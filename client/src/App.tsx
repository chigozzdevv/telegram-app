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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function ChatLayout() {
  const { activeConversationId, setActiveConversation, addMessage, updateTypingStatus } = useChatStore()

  useEffect(() => {
    const unsubscribeMessage = zegoService.onMessage((message) => {
      addMessage(message)
    })

    const unsubscribeTyping = zegoService.onTyping((status) => {
      updateTypingStatus(status)
    })

    return () => {
      unsubscribeMessage()
      unsubscribeTyping()
    }
  }, [addMessage, updateTypingStatus])

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar
        onSelectConversation={setActiveConversation}
        activeConversationId={activeConversationId}
      />
      <div className="flex-1">
        {activeConversationId ? (
          <ChatWindow conversationId={activeConversationId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-900 dark:text-white">Loading...</div>
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
