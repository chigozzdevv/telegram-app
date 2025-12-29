import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'
import { apiService } from '@/services/api'
import type { User } from '@/types'

interface UserListProps {
  onSelectUser: (userId: string) => void
}

export function UserList({ onSelectUser }: UserListProps) {
  const { user: currentUser } = useAuthStore()
  const { startConversation, setActiveConversation } = useChatStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadUsers()
  }, [search])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await apiService.getUsers(search)
      setUsers(data.filter((u: User) => u.id !== currentUser?.id))
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = async (userId: string) => {
    try {
      const conversationId = await startConversation(userId)
      setActiveConversation(conversationId)
      onSelectUser(userId)
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No users found</div>
        ) : (
          users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className="w-full p-4 flex items-center gap-3 border-b border-gray-800 hover:bg-gray-800 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{user.username}</p>
                <p className="text-sm text-gray-400 mt-1">{user.email}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
