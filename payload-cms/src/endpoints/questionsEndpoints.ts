import type { PayloadHandler } from 'payload'

const jsonError = (error: string, status: number) =>
  Response.json(
    {
      error,
    },
    { status },
  )

const sanitizeQuestionDoc = (doc: Record<string, unknown>) => {
  const { user: _user, ...rest } = doc
  return rest
}

const parseRouteId = (
  req: Parameters<PayloadHandler>[0],
  key: string,
  pattern: RegExp,
): string => {
  const routeParams = (req as { routeParams?: Record<string, unknown> }).routeParams
  const routeValue = routeParams?.[key]
  if (typeof routeValue === 'string' || typeof routeValue === 'number') return String(routeValue)

  const rawUrl = typeof req.url === 'string' ? req.url : ''
  if (!rawUrl) return ''

  try {
    const pathname = new URL(rawUrl, 'http://localhost').pathname
    const match = pathname.match(pattern)
    return match?.[1] ? decodeURIComponent(match[1]) : ''
  } catch {
    return ''
  }
}

export const lessonQuestionsHandler: PayloadHandler = async (req) => {
  if (req.user?.collection !== 'accounts') return jsonError('Unauthorized', 401)

  const lessonId = parseRouteId(req, 'lessonId', /\/questions\/by-lesson\/([^/]+)$/)
  if (!lessonId) return jsonError('Invalid lesson id', 400)

  const result = await req.payload.find({
    collection: 'questions',
    where: {
      lesson: { equals: lessonId },
    },
    depth: 2,
    overrideAccess: true,
    sort: '-createdAt',
    limit: 200,
  })

  const docs = Array.isArray(result.docs)
    ? result.docs.map((doc) =>
        sanitizeQuestionDoc(doc as unknown as Record<string, unknown>),
      )
    : []

  return Response.json({
    docs,
    totalDocs: docs.length,
  })
}

export const questionDetailHandler: PayloadHandler = async (req) => {
  if (req.user?.collection !== 'accounts') return jsonError('Unauthorized', 401)

  const questionId = parseRouteId(req, 'questionId', /\/questions\/([^/]+)\/detail$/)
  if (!questionId) return jsonError('Invalid question id', 400)

  try {
    const doc = (await req.payload.findByID({
      collection: 'questions',
      id: questionId,
      depth: 2,
      overrideAccess: true,
    })) as unknown as Record<string, unknown>

    return Response.json({
      doc: sanitizeQuestionDoc(doc),
    })
  } catch {
    return jsonError('Question not found', 404)
  }
}
