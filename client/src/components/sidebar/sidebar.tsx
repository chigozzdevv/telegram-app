import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useUIStore } from '@/store/ui-store'
import { ConversationList } from '../conversation/conversation-list'
import { UserList } from './user-list'

interface SidebarProps {
  onSelectConversation: (conversationId: string) => void
  activeConversationId: string | null
}

export function Sidebar({ onSelectConversation, activeConversationId }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()
  const [showUserList, setShowUserList] = useState(false)

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user?.username}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUserList(!showUserList)}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {showUserList ? 'Show Conversations' : 'New Chat'}
        </button>
      </div>

      {showUserList ? (
        <UserList
          onSelectUser={() => {
            setShowUserList(false)
          }}
        />
      ) : (
        <ConversationList
          onSelectConversation={onSelectConversation}
          activeConversationId={activeConversationId}
        />
      )}
    </div>
  )
}
