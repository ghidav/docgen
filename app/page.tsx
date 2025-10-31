"use client"

import { useState, useRef } from "react"
import { DocumentEditor } from "@/components/document-editor"
import { DocumentList } from "@/components/document-list"
import { NavigationSidebar } from "@/components/navigation-sidebar"
import { TopBar } from "@/components/top-bar"
import type { Document } from "@/types/document"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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
  const [exporting, setExporting] = useState(false)
  const editorRef = useRef<DocumentEditorRef>(null)
  const { toast } = useToast()

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

  const handleExport = async () => {
    if (!editorState.documentId) {
      toast({
        title: "Error",
        description: "Cannot export: document not saved yet",
        variant: "destructive",
      })
      return
    }

    setExporting(true)
    try {
      await apiClient.exportDocumentToDocx(editorState.documentId)
      toast({
        title: "Success",
        description: "Document exported successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to export document",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <NavigationSidebar />
      <TopBar
        view={currentView}
        onBack={handleBackToList}
        onSettings={() => editorRef.current?.handleSettings()}
        onRefetch={() => editorRef.current?.handleRefetch()}
        onExport={handleExport}
        onSave={() => editorRef.current?.handleSave()}
        saving={editorState.saving}
        refetching={editorState.refetching}
        exporting={exporting}
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
