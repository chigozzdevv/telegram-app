import { useEffect } from 'react'
import { useChatStore } from '@/store/chat-store'
import { ConversationItem } from './conversation-item'

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void
  activeConversationId: string | null
}

export function ConversationList({ onSelectConversation, activeConversationId }: ConversationListProps) {
  const { conversations, loadConversations } = useChatStore()

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No conversations yet
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
