import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'
import type { Message } from '@/types'
import { formatDistanceToNow } from '@/utils/date-helpers'

interface MessageBubbleProps {
  message: Message
  onReply: (message: Message) => void
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢']

export function MessageBubble({ message, onReply }: MessageBubbleProps) {
  const { user } = useAuthStore()
  const { addReaction, removeReaction, editMessage, deleteMessage } = useChatStore()
  const [showReactions, setShowReactions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const isOwn = message.sender_id === user?.id

  const handleReaction = async (emoji: string) => {
    const hasReacted = message.reactions?.some(
      r => r.user_id === user?.id && r.emoji === emoji
    )

    if (hasReacted) {
      await removeReaction(message.id, message.conversation_id, emoji)
    } else {
      await addReaction(message.id, message.conversation_id, emoji)
    }
    setShowReactions(false)
  }

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await editMessage(message.id, message.conversation_id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('Delete this message?')) {
      await deleteMessage(message.id, message.conversation_id)
    }
  }

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700 italic text-gray-500">
          Message deleted
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {message.replied_message && (
          <div className="mb-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {message.replied_message.sender?.username}
            </p>
            <p className="text-gray-600 dark:text-gray-300 truncate">
              {message.replied_message.content}
            </p>
          </div>
        )}
        
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
          }`}
        >
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                className="flex-1 bg-transparent border-b border-white/50 outline-none"
                autoFocus
              />
              <button onClick={handleEdit} className="text-xs">✓</button>
              <button onClick={() => setIsEditing(false)} className="text-xs">✕</button>
            </div>
          ) : (
            <>
              {message.type === 'text' && <p className="break-words">{message.content}</p>}
              {message.type === 'image' && (
                <img src={message.content} alt="Shared image" className="rounded-lg max-w-full max-h-64 cursor-pointer" onClick={() => window.open(message.content, '_blank')} />
              )}
              {message.type === 'video' && (
                <video src={message.content} controls className="rounded-lg max-w-full max-h-64" />
              )}
              {message.type === 'audio' && (
                <audio src={message.content} controls className="max-w-full" />
              )}
              {message.type === 'file' && (
                <a href={message.content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download file
                </a>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(message.created_at)}
          </span>
          {message.is_edited && (
            <span className="text-xs text-gray-500 dark:text-gray-400">edited</span>
          )}
          {isOwn && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(
              message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}

        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex gap-2">
          <button
            onClick={() => onReply(message)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Reply
          </button>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            React
          </button>
          {isOwn && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </>
          )}
        </div>

        {showReactions && (
          <div className="flex gap-1 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
