"use client";

import { useState } from "react";
import type { Section, Subsection, Block } from "@/types/document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubsectionEditor } from "./subsection-editor";
import { BlockEditor } from "./block-editor";
import {
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Type,
  List,
  Table,
  Image,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SectionEditorProps {
  section: Section;
  onUpdate: (section: Section) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  documentId: string;
}

export function SectionEditor({
  section,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  documentId,
}: SectionEditorProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const addBlock = (type: Block["type"] = "text") => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: "",
    };
    onUpdate({
      ...section,
      blocks: [...section.blocks, newBlock],
    });
  };

  const updateBlock = (index: number, block: Block) => {
    const newBlocks = [...section.blocks];
    newBlocks[index] = block;
    onUpdate({ ...section, blocks: newBlocks });
  };

  const deleteBlock = (index: number) => {
    onUpdate({
      ...section,
      blocks: section.blocks.filter((_, i) => i !== index),
    });
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= section.blocks.length) return;

    const newBlocks = [...section.blocks];
    [newBlocks[index], newBlocks[newIndex]] = [
      newBlocks[newIndex],
      newBlocks[index],
    ];
    onUpdate({ ...section, blocks: newBlocks });
  };

  const addSubsection = () => {
    const newSubsection: Subsection = {
      id: `subsection-${Date.now()}`,
      title: "",
      blocks: [],
    };
    onUpdate({
      ...section,
      subsections: [...section.subsections, newSubsection],
    });
  };

  const updateSubsection = (index: number, subsection: Subsection) => {
    const newSubsections = [...section.subsections];
    newSubsections[index] = subsection;
    onUpdate({ ...section, subsections: newSubsections });
  };

  const deleteSubsection = (index: number) => {
    onUpdate({
      ...section,
      subsections: section.subsections.filter((_, i) => i !== index),
    });
  };

  const moveSubsection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= section.subsections.length) return;

    const newSubsections = [...section.subsections];
    [newSubsections[index], newSubsections[newIndex]] = [
      newSubsections[newIndex],
      newSubsections[index],
    ];
    onUpdate({ ...section, subsections: newSubsections });
  };

  return (
    <div className="group relative mt-12 mb-10">
      {/* Hover controls - arrows on the left */}
      <div className="absolute -left-16 top-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
      <div className="absolute -right-16 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (section.subsections.length > 0 || section.blocks.length > 0) {
              setShowDeleteDialog(true);
            } else {
              onDelete();
            }
          }}
          className="h-6 w-6 p-0 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Section title - styled as H1 */}
      <Input
        placeholder="Section Title"
        value={section.title}
        onChange={(e) => onUpdate({ ...section, title: e.target.value })}
        className="text-xl font-bold border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 mb-6 bg-transparent placeholder:text-muted-foreground/40 shadow-none"
      />

      {/* Section-level blocks - appear before subsections */}
      {section.blocks.length > 0 && (
        <div className="space-y-3 mb-6">
          {section.blocks.map((block, index) => (
            <BlockEditor
              key={block.id}
              block={block}
              onUpdate={(b) => updateBlock(index, b)}
              onDelete={() => deleteBlock(index)}
              onMoveUp={() => moveBlock(index, "up")}
              onMoveDown={() => moveBlock(index, "down")}
              isFirst={index === 0}
              isLast={index === section.blocks.length - 1}
              documentId={documentId}
            />
          ))}
        </div>
      )}

      {/* Add block button - appears after section title */}
      <div className="mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="text-xs">Add content</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => addBlock("text")}>
              <Type className="h-4 w-4 mr-2" />
              <span>Text</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock("list")}>
              <List className="h-4 w-4 mr-2" />
              <span>List</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock("table")}>
              <Table className="h-4 w-4 mr-2" />
              <span>Table</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock("image")}>
              <Image className="h-4 w-4 mr-2" />
              <span>Image</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
            documentId={documentId}
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

      {/* Divider after section - prominent stroke */}
      <div className="mt-8 border-t-2 border-border" />

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} modal={true}>
        <AlertDialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete section?</AlertDialogTitle>
            <AlertDialogDescription>
              This section contains{" "}
              {section.blocks.length > 0 &&
                `${section.blocks.length} content block${
                  section.blocks.length !== 1 ? "s" : ""
                }`}
              {section.blocks.length > 0 &&
                section.subsections.length > 0 &&
                " and "}
              {section.subsections.length > 0 &&
                `${section.subsections.length} subsection${
                  section.subsections.length !== 1 ? "s" : ""
                }`}
              . Deleting it will also remove all content. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                // Use setTimeout to ensure dialog closes before delete
                setTimeout(() => onDelete(), 0);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
