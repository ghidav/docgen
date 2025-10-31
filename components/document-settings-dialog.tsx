"use client"

import { useState, useEffect } from "react"
import type { Document, Collaborator } from "@/types/document"
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
import { Badge } from "@/components/ui/badge"
import { X, Search, Plus, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DocumentSettingsDialogProps {
  document: Document
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<Document>) => void
}

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
}

export function DocumentSettingsDialog({
  document,
  open,
  onOpenChange,
  onSave,
}: DocumentSettingsDialogProps) {
  const { toast } = useToast()
  const [subtitle, setSubtitle] = useState(document.subtitle || "")
  const [client, setClient] = useState(document.client || "")
  const [classified, setClassified] = useState(document.classified || false)
  const [lastRevision, setLastRevision] = useState(
    document.last_revision ? new Date(document.last_revision).toISOString().split("T")[0] : ""
  )
  const [contacts, setContacts] = useState(document.contacts || "")

  // Collaborator management
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loadingCollaborators, setLoadingCollaborators] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [newRole, setNewRole] = useState("Collaboratore")
  const [editingRole, setEditingRole] = useState<{ userId: string; role: string } | null>(null)

  // Load collaborators and metadata when dialog opens
  useEffect(() => {
    if (open && document.id) {
      loadCollaborators()
      loadMetadata()
    }
  }, [open, document.id])

  // Update state when document changes
  useEffect(() => {
    console.log("Document prop updated:", {
      client: document.client,
      last_revision: document.last_revision,
      contacts: document.contacts
    })
    setSubtitle(document.subtitle || "")
    setClient(document.client || "")
    setClassified(document.classified || false)
    setLastRevision(
      document.last_revision ? new Date(document.last_revision).toISOString().split("T")[0] : ""
    )
    setContacts(document.contacts || "")
  }, [document])

  // Search profiles with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const profiles = await apiClient.searchProfiles(searchQuery)
        setSearchResults(profiles)
      } catch (error) {
        console.error("Failed to search profiles:", error)
        toast({
          title: "Search failed",
          description: "Could not search for users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadMetadata = async () => {
    try {
      // Load document metadata from Supabase if available
      // For now, use the document prop values if they exist
      if (document.client) setClient(document.client)
      if (document.last_revision) setLastRevision(new Date(document.last_revision).toISOString().split("T")[0])
    } catch (error) {
      console.error("Failed to load metadata:", error)
    }
  }

  const loadCollaborators = async () => {
    setLoadingCollaborators(true)
    try {
      console.log("Loading collaborators for document ID:", document.id)
      const collabs = await apiClient.getCollaborators(document.id)
      console.log("Loaded collaborators:", collabs)
      setCollaborators(collabs)
    } catch (error) {
      console.error("Failed to load collaborators:", error)
      toast({
        title: "Error",
        description: "Could not load collaborators. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingCollaborators(false)
    }
  }

  const handleAddCollaborator = async (profile: Profile) => {
    try {
      await apiClient.addCollaborator(document.id, profile.id, newRole)
      toast({
        title: "Collaborator added",
        description: `${profile.full_name} has been added to the document.`,
      })
      await loadCollaborators()
      setSearchOpen(false)
      setSearchQuery("")
      setNewRole("Collaboratore")
    } catch (error) {
      console.error("Failed to add collaborator:", error)
      toast({
        title: "Error",
        description: "Could not add collaborator. They may already be added.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await apiClient.removeCollaborator(document.id, userId)
      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed from the document.",
      })
      await loadCollaborators()
    } catch (error) {
      console.error("Failed to remove collaborator:", error)
      toast({
        title: "Error",
        description: "Could not remove collaborator. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiClient.updateCollaboratorRole(document.id, userId, newRole)
      toast({
        title: "Role updated",
        description: "The collaborator's role has been updated.",
      })
      await loadCollaborators()
      setEditingRole(null)
    } catch (error) {
      console.error("Failed to update role:", error)
      toast({
        title: "Error",
        description: "Could not update role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSave = () => {
    onSave({
      subtitle: subtitle || undefined,
      client: client || undefined,
      classified,
      last_revision: lastRevision || undefined,
      contacts: contacts || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Settings</DialogTitle>
          <DialogDescription>
            Configure metadata and collaborators for this document.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Subtitle */}
          <div className="grid gap-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter document subtitle"
            />
          </div>

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

          {/* Collaborators Section */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Collaborators & Authors</Label>
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Collaborator
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="end">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <div className="p-2 border-b">
                      <Label className="text-xs">Role</Label>
                      <Input
                        placeholder="e.g., Consulente, Project Manager"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="mt-1 h-8"
                      />
                    </div>
                    <CommandList>
                      {searching && (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
                        <CommandEmpty>No users found.</CommandEmpty>
                      )}
                      {!searching && searchQuery.length < 2 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          Type at least 2 characters to search
                        </div>
                      )}
                      {!searching && searchResults.length > 0 && (
                        <CommandGroup>
                          {searchResults.map((profile) => (
                            <CommandItem
                              key={profile.id}
                              onSelect={() => handleAddCollaborator(profile)}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{profile.full_name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {profile.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {loadingCollaborators && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading collaborators...</span>
              </div>
            )}

            {!loadingCollaborators && collaborators.length === 0 && (
              <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                No collaborators yet. Add someone to get started.
              </div>
            )}

            {!loadingCollaborators && collaborators.length > 0 && (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{collab.profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{collab.profile.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingRole?.userId === collab.user_id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingRole.role}
                            onChange={(e) =>
                              setEditingRole({ ...editingRole, role: e.target.value })
                            }
                            className="h-7 w-32 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateRole(collab.user_id, editingRole.role)
                              }
                              if (e.key === "Escape") {
                                setEditingRole(null)
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => handleUpdateRole(collab.user_id, editingRole.role)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => setEditingRole(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() =>
                            setEditingRole({ userId: collab.user_id, role: collab.role })
                          }
                        >
                          {collab.role}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCollaborator(collab.user_id)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
