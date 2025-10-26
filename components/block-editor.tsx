"use client"

import type { Block } from "@/types/document"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, ArrowUp, ArrowDown } from "lucide-react"

interface BlockEditorProps {
  block: Block
  onUpdate: (block: Block) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export function BlockEditor({ block, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: BlockEditorProps) {
  return (
    <div className="group relative">
      {/* Hover controls - arrows on the left */}
      <div className="absolute -left-16 top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>

      {/* Delete button on the right */}
      <div className="absolute -right-16 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-6 w-6 p-0 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content area - looks like plain text */}
      <Textarea
        value={block.content}
        onChange={(e) => onUpdate({ ...block, content: e.target.value })}
        placeholder="Type something..."
        className="min-h-[40px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed bg-transparent shadow-none"
        style={{
          height: "auto",
          overflow: "hidden",
        }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement
          target.style.height = "auto"
          target.style.height = target.scrollHeight + "px"
        }}
      />
    </div>
  )
}
