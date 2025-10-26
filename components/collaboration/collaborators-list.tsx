'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Trash2, User } from 'lucide-react'

interface Collaborator {
  id: string
  user_id: string
  role: 'viewer' | 'editor' | 'owner'
  profile?: {
    email: string
    full_name: string | null
  }
}

interface CollaboratorsListProps {
  supabaseDocumentId: string
  isOwner: boolean
}

export function CollaboratorsList({
  supabaseDocumentId,
  isOwner,
}: CollaboratorsListProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('document_collaborators')
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq('document_id', supabaseDocumentId)

      if (error) throw error

      setCollaborators(data || [])
    } catch (error: any) {
      console.error('Error loading collaborators:', error)
      toast.error('Failed to load collaborators')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (collaboratorId: string) => {
    if (!isOwner) {
      toast.error('Only the owner can remove collaborators')
      return
    }

    setDeleting(collaboratorId)

    try {
      const { error } = await supabase
        .from('document_collaborators')
        .delete()
        .eq('id', collaboratorId)

      if (error) throw error

      toast.success('Collaborator removed')
      await loadCollaborators()
    } catch (error: any) {
      console.error('Error removing collaborator:', error)
      toast.error('Failed to remove collaborator')
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    loadCollaborators()
  }, [supabaseDocumentId])

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email[0].toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-primary text-primary-foreground'
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading collaborators...</div>
  }

  if (collaborators.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No collaborators yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {collaborators.map((collab) => {
        const profile = collab.profile as any
        return (
          <div
            key={collab.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar>
                <AvatarFallback>
                  {profile ? getInitials(profile.full_name, profile.email) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || profile?.email || 'Unknown User'}
                </p>
                {profile?.full_name && (
                  <p className="text-xs text-muted-foreground truncate">
                    {profile.email}
                  </p>
                )}
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(collab.role)}`}
              >
                {collab.role}
              </span>
            </div>

            {isOwner && collab.role !== 'owner' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(collab.id)}
                disabled={deleting === collab.id}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
