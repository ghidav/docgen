"use client"

import { useState, useEffect, useRef } from "react"
import type { Document, Section } from "@/types/document"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save, ArrowLeft, Loader2, PanelLeftClose, List, Settings, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DocumentToc } from "./document-toc"
import { SectionEditor } from "./section-editor"
import { DocumentSettingsDialog } from "./document-settings-dialog"
import { useCurrentDocument } from "@/providers/current-document"

interface DocumentEditorProps {
  initialDocument?: Document
  onBack?: () => void
}

export function DocumentEditor({ initialDocument, onBack }: DocumentEditorProps) {
  const [document, setDocument] = useState<Document>(
    initialDocument || {
      id: "",
      title: "",
      sections: [],
    },
  )
  const [saving, setSaving] = useState(false)
  const [refetching, setRefetching] = useState(false)
  const [activeSection, setActiveSection] = useState<string | undefined>()
  const [tocVisible, setTocVisible] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { toast} = useToast()
  const { setCurrentDocumentId, reloadTrigger } = useCurrentDocument()

  // Refs for sections to enable scrolling
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const isInitialMountRef = useRef(true)

  useEffect(() => {
    if (initialDocument) {
      setDocument(initialDocument)
    }
  }, [initialDocument])

  useEffect(() => {
    setCurrentDocumentId(document.id || undefined)
    return () => setCurrentDocumentId(undefined)
  }, [document.id, setCurrentDocumentId])

  // Auto-reload when triggered by chat assistant
  useEffect(() => {
    // Skip initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }

    // Only reload if document is saved and has an ID
    if (document.id) {
      handleRefetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTrigger])

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: "",
      subsections: [],
      blocks: [],
    }
    setDocument({
      ...document,
      sections: [...document.sections, newSection],
    })
  }

  const updateSection = (index: number, section: Section) => {
    const newSections = [...document.sections]
    newSections[index] = section
    setDocument({ ...document, sections: newSections })
  }

  const deleteSection = (index: number) => {
    setDocument({
      ...document,
      sections: document.sections.filter((_, i) => i !== index),
    })
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= document.sections.length) return

    const newSections = [...document.sections]
    ;[newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
    setDocument({ ...document, sections: newSections })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (document.id) {
        // Update existing document
        await apiClient.updateDocument(document.id, {
          title: document.title,
          sections: document.sections,
          client: document.client,
          authors: document.authors,
          classified: document.classified,
          last_revision: document.last_revision,
          contacts: document.contacts,
        })
        toast({
          title: "Success",
          description: "Document saved successfully",
        })
      } else {
        // Create new document
        const newDoc = await apiClient.createDocument({
          title: document.title,
          sections: document.sections,
          client: document.client,
          authors: document.authors,
          classified: document.classified,
          last_revision: document.last_revision,
          contacts: document.contacts,
        })
        setDocument(newDoc)
        toast({
          title: "Success",
          description: "Document created successfully",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save document",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRefetch = async () => {
    if (!document.id) {
      toast({
        title: "Error",
        description: "Cannot refetch: document not saved yet",
        variant: "destructive",
      })
      return
    }

    setRefetching(true)
    try {
      const fetchedDoc = await apiClient.getDocument(document.id)
      setDocument(fetchedDoc)
      toast({
        title: "Success",
        description: "Document reloaded from database",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to refetch document",
        variant: "destructive",
      })
    } finally {
      setRefetching(false)
    }
  }

  const handleSettingsSave = (updates: Partial<Document>) => {
    setDocument({ ...document, ...updates })
  }

  const handleSectionClick = (sectionId: string) => {
    const element = sectionRefs.current.get(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveSection(sectionId)
    }
  }

  const setSectionRef = (sectionId: string, element: HTMLDivElement | null) => {
    if (element) {
      sectionRefs.current.set(sectionId, element)
    } else {
      sectionRefs.current.delete(sectionId)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="px-8 h-[57px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setSettingsOpen(true)} variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            {document.id && (
              <Button
                onClick={handleRefetch}
                disabled={refetching}
                variant="outline"
                size="sm"
              >
                {refetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area with TOC */}
      <div className="flex">
        {/* Table of Contents Sidebar */}
        {tocVisible && (
          <aside className="w-64 border-r border-border bg-muted/30 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
            <DocumentToc
              document={document}
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
            />
          </aside>
        )}

        {/* Document content */}
        <div className="flex-1 overflow-auto relative">
          {/* TOC Toggle Button */}
          <div className="absolute top-4 left-4 z-10">
            <Button
              onClick={() => setTocVisible(!tocVisible)}
              variant="ghost"
              size="icon"
            >
              {tocVisible ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <List className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="max-w-4xl mx-auto px-16 py-12">
            {/* Document title */}
            <div className="mb-16">
              <Input
                placeholder="Untitled Document"
                value={document.title}
                onChange={(e) => setDocument({ ...document, title: e.target.value })}
                className="text-2xl font-bold border-0 p-0 mb-6 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-muted-foreground/30"
              />
            </div>

            {/* Sections - natural flow */}
            <div className="space-y-2">
              {document.sections.map((section, index) => (
                <div
                  key={section.id}
                  ref={(el) => setSectionRef(section.id, el)}
                >
                  <SectionEditor
                    section={section}
                    onUpdate={(s) => updateSection(index, s)}
                    onDelete={() => deleteSection(index)}
                    onMoveUp={() => moveSection(index, "up")}
                    onMoveDown={() => moveSection(index, "down")}
                    isFirst={index === 0}
                    isLast={index === document.sections.length - 1}
                  />
                </div>
              ))}
            </div>

            {/* Add section button - appears at the end */}
            <div className="mt-12">
              <Button
                onClick={addSection}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add section
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <DocumentSettingsDialog
        document={document}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={handleSettingsSave}
      />
    </div>
  )
}
