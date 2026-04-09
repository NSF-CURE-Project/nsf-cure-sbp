import { createHmac, timingSafeEqual } from 'node:crypto'

const getSigningSecret = () =>
  process.env.PROBLEM_TEMPLATE_SIGNING_SECRET?.trim() || process.env.PAYLOAD_SECRET?.trim() || ''

const buildSignaturePayload = (problemId: string, seed: string) => `${problemId}::${seed}`

export const signProblemTemplateVariant = (problemId: string, seed: string): string => {
  const secret = getSigningSecret()
  if (!secret || !problemId.trim() || !seed.trim()) return ''
  return createHmac('sha256', secret)
    .update(buildSignaturePayload(problemId.trim(), seed.trim()))
    .digest('hex')
}

export const verifyProblemTemplateVariantSignature = ({
  problemId,
  seed,
  signature,
}: {
  problemId: string
  seed: string
  signature?: string | null
}) => {
  const secret = getSigningSecret()
  // Fail closed when no signing secret is configured.
  if (!secret) return false

  const provided = typeof signature === 'string' ? signature.trim() : ''
  if (!provided) return false

  const expected = signProblemTemplateVariant(problemId, seed)
  if (!expected) return false

  try {
    const providedBuf = Buffer.from(provided, 'hex')
    const expectedBuf = Buffer.from(expected, 'hex')
    if (providedBuf.length !== expectedBuf.length) return false
    return timingSafeEqual(providedBuf, expectedBuf)
  } catch {
    return false
  }
}
