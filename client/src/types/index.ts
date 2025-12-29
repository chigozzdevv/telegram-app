export interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface MessageReaction {
  emoji: string
  users: string[]
  count: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file' | 'audio' | 'video'
  reply_to?: string
  replied_info?: any
  reactions: MessageReaction[]
  is_edited: boolean
  is_deleted: boolean
  is_read?: boolean
  created_at: string
  updated_at: string
  sender?: User
  status?: 'sending' | 'success' | 'failed'
  _raw?: any
}

export interface Conversation {
  id: string
  conversationName?: string
  lastMessage?: any
  unreadMessageCount: number
  orderKey: number
  type: number
  other_user?: User
}

export interface TypingStatus {
  user_id: string
  conversation_id: string
  is_typing: boolean
}
