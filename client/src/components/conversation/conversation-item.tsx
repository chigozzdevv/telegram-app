import { formatDistanceToNow } from '@/utils/date-helpers'
import type { Conversation } from '@/types'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const otherUser = conversation.other_user
  const lastMsg = conversation.lastMessage
  
  let lastMessageContent = ''
  if (lastMsg) {
    if (lastMsg.type === 1) {
      lastMessageContent = lastMsg.message || ''
    } else if (lastMsg.type === 11) {
      lastMessageContent = '📷 Image'
    } else if (lastMsg.type === 12) {
      lastMessageContent = '📎 File'
    } else if (lastMsg.type === 13) {
      lastMessageContent = '🎵 Audio'
    } else if (lastMsg.type === 14) {
      lastMessageContent = '🎬 Video'
    }
  }
  
  const lastMessageTime = lastMsg?.timestamp

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 border-b border-gray-800 hover:bg-gray-800 transition-colors text-left ${isActive ? 'bg-gray-800' : ''}`}
    >
      <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
        {otherUser?.username?.[0]?.toUpperCase() || conversation.conversationName?.[0]?.toUpperCase() || '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-white truncate">
            {otherUser?.username || conversation.conversationName || 'Unknown User'}
          </span>
          {lastMessageTime && (
            <span className="text-xs text-gray-500 ml-2 shrink-0">
              {formatDistanceToNow(new Date(lastMessageTime).toISOString())}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 truncate">
            {lastMessageContent || 'No messages yet'}
          </span>
          {conversation.unreadMessageCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full shrink-0">
              {conversation.unreadMessageCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
