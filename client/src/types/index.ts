export interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file' | 'audio' | 'video'
  reply_to?: string
  reactions?: MessageReaction[]
  is_edited: boolean
  is_deleted: boolean
  is_read?: boolean
  created_at: string
  updated_at: string
  sender?: User
  replied_message?: Message
}

export interface MessageReaction {
  user_id: string
  emoji: string
  created_at: string
}

export interface Conversation {
  id: string
  participant_ids: string[]
  last_message?: string
  last_message_at?: string
  unread_count?: number
  created_at: string
  updated_at: string
  participants?: User[]
  other_user?: User
}

export interface TypingStatus {
  user_id: string
  conversation_id: string
  is_typing: boolean
}

export interface MessageStatus {
  message_id: string
  status: 'sent' | 'delivered' | 'read'
  user_id: string
}
