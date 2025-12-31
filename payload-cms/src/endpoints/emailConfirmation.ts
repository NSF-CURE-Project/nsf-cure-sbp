import type { PayloadRequest } from 'payload'

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

  await req.payload.sendEmail({
    to: email,
    subject: 'Confirm your NSF CURE account email',
    text: `Confirm your email address by visiting ${confirmUrl}. This link expires in 24 hours.`,
    html: `
      <p>Confirm your email address by clicking the link below:</p>
      <p><a href="${confirmUrl}">Confirm email address</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  })

  return jsonResponse({ message: 'Confirmation link sent.' }, 200)
}

export const confirmEmailHandler = async (req: PayloadRequest) => {
  let body = req.body
  if (!body && typeof (req as any).json === 'function') {
    try {
      body = await (req as any).json()
    } catch {
      body = undefined
    }
  }

  const query = (req as any)?.query ?? {}
  let token =
    (body as any)?.token ??
    (typeof query?.token === 'string' ? query.token : undefined)

  if (!token && typeof (req as any)?.url === 'string') {
    try {
      const params = new URL((req as any).url, 'http://localhost').searchParams
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
    | { id: string; emailVerificationExpiresAt?: string | null }
    | undefined

  if (!account) {
    return jsonResponse({ message: 'Token is invalid or expired.' }, 400)
  }

  const expiresAt = account.emailVerificationExpiresAt
    ? new Date(account.emailVerificationExpiresAt).getTime()
    : 0
  if (expiresAt && Date.now() > expiresAt) {
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
