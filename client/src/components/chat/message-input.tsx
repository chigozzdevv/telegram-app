import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/store/chat-store'
import type { Message } from '@/types'

interface MessageInputProps {
  conversationId: string
  replyingTo: Message | null
  onCancelReply: () => void
}

export function MessageInput({ conversationId, replyingTo, onCancelReply }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { sendMessage, sendTyping } = useChatStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus()
    }
  }, [replyingTo])

  const handleTyping = (value: string) => {
    setMessage(value)

    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      sendTyping(conversationId, true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTyping(conversationId, false)
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    try {
      await sendMessage(conversationId, message.trim(), replyingTo?.id)
      setMessage('')
      onCancelReply()

      if (isTyping) {
        setIsTyping(false)
        sendTyping(conversationId, false)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="px-6 py-4 border-t border-gray-800 bg-gray-900">
      {replyingTo && (
        <div className="mb-3 p-3 bg-gray-800 rounded-lg flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">Replying to</p>
            <p className="text-sm text-gray-300 truncate">{replyingTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="ml-3 text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none px-4 py-3 text-base bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
