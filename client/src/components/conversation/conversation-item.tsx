import { formatDistanceToNow } from '@/utils/date-helpers'
import type { Conversation } from '@/types'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const otherUser = conversation.other_user

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
        isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
        {otherUser?.username?.[0]?.toUpperCase() || '?'}
      </div>
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {otherUser?.username || 'Unknown User'}
          </h3>
          {conversation.last_message_at && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatDistanceToNow(conversation.last_message_at)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {conversation.last_message || 'No messages yet'}
          </p>
          {conversation.unread_count && conversation.unread_count > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
