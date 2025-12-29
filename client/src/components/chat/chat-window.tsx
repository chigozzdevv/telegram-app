import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/store/chat-store'
import { useAuthStore } from '@/store/auth-store'
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'
import { TypingIndicator } from './typing-indicator'
import type { Message } from '@/types'

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { messages, typingUsers, conversations } = useChatStore()
  const { user } = useAuthStore()
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationMessages = messages[conversationId] || []

  const conversation = conversations.find(c => c.id === conversationId)
  const otherUser = conversation?.other_user

  const typingUsernames = (typingUsers[conversationId] || [])
    .filter(userId => userId !== user?.id)
    .map(() => otherUser?.username || 'Someone')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages, typingUsernames])

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
            {otherUser?.username?.[0]?.toUpperCase() || conversation?.conversationName?.[0]?.toUpperCase() || '?'}
          </div>
          <h2 className="text-lg font-semibold text-white">
            {otherUser?.username || conversation?.conversationName || 'Unknown User'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
        {conversationMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {conversationMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onReply={setReplyingTo}
                conversationId={conversationId}
              />
            ))}
            <TypingIndicator usernames={typingUsernames} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput
        conversationId={conversationId}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  )
}
