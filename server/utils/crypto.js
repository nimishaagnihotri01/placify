import crypto from 'crypto'

const IV_LENGTH = 12

function getKey() {
  const secret = process.env.GMAIL_TOKEN_ENCRYPTION_KEY

  if (!secret) {
    throw new Error('GMAIL_TOKEN_ENCRYPTION_KEY is required for Gmail token storage')
  }

  return crypto.createHash('sha256').update(secret).digest()
}

export function encrypt(value = '') {
  if (!value) {
    return ''
  }

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [iv, authTag, encrypted]
    .map((part) => part.toString('base64url'))
    .join('.')
}

export function decrypt(value = '') {
  if (!value) {
    return ''
  }

  const [ivValue, authTagValue, encryptedValue] = value.split('.')

  if (!ivValue || !authTagValue || !encryptedValue) {
    throw new Error('Stored Gmail token is invalid')
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getKey(),
    Buffer.from(ivValue, 'base64url'),
  )
  decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'))

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

export function createSignedState(payload = {}) {
  const stateSecret =
    process.env.GMAIL_OAUTH_STATE_SECRET || process.env.GMAIL_TOKEN_ENCRYPTION_KEY

  if (!stateSecret) {
    throw new Error('GMAIL_OAUTH_STATE_SECRET or GMAIL_TOKEN_ENCRYPTION_KEY is required')
  }

  const statePayload = Buffer.from(
    JSON.stringify({
      ...payload,
      nonce: crypto.randomBytes(12).toString('hex'),
      issuedAt: Date.now(),
    }),
  ).toString('base64url')
  const signature = crypto
    .createHmac('sha256', stateSecret)
    .update(statePayload)
    .digest('base64url')

  return `${statePayload}.${signature}`
}

export function verifySignedState(state = '') {
  const stateSecret =
    process.env.GMAIL_OAUTH_STATE_SECRET || process.env.GMAIL_TOKEN_ENCRYPTION_KEY
  const [statePayload, signature] = state.split('.')

  if (!stateSecret || !statePayload || !signature) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', stateSecret)
    .update(statePayload)
    .digest('base64url')

  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(statePayload, 'base64url').toString())
    const ageInMinutes = (Date.now() - payload.issuedAt) / 60000
    return ageInMinutes <= 15
  } catch {
    return false
  }
}
