"use client"

import { useState, useEffect } from "react"
import type { Document } from "@/types/document"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface DocumentSettingsDialogProps {
  document: Document
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<Document>) => void
}

export function DocumentSettingsDialog({
  document,
  open,
  onOpenChange,
  onSave,
}: DocumentSettingsDialogProps) {
  const [client, setClient] = useState(document.client || "")
  const [authors, setAuthors] = useState((document.authors || []).join(", "))
  const [classified, setClassified] = useState(document.classified || false)
  const [lastRevision, setLastRevision] = useState(
    document.last_revision ? new Date(document.last_revision).toISOString().split("T")[0] : ""
  )
  const [contacts, setContacts] = useState(document.contacts || "")

  // Update state when document changes
  useEffect(() => {
    setClient(document.client || "")
    setAuthors((document.authors || []).join(", "))
    setClassified(document.classified || false)
    setLastRevision(
      document.last_revision ? new Date(document.last_revision).toISOString().split("T")[0] : ""
    )
    setContacts(document.contacts || "")
  }, [document])

  const handleSave = () => {
    // Parse authors from comma-separated string
    const authorsArray = authors
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0)

    onSave({
      client: client || undefined,
      authors: authorsArray.length > 0 ? authorsArray : undefined,
      classified,
      last_revision: lastRevision || undefined,
      contacts: contacts || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Document Settings</DialogTitle>
          <DialogDescription>
            Configure metadata and settings for this document.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Client */}
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Enter client name"
            />
          </div>

          {/* Authors */}
          <div className="grid gap-2">
            <Label htmlFor="authors">Authors</Label>
            <Input
              id="authors"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="Enter authors (comma-separated)"
            />
            <p className="text-xs text-muted-foreground">
              Enter multiple authors separated by commas
            </p>
          </div>

          {/* Classified */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="classified"
              checked={classified}
              onCheckedChange={(checked) => setClassified(checked as boolean)}
            />
            <Label
              htmlFor="classified"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Classified Document
            </Label>
          </div>

          {/* Last Revision */}
          <div className="grid gap-2">
            <Label htmlFor="lastRevision">Last Revision</Label>
            <Input
              id="lastRevision"
              type="date"
              value={lastRevision}
              onChange={(e) => setLastRevision(e.target.value)}
            />
          </div>

          {/* Contacts */}
          <div className="grid gap-2">
            <Label htmlFor="contacts">Contacts</Label>
            <Textarea
              id="contacts"
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
              placeholder="Enter contact information"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
