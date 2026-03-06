import type { PayloadRequest } from 'payload'

import { buildAuthEmail } from '../utils/authEmails'
import { buildEmailConfirmation, hashEmailToken } from '../utils/emailConfirmation'

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const requestEmailConfirmationHandler = async (req: PayloadRequest) => {
  if (req.user?.collection !== 'accounts') {
    return jsonResponse({ message: 'Not authorized.' }, 403)
  }

  const email = req.user.email
  if (!email) {
    return jsonResponse({ message: 'Email is missing.' }, 400)
  }

  if (!req.payload?.sendEmail) {
    return jsonResponse({ message: 'Email service is not configured.' }, 500)
  }

  const { confirmUrl, expiresAt, tokenHash } = buildEmailConfirmation()

  await req.payload.update({
    collection: 'accounts',
    id: req.user.id,
    data: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
      emailVerified: false,
      emailVerifiedAt: null,
    },
    overrideAccess: true,
  })

  const message = buildAuthEmail({
    heading: 'Confirm your NSF CURE account email',
    intro: 'Please confirm your email address to activate your account.',
    actionLabel: 'Confirm email address',
    actionUrl: confirmUrl,
    securityNote: 'If you did not create this account, no further action is needed.',
  })

  await req.payload.sendEmail({
    to: email,
    subject: 'Confirm your NSF CURE account email',
    ...message,
  })

  return jsonResponse({ message: 'Confirmation link sent.' }, 200)
}

export const confirmEmailHandler = async (req: PayloadRequest) => {
  const requestMeta = req as unknown as {
    json?: () => Promise<unknown>
    query?: Record<string, unknown>
    url?: string
  }

  let body: unknown = req.body
  if (!body && typeof requestMeta.json === 'function') {
    try {
      body = await requestMeta.json()
    } catch {
      body = undefined
    }
  }

  const query = requestMeta.query ?? {}
  const bodyData = body as { token?: string } | undefined
  let token =
    bodyData?.token ??
    (typeof query?.token === 'string' ? query.token : undefined)

  if (!token && typeof requestMeta?.url === 'string') {
    try {
      const params = new URL(requestMeta.url, 'http://localhost').searchParams
      token = params.get('token') ?? undefined
    } catch {
      // ignore
    }
  }

  if (!token || typeof token !== 'string') {
    return jsonResponse({ message: 'Token is missing.' }, 400)
  }

  const tokenHash = hashEmailToken(token)
  const result = await req.payload.find({
    collection: 'accounts',
    limit: 1,
    where: {
      emailVerificationTokenHash: {
        equals: tokenHash,
      },
    },
    overrideAccess: true,
  })

  const account = result.docs?.[0] as
    | { id: string | number; emailVerificationExpiresAt?: string | null }
    | undefined

  if (!account) {
    return jsonResponse({ message: 'Token is invalid or expired.' }, 400)
  }

  const expiresAtMs = account.emailVerificationExpiresAt
    ? new Date(account.emailVerificationExpiresAt).getTime()
    : null
  const isExpired =
    expiresAtMs == null || Number.isNaN(expiresAtMs) || Date.now() > expiresAtMs

  if (isExpired) {
    await req.payload.update({
      collection: 'accounts',
      id: account.id,
      data: {
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
      overrideAccess: true,
    })
    return jsonResponse({ message: 'Token is invalid or expired.' }, 400)
  }

  await req.payload.update({
    collection: 'accounts',
    id: account.id,
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    },
    overrideAccess: true,
  })

  return jsonResponse({ message: 'Email confirmed.' }, 200)
}
