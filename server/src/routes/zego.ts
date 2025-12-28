import { Router } from 'express'
import { zegoService } from '../services/zego-service'
import { authMiddleware, AuthRequest } from '../middleware/auth'

export const zegoRoutes = Router()

zegoRoutes.get('/token', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.query.user_id as string || req.user!.id
    
    const token = zegoService.generateToken(userId, 3600)
    
    res.json({ token })
  } catch (error) {
    console.error('Failed to generate ZEGO token:', error)
    res.status(500).json({ error: 'Failed to generate token' })
  }
})
