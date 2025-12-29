import { useChatStore } from '@/store/chat-store'
import { ConversationItem } from './conversation-item'

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void
  activeConversationId: string | null
}

export function ConversationList({ onSelectConversation, activeConversationId }: ConversationListProps) {
  const { conversations } = useChatStore()

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-6 text-center text-gray-400">No conversations yet</div>
      ) : (
        conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            onClick={() => onSelectConversation(conversation.id)}
          />
        ))
      )}
    </div>
  )
}
