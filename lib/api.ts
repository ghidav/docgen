import type { Document } from "@/types/document"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class DocumentApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async listDocuments(): Promise<Document[]> {
    const response = await fetch(`${this.baseUrl}/documents`)
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`)
    }
    return response.json()
  }

  async getDocument(id: string): Promise<Document> {
    const response = await fetch(`${this.baseUrl}/documents/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`)
    }
    return response.json()
  }

  async createDocument(document: Omit<Document, "id">): Promise<Document> {
    const response = await fetch(`${this.baseUrl}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: document.title,
        sections: document.sections,
        client: document.client,
        authors: document.authors,
        classified: document.classified,
        last_revision: document.last_revision,
        contacts: document.contacts,
      }),
    })
    if (!response.ok) {
      throw new Error(`Failed to create document: ${response.statusText}`)
    }
    return response.json()
  }

  async updateDocument(
    id: string,
    updates: Partial<Pick<Document, "title" | "sections" | "client" | "authors" | "classified" | "last_revision" | "contacts">>
  ): Promise<Document> {
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`)
    }
    return response.json()
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`)
    }
  }
}

export const apiClient = new DocumentApiClient()
