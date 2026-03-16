import type { PayloadRequest } from 'payload'

export type ApiKeyAuthResult = {
  apiKeyId: string
  owner: { id: string; email: string | null; name: string | null }
  scopes: string[]
}

const getAuthorizationHeader = (req: PayloadRequest): string => {
  const fromHeadersGet =
    req.headers && typeof req.headers.get === 'function'
      ? req.headers.get('authorization')
      : null

  if (typeof fromHeadersGet === 'string') return fromHeadersGet

  const rawHeaders = (req as unknown as { headers?: Record<string, unknown> }).headers
  const fallback = rawHeaders?.authorization
  return typeof fallback === 'string' ? fallback : ''
}

const getBearerToken = (req: PayloadRequest): string => {
  const header = getAuthorizationHeader(req)
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() ?? ''
}

const asString = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id != null ? String(id) : ''
  }
  return ''
}

const toScopes = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((scope): scope is string => typeof scope === 'string')
}

export const authenticateApiKey = async (
  req: PayloadRequest,
  options?: { requiredScope?: string | null },
): Promise<ApiKeyAuthResult | null> => {
  const token = getBearerToken(req)
  if (!token) return null

  const result = await req.payload.find({
    collection: 'api-keys' as never,
    depth: 1,
    limit: 1,
    overrideAccess: true,
    context: {
      maskApiKey: false,
    },
    where: {
      and: [{ key: { equals: token } }, { active: { equals: true } }],
    } as never,
  })

  const apiKey = result.docs?.[0] as
    | {
        id?: string | number
        key?: string
        owner?: { id?: string | number; email?: string; firstName?: string; lastName?: string } | string | number
        scopes?: unknown
        expiresAt?: string | null
      }
    | undefined

  if (!apiKey?.key || apiKey.key !== token) return null

  if (apiKey.expiresAt) {
    const expiresAt = new Date(apiKey.expiresAt)
    if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) return null
  }

  const scopes = toScopes(apiKey.scopes)
  if (options?.requiredScope && !scopes.includes(options.requiredScope)) return null

  const ownerValue = apiKey.owner
  const ownerId = asString(ownerValue)
  const ownerEmail =
    typeof ownerValue === 'object' && ownerValue !== null
      ? ((ownerValue as { email?: string }).email ?? null)
      : null
  const firstName =
    typeof ownerValue === 'object' && ownerValue !== null
      ? ((ownerValue as { firstName?: string }).firstName ?? '')
      : ''
  const lastName =
    typeof ownerValue === 'object' && ownerValue !== null
      ? ((ownerValue as { lastName?: string }).lastName ?? '')
      : ''
  const ownerName = [firstName, lastName].filter(Boolean).join(' ') || null

  await req.payload.update({
    collection: 'api-keys' as never,
    id: asString(apiKey.id),
    data: {
      lastUsedAt: new Date().toISOString(),
    } as never,
    overrideAccess: true,
    context: {
      maskApiKey: false,
    },
  })

  return {
    apiKeyId: asString(apiKey.id),
    owner: {
      id: ownerId,
      email: ownerEmail,
      name: ownerName,
    },
    scopes,
  }
}

export const hasApiScope = (scopes: string[], scope: string) => scopes.includes(scope)
