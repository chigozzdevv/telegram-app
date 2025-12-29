import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'
import type { Message } from '@/types'
import { formatDistanceToNow } from '@/utils/date-helpers'

interface MessageBubbleProps {
  message: Message
  onReply: (message: Message) => void
}

export function MessageBubble({ message, onReply }: MessageBubbleProps) {
  const { user } = useAuthStore()
  const { editMessage, deleteMessage } = useChatStore()
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const isOwn = message.sender_id === user?.id

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
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="max-w-[70%]">
        {message.replied_message && (
          <div className="mb-1.5 px-3 py-2 bg-gray-800 rounded-lg border-l-2 border-primary-500">
            <p className="text-xs text-gray-400 mb-0.5">{message.replied_message.sender?.username}</p>
            <p className="text-sm text-gray-300 truncate">{message.replied_message.content}</p>
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
            <p className="break-words leading-relaxed">{message.content}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-gray-500">{formatDistanceToNow(message.created_at)}</span>
          {message.is_edited && <span className="text-xs text-gray-500">edited</span>}
          {isOwn && <span className="text-xs text-gray-500">{message.is_read ? '✓✓' : '✓'}</span>}
        </div>

        {showActions && !isEditing && (
          <div className="flex gap-3 mt-1 px-1">
            <button onClick={() => onReply(message)} className="text-xs text-gray-400 hover:text-white">
              Reply
            </button>
            {isOwn && (
              <>
                <button onClick={() => setIsEditing(true)} className="text-xs text-gray-400 hover:text-white">
                  Edit
                </button>
                <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300">
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
