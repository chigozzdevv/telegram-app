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
    .map(userId => {
      const msg = conversationMessages.find(m => m.sender_id === userId)
      return msg?.sender?.username || 'Someone'
    })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages, typingUsernames])

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
            {otherUser?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {otherUser?.username || 'Unknown User'}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {conversationMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onReply={setReplyingTo}
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
