import type { Document } from "@/types/document";
import { createClient } from "@/lib/supabase/client";
import {
  extractImageUrls,
  deleteImagesFromStorage,
} from "@/lib/utils/image-cleanup";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class DocumentApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    return {
      "Content-Type": "application/json",
      "X-User-Id": user.id,
    };
  }

  async listDocuments(): Promise<Document[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/documents`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }
    return response.json();
  }

  async getDocument(id: string): Promise<Document> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    const doc = await response.json();
    console.log("API getDocument response:", {
      id: doc.id,
      client: doc.client,
      last_revision: doc.last_revision,
      contacts: doc.contacts
    });
    return doc;
  }

  async createDocument(document: Omit<Document, "id">): Promise<Document> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/documents`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: document.title,
        subtitle: document.subtitle,
        owner_id: user.id,
        sections: document.sections,
        client: document.client,
        authors: document.authors,
        classified: document.classified,
        last_revision: document.last_revision,
        contacts: document.contacts,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to create document: ${response.statusText}`);
    }
    return response.json();
  }

  async updateDocument(
    id: string,
    updates: Partial<
      Pick<
        Document,
        | "title"
        | "subtitle"
        | "sections"
        | "client"
        | "authors"
        | "classified"
        | "last_revision"
        | "contacts"
      >
    >,
  ): Promise<Document> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }
    return response.json();
  }

  async deleteDocument(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    // Fetch the document first to get all image URLs
    let imageUrls: string[] = [];
    try {
      const document = await this.getDocument(id);
      imageUrls = extractImageUrls(document);
    } catch (err) {
      // Log but continue with deletion
      console.error("Error fetching document for image cleanup:", err);
    }

    // Delete the document from backend
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }

    // Clean up all images from storage after successful deletion
    if (imageUrls.length > 0) {
      try {
        await deleteImagesFromStorage(imageUrls);
      } catch (cleanupErr) {
        // Log but don't fail the deletion operation
        console.error(
          "Error cleaning up images after document deletion:",
          cleanupErr,
        );
      }
    }
  }

  async exportDocumentToDocx(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/documents/${id}/export/docx`, {
      headers: {
        "X-User-Id": headers["X-User-Id"],
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export document: ${response.statusText}`);
    }

    // Get the blob
    const blob = await response.blob();

    // Extract filename from Content-Disposition header or use fallback
    let filename = `document-${id}.docx`;
    const contentDisposition = response.headers.get("Content-Disposition");
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async uploadAndCreateDocument(file: File): Promise<Document> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", user.id);

    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: "POST",
      headers: {
        "X-User-Id": user.id,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to upload document: ${response.statusText}`,
      );
    }

    return response.json();
  }

  // ============================================================================
  // Collaborator Methods
  // ============================================================================

  async getCollaborators(documentId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/collaborators`,
      { headers }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch collaborators: ${response.statusText}`
      );
    }
    const data = await response.json();
    return data.collaborators;
  }

  async addCollaborator(
    documentId: string,
    userId: string,
    role: string
  ) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("role", role);

    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/collaborators`,
      {
        method: "POST",
        headers: {
          "X-User-Id": user.id,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to add collaborator: ${response.statusText}`
      );
    }

    return response.json();
  }

  async updateCollaboratorRole(
    documentId: string,
    userId: string,
    role: string
  ) {
    const formData = new FormData();
    formData.append("role", role);

    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/collaborators/${userId}`,
      {
        method: "PATCH",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update collaborator role: ${response.statusText}`
      );
    }

    return response.json();
  }

  async removeCollaborator(documentId: string, userId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/documents/${documentId}/collaborators/${userId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to remove collaborator: ${response.statusText}`
      );
    }
  }

  async searchProfiles(searchTerm: string, limit: number = 10) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/profiles/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to search profiles: ${response.statusText}`);
    }

    const data = await response.json();
    return data.profiles;
  }
}

export const apiClient = new DocumentApiClient();
