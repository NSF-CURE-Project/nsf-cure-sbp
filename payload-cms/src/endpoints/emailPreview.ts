import type { PayloadRequest } from 'payload'

import { buildAuthEmail, buildResetPasswordUrl } from '../utils/authEmails'

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

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
  const token = resolveToken(bodyData.token ?? query.token)

  const content = {
    subject: '[Preview] Reset your NSF CURE account password',
    ...buildAuthEmail({
      heading: 'Reset your NSF CURE account password',
      intro: 'A password reset was requested for your account.',
      actionLabel: 'Reset password',
      actionUrl: buildResetPasswordUrl(token),
      securityNote: 'If you did not request a password reset, you can safely ignore this email.',
    }),
  }

  req.payload.logger.info('[email-preview] generated email preview payload')
  req.payload.logger.info(content.text)
  req.payload.logger.info(content.html)

  return jsonResponse({
    mode: 'preview-only',
    type: 'reset-password',
    ...content,
  })
}
