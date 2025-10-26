import { useEffect, useRef, useState } from "react"
import type { Document } from "@/types/document"
import { apiClient } from "@/lib/api"

interface UseDocumentPollingOptions {
  enabled?: boolean
  interval?: number
  onUpdate?: (documents: Document[]) => void
}

export function useDocumentPolling(options: UseDocumentPollingOptions = {}) {
  const { enabled = true, interval = 5000, onUpdate } = options
  const [documents, setDocuments] = useState<Document[]>([])
  const [lastFetch, setLastFetch] = useState<number>(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchDocuments = async () => {
    try {
      const docs = await apiClient.listDocuments()
      setDocuments(docs)
      setLastFetch(Date.now())
      if (onUpdate) {
        onUpdate(docs)
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err)
    }
  }

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Initial fetch
    fetchDocuments()

    // Set up polling
    intervalRef.current = setInterval(fetchDocuments, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval])

  return {
    documents,
    lastFetch,
    refresh: fetchDocuments,
  }
}
