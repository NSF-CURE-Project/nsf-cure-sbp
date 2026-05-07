import type { PayloadHandler, PayloadRequest } from 'payload'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes((req.user as { role?: string }).role ?? '')

const getId = (value: unknown): string | number | null => {
  if (value == null) return null
  if (typeof value === 'object' && 'id' in (value as { id?: unknown })) {
    return ((value as { id?: string | number }).id ?? null) as string | number | null
  }
  return value as string | number | null
}

export const questionBankHandler: PayloadHandler = async (req) => {
  if (!req?.user) return jsonResponse({ error: 'Unauthorized' }, 401)
  if (!isStaff(req)) return jsonResponse({ error: 'Forbidden' }, 403)

  // Pull a wide net up front; the client-side filters are cheap once we have
  // the rows. For programs with thousands of questions this should be paged.
  const [questions, concepts, quizzes] = await Promise.all([
    req.payload.find({
      collection: 'quiz-questions',
      depth: 1,
      limit: 2000,
      sort: '-updatedAt',
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'concepts',
      depth: 0,
      limit: 500,
      overrideAccess: true,
    }),
    req.payload.find({
      collection: 'quizzes',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
    }),
  ])

  // Build "in how many quizzes is this question used?" map.
  const usageByQuestion = new Map<string, number>()
  ;(quizzes.docs as Array<{ questions?: unknown[] }>).forEach((q) => {
    const qs = Array.isArray(q.questions) ? q.questions : []
    qs.forEach((item) => {
      const id = getId(item)
      if (id != null) {
        const key = String(id)
        usageByQuestion.set(key, (usageByQuestion.get(key) ?? 0) + 1)
      }
    })
  })

  return jsonResponse({
    concepts: (concepts.docs as Array<{ id: string | number; name?: string; slug?: string; subject?: string }>).map(
      (c) => ({ id: c.id, name: c.name ?? '(unnamed)', slug: c.slug ?? '', subject: c.subject ?? null }),
    ),
    questions: (questions.docs as Array<{
      id: string | number
      title?: string
      questionType?: string
      difficulty?: string
      bloomLevel?: string
      topic?: string
      tags?: string[]
      concepts?: unknown
      updatedAt?: string
      _status?: string
    }>).map((q) => {
      const conceptIds: Array<string | number> = Array.isArray(q.concepts)
        ? q.concepts.map((c) => getId(c)).filter((x): x is string | number => x != null)
        : []
      return {
        id: q.id,
        title: q.title ?? '(untitled)',
        questionType: q.questionType ?? null,
        difficulty: q.difficulty ?? null,
        bloomLevel: q.bloomLevel ?? null,
        topic: q.topic ?? null,
        tags: Array.isArray(q.tags) ? q.tags : [],
        conceptIds,
        usageCount: usageByQuestion.get(String(q.id)) ?? 0,
        updatedAt: q.updatedAt ?? null,
        status: q._status ?? null,
      }
    }),
  })
}
