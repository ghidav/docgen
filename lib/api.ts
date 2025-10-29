import type { Document } from "@/types/document"
import { createClient } from "@/lib/supabase/client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class DocumentApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    return {
      "Content-Type": "application/json",
      "X-User-Id": user.id,
    }
  }

  async listDocuments(): Promise<Document[]> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}/documents`, { headers })
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`)
    }
    return response.json()
  }

  async getDocument(id: string): Promise<Document> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}/documents/${id}`, { headers })
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`)
    }
    return response.json()
  }

  async createDocument(document: Omit<Document, "id">): Promise<Document> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const headers = await this.getAuthHeaders()
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
    })
    if (!response.ok) {
      throw new Error(`Failed to create document: ${response.statusText}`)
    }
    return response.json()
  }

  async updateDocument(
    id: string,
    updates: Partial<Pick<Document, "title" | "subtitle" | "sections" | "client" | "authors" | "classified" | "last_revision" | "contacts">>
  ): Promise<Document> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`)
    }
    return response.json()
  }

  async deleteDocument(id: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "DELETE",
      headers,
    })
    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`)
    }
  }
}

export const apiClient = new DocumentApiClient()
