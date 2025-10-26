"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Send,
  Sparkles,
  MessageCircle,
  Loader2,
  Plus,
  X
} from "lucide-react"
import { useConversations } from "@/hooks/use-conversations"
import { useToast } from "@/hooks/use-toast"
import { cn, getContentString } from "@/lib/utils"
import { StreamProvider, useStreamContext } from "@/providers/Stream"
import { Message } from "@langchain/langgraph-sdk"
import { v4 as uuidv4 } from "uuid"
import { ensureToolCallsHaveResponses } from "@/lib/ensure-tool-responses"
import { Markdown } from "@/components/ui/markdown"
import { useCurrentDocument } from "@/providers/current-document"

const CURRENT_DOC_TAG_PATTERN = /^<current_doc>.*?<\/current_doc>\s*/i

function SidechatContent() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollViewportRef = useRef<HTMLDivElement>(null)
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false)
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false)
  const { toast } = useToast()
  const { currentDocumentId } = useCurrentDocument()

  const {
    currentConversation,
    createConversation,
  } = useConversations()

  // Use LangGraph SDK stream
  const stream = useStreamContext()
  const isLoading = stream.isLoading
  const messages = stream.messages ?? []

  // Track loading state changes
  useEffect(() => {
    console.log('isLoading changed:', isLoading, 'messages count:', messages.length)
  }, [isLoading, messages.length])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight
    }
  }, [messages.length, isLoading])

  const handleStartNewChat = () => {
    setIsNewChatDialogOpen(true)
  }

  const handleConfirmNewChat = async () => {
    if (isCreatingNewChat) return

    try {
      setIsCreatingNewChat(true)
      await createConversation()
      setIsNewChatDialogOpen(false)
      setInput("")
      inputRef.current?.focus()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      })
    } finally {
      setIsCreatingNewChat(false)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsNewChatDialogOpen(open)
    if (!open) {
      setIsCreatingNewChat(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Create conversation if needed
    let conversation = currentConversation
    if (!conversation) {
      try {
        const newConv = await createConversation()
        conversation = { conversation: newConv, messages: [] }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        })
        return
      }
    }

    if (!conversation) return

    // Create user message with proper LangGraph format
    const hiddenTag = currentDocumentId ? `<current_doc>${currentDocumentId}</current_doc>` : ""

    const newHumanMessage: Message = {
      id: uuidv4(),
      type: "human",
      content: `${hiddenTag}${input}`,
    }

    // Clear input immediately for better UX
    const messageText = input
    setInput("")

    // Ensure all tool calls have responses (prevents graph from getting stuck)
    const toolMessages = ensureToolCallsHaveResponses(messages)

    // Submit to LangGraph with ALL previous messages for context + tool responses
    try {
      stream.submit(
        { messages: [...messages, ...toolMessages, newHumanMessage] },
        {
          streamMode: ["values"],
        }
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
      // Restore input on error
      setInput(messageText)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50 flex items-center justify-center"
        aria-label="Toggle chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Container */}
          <div className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-background border rounded-lg shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200">
            {/* Header */}
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Assistant
              </h2>
              <div className="flex items-center gap-2">
                <Button onClick={handleStartNewChat} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Dialog open={isNewChatDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a new chat</DialogTitle>
                  <DialogDescription>
                    Starting a new chat will clear the current conversation history.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                    disabled={isCreatingNewChat}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmNewChat}
                    disabled={isCreatingNewChat}
                    className="gap-2"
                  >
                    {isCreatingNewChat ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      "Start chat"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                Messages
              </div>
              <div className="flex-1 overflow-hidden">
                <div
                  ref={scrollViewportRef}
                  className="h-full overflow-y-auto px-4"
                >
                  <div className="space-y-4 py-4">
                    {messages.length === 0 && !isLoading ? (
                      <div className="text-center text-muted-foreground text-sm mt-8 px-4">
                        Start a conversation to manage your documents with AI
                      </div>
                    ) : (
                      <>
                        {messages
                          .filter((message) => {
                            // Skip tool result messages
                            if (message.type === "tool") {
                              console.log('Filtering out tool message:', message.id)
                              return false
                            }
                            // Skip messages with do-not-render prefix
                            if (message.id?.startsWith("do-not-render-")) {
                              console.log('Filtering out do-not-render message:', message.id)
                              return false
                            }
                            console.log('Message passed filter:', message.type, message.id)
                            return true
                          })
                          .map((message) => {
                            // Debug: log raw content structure
                            console.log('Raw message content:', {
                              type: message.type,
                              id: message.id,
                              content: message.content,
                              contentType: typeof message.content,
                              isArray: Array.isArray(message.content),
                              hasAdditionalKwargs: !!(message as any).additional_kwargs,
                              additionalKwargsKeys: (message as any).additional_kwargs ? Object.keys((message as any).additional_kwargs) : []
                            })

                            // Extract text content from message
                            const content = getContentString(message.content ?? "")
                            const displayContent = content.replace(CURRENT_DOC_TAG_PATTERN, "")

                            console.log('Rendering message:', {
                              type: message.type,
                              id: message.id,
                              contentLength: content.length,
                              displayContentLength: displayContent.length,
                              displayContentPreview: displayContent.substring(0, 100),
                              hasToolCalls: !!(message.tool_calls && message.tool_calls.length > 0)
                            })

                            // Show tool-only messages
                            const hasToolCalls = message.tool_calls && message.tool_calls.length > 0

                            // Skip only if no content AND no tool calls
                            if (!displayContent.trim() && !hasToolCalls) {
                              console.log('SKIPPING message (no content, no tools):', message.id)
                              return null
                            }

                            console.log('RENDERING message to DOM:', message.type, message.id)

                            return (
                              <div key={message.id}>
                                <div
                                  className={cn(
                                    "p-3 rounded-lg text-sm",
                                    message.type === "human"
                                      ? "bg-primary text-primary-foreground ml-4"
                                      : "bg-muted mr-4"
                                  )}
                                >
                                  <div className="text-xs font-medium mb-1 opacity-70">
                                    {message.type === "human" ? "You" : "Assistant"}
                                  </div>
                                  {displayContent.trim() ? (
                                    <Markdown>{displayContent}</Markdown>
                                  ) : hasToolCalls ? (
                                    <div className="text-muted-foreground italic">Using tools...</div>
                                  ) : null}
                                </div>
                                {/* Optional: Show tool usage indicator */}
                                {message.tool_calls && message.tool_calls.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1 ml-1 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Used {message.tool_calls.length} tool{message.tool_calls.length > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        {/* Show loading indicator */}
                        {isLoading && (
                          <div className="p-3 rounded-lg text-sm bg-muted mr-4 flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Assistant is thinking...</span>
                          </div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-2">
              {stream.error && (
                <div className="text-xs text-destructive p-2 bg-destructive/10 rounded">
                  {(stream.error as any).message || "An error occurred"}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1"
                  disabled={isLoading}
                  ref={inputRef}
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// Wrapper component that provides Stream context
export function Sidechat() {
  const { currentConversation } = useConversations()
  const threadId = currentConversation?.conversation.thread_id || null

  return (
    <StreamProvider threadId={threadId}>
      <SidechatContent />
    </StreamProvider>
  )
}
