import { Router } from 'express'

export const authRoutes = Router()

authRoutes.post('/signup', async (req, res) => {
  res.json({ message: 'Signup handled by Supabase client' })
})

authRoutes.post('/login', async (req, res) => {
  res.json({ message: 'Login handled by Supabase client' })
})

authRoutes.post('/logout', async (req, res) => {
  res.json({ message: 'Logout handled by Supabase client' })
})
