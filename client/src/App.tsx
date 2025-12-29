import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'
import { zegoService } from '@/services/zego'
import { Login } from '@/components/auth/login'
import { Signup } from '@/components/auth/signup'
import { Sidebar } from '@/components/sidebar/sidebar'
import { ChatWindow } from '@/components/chat/chat-window'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function ChatLayout() {
  const { 
    activeConversationId, 
    setActiveConversation, 
    addMessage, 
    updateTypingStatus,
    updateConversations,
    setTotalUnreadCount,
    updateMessageStatus,
    updateMessageReactions,
    updateMessageReceipt,
    handleEditedMessage,
    loadConversations,
  } = useChatStore()

  useEffect(() => {
    loadConversations()

    const unsubscribeMessage = zegoService.onMessage((message) => {
      addMessage(message)
    })

    const unsubscribeTyping = zegoService.onTyping((status) => {
      updateTypingStatus(status)
    })

    const unsubscribeConversation = zegoService.onConversationChanged((infoList) => {
      updateConversations(infoList)
    })

    const unsubscribeUnread = zegoService.onTotalUnreadCountChanged((count) => {
      setTotalUnreadCount(count)
    })

    const unsubscribeStatus = zegoService.onMessageStatusChanged((messageId, status) => {
      updateMessageStatus(messageId, status)
    })

    const unsubscribeReactions = zegoService.onReactionChanged((messageId, reactions) => {
      updateMessageReactions(messageId, reactions)
    })

    const unsubscribeReceipt = zegoService.onReceiptChanged((messageId, status) => {
      updateMessageReceipt(messageId, status)
    })

    const unsubscribeEdited = zegoService.onMessageEdited((message) => {
      handleEditedMessage(message)
    })

    return () => {
      unsubscribeMessage()
      unsubscribeTyping()
      unsubscribeConversation()
      unsubscribeUnread()
      unsubscribeStatus()
      unsubscribeReactions()
      unsubscribeReceipt()
      unsubscribeEdited()
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar
        onSelectConversation={setActiveConversation}
        activeConversationId={activeConversationId}
      />
      <div className="flex-1 flex flex-col">
        {activeConversationId ? (
          <ChatWindow conversationId={activeConversationId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-base">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  )
}

export function App() {
  const { initialize, initialized } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
