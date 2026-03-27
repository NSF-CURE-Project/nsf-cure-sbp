import type { PayloadHandler } from 'payload'

import { sanitizeProblemSetForPublic } from '@/lib/problemSet/publicProblemSet'

const STAFF_ROLES = new Set(['admin', 'staff', 'professor'])

const jsonError = (error: string, status: number) =>
  Response.json(
    {
      error,
    },
    { status },
  )

const getRouteParam = (req: Parameters<PayloadHandler>[0], key: string): string => {
  const routeParams = (req as { routeParams?: Record<string, unknown> }).routeParams
  const value = routeParams?.[key]
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

const getQueryParam = (req: Parameters<PayloadHandler>[0], key: string): string | null => {
  if (!req.url) return null
  try {
    const url = new URL(req.url, 'http://localhost')
    const value = url.searchParams.get(key)
    return value && value.trim().length ? value.trim() : null
  } catch {
    return null
  }
}

const canReadDraftProblemSets = (req: Parameters<PayloadHandler>[0]) =>
  req.user?.collection === 'users' && STAFF_ROLES.has(req.user.role ?? '')

const parsePositiveInt = (value: string | null, fallback: number, max: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(Math.trunc(parsed), max)
}

const parseDraft = (value: string | null) =>
  value === 'true' || value === '1' || value === 'yes'

export const publicProblemSetByIdHandler: PayloadHandler = async (req) => {
  const problemSetId = getRouteParam(req, 'problemSetId')
  if (!problemSetId) return jsonError('Missing problem set id', 400)

  const draftRequested = parseDraft(getQueryParam(req, 'draft'))
  const useDraft = draftRequested && canReadDraftProblemSets(req)

  try {
    const doc = await req.payload.findByID({
      collection: 'problem-sets',
      id: problemSetId,
      depth: 3,
      draft: useDraft,
      overrideAccess: true,
    })

    return Response.json({
      doc: sanitizeProblemSetForPublic(doc),
    })
  } catch {
    return jsonError('Problem set not found', 404)
  }
}

export const publicProblemSetListHandler: PayloadHandler = async (req) => {
  const draftRequested = parseDraft(getQueryParam(req, 'draft'))
  const useDraft = draftRequested && canReadDraftProblemSets(req)
  const limit = parsePositiveInt(getQueryParam(req, 'limit'), 20, 100)
  const sort = getQueryParam(req, 'sort') ?? 'title'
  const titlePrefix = getQueryParam(req, 'titlePrefix')

  const where =
    titlePrefix && titlePrefix.length
      ? ({
          title: {
            like: titlePrefix,
          },
        } as const)
      : undefined

  const result = await req.payload.find({
    collection: 'problem-sets',
    depth: 3,
    draft: useDraft,
    overrideAccess: true,
    limit,
    page: 1,
    sort,
    where,
  })

  return Response.json({
    ...result,
    docs: result.docs.map((doc) => sanitizeProblemSetForPublic(doc)),
  })
}
