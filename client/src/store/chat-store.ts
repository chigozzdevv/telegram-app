import { create } from 'zustand'
import { zegoService } from '@/services/zego'
import { apiService } from '@/services/api'
import { useAuthStore } from './auth-store'
import type { Message, Conversation, TypingStatus } from '@/types'

interface ChatState {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  activeConversationId: string | null
  typingUsers: Record<string, string[]>
  totalUnreadCount: number
  loading: boolean
  rawMessages: Record<string, any>

  loadConversations: () => Promise<void>
  loadMessages: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, content: string, replyToMessageId?: string) => Promise<void>
  sendMediaMessage: (conversationId: string, file: File, type: 'image' | 'file' | 'audio' | 'video', onProgress?: (current: number, total: number) => void, duration?: number) => Promise<Message>
  setActiveConversation: (conversationId: string | null) => void
  startConversation: (userId: string) => Promise<string>
  addMessage: (message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  updateTypingStatus: (status: TypingStatus) => void
  sendTyping: (conversationId: string, isTyping: boolean) => void
  addReaction: (messageId: string, conversationId: string, emoji: string) => Promise<void>
  removeReaction: (messageId: string, conversationId: string, emoji: string) => Promise<void>
  markAsRead: (conversationId: string) => Promise<void>
  editMessage: (messageId: string, conversationId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string, conversationId: string) => Promise<void>
  updateConversations: (infoList: any[]) => void
  setTotalUnreadCount: (count: number) => void
  updateMessageStatus: (messageId: string, status: 'sending' | 'success' | 'failed') => void
  updateMessageReactions: (messageId: string, reactions: any[]) => void
  updateMessageReceipt: (messageId: string, status: 'processing' | 'done') => void
  handleEditedMessage: (message: Message) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  typingUsers: {},
  totalUnreadCount: 0,
  loading: false,
  rawMessages: {},

  loadConversations: async () => {
    try {
      const zegoConversations = await zegoService.queryConversationList()
      const users = await apiService.getUsers()
      
      const conversations: Conversation[] = zegoConversations
        .filter((c: any) => c.type === 0)
        .map((c: any) => {
          const visitorId = c.conversationID
          const otherUser = users.find((u: any) => 
            u.id.replace(/-/g, '').substring(0, 32) === visitorId
          )
          
          return {
            id: c.conversationID,
            conversationName: otherUser?.username || c.conversationID,
            lastMessage: c.lastMessage,
            unreadMessageCount: c.unreadMessageCount || 0,
            orderKey: c.orderKey || 0,
            type: c.type,
            other_user: otherUser,
          }
        })
      
      set({ conversations })
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  },

  loadMessages: async (conversationId) => {
    set({ loading: true })
    try {
      const messages = await zegoService.queryHistoryMessages(conversationId)
      const rawMap: Record<string, any> = {}
      messages.forEach(m => {
        if (m._raw) rawMap[m.id] = m._raw
      })
      
      set((state) => ({
        messages: { ...state.messages, [conversationId]: messages },
        rawMessages: { ...state.rawMessages, ...rawMap },
      }))
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      set({ loading: false })
    }
  },

  sendMessage: async (conversationId, content, replyToMessageId) => {
    try {
      const currentUser = useAuthStore.getState().user
      if (!currentUser) throw new Error('Not authenticated')

      const replyToMessage = replyToMessageId ? get().rawMessages[replyToMessageId] : undefined
      const message = await zegoService.sendMessage(conversationId, content, 'text', replyToMessage)
      
      if (message._raw) {
        set((state) => ({
          rawMessages: { ...state.rawMessages, [message.id]: message._raw }
        }))
      }
      
      const messageWithSender = { ...message, sender_id: currentUser.id }
      get().addMessage(messageWithSender)
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  },

  sendMediaMessage: async (conversationId, file, type, onProgress, duration) => {
    try {
      const currentUser = useAuthStore.getState().user
      if (!currentUser) throw new Error('Not authenticated')

      const message = await zegoService.sendMessage(
        conversationId,
        '',
        type,
        undefined,
        file,
        onProgress,
        type === 'audio' ? duration : undefined,
        type === 'video' ? duration : undefined
      )

      if (message._raw) {
        set((state) => ({
          rawMessages: { ...state.rawMessages, [message.id]: message._raw }
        }))
      }

      const messageWithSender = { ...message, sender_id: currentUser.id }
      get().addMessage(messageWithSender)
      return messageWithSender
    } catch (error) {
      console.error('Failed to send media message:', error)
      throw error
    }
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId })
    if (conversationId) {
      get().loadMessages(conversationId)
      get().markAsRead(conversationId)
    }
  },

  startConversation: async (userId) => {
    const shortUserId = userId.replace(/-/g, '').substring(0, 32)
    await get().loadConversations()
    return shortUserId
  },

  addMessage: (message) => {
    set((state) => {
      const conversationMessages = state.messages[message.conversation_id] || []
      const exists = conversationMessages.some(m => m.id === message.id)
      if (exists) return state

      return {
        messages: {
          ...state.messages,
          [message.conversation_id]: [...conversationMessages, message],
        },
      }
    })
  },

  updateMessage: (conversationId, messageId, updates) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map(m =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      },
    }))
  },

  updateTypingStatus: (status) => {
    set((state) => {
      const currentTyping = state.typingUsers[status.conversation_id] || []

      if (status.is_typing) {
        if (!currentTyping.includes(status.user_id)) {
          return {
            typingUsers: {
              ...state.typingUsers,
              [status.conversation_id]: [...currentTyping, status.user_id],
            },
          }
        }
      } else {
        return {
          typingUsers: {
            ...state.typingUsers,
            [status.conversation_id]: currentTyping.filter(id => id !== status.user_id),
          },
        }
      }

      return state
    })
  },

  sendTyping: async (conversationId, isTyping) => {
    try {
      await zegoService.sendTypingStatus(conversationId, isTyping)
    } catch {}
  },

  addReaction: async (messageId, _conversationId, emoji) => {
    try {
      const rawMessage = get().rawMessages[messageId]
      if (!rawMessage) throw new Error('Message not found')
      await zegoService.addReaction(rawMessage, emoji)
    } catch (error) {
      console.error('Failed to add reaction:', error)
      throw error
    }
  },

  removeReaction: async (messageId, _conversationId, emoji) => {
    try {
      const rawMessage = get().rawMessages[messageId]
      if (!rawMessage) throw new Error('Message not found')
      await zegoService.removeReaction(rawMessage, emoji)
    } catch (error) {
      console.error('Failed to remove reaction:', error)
      throw error
    }
  },

  markAsRead: async (conversationId) => {
    try {
      await zegoService.clearConversationUnread(conversationId)
      const messages = get().messages[conversationId] || []
      const rawMessages = messages.map(m => get().rawMessages[m.id]).filter(Boolean)
      if (rawMessages.length > 0) {
        await zegoService.sendReadReceipt(rawMessages, conversationId)
      }
    } catch {}
  },

  editMessage: async (messageId, conversationId, content) => {
    try {
      const rawMessage = get().rawMessages[messageId]
      if (!rawMessage) throw new Error('Message not found')
      
      const edited = await zegoService.editMessage(rawMessage, content)
      
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: (state.messages[conversationId] || []).map(m =>
            m.id === messageId ? { ...m, content, is_edited: true } : m
          ),
        },
        rawMessages: edited._raw ? { ...state.rawMessages, [messageId]: edited._raw } : state.rawMessages,
      }))
    } catch (error) {
      console.error('Failed to edit message:', error)
      throw error
    }
  },

  deleteMessage: async (messageId, conversationId) => {
    try {
      const rawMessage = get().rawMessages[messageId]
      if (!rawMessage) throw new Error('Message not found')
      
      await zegoService.deleteMessages([rawMessage], conversationId)
      
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: (state.messages[conversationId] || []).filter(m => m.id !== messageId),
        },
      }))
    } catch (error) {
      console.error('Failed to delete message:', error)
      throw error
    }
  },

  updateConversations: (infoList) => {
    set((state) => {
      const updated = [...state.conversations]
      infoList.forEach((info: any) => {
        const idx = updated.findIndex(c => c.id === info.conversation?.conversationID)
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            lastMessage: info.conversation?.lastMessage,
            unreadMessageCount: info.conversation?.unreadMessageCount,
            orderKey: info.conversation?.orderKey,
          }
        }
      })
      return { conversations: updated.sort((a, b) => b.orderKey - a.orderKey) }
    })
  },

  setTotalUnreadCount: (count) => {
    set({ totalUnreadCount: count })
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => {
      const newMessages = { ...state.messages }
      for (const convId in newMessages) {
        newMessages[convId] = newMessages[convId].map(m =>
          m.id === messageId ? { ...m, status } : m
        )
      }
      return { messages: newMessages }
    })
  },

  updateMessageReactions: (messageId, reactions) => {
    set((state) => {
      const newMessages = { ...state.messages }
      for (const convId in newMessages) {
        newMessages[convId] = newMessages[convId].map(m =>
          m.id === messageId ? { ...m, reactions: reactions.map((r: any) => ({
            emoji: r.reactionType,
            users: r.userList || [],
            count: r.totalCount || 0,
          })) } : m
        )
      }
      return { messages: newMessages }
    })
  },

  updateMessageReceipt: (messageId, status) => {
    set((state) => {
      const newMessages = { ...state.messages }
      for (const convId in newMessages) {
        newMessages[convId] = newMessages[convId].map(m =>
          m.id === messageId ? { ...m, is_read: status === 'done' } : m
        )
      }
      return { messages: newMessages }
    })
  },

  handleEditedMessage: (message) => {
    set((state) => {
      const convMessages = state.messages[message.conversation_id]
      if (!convMessages) return state
      
      return {
        messages: {
          ...state.messages,
          [message.conversation_id]: convMessages.map(m =>
            m.id === message.id ? message : m
          ),
        },
        rawMessages: message._raw ? { ...state.rawMessages, [message.id]: message._raw } : state.rawMessages,
      }
    })
  },
}))
