"use client"

import { useState } from "react"
import type { Document } from "@/types/document"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentTocProps {
  document: Document
  activeSection?: string
  onSectionClick?: (sectionId: string) => void
}

export function DocumentToc({ document, activeSection, onSectionClick }: DocumentTocProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId)
    } else {
      newCollapsed.add(sectionId)
    }
    setCollapsedSections(newCollapsed)
  }

  const handleSectionClick = (sectionId: string) => {
    if (onSectionClick) {
      onSectionClick(sectionId)
    }
  }

  if (!document.sections || document.sections.length === 0) {
    return (
      <div className="p-6 text-center">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          No sections yet
        </p>
      </div>
    )
  }

  return (
    <div className="py-6 px-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4 px-2">
        Contents
      </h2>
      <nav className="space-y-1">
        {document.sections.map((section, sectionIndex) => {
          const isCollapsed = collapsedSections.has(section.id)
          const isActive = activeSection === section.id
          const hasSubsections = section.subsections && section.subsections.length > 0

          return (
            <div key={section.id}>
              {/* Section */}
              <div className="group flex items-start gap-1">
                {hasSubsections && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(section.id)}
                    className="h-6 w-6 p-0 hover:bg-transparent"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                )}
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className={cn(
                    "flex-1 text-left px-2 py-1.5 rounded-md text-sm transition-colors",
                    hasSubsections ? "" : "ml-7",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-foreground hover:bg-accent/50"
                  )}
                >
                  <span className="text-xs text-muted-foreground mr-2">
                    {sectionIndex + 1}.
                  </span>
                  {section.title || "Untitled Section"}
                </button>
              </div>

              {/* Subsections */}
              {!isCollapsed && hasSubsections && (
                <div className="ml-7 mt-1 space-y-1 border-l border-border pl-3">
                  {section.subsections.map((subsection, subIndex) => {
                    const subsectionId = `${section.id}-${subsection.id}`
                    const isSubActive = activeSection === subsectionId

                    return (
                      <button
                        key={subsection.id}
                        onClick={() => handleSectionClick(subsectionId)}
                        className={cn(
                          "w-full text-left px-2 py-1 rounded-md text-sm transition-colors",
                          isSubActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        <span className="text-xs mr-2">
                          {sectionIndex + 1}.{subIndex + 1}
                        </span>
                        {subsection.title || "Untitled Subsection"}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
