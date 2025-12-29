import { Router } from 'express'
import { zegoService } from '../services/zego-service.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

export const zegoRoutes = Router()

zegoRoutes.get('/token', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const rawUserId = req.query.user_id as string || req.user!.id
    const userId = rawUserId.replace(/-/g, '').substring(0, 32)
    
    const token = zegoService.generateToken(userId, 3600)
    
    res.json({ token })
  } catch (error) {
    console.error('Failed to generate ZEGO token:', error)
    res.status(500).json({ error: 'Failed to generate token' })
  }
})
