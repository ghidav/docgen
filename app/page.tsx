"use client"

import { useState, useRef } from "react"
import { DocumentEditor } from "@/components/document-editor"
import { DocumentList } from "@/components/document-list"
import { NavigationSidebar } from "@/components/navigation-sidebar"
import { TopBar } from "@/components/top-bar"
import type { Document } from "@/types/document"

export interface DocumentEditorRef {
  handleSave: () => Promise<void>
  handleRefetch: () => Promise<void>
  handleSettings: () => void
  documentId?: string
  saving: boolean
  refetching: boolean
}

export default function Home() {
  const [currentView, setCurrentView] = useState<"list" | "editor">("list")
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>(undefined)
  const [editorState, setEditorState] = useState({
    saving: false,
    refetching: false,
    documentId: undefined as string | undefined,
  })
  const editorRef = useRef<DocumentEditorRef>(null)

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
    <>
      <NavigationSidebar />
      <TopBar
        view={currentView}
        onBack={handleBackToList}
        onSettings={() => editorRef.current?.handleSettings()}
        onRefetch={() => editorRef.current?.handleRefetch()}
        onSave={() => editorRef.current?.handleSave()}
        saving={editorState.saving}
        refetching={editorState.refetching}
        hasDocumentId={!!editorState.documentId}
      />
      <main className="min-h-screen bg-background pl-16 pt-14">
        {/* Main Content */}
        <div className="py-8">
          {currentView === "list" ? (
            <DocumentList onSelectDocument={handleSelectDocument} onCreateNew={handleCreateNew} />
          ) : (
            <DocumentEditor
              ref={editorRef}
              initialDocument={selectedDocument}
              onBack={handleBackToList}
              onStateChange={setEditorState}
            />
          )}
        </div>
      </main>
    </>
  )
}
