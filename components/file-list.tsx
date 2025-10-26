'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Download, Trash2, ExternalLink } from 'lucide-react'

interface FileListProps {
  fileUrls: string[]
  documentId: string
  onFileDelete?: (url: string) => void
}

export function FileList({ fileUrls, documentId, onFileDelete }: FileListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async (fileUrl: string) => {
    setDeleting(fileUrl)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to delete files')
        return
      }

      // Extract file path from URL
      const urlParts = fileUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${user.id}/${documentId}/${fileName}`

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('document-files')
        .remove([filePath])

      if (error) {
        throw error
      }

      toast.success('File deleted successfully')

      if (onFileDelete) {
        onFileDelete(fileUrl)
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete file')
    } finally {
      setDeleting(null)
    }
  }

  const getFileName = (url: string) => {
    const parts = url.split('/')
    return decodeURIComponent(parts[parts.length - 1])
  }

  if (!fileUrls || fileUrls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No files uploaded yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {fileUrls.map((url, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">{getFileName(url)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(url)}
              disabled={deleting === url}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
