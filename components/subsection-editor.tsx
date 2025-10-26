"use client"

import { useState } from "react"
import type { Subsection, Block } from "@/types/document"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BlockEditor } from "./block-editor"
import { GripVertical, X, Plus, ArrowUp, ArrowDown } from "lucide-react"

interface SubsectionEditorProps {
  subsection: Subsection
  onUpdate: (subsection: Subsection) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export function SubsectionEditor({ subsection, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: SubsectionEditorProps) {
  const [isHovered, setIsHovered] = useState(false)

  const addBlock = () => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: "text",
      content: "",
    }
    onUpdate({
      ...subsection,
      blocks: [...subsection.blocks, newBlock],
    })
  }

  const updateBlock = (index: number, block: Block) => {
    const newBlocks = [...subsection.blocks]
    newBlocks[index] = block
    onUpdate({ ...subsection, blocks: newBlocks })
  }

  const deleteBlock = (index: number) => {
    onUpdate({
      ...subsection,
      blocks: subsection.blocks.filter((_, i) => i !== index),
    })
  }

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= subsection.blocks.length) return

    const newBlocks = [...subsection.blocks]
    ;[newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
    onUpdate({ ...subsection, blocks: newBlocks })
  }

  return (
    <div
      className="group relative mt-8 mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover controls on the left */}
      {isHovered && (
        <div className="absolute -left-16 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Subsection title - styled as H2 */}
      <Input
        placeholder="Subsection Heading"
        value={subsection.title}
        onChange={(e) => onUpdate({ ...subsection, title: e.target.value })}
        className="text-l font-semibold border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 mb-4 bg-transparent placeholder:text-muted-foreground/40"
      />

      {/* Blocks - appear as paragraphs */}
      <div className="space-y-3 ml-0">
        {subsection.blocks.map((block, index) => (
          <BlockEditor
            key={block.id}
            block={block}
            onUpdate={(b) => updateBlock(index, b)}
            onDelete={() => deleteBlock(index)}
            onMoveUp={() => moveBlock(index, "up")}
            onMoveDown={() => moveBlock(index, "down")}
            isFirst={index === 0}
            isLast={index === subsection.blocks.length - 1}
          />
        ))}
      </div>

      {/* Add block button - subtle, appears on hover */}
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={addBlock}
          className="text-muted-foreground hover:text-foreground h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          <span className="text-xs">Add content</span>
        </Button>
      </div>
    </div>
  )
}
