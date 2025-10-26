"use client"

import { useState } from "react"
import type { Section, Subsection } from "@/types/document"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SubsectionEditor } from "./subsection-editor"
import { GripVertical, X, Plus, ArrowUp, ArrowDown } from "lucide-react"

interface SectionEditorProps {
  section: Section
  onUpdate: (section: Section) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export function SectionEditor({ section, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: SectionEditorProps) {
  const [isHovered, setIsHovered] = useState(false)

  const addSubsection = () => {
    const newSubsection: Subsection = {
      id: `subsection-${Date.now()}`,
      title: "",
      blocks: [],
    }
    onUpdate({
      ...section,
      subsections: [...section.subsections, newSubsection],
    })
  }

  const updateSubsection = (index: number, subsection: Subsection) => {
    const newSubsections = [...section.subsections]
    newSubsections[index] = subsection
    onUpdate({ ...section, subsections: newSubsections })
  }

  const deleteSubsection = (index: number) => {
    onUpdate({
      ...section,
      subsections: section.subsections.filter((_, i) => i !== index),
    })
  }

  const moveSubsection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= section.subsections.length) return

    const newSubsections = [...section.subsections]
    ;[newSubsections[index], newSubsections[newIndex]] = [newSubsections[newIndex], newSubsections[index]]
    onUpdate({ ...section, subsections: newSubsections })
  }

  return (
    <div
      className="group relative mt-12 mb-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover controls on the left */}
      {isHovered && (
        <div className="absolute -left-16 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={isFirst}
            className="h-6 w-6 p-0"
          >
            <ArrowUp className="h-3 w-3 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={isLast}
            className="h-6 w-6 p-0"
          >
            <ArrowDown className="h-3 w-3 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 p-0 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Section title - styled as H1 */}
      <Input
        placeholder="Section Title"
        value={section.title}
        onChange={(e) => onUpdate({ ...section, title: e.target.value })}
        className="text-xl font-bold border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 mb-6 bg-transparent placeholder:text-muted-foreground/40"
      />

      {/* Subsections - appear as natural content */}
      <div className="space-y-2">
        {section.subsections.map((subsection, index) => (
          <SubsectionEditor
            key={subsection.id}
            subsection={subsection}
            onUpdate={(s) => updateSubsection(index, s)}
            onDelete={() => deleteSubsection(index)}
            onMoveUp={() => moveSubsection(index, "up")}
            onMoveDown={() => moveSubsection(index, "down")}
            isFirst={index === 0}
            isLast={index === section.subsections.length - 1}
          />
        ))}
      </div>

      {/* Add subsection button - subtle, appears on hover */}
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={addSubsection}
          className="text-muted-foreground hover:text-foreground h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          <span className="text-xs">Add subsection</span>
        </Button>
      </div>

      {/* Divider after section - subtle */}
      <div className="mt-8 border-t border-border/30" />
    </div>
  )
}
