import { create } from 'zustand'
import { supabase } from '@/services/supabase'
import { zegoService } from '@/services/zego'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          set({ user: profile })
          await zegoService.initialize(profile.id)
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    } finally {
      set({ initialized: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          set({ user: profile })
          await zegoService.initialize(profile.id)
        }
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signup: async (email, password, username) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            username,
          })

        if (profileError) throw profileError

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          set({ user: profile })
          await zegoService.initialize(profile.id)
        }
      }
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      await zegoService.logout()
      await supabase.auth.signOut()
      set({ user: null })
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  },
}))
