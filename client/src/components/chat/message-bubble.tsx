import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'
import type { Message } from '@/types'
import { formatDistanceToNow } from '@/utils/date-helpers'

interface MessageBubbleProps {
  message: Message
  onReply: (message: Message) => void
  conversationId: string
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢']

export function MessageBubble({ message, onReply, conversationId }: MessageBubbleProps) {
  const { user } = useAuthStore()
  const { editMessage, deleteMessage, addReaction, removeReaction } = useChatStore()
  const [showActions, setShowActions] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  
  const currentUserShortId = user?.id.replace(/-/g, '').substring(0, 32)
  const isOwn = message.sender_id === currentUserShortId || message.sender_id === user?.id

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await editMessage(message.id, conversationId, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('Delete this message?')) {
      await deleteMessage(message.id, conversationId)
    }
  }

  const handleReaction = async (emoji: string) => {
    const existingReaction = message.reactions?.find(r => 
      r.emoji === emoji && r.users?.includes(user?.id || '')
    )
    if (existingReaction) {
      await removeReaction(message.id, conversationId, emoji)
    } else {
      await addReaction(message.id, conversationId, emoji)
    }
    setShowReactions(false)
  }

  const renderContent = () => {
    if (message.type === 'image') {
      return <img src={message.content} alt="Image" className="max-w-full rounded-lg" />
    }
    if (message.type === 'video') {
      return <video src={message.content} controls className="max-w-full rounded-lg" />
    }
    if (message.type === 'audio') {
      return <audio src={message.content} controls className="w-full" />
    }
    if (message.type === 'file') {
      return (
        <a href={message.content} target="_blank" rel="noopener noreferrer" className="underline">
          Download File
        </a>
      )
    }
    return <p className="break-words leading-relaxed">{message.content}</p>
  }

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className="px-4 py-3 rounded-2xl bg-gray-800 text-gray-500 italic">
          Message deleted
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false) }}
    >
      <div className="max-w-[70%]">
        {message.replied_info && (
          <div className="mb-1.5 px-3 py-2 bg-gray-800 rounded-lg border-l-2 border-primary-500">
            <p className="text-xs text-gray-400 mb-0.5">Reply</p>
            <p className="text-sm text-gray-300 truncate">
              {message.replied_info.message ||
               (message.replied_info.type === 11 ? '📷 Image' :
                message.replied_info.type === 12 ? '📎 File' :
                message.replied_info.type === 13 ? '🎵 Audio' :
                message.replied_info.type === 14 ? '🎬 Video' : 'Message')}
            </p>
          </div>
        )}

        <div className={`px-4 py-3 rounded-2xl ${isOwn ? 'bg-primary-600 text-white' : 'bg-gray-800 text-white'}`}>
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                className="flex-1 bg-transparent border-b border-white/50 outline-none py-1"
                autoFocus
              />
              <button onClick={handleEdit} className="text-sm">✓</button>
              <button onClick={() => setIsEditing(false)} className="text-sm">✕</button>
            </div>
          ) : (
            renderContent()
          )}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 px-1">
            {message.reactions.map((r, i) => (
              <span key={i} className="text-sm bg-gray-800 px-2 py-0.5 rounded-full">
                {r.emoji} {r.count > 1 && r.count}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-gray-500">{formatDistanceToNow(message.created_at)}</span>
          {message.is_edited && <span className="text-xs text-gray-500">edited</span>}
          {isOwn && (
            <span className="text-xs text-gray-500">
              {message.status === 'sending' ? '...' : message.status === 'failed' ? '!' : message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>

        {showActions && !isEditing && (
          <div className="flex gap-3 mt-1 px-1 relative">
            <button onClick={() => onReply(message)} className="text-xs text-gray-400 hover:text-white">
              Reply
            </button>
            <button onClick={() => setShowReactions(!showReactions)} className="text-xs text-gray-400 hover:text-white">
              React
            </button>
            {isOwn && message.type === 'text' && (
              <button onClick={() => setIsEditing(true)} className="text-xs text-gray-400 hover:text-white">
                Edit
              </button>
            )}
            {isOwn && (
              <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300">
                Delete
              </button>
            )}
            
            {showReactions && (
              <div className="absolute bottom-6 left-0 bg-gray-800 rounded-lg p-2 flex gap-1 shadow-lg">
                {REACTION_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
