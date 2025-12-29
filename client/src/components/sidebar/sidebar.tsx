import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'
import { ConversationList } from '../conversation/conversation-list'
import { UserList } from './user-list'

interface SidebarProps {
  onSelectConversation: (conversationId: string) => void
  activeConversationId: string | null
}

export function Sidebar({ onSelectConversation, activeConversationId }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { loadConversations } = useChatStore()
  const [showUserList, setShowUserList] = useState(false)

  const handleClearAll = async () => {
    if (confirm('Delete all conversations and messages? This cannot be undone.')) {
      const { zegoService } = await import('@/services/zego')
      await zegoService.deleteAllConversations()
      await loadConversations()
    }
  }

  return (
    <div className="w-80 min-w-80 border-r border-gray-800 flex flex-col bg-gray-900 h-full">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <div className="flex gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-lg bg-red-900 text-red-300 hover:bg-red-800 text-sm transition-colors"
            >
              Clear
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{user?.username}</p>
            <p className="text-sm text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => setShowUserList(!showUserList)}
          className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          {showUserList ? 'Show Conversations' : 'New Chat'}
        </button>
      </div>

      {showUserList ? (
        <UserList onSelectUser={() => setShowUserList(false)} />
      ) : (
        <ConversationList
          onSelectConversation={onSelectConversation}
          activeConversationId={activeConversationId}
        />
      )}
    </div>
  )
}
