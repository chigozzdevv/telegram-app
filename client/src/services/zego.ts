import { ZIM } from 'zego-zim-web'
import { config } from '@/config'
import { apiService } from './api'
import type { Message, TypingStatus } from '@/types'

export class ZegoService {
  private static instance: ZegoService
  private zim: any = null
  private isInitialized = false
  private currentUserId: string | null = null
  private shortUserId: string | null = null
  private messageCallbacks: ((message: Message) => void)[] = []
  private typingCallbacks: ((status: TypingStatus) => void)[] = []
  private connectionCallbacks: ((connected: boolean) => void)[] = []
  private conversationCallbacks: ((conversations: any[]) => void)[] = []
  private unreadCountCallbacks: ((count: number) => void)[] = []
  private messageStatusCallbacks: ((messageId: string, status: 'sending' | 'success' | 'failed') => void)[] = []
  private messageEditedCallbacks: ((message: Message) => void)[] = []
  private reactionCallbacks: ((messageId: string, reactions: any[]) => void)[] = []
  private receiptCallbacks: ((messageId: string, status: 'processing' | 'done') => void)[] = []

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

    const shortUserId = userId.replace(/-/g, '').substring(0, 32)
    this.shortUserId = shortUserId

    try {
      this.zim = ZIM.create({ appID: config.zego.appId })
      this.setupEventListeners()

      const { token } = await apiService.getZegoToken(shortUserId)

      await this.zim.login(shortUserId, { userName: shortUserId, token })

      this.currentUserId = userId
      this.isInitialized = true
      this.notifyConnection(true)
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
          } catch {}
        } else {
          const message = this.convertZegoMessage(msg, fromConversationID)
          this.notifyMessage(message)
        }
      })
    })

    this.zim.on('tokenWillExpire', async () => {
      if (this.shortUserId) {
        try {
          const { token } = await apiService.getZegoToken(this.shortUserId)
          await this.zim.renewToken(token)
        } catch {}
      }
    })

    this.zim.on('conversationChanged', (_zim: any, { infoList }: any) => {
      this.conversationCallbacks.forEach(cb => cb(infoList))
    })

    this.zim.on('conversationTotalUnreadMessageCountUpdated', (_zim: any, { totalUnreadMessageCount }: any) => {
      this.unreadCountCallbacks.forEach(cb => cb(totalUnreadMessageCount))
    })

    this.zim.on('messageSentStatusChanged', (_zim: any, { infos }: any) => {
      infos.forEach((info: any) => {
        const status = info.status === 1 ? 'success' : info.status === 2 ? 'failed' : 'sending'
        this.messageStatusCallbacks.forEach(cb => cb(info.message.messageID.toString(), status))
      })
    })

    this.zim.on('messageReceiptChanged', (_zim: any, { infos }: any) => {
      infos.forEach((info: any) => {
        const status = info.status === 1 ? 'done' : 'processing'
        this.receiptCallbacks.forEach(cb => cb(info.messageID.toString(), status))
      })
    })

    this.zim.on('messageReactionsChanged', (_zim: any, { reactions }: any) => {
      reactions.forEach((r: any) => {
        this.reactionCallbacks.forEach(cb => cb(r.messageID.toString(), r.reactionList))
      })
    })

    this.zim.on('messageEdited', (_zim: any, { messageList }: any) => {
      messageList.forEach((msg: any) => {
        const message = this.convertZegoMessage(msg, msg.conversationID)
        this.messageEditedCallbacks.forEach(cb => cb(message))
      })
    })
  }

  private async reconnect(): Promise<void> {
    if (this.shortUserId) {
      try {
        const { token } = await apiService.getZegoToken(this.shortUserId)
        await this.zim.login(this.shortUserId, { userName: this.shortUserId, token })
      } catch {}
    }
  }

  async queryConversationList(count: number = 100): Promise<any[]> {
    if (!this.zim) return []
    const config = { nextConversation: null, count }
    const { conversationList } = await this.zim.queryConversationList(config)
    return conversationList
  }

  async queryHistoryMessages(conversationId: string, count: number = 50, nextMessage: any = null): Promise<Message[]> {
    if (!this.zim) return []
    const config = { nextMessage, count, reverse: true }
    const { messageList } = await this.zim.queryHistoryMessage(conversationId, 0, config)
    return messageList
      .filter((msg: any) => msg.type !== 200)
      .map((msg: any) => this.convertZegoMessage(msg, conversationId))
  }

  async sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'audio' | 'video' = 'text',
    replyToMessage?: any,
    file?: File,
    onProgress?: (current: number, total: number) => void,
    audioDuration?: number,
    videoDuration?: number
  ): Promise<Message> {
    if (!this.zim) throw new Error('ZEGO not initialized')

    let messageObj: any

    if (type === 'text') {
      messageObj = { type: 1, message: content }
    } else if (file) {
      const typeMap = { image: 11, file: 12, audio: 13, video: 14 }
      messageObj = { type: typeMap[type], fileLocalPath: file }
      if (type === 'audio' && audioDuration) {
        messageObj.audioDuration = audioDuration
      } else if (type === 'video' && videoDuration) {
        messageObj.videoDuration = videoDuration
      }
    } else {
      throw new Error('File required for media messages')
    }

    const sendConfig = { priority: 2, hasReceipt: true }
    const notification = {
      onMessageAttached: () => {},
      onMediaUploadingProgress: (_: any, currentFileSize: number, totalFileSize: number) => {
        onProgress?.(currentFileSize, totalFileSize)
      },
    }

    let result
    if (replyToMessage) {
      result = await this.zim.replyMessage(messageObj, replyToMessage, sendConfig, notification)
    } else {
      result = await this.zim.sendMessage(messageObj, conversationId, 0, sendConfig, notification)
    }

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
      await this.zim.sendMessage(customMessage, conversationId, 0, { priority: 1, disableUnreadMessageCount: true })
    } catch {}
  }

  async addReaction(message: any, emoji: string): Promise<void> {
    if (!this.zim) throw new Error('ZEGO not initialized')
    await this.zim.addMessageReaction(emoji, message)
  }

  async removeReaction(message: any, emoji: string): Promise<void> {
    if (!this.zim) throw new Error('ZEGO not initialized')
    await this.zim.deleteMessageReaction(emoji, message)
  }

  async clearConversationUnread(conversationId: string): Promise<void> {
    if (!this.zim) return
    await this.zim.clearConversationUnreadMessageCount(conversationId, 0)
  }

  async sendReadReceipt(messages: any[], conversationId: string): Promise<void> {
    if (!this.zim || messages.length === 0) return
    await this.zim.sendMessageReceiptsRead(messages, conversationId, 0)
  }

  async deleteMessages(messages: any[], conversationId: string): Promise<void> {
    if (!this.zim) return
    await this.zim.deleteMessages(messages, conversationId, 0, { isAlsoDeleteServerMessage: true })
  }

  async deleteAllMessages(conversationId: string): Promise<void> {
    if (!this.zim) return
    await this.zim.deleteAllMessage(conversationId, 0, { isAlsoDeleteServerMessage: true })
  }

  async editMessage(message: any, newContent: string): Promise<Message> {
    if (!this.zim) throw new Error('ZEGO not initialized')
    message.message = newContent
    const { message: edited } = await this.zim.editMessage(message, {}, { onMessageAttached: () => {} })
    return this.convertZegoMessage(edited, edited.conversationID)
  }

  async deleteConversation(conversationId: string): Promise<void> {
    if (!this.zim) return
    await this.zim.deleteConversation(conversationId, 0, { isAlsoDeleteServerConversation: true })
  }

  async deleteAllConversations(): Promise<void> {
    if (!this.zim) return
    await this.zim.deleteAllConversations({ isAlsoDeleteServerConversation: true })
  }

  async queryMessagesBySeq(messageSeqs: number[], conversationId: string): Promise<Message[]> {
    if (!this.zim) return []
    const { messageList } = await this.zim.queryMessages(messageSeqs, conversationId, 0)
    return messageList.map((msg: any) => this.convertZegoMessage(msg, conversationId))
  }

  private convertZegoMessage(zegoMsg: any, conversationId: string): Message {
    let replyTo: string | undefined
    let repliedInfo: any = undefined

    if (zegoMsg.repliedInfo) {
      repliedInfo = zegoMsg.repliedInfo
      replyTo = zegoMsg.repliedInfo.messageInfo?.messageID?.toString()
    }

    let content = zegoMsg.message || ''
    if (zegoMsg.fileDownloadUrl) {
      content = zegoMsg.fileDownloadUrl
    }

    const reactions = (zegoMsg.reactions || []).map((r: any) => ({
      emoji: r.reactionType,
      users: r.userList || [],
      count: r.totalCount || 0,
    }))

    return {
      id: zegoMsg.messageID.toString(),
      conversation_id: conversationId,
      sender_id: zegoMsg.senderUserID,
      content,
      type: this.getMessageType(zegoMsg.type),
      reply_to: replyTo,
      replied_info: repliedInfo,
      reactions,
      is_edited: zegoMsg.isEdited === true,
      is_deleted: false,
      is_read: zegoMsg.receiptStatus === 1,
      created_at: new Date(zegoMsg.timestamp).toISOString(),
      updated_at: new Date(zegoMsg.timestamp).toISOString(),
      _raw: zegoMsg,
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
    return () => { this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback) }
  }

  onTyping(callback: (status: TypingStatus) => void): () => void {
    this.typingCallbacks.push(callback)
    return () => { this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback) }
  }

  onConnection(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback)
    return () => { this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback) }
  }

  onConversationChanged(callback: (conversations: any[]) => void): () => void {
    this.conversationCallbacks.push(callback)
    return () => { this.conversationCallbacks = this.conversationCallbacks.filter(cb => cb !== callback) }
  }

  onTotalUnreadCountChanged(callback: (count: number) => void): () => void {
    this.unreadCountCallbacks.push(callback)
    return () => { this.unreadCountCallbacks = this.unreadCountCallbacks.filter(cb => cb !== callback) }
  }

  onMessageStatusChanged(callback: (messageId: string, status: 'sending' | 'success' | 'failed') => void): () => void {
    this.messageStatusCallbacks.push(callback)
    return () => { this.messageStatusCallbacks = this.messageStatusCallbacks.filter(cb => cb !== callback) }
  }

  onMessageEdited(callback: (message: Message) => void): () => void {
    this.messageEditedCallbacks.push(callback)
    return () => { this.messageEditedCallbacks = this.messageEditedCallbacks.filter(cb => cb !== callback) }
  }

  onReactionChanged(callback: (messageId: string, reactions: any[]) => void): () => void {
    this.reactionCallbacks.push(callback)
    return () => { this.reactionCallbacks = this.reactionCallbacks.filter(cb => cb !== callback) }
  }

  onReceiptChanged(callback: (messageId: string, status: 'processing' | 'done') => void): () => void {
    this.receiptCallbacks.push(callback)
    return () => { this.receiptCallbacks = this.receiptCallbacks.filter(cb => cb !== callback) }
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
      this.shortUserId = null
      this.notifyConnection(false)
    }
  }

  isConnected(): boolean {
    return this.isInitialized && this.currentUserId !== null
  }

  getCurrentUserId(): string | null {
    return this.currentUserId
  }

  getShortUserId(): string | null {
    return this.shortUserId
  }
}

export const zegoService = ZegoService.getInstance()
