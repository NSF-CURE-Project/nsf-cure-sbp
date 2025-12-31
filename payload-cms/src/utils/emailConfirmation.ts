import crypto from 'crypto'

const getWebBaseUrl = () =>
  process.env.WEB_PUBLIC_URL ?? process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'

export const hashEmailToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex')

export const buildEmailConfirmation = () => {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashEmailToken(token)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  const confirmUrl = `${getWebBaseUrl()}/confirm-email?token=${token}`

  return { token, tokenHash, expiresAt, confirmUrl }
}
