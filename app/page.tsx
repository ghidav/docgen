"use client"

import { useState } from "react"
import { DocumentEditor } from "@/components/document-editor"
import { DocumentList } from "@/components/document-list"
import { LogoutButton } from "@/components/auth/logout-button"
import type { Document } from "@/types/document"

export default function Home() {
  const [currentView, setCurrentView] = useState<"list" | "editor">("list")
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>(undefined)

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocument(doc)
    setCurrentView("editor")
  }

  const handleCreateNew = () => {
    setSelectedDocument(undefined)
    setCurrentView("editor")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedDocument(undefined)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header with logout */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Documents</h1>
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {currentView === "list" ? (
          <DocumentList onSelectDocument={handleSelectDocument} onCreateNew={handleCreateNew} />
        ) : (
          <DocumentEditor initialDocument={selectedDocument} onBack={handleBackToList} />
        )}
      </div>
    </main>
  )
}
