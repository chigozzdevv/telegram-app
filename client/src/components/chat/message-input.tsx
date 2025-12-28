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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const { sendMessage, sendMediaMessage, sendTyping } = useChatStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const type = getFileType(file)
    
    try {
      setUploadProgress(0)
      await sendMediaMessage(conversationId, file, type, (current, total) => {
        setUploadProgress(Math.round((current / total) * 100))
      })
    } catch (error) {
      console.error('Failed to send media:', error)
    } finally {
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const getFileType = (file: File): 'image' | 'file' | 'audio' | 'video' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type.startsWith('video/')) return 'video'
    return 'file'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
      {replyingTo && (
        <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Replying to {replyingTo.sender?.username}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
      )}

      {uploadProgress !== null && (
        <div className="mb-2">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded">
            <div 
              className="h-1 bg-primary-600 rounded transition-all" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.zip"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadProgress !== null}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          title="Attach file"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!message.trim() || uploadProgress !== null}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
