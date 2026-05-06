import type { PayloadHandler, PayloadRequest } from 'payload'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes((req.user as { role?: string }).role ?? '')

const round = (value: number, digits = 3) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

const getId = (value: unknown): string | number | null => {
  if (value == null) return null
  if (typeof value === 'object' && 'id' in (value as { id?: unknown })) {
    return ((value as { id?: string | number }).id ?? null) as string | number | null
  }
  return value as string | number | null
}

// Lightweight list for the concept library page.
export const conceptListHandler: PayloadHandler = async (req) => {
  if (!isStaff(req)) return jsonResponse({ error: 'Unauthorized' }, 403)

  const concepts = await req.payload.find({
    collection: 'concepts',
    depth: 0,
    limit: 500,
    sort: 'name',
    overrideAccess: true,
  })

  // Tally how many quiz-questions reference each concept by scanning the
  // rels table via a paginated find on quiz-questions.
  const questions = await req.payload.find({
    collection: 'quiz-questions',
    depth: 0,
    limit: 5000,
    overrideAccess: true,
  })

  const questionsByConcept = new Map<string, number>()
  ;(questions.docs as Array<{ concepts?: unknown }>).forEach((qd) => {
    const ids = Array.isArray(qd.concepts) ? qd.concepts : []
    ids.forEach((c) => {
      const id = getId(c)
      if (id != null) {
        const key = String(id)
        questionsByConcept.set(key, (questionsByConcept.get(key) ?? 0) + 1)
      }
    })
  })

  return jsonResponse({
    concepts: concepts.docs.map((doc) => {
      const d = doc as {
        id: string | number
        name?: string
        slug?: string
        subject?: string
        bloomLevel?: string
        description?: string
      }
      return {
        id: d.id,
        name: d.name ?? '(unnamed)',
        slug: d.slug ?? '',
        subject: d.subject ?? null,
        bloomLevel: d.bloomLevel ?? null,
        description: d.description ?? null,
        questionCount: questionsByConcept.get(String(d.id)) ?? 0,
      }
    }),
    totalDocs: concepts.totalDocs,
  })
}

// Detailed view for one concept: prerequisites, tagged questions, attempt-level mastery.
export const conceptDetailHandler: PayloadHandler = async (req) => {
  if (!isStaff(req)) return jsonResponse({ error: 'Unauthorized' }, 403)

  const url = new URL(req.url ?? 'http://localhost')
  const slug = url.searchParams.get('slug')
  if (!slug) return jsonResponse({ error: 'slug is required' }, 400)

  const conceptList = await req.payload.find({
    collection: 'concepts',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const concept = conceptList.docs[0]
  if (!concept) return jsonResponse({ error: 'Concept not found' }, 404)

  const c = concept as {
    id: string | number
    name?: string
    slug?: string
    subject?: string
    bloomLevel?: string
    description?: string
    prerequisiteConcepts?: unknown
  }

  const prereqRel = c.prerequisiteConcepts
  const prerequisites = Array.isArray(prereqRel)
    ? prereqRel
        .map((pr) => {
          if (typeof pr === 'object' && pr !== null && 'id' in (pr as { id?: unknown })) {
            const pd = pr as { id: string | number; name?: string; slug?: string }
            return { id: pd.id, name: pd.name ?? '(unnamed)', slug: pd.slug ?? '' }
          }
          return null
        })
        .filter((x): x is { id: string | number; name: string; slug: string } => x != null)
    : []

  // All quiz-questions tagged with this concept.
  const questions = await req.payload.find({
    collection: 'quiz-questions',
    where: { concepts: { in: [String(c.id)] } },
    depth: 0,
    limit: 500,
    overrideAccess: true,
  })

  const questionDocs = questions.docs as Array<{
    id: string | number
    title?: string
    questionType?: string
    difficulty?: string
    bloomLevel?: string
  }>
  const questionIds = new Set(questionDocs.map((q) => String(q.id)))

  // Find attempts that reference any of these questions to compute mastery.
  // Pull recent attempts and aggregate.
  const attempts = await req.payload.find({
    collection: 'quiz-attempts',
    depth: 0,
    limit: 2000,
    sort: '-completedAt',
    overrideAccess: true,
  })

  let totalAnswers = 0
  let correctAnswers = 0
  const studentMastery = new Map<string, { total: number; correct: number }>()

  ;(attempts.docs as Array<{ user?: unknown; answers?: Array<{ question?: unknown; isCorrect?: boolean | null }> }>).forEach(
    (a) => {
      const userId = getId(a.user)
      const answers = Array.isArray(a.answers) ? a.answers : []
      answers.forEach((ans) => {
        const qid = getId(ans.question)
        if (qid == null || !questionIds.has(String(qid))) return
        totalAnswers += 1
        const correct = ans.isCorrect === true
        if (correct) correctAnswers += 1
        if (userId != null) {
          const key = String(userId)
          const cur = studentMastery.get(key) ?? { total: 0, correct: 0 }
          cur.total += 1
          if (correct) cur.correct += 1
          studentMastery.set(key, cur)
        }
      })
    },
  )

  const mastered = Array.from(studentMastery.values()).filter((m) => m.total >= 3 && m.correct / m.total >= 0.8).length
  const struggling = Array.from(studentMastery.values()).filter((m) => m.total >= 3 && m.correct / m.total < 0.5).length

  return jsonResponse({
    concept: {
      id: c.id,
      name: c.name ?? '',
      slug: c.slug ?? '',
      subject: c.subject ?? null,
      bloomLevel: c.bloomLevel ?? null,
      description: c.description ?? null,
    },
    prerequisites,
    questions: questionDocs.map((q) => ({
      id: q.id,
      title: q.title ?? '(untitled)',
      questionType: q.questionType ?? null,
      difficulty: q.difficulty ?? null,
      bloomLevel: q.bloomLevel ?? null,
    })),
    aggregate: {
      questionCount: questionDocs.length,
      attemptCount: totalAnswers,
      pValue: totalAnswers > 0 ? round(correctAnswers / totalAnswers, 3) : null,
      studentsTracked: studentMastery.size,
      studentsMastered: mastered,
      studentsStruggling: struggling,
    },
  })
}
