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
  (error) => Promise.reject(error)
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

  async getUsers(search?: string, excludeSelf?: boolean): Promise<any[]> {
    const response = await api.get('/api/users', { 
      params: { search, exclude_self: excludeSelf ? 'true' : undefined } 
    })
    return response.data
  },

  async getUserById(userId: string): Promise<any> {
    const response = await api.get(`/api/users/${userId}`)
    return response.data
  },
}

export default api
