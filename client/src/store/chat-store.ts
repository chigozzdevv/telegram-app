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
  loading: boolean
  
  loadConversations: () => Promise<void>
  loadMessages: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, content: string, replyTo?: string) => Promise<void>
  sendMediaMessage: (conversationId: string, file: File, type: 'image' | 'file' | 'audio' | 'video', onProgress?: (current: number, total: number) => void) => Promise<Message>
  setActiveConversation: (conversationId: string | null) => void
  createConversation: (participantId: string) => Promise<string>
  addMessage: (message: Message) => void
  updateTypingStatus: (status: TypingStatus) => void
  sendTyping: (conversationId: string, isTyping: boolean) => void
  addReaction: (messageId: string, conversationId: string, emoji: string) => Promise<void>
  removeReaction: (messageId: string, conversationId: string, emoji: string) => Promise<void>
  markAsRead: (conversationId: string) => Promise<void>
  editMessage: (messageId: string, conversationId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string, conversationId: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  typingUsers: {},
  loading: false,

  loadConversations: async () => {
    try {
      const conversations = await apiService.getConversations()
      set({ conversations })
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  },

  loadMessages: async (conversationId) => {
    set({ loading: true })
    try {
      const messages = await apiService.getMessages(conversationId)
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages,
        },
      }))
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      set({ loading: false })
    }
  },

  sendMessage: async (conversationId, content, replyTo) => {
    try {
      const conversation = get().conversations.find(c => c.id === conversationId)
      const otherUserId = conversation?.other_user?.id
      if (!otherUserId) throw new Error('Could not find other user')
      
      const currentUser = useAuthStore.getState().user
      if (!currentUser) throw new Error('Not authenticated')
      
      const zegoConversationId = otherUserId.replace(/-/g, '').substring(0, 32)
      
      const message = await zegoService.sendMessage(zegoConversationId, content, 'text', replyTo)
      
      await apiService.saveMessage({
        id: message.id,
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content,
        type: 'text',
        reply_to: replyTo,
      })

      const messageWithConvId = { ...message, conversation_id: conversationId, sender_id: currentUser.id }
      get().addMessage(messageWithConvId)
      get().loadConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  },

  sendMediaMessage: async (conversationId, file, type, onProgress) => {
    try {
      const conversation = get().conversations.find(c => c.id === conversationId)
      const otherUserId = conversation?.other_user?.id
      if (!otherUserId) throw new Error('Could not find other user')
      
      const currentUser = useAuthStore.getState().user
      if (!currentUser) throw new Error('Not authenticated')
      
      const zegoConversationId = otherUserId.replace(/-/g, '').substring(0, 32)
      
      const message = await zegoService.sendMessage(
        zegoConversationId,
        '',
        type,
        undefined,
        file,
        onProgress
      )
      
      await apiService.saveMessage({
        id: message.id,
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: message.content,
        type,
      })

      const messageWithConvId = { ...message, conversation_id: conversationId, sender_id: currentUser.id }
      get().addMessage(messageWithConvId)
      get().loadConversations()
      return messageWithConvId
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

  createConversation: async (participantId) => {
    try {
      const conversation = await apiService.createConversation(participantId)
      set((state) => ({
        conversations: [conversation, ...state.conversations],
      }))
      return conversation.id
    } catch (error) {
      console.error('Failed to create conversation:', error)
      throw error
    }
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
      const conversation = get().conversations.find(c => c.id === conversationId)
      const otherUserId = conversation?.other_user?.id
      if (!otherUserId) return
      
      const zegoConversationId = otherUserId.replace(/-/g, '').substring(0, 32)
      await zegoService.sendTypingStatus(zegoConversationId, isTyping)
    } catch (error) {
      console.error('Failed to send typing status:', error)
    }
  },

  addReaction: async (messageId, conversationId, emoji) => {
    const userId = zegoService.getCurrentUserId()
    try {
      const conversation = get().conversations.find(c => c.id === conversationId)
      const otherUserId = conversation?.other_user?.id
      if (!otherUserId) throw new Error('Could not find other user')
      
      const zegoConversationId = otherUserId.replace(/-/g, '').substring(0, 32)
      
      await zegoService.addReaction(messageId, zegoConversationId, emoji)
      await apiService.addReaction(messageId, emoji)
      
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.map(m =>
            m.id === messageId
              ? { ...m, reactions: [...(m.reactions || []), { user_id: userId!, emoji, created_at: new Date().toISOString() }] }
              : m
          ) || [],
        },
      }))
    } catch (error) {
      console.error('Failed to add reaction:', error)
      throw error
    }
  },

  removeReaction: async (messageId, conversationId, emoji) => {
    const userId = zegoService.getCurrentUserId()
    try {
      const conversation = get().conversations.find(c => c.id === conversationId)
      const otherUserId = conversation?.other_user?.id
      if (!otherUserId) throw new Error('Could not find other user')
      
      const zegoConversationId = otherUserId.replace(/-/g, '').substring(0, 32)
      
      await zegoService.removeReaction(messageId, zegoConversationId, emoji)
      await apiService.removeReaction(messageId, emoji)
      
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.map(m =>
            m.id === messageId
              ? { ...m, reactions: (m.reactions || []).filter(r => !(r.user_id === userId && r.emoji === emoji)) }
              : m
          ) || [],
        },
      }))
    } catch (error) {
      console.error('Failed to remove reaction:', error)
      throw error
    }
  },

  markAsRead: async (conversationId) => {
    try {
      await apiService.markAsRead(conversationId)
      // Reload conversations to update unread counts
      get().loadConversations()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  },

  editMessage: async (messageId, conversationId, content) => {
    try {
      await apiService.editMessage(messageId, content)
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.map(m =>
            m.id === messageId ? { ...m, content, is_edited: true } : m
          ) || [],
        },
      }))
    } catch (error) {
      console.error('Failed to edit message:', error)
      throw error
    }
  },

  deleteMessage: async (messageId, conversationId) => {
    try {
      await apiService.deleteMessage(messageId)
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.map(m =>
            m.id === messageId ? { ...m, content: '', is_deleted: true } : m
          ) || [],
        },
      }))
    } catch (error) {
      console.error('Failed to delete message:', error)
      throw error
    }
  },
}))
