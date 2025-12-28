import axios from 'axios'
import { config } from '@/config'

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  async getZegoToken(userId: string): Promise<{ token: string }> {
    const response = await api.get(`/api/zego/token?user_id=${userId}`)
    return response.data
  },

  async getUsers(search?: string): Promise<any[]> {
    const response = await api.get('/api/users', { params: { search } })
    return response.data
  },

  async getConversations(): Promise<any[]> {
    const response = await api.get('/api/conversations')
    return response.data
  },

  async createConversation(participantId: string): Promise<any> {
    const response = await api.post('/api/conversations', { participant_id: participantId })
    return response.data
  },

  async getMessages(conversationId: string, limit = 50, before?: string): Promise<any[]> {
    const response = await api.get(`/api/conversations/${conversationId}/messages`, {
      params: { limit, before },
    })
    return response.data
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.post(`/api/conversations/${conversationId}/read`)
  },

  async saveMessage(message: any): Promise<void> {
    await api.post('/api/messages', message)
  },

  async addReaction(messageId: string, emoji: string): Promise<void> {
    await api.post('/api/messages/reactions', { message_id: messageId, emoji })
  },

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    await api.delete('/api/messages/reactions', { 
      data: { message_id: messageId, emoji } 
    })
  },

  async editMessage(messageId: string, content: string): Promise<any> {
    const response = await api.patch(`/api/messages/${messageId}`, { content })
    return response.data
  },

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/api/messages/${messageId}`)
  },
}

export default api
