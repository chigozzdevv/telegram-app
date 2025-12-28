import { Router } from 'express'
import { supabase } from '../config/supabase'
import { authMiddleware, AuthRequest } from '../middleware/auth'

export const conversationRoutes = Router()

conversationRoutes.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [userId])
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) throw error

    // Get user's read status for all conversations
    const { data: readStatuses } = await supabase
      .from('message_status')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId)

    const readMap = new Map(readStatuses?.map(s => [s.conversation_id, s.last_read_at]) || [])

    // Get all participant user data
    const allParticipantIds = [...new Set(conversations?.flatMap(c => c.participant_ids) || [])]
    const { data: users } = await supabase
      .from('users')
      .select('id, username, email, avatar_url')
      .in('id', allParticipantIds)

    const userMap = new Map(users?.map(u => [u.id, u]) || [])

    // Calculate unread counts and attach user data
    const conversationsWithUnread = await Promise.all(
      (conversations || []).map(async (conv) => {
        const lastRead = readMap.get(conv.id)
        
        let unreadQuery = supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)

        if (lastRead) {
          unreadQuery = unreadQuery.gt('created_at', lastRead)
        }

        const { count } = await unreadQuery
        const otherUserId = conv.participant_ids?.find((pid: string) => pid !== userId)
        const otherUser = otherUserId ? userMap.get(otherUserId) : null

        return {
          ...conv,
          other_user: otherUser,
          unread_count: count || 0,
        }
      })
    )

    res.json(conversationsWithUnread)
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

conversationRoutes.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { participant_id } = req.body
    const userId = req.user!.id

    if (!participant_id) {
      res.status(400).json({ error: 'participant_id is required' })
      return
    }

    const participantIds = [userId, participant_id].sort()

    const { data: existing, error: existingError } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', participantIds)
      .eq('participant_ids', participantIds)
      .single()

    if (existing) {
      res.json(existing)
      return
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        participant_ids: participantIds,
      })
      .select()
      .single()

    if (error) throw error

    res.json(conversation)
  } catch (error) {
    console.error('Failed to create conversation:', error)
    res.status(500).json({ error: 'Failed to create conversation' })
  }
})

conversationRoutes.get('/:id/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { limit = 50, before } = req.query
    const userId = req.user!.id

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, email, avatar_url),
        replied_message:messages!messages_reply_to_fkey(
          id,
          content,
          sender:users!messages_sender_id_fkey(id, username)
        ),
        reactions:message_reactions(user_id, emoji, created_at)
      `)
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
      .limit(parseInt(limit as string))

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query
    if (error) throw error

    // Get read status for the other participant
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participant_ids')
      .eq('id', id)
      .single()

    const otherUserId = conversation?.participant_ids?.find((pid: string) => pid !== userId)
    
    let otherUserLastRead: string | null = null
    if (otherUserId) {
      const { data: status } = await supabase
        .from('message_status')
        .select('last_read_at')
        .eq('conversation_id', id)
        .eq('user_id', otherUserId)
        .single()
      
      otherUserLastRead = status?.last_read_at || null
    }

    // Add read status to each message
    const messagesWithStatus = messages?.map(msg => ({
      ...msg,
      is_read: msg.sender_id === userId && otherUserLastRead && new Date(msg.created_at) <= new Date(otherUserLastRead)
    }))

    res.json(messagesWithStatus || [])
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

conversationRoutes.post('/:id/read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const { error } = await supabase
      .from('message_status')
      .upsert({
        conversation_id: id,
        user_id: userId,
        last_read_at: new Date().toISOString(),
      })

    if (error) throw error

    res.json({ success: true })
  } catch (error) {
    console.error('Failed to mark as read:', error)
    res.status(500).json({ error: 'Failed to mark as read' })
  }
})
