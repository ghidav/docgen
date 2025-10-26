'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Share2, Loader2 } from 'lucide-react'

interface ShareDialogProps {
  documentId: string
  supabaseDocumentId: string
  onCollaboratorAdded?: () => void
}

export function ShareDialog({
  documentId,
  supabaseDocumentId,
  onCollaboratorAdded,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleShare = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      if (profileError || !profiles) {
        toast.error('User not found. They must have an account first.')
        return
      }

      // Add collaborator
      const { error: collaboratorError } = await supabase
        .from('document_collaborators')
        .insert({
          document_id: supabaseDocumentId,
          user_id: profiles.id,
          role,
          added_by: user.id,
        })

      if (collaboratorError) {
        if (collaboratorError.code === '23505') {
          toast.error('This user is already a collaborator')
        } else {
          throw collaboratorError
        }
        return
      }

      toast.success(`Successfully shared document with ${email}`)
      setEmail('')
      setRole('viewer')
      setOpen(false)

      if (onCollaboratorAdded) {
        onCollaboratorAdded()
      }
    } catch (error: any) {
      console.error('Share error:', error)
      toast.error(error.message || 'Failed to share document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Add collaborators to this document by entering their email address.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: 'viewer' | 'editor') => setRole(value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer (read-only)</SelectItem>
                <SelectItem value="editor">Editor (can edit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleShare} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              'Share Document'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
