import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

export const messageRoutes = Router()

messageRoutes.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id, conversation_id, sender_id, content, type, reply_to } = req.body

    if (sender_id !== req.user!.id) {
      res.status(403).json({ error: 'Cannot send message as another user' })
      return
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        id,
        conversation_id,
        sender_id,
        content,
        type,
        reply_to,
      })
      .select()
      .single()

    if (error) throw error

    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation_id)

    res.json(data)
  } catch (error) {
    console.error('Failed to save message:', error)
    res.status(500).json({ error: 'Failed to save message' })
  }
})

messageRoutes.post('/reactions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { message_id, emoji } = req.body
    const user_id = req.user!.id

    const { data, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id,
        user_id,
        emoji,
      })
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Failed to add reaction:', error)
    res.status(500).json({ error: 'Failed to add reaction' })
  }
})

messageRoutes.delete('/reactions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { message_id, emoji } = req.body
    const user_id = req.user!.id

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', message_id)
      .eq('user_id', user_id)
      .eq('emoji', emoji)

    if (error) throw error

    res.json({ success: true })
  } catch (error) {
    console.error('Failed to remove reaction:', error)
    res.status(500).json({ error: 'Failed to remove reaction' })
  }
})

messageRoutes.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const user_id = req.user!.id

    const { data, error } = await supabase
      .from('messages')
      .update({ content, is_edited: true })
      .eq('id', id)
      .eq('sender_id', user_id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Failed to edit message:', error)
    res.status(500).json({ error: 'Failed to edit message' })
  }
})

messageRoutes.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const user_id = req.user!.id

    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true, content: '' })
      .eq('id', id)
      .eq('sender_id', user_id)

    if (error) throw error

    res.json({ success: true })
  } catch (error) {
    console.error('Failed to delete message:', error)
    res.status(500).json({ error: 'Failed to delete message' })
  }
})
