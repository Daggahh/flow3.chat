"use client"

import { useCallback, useEffect, useState } from "react"
import { db } from "../lib/db/local"
import { nanoid } from "nanoid"
import { LocalMessage, LocalConversation } from "../lib/db/local"

const RATE_LIMIT_KEY = "flow3-message-count"
const RATE_LIMIT_RESET_KEY = "flow3-rate-limit-reset"

export interface Message extends LocalMessage {}
export interface ChatSession extends Omit<LocalConversation, "synced"> {
  messages: Message[]
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [lastResetTime, setLastResetTime] = useState<number>(0)
  const [streamController, setStreamController] = useState<AbortController | null>(null)
  const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState<string | null>(null)

  // Load conversations from IndexedDB
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const conversations = await db.conversations.toArray()
      const messages = await db.messages.toArray()

      const sessionsWithMessages = conversations.map(conv => ({
        ...conv,
        messages: messages
          .filter(msg => msg.conversation_id === conv.id)
          .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
      }))

      setSessions(sessionsWithMessages)
      
      // If no current session is selected but we have sessions, select the first one
      if (!currentSessionId && sessionsWithMessages.length > 0) {
        setCurrentSessionId(sessionsWithMessages[0].id)
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentSessionId])

  // Initialize message count from localStorage
  useEffect(() => {
    const storedCount = localStorage.getItem(RATE_LIMIT_KEY)
    const storedResetTime = localStorage.getItem(RATE_LIMIT_RESET_KEY)
    
    if (storedCount) setMessageCount(parseInt(storedCount))
    if (storedResetTime) setLastResetTime(parseInt(storedResetTime))
    
    loadConversations()
  }, [loadConversations])

  const incrementMessageCount = useCallback(() => {
    const newCount = messageCount + 1
    setMessageCount(newCount)
    localStorage.setItem(RATE_LIMIT_KEY, newCount.toString())
  }, [messageCount])

  const createNewChat = useCallback(async () => {
    const id = nanoid()
    const newChat: LocalConversation = {
      id,
      title: "New Chat",
      created_at: new Date(),
      updated_at: new Date(),
      is_pinned: false,
      synced: false
    }

    await db.conversations.add(newChat)
    await loadConversations()
    setCurrentSessionId(id)
    return id
  }, [loadConversations])

  const sendMessage = useCallback(
    async (content: string, model: string, apiKey: string, sessionId?: string) => {
      let activeSessionId = sessionId || currentSessionId
      
      if (!activeSessionId) {
        activeSessionId = await createNewChat()
      }

      const messageId = nanoid()
      const userMessage: LocalMessage = {
        id: messageId,
        conversation_id: activeSessionId,
        content,
        role: "user",
        created_at: new Date(),
        synced: false
      }

      await db.messages.add(userMessage)
      incrementMessageCount()

      const controller = new AbortController()
      setStreamController(controller)
      setIsStreaming(true)
      setCurrentStreamingMessageId(messageId)

      try {
        // API call logic here
        // After response:
        const assistantMessage: LocalMessage = {
          id: nanoid(),
          conversation_id: activeSessionId,
          content: "API Response",
          role: "assistant",
          model,
          created_at: new Date(),
          synced: false
        }
        
        await db.messages.add(assistantMessage)
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setIsStreaming(false)
        setStreamController(null)
        setCurrentStreamingMessageId(null)
        await loadConversations()
      }
    },
    [currentSessionId, loadConversations, incrementMessageCount, createNewChat]
  )

  const togglePinThread = useCallback(
    async (sessionId: string) => {
      const conversation = await db.conversations.get(sessionId)
      if (conversation) {
        await db.conversations.update(sessionId, {
          is_pinned: !conversation.is_pinned
        })
        await loadConversations()
      }
    },
    [loadConversations]
  )

  const deleteThread = useCallback(
    async (sessionId: string) => {
      await db.conversations.delete(sessionId)
      await db.messages.where("conversation_id").equals(sessionId).delete()
      
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId)
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].id)
        } else {
          setCurrentSessionId("")
        }
      }
      
      await loadConversations()
    },
    [currentSessionId, sessions, loadConversations]
  )

  const stopStreaming = useCallback(() => {
    if (streamController) {
      streamController.abort()
      setStreamController(null)
      setIsStreaming(false)
    }
  }, [streamController])

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    isLoading,
    isStreaming,
    createNewChat,
    sendMessage,
    stopStreaming,
    togglePinThread,
    deleteThread,
    refreshConversations: loadConversations,
    messageCount,
    currentStreamingMessageId,
  }
}
