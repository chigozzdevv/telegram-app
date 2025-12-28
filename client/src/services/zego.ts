import { ZIM } from 'zego-zim-web'
import { config } from '@/config'
import { apiService } from './api'
import type { Message, TypingStatus } from '@/types'

export class ZegoService {
  private static instance: ZegoService
  private zim: any = null
  private isInitialized = false
  private currentUserId: string | null = null
  private messageCallbacks: ((message: Message) => void)[] = []
  private typingCallbacks: ((status: TypingStatus) => void)[] = []
  private connectionCallbacks: ((connected: boolean) => void)[] = []

  static getInstance(): ZegoService {
    if (!ZegoService.instance) {
      ZegoService.instance = new ZegoService()
    }
    return ZegoService.instance
  }

  async initialize(userId: string): Promise<void> {
    if (this.isInitialized && this.currentUserId === userId) {
      return
    }

    try {
      this.zim = ZIM.create({ appID: config.zego.appId })
      this.setupEventListeners()
      
      const { token } = await apiService.getZegoToken(userId)
      
      await this.zim.login(userId, { userName: userId, token })
      
      this.currentUserId = userId
      this.isInitialized = true
      this.notifyConnection(true)
      
      console.log('ZEGO initialized successfully')
    } catch (error) {
      console.error('ZEGO initialization failed:', error)
      throw error
    }
  }

  private setupEventListeners(): void {
    if (!this.zim) return

    this.zim.on('error', (_zim: any, errorInfo: any) => {
      console.error('ZEGO error:', errorInfo.code, errorInfo.message)
    })

    this.zim.on('connectionStateChanged', (_zim: any, { state, event }: any) => {
      console.log('Connection state changed:', state, event)
      this.notifyConnection(state === 1)
      
      if (state === 0 && event === 3) {
        this.reconnect()
      }
    })

    this.zim.on('peerMessageReceived', (_zim: any, { messageList, fromConversationID }: any) => {
      messageList.forEach((msg: any) => {
        if (msg.type === 200) {
          try {
            const data = JSON.parse(msg.message)
            if (data.type === 'typing') {
              this.notifyTyping({
                user_id: data.user_id,
                conversation_id: fromConversationID,
                is_typing: data.is_typing,
              })
            }
          } catch (error) {
            console.error('Failed to parse custom message:', error)
          }
        } else {
          const message = this.convertZegoMessage(msg, fromConversationID)
          this.notifyMessage(message)
        }
      })
    })

    this.zim.on('tokenWillExpire', async (_zim: any, { second }: any) => {
      console.log('Token will expire in', second, 'seconds')
      if (this.currentUserId) {
        try {
          const { token } = await apiService.getZegoToken(this.currentUserId)
          await this.zim.renewToken(token)
        } catch (error) {
          console.error('Failed to renew token:', error)
        }
      }
    })
  }

  private async reconnect(): Promise<void> {
    if (this.currentUserId) {
      try {
        const { token } = await apiService.getZegoToken(this.currentUserId)
        await this.zim.login(this.currentUserId, { userName: this.currentUserId, token })
      } catch (error) {
        console.error('Reconnection failed:', error)
      }
    }
  }

