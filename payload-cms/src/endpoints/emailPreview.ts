import type { PayloadRequest } from 'payload'

import { buildAuthEmail, buildResetPasswordUrl } from '../utils/authEmails'

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const resolveType = (value: unknown) =>
  value === 'reset-password' || value === 'confirm-email' ? value : 'confirm-email'

const resolveToken = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : 'EXAMPLE_TOKEN_PREVIEW'

export const emailPreviewHandler = async (req: PayloadRequest) => {
  const requestMeta = req as unknown as {
    query?: Record<string, unknown>
    json?: () => Promise<unknown>
  }

  const query = requestMeta.query ?? {}

  let body: unknown = req.body
  if (!body && typeof requestMeta.json === 'function') {
    try {
      body = await requestMeta.json()
    } catch {
      body = undefined
    }
  }

  const bodyData = (body ?? {}) as Record<string, unknown>
  const type = resolveType(bodyData.type ?? query.type)
  const token = resolveToken(bodyData.token ?? query.token)

  const content =
    type === 'reset-password'
      ? {
          subject: '[Preview] Reset your NSF CURE account password',
          ...buildAuthEmail({
            heading: 'Reset your NSF CURE account password',
            intro: 'A password reset was requested for your account.',
            actionLabel: 'Reset password',
            actionUrl: buildResetPasswordUrl(token),
            securityNote: 'If you did not request a password reset, you can safely ignore this email.',
          }),
        }
      : {
          subject: '[Preview] Confirm your NSF CURE account email',
          ...buildAuthEmail({
            heading: 'Confirm your NSF CURE account email',
            intro: 'Please confirm your email address to activate your account.',
            actionLabel: 'Confirm email address',
            actionUrl: `${process.env.WEB_PUBLIC_URL ?? process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'}/confirm-email?token=${encodeURIComponent(token)}`,
            securityNote: 'If you did not create this account, no further action is needed.',
          }),
        }

  req.payload.logger.info('[email-preview] generated email preview payload')
  req.payload.logger.info(content.text)
  req.payload.logger.info(content.html)

  return jsonResponse({
    mode: 'preview-only',
    type,
    ...content,
  })
}
