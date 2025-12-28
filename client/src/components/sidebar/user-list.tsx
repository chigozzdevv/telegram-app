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
  const { createConversation, setActiveConversation } = useChatStore()
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
      setUsers(data.filter(u => u.id !== currentUser?.id))
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = async (userId: string) => {
    try {
      const conversationId = await createConversation(userId)
      setActiveConversation(conversationId)
      onSelectUser(userId)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className="w-full p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
