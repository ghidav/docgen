"use client"

import { useState, useEffect, useCallback } from 'react'
import { Message } from './use-chat-stream'

export interface Conversation {
  id: string
  title: string
  thread_id: string
  description?: string
  tags?: string[]
  message_count: number
  created_at: string
  updated_at: string
  last_message_at?: string
}

export interface ConversationWithMessages {
  conversation: Conversation
  messages: Message[]
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ConversationWithMessages | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat/conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const data = await response.json()
      setConversations(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load a specific conversation with messages
  const loadConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`)
      if (!response.ok) {
        throw new Error('Failed to load conversation')
      }
      const data = await response.json()
      setCurrentConversation(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new conversation
  const createConversation = useCallback(async (title?: string, description?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = {}
      if (title !== undefined) {
        payload.title = title
      }
      if (description !== undefined) {
        payload.description = description
      }

      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      const newConversation = await response.json()

      // Set as current conversation with empty messages
      setCurrentConversation({
        conversation: newConversation,
        messages: [],
      })

      // Refresh conversations list
      await fetchConversations()

      return newConversation
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [fetchConversations])

  // Update conversation metadata
  const updateConversation = useCallback(
    async (conversationId: string, updates: { title?: string; description?: string; tags?: string[] }) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/chat/conversations/${conversationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          throw new Error('Failed to update conversation')
        }

        const updated = await response.json()

        // Update current conversation if it's the one being edited
        if (currentConversation?.conversation.id === conversationId) {
          setCurrentConversation({
            ...currentConversation,
            conversation: updated,
          })
        }

        // Refresh conversations list
        await fetchConversations()

        return updated
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [currentConversation, fetchConversations]
  )

  // Delete a conversation
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/chat/conversations/${conversationId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete conversation')
        }

        // Clear current conversation if it's the one being deleted
        if (currentConversation?.conversation.id === conversationId) {
          setCurrentConversation(null)
        }

        // Refresh conversations list
        await fetchConversations()
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [currentConversation, fetchConversations]
  )

  // Add a message to the current conversation (optimistic update)
  const addMessage = useCallback((message: Message) => {
    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
    } : null)
  }, [])

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    currentConversation,
    isLoading,
    error,
    fetchConversations,
    loadConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    addMessage,
    setCurrentConversation,
  }
}
