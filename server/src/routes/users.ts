import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

export const userRoutes = Router()

userRoutes.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { search } = req.query
    
    let query = supabase
      .from('users')
      .select('id, username, email, avatar_url, created_at')
      .neq('id', req.user!.id)
      .order('username')

    if (search && typeof search === 'string') {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query.limit(50)

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    console.error('Failed to fetch users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

userRoutes.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, avatar_url, created_at')
      .eq('id', id)
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})