  async sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'audio' | 'video' = 'text',
    replyTo?: string,
    file?: File,
    onProgress?: (current: number, total: number) => void
  ): Promise<Message> {
    if (!this.zim) throw new Error('ZEGO not initialized')

    let messageObj: any

    if (type === 'text') {
      messageObj = { type: 1, message: content }
    } else if (file) {
      const typeMap = { image: 11, file: 12, audio: 13, video: 14 }
      messageObj = { type: typeMap[type], fileLocalPath: file }
      
      if (type === 'audio') {
        messageObj.audioDuration = 0 // Will be set by ZEGO
      } else if (type === 'video') {
        messageObj.videoDuration = 0
      }
    } else {
      throw new Error('File required for media messages')
    }

    if (replyTo) {
      messageObj.extendedData = JSON.stringify({ reply_to: replyTo })
    }

    const config = { priority: 1 }
    const notification = {
      onMessageAttached: () => {},
      onMediaUploadingProgress: (_: any, currentFileSize: number, totalFileSize: number) => {
        onProgress?.(currentFileSize, totalFileSize)
      },
    }

    const result = await this.zim.sendMessage(
      messageObj,
      conversationId,
      0,
      config,
      notification
    )

    return this.convertZegoMessage(result.message, conversationId)
  }

  async sendTypingStatus(conversationId: string, isTyping: boolean): Promise<void> {
    if (!this.zim || !this.currentUserId) return

    const customMessage = {
      type: 200,
      message: JSON.stringify({
        type: 'typing',
        user_id: this.currentUserId,
        is_typing: isTyping,
      }),
    }

    try {
      await this.zim.sendMessage(customMessage, conversationId, 0, { priority: 1 })
    } catch (error) {
      console.error('Failed to send typing status:', error)
    }
  }

  async addReaction(messageId: string, conversationId: string, emoji: string): Promise<void> {
    if (!this.zim) throw new Error('ZEGO not initialized')

    const customMessage = {
      type: 200,
      message: JSON.stringify({
        type: 'reaction',
        message_id: messageId,
        emoji,
        action: 'add',
      }),
    }

    await this.zim.sendMessage(customMessage, conversationId, 0, { priority: 1 })
  }

  async removeReaction(messageId: string, conversationId: string, emoji: string): Promise<void> {
    if (!this.zim) throw new Error('ZEGO not initialized')

    const customMessage = {
      type: 200,
      message: JSON.stringify({
        type: 'reaction',
        message_id: messageId,
        emoji,
        action: 'remove',
      }),
    }

    await this.zim.sendMessage(customMessage, conversationId, 0, { priority: 1 })
  }

  private convertZegoMessage(zegoMsg: any, conversationId: string): Message {
    let replyTo: string | undefined
    
    if (zegoMsg.extendedData) {
      try {
        const data = JSON.parse(zegoMsg.extendedData)
        replyTo = data.reply_to
      } catch (error) {
        console.error('Failed to parse extended data:', error)
      }
    }

    // For media messages, use fileDownloadUrl as content
    let content = zegoMsg.message || ''
    if (zegoMsg.fileDownloadUrl) {
      content = zegoMsg.fileDownloadUrl
    }

    return {
      id: zegoMsg.messageID.toString(),
      conversation_id: conversationId,
      sender_id: zegoMsg.senderUserID,
      content,
      type: this.getMessageType(zegoMsg.type),
      reply_to: replyTo,
      reactions: [],
      is_edited: false,
      is_deleted: false,
      created_at: new Date(zegoMsg.timestamp).toISOString(),
      updated_at: new Date(zegoMsg.timestamp).toISOString(),
    }
  }

  private getMessageType(zegoType: number): 'text' | 'image' | 'file' | 'audio' | 'video' {
    switch (zegoType) {
      case 1: return 'text'
      case 11: return 'image'
      case 12: return 'file'
      case 13: return 'audio'
      case 14: return 'video'
      default: return 'text'
    }
  }

  onMessage(callback: (message: Message) => void): () => void {
    this.messageCallbacks.push(callback)
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback)
    }
  }

  onTyping(callback: (status: TypingStatus) => void): () => void {
    this.typingCallbacks.push(callback)
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback)
    }
  }

  onConnection(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback)
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback)
    }
  }

  private notifyMessage(message: Message): void {
    this.messageCallbacks.forEach(cb => cb(message))
  }

  private notifyTyping(status: TypingStatus): void {
    this.typingCallbacks.forEach(cb => cb(status))
  }

  private notifyConnection(connected: boolean): void {
    this.connectionCallbacks.forEach(cb => cb(connected))
  }

  async logout(): Promise<void> {
    if (this.zim) {
      await this.zim.logout()
      this.zim.destroy()
      this.zim = null
      this.isInitialized = false
      this.currentUserId = null
      this.notifyConnection(false)
    }
  }

  isConnected(): boolean {
    return this.isInitialized && this.currentUserId !== null
  }

  getCurrentUserId(): string | null {
    return this.currentUserId
  }
}

export const zegoService = ZegoService.getInstance()
