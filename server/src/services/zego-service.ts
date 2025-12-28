import crypto from 'crypto'

function makeRandomIv(): string {
  const str = '0123456789abcdefghijklmnopqrstuvwxyz'
  const result: string[] = []
  for (let i = 0; i < 16; i++) {
    const r = Math.floor(Math.random() * str.length)
    result.push(str.charAt(r))
  }
  return result.join('')
}

function getAlgorithm(key: Buffer): string {
  switch (key.length) {
    case 16:
      return 'aes-128-cbc'
    case 24:
      return 'aes-192-cbc'
    case 32:
      return 'aes-256-cbc'
  }
  throw new Error('Invalid key length: ' + key.length)
}

function aesEncrypt(plainText: string, key: string, iv: string): ArrayBuffer {
  const cipher = crypto.createCipheriv(getAlgorithm(Buffer.from(key)), key, iv)
  cipher.setAutoPadding(true)
  const encrypted = cipher.update(plainText)
  const final = cipher.final()
  const out = Buffer.concat([encrypted, final])
  return Uint8Array.from(out).buffer
}

export class ZegoService {
  private appId: number
  private serverSecret: string

  constructor() {
    if (!process.env.ZEGO_APP_ID || !process.env.ZEGO_SERVER_SECRET) {
      throw new Error('Missing ZEGO environment variables')
    }
    
    this.appId = parseInt(process.env.ZEGO_APP_ID)
    this.serverSecret = process.env.ZEGO_SERVER_SECRET

    if (this.serverSecret.length !== 32) {
      throw new Error('ZEGO_SERVER_SECRET must be exactly 32 characters')
    }
  }

  generateToken(userId: string, effectiveTimeInSeconds: number = 3600): string {
    const createTime = Math.floor(Date.now() / 1000)
    
    const tokenInfo = {
      app_id: this.appId,
      user_id: userId,
      nonce: Math.floor(Math.random() * 4294967295) - 2147483648,
      ctime: createTime,
      expire: createTime + effectiveTimeInSeconds,
      payload: ''
    }

    const plainText = JSON.stringify(tokenInfo)
    const iv = makeRandomIv()
    const encryptBuf = aesEncrypt(plainText, this.serverSecret, iv)

    const b1 = new Uint8Array(8)
    const b2 = new Uint8Array(2)
    const b3 = new Uint8Array(2)

    new DataView(b1.buffer).setBigInt64(0, BigInt(tokenInfo.expire), false)
    new DataView(b2.buffer).setUint16(0, iv.length, false)
    new DataView(b3.buffer).setUint16(0, encryptBuf.byteLength, false)

    const buf = Buffer.concat([
      Buffer.from(b1),
      Buffer.from(b2),
      Buffer.from(iv),
      Buffer.from(b3),
      Buffer.from(encryptBuf),
    ])

    return '04' + buf.toString('base64')
  }
}

export const zegoService = new ZegoService()
