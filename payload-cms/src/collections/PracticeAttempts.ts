import type { CollectionConfig, PayloadHandler, Where } from 'payload'
import catalog from '../practice/numeric.generated.json'
import { generateNumeric, matchesSignificantFigures, parseResponse } from '../practice/engine.generated.mjs'
import simulationCatalog from '../practice/simulations/metadata.generated.json'
import simulationLoaders from '../practice/simulations/loaders.generated.mjs'

const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const problemIdPattern = /^[0-9a-f]{20}$/
const LIBRARY_ASSIGNMENT = 'library'
const numeric = new Map(catalog.map((item) => [item.id, item]))
type SimGrade = { parameters: Record<string, unknown>; results: { name: string; entered: boolean; correct: boolean }[] }
const simulations = simulationCatalog as Record<string, { version: string } | undefined>
const loaders = simulationLoaders as unknown as Record<string, (() => Promise<{
  default: (options: { seed: string; gradeResponses: Record<string, unknown> }) => SimGrade
}>) | undefined>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const textRecord = (value: unknown, max: number) =>
  isRecord(value) && Object.keys(value).length <= max &&
  Object.values(value).every((item) => typeof item === 'string' && item.length <= 100)

function segments(value: unknown) {
  return Array.isArray(value) && value.length <= 64 && value.every((segment) =>
    isRecord(segment) && typeof segment.type === 'string' && ['horizontal', 'vertical', 'diagonal', 'curve'].includes(segment.type) &&
    ['c1', 'r1', 'c2', 'r2'].every((key) => typeof segment[key] === 'number' && Math.abs(segment[key]) <= 32) &&
    (segment.type !== 'curve' || segment.vertex === 'left' || segment.vertex === 'right' || segment.vertex === null),
  )
}

function validSimulationInput(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false
  if (Object.hasOwn(value, 'level')) {
    return typeof value.level === 'string' && ['easy', 'medium', 'hard'].includes(value.level) &&
      typeof value.step === 'string' && ['forces', 'components', 'resolve'].includes(value.step) &&
      isRecord(value.drawn) && Object.keys(value.drawn).length <= 12 &&
      Object.values(value.drawn).every((item) => isRecord(item) && typeof item.angle === 'number' &&
        Number.isFinite(item.angle) && Math.abs(item.angle) <= 720) &&
      isRecord(value.components) && Object.keys(value.components).length <= 10 &&
      Object.values(value.components).every((item) => textRecord(item, 12))
  }
  return textRecord(value.values, 12) && segments(value.shear) && segments(value.moment)
}

const gradeSubmission = async ({
  problemId,
  seed,
  version,
  responses,
  requireAllCorrect,
}: {
  problemId: string
  seed: string
  version: unknown
  responses: unknown
  requireAllCorrect: boolean
}) => {
  const problem = numeric.get(problemId)
  const simulation = simulations[problemId]
  if ((!problem && !simulation) || version !== (problem ?? simulation)?.version) {
    return { error: Response.json({ error: 'This problem was updated. Refresh before submitting.' }, { status: 409 }) }
  }

  if (problem) {
    if (!Array.isArray(responses) || responses.length !== problem.parts.length ||
        !responses.every((response) => typeof response === 'string' && response.length <= 100)) {
      return { error: Response.json({ error: 'Invalid practice submission.' }, { status: 400 }) }
    }
    const { data: generated, values } = generateNumeric(problemId, problem.parts, seed)
    const results = problem.parts.map((part, index) => {
      const response = responses[index] as string
      const parsed = parseResponse(response)
      const expected = values[index] as number
      return {
        name: part.name, response, expected, valid: parsed !== null,
        correct: parsed !== null && matchesSignificantFigures(parsed, expected, part.digits),
      }
    })
    if (!results.some((result) => result.valid)) {
      return {
        error: Response.json(
          { error: 'Enter at least one valid answer to save an attempt.' },
          { status: 422 },
        ),
      }
    }
    const allCorrect = results.every((part) => part.correct)
    return {
      data: {
        completed: requireAllCorrect ? allCorrect : results.every((part) => part.valid),
        score: results.filter((part) => part.correct).length,
        maxScore: results.length,
        snapshot: { seed, version, parameters: generated.params, results },
      },
    }
  }

  const load = loaders[problemId]
  if (!load || !validSimulationInput(responses)) {
    return { error: Response.json({ error: 'Invalid simulation submission.' }, { status: 400 }) }
  }
  const { default: grade } = await load()
  const { parameters, results } = grade({ seed, gradeResponses: responses })
  if (!results.some((result) => result.entered)) {
    return {
      error: Response.json(
        { error: 'Enter an answer or draw part of the diagram to save an attempt.' },
        { status: 422 },
      ),
    }
  }
  const allCorrect = results.every((result) => result.correct)
  const finished =
    results.every((result) => result.entered) &&
    (!responses.step || responses.step === 'resolve')
  return {
    data: {
      completed: requireAllCorrect ? allCorrect && finished : finished,
      score: results.filter((part) => part.correct).length,
      maxScore: results.length,
      snapshot: { seed, version, parameters, responses, results },
    },
  }
}

const recordAttempt: PayloadHandler = async (req) => {
  const body = await req.json?.().catch(() => null)
  if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request.' }, { status: 400 })

  const { problemId, seed, submissionId, version, responses } = body as Record<string, unknown>
  if (typeof problemId !== 'string' || !problemIdPattern.test(problemId)) {
    return Response.json({ error: 'Invalid practice problem.' }, { status: 400 })
  }

  const opening = body.action === 'open'
  if (!opening && body.action !== 'submit') {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const account = req.user?.collection === 'accounts' ? req.user : null
  const lessonId = body.lessonId
  const assignmentKey = body.assignmentKey
  const hasLessonContext =
    Number.isSafeInteger(lessonId) &&
    (lessonId as number) > 0 &&
    typeof assignmentKey === 'string' &&
    idPattern.test(assignmentKey)

  // Signed-out visitors: grade without persisting. Numeric web practice skips
  // this path entirely (grades in the Next server action). Simulations still
  // POST here so unsigned visitors can get a grade + local progress.
  if (!account) {
    if (opening) {
      return Response.json({ completed: false, score: null, maxScore: null, persisted: false })
    }
    if (typeof seed !== 'string' || !idPattern.test(seed) || typeof submissionId !== 'string' ||
      !idPattern.test(submissionId)) {
      return Response.json({ error: 'Invalid practice submission.' }, { status: 400 })
    }
    const graded = await gradeSubmission({
      problemId,
      seed,
      version,
      responses,
      // Shared problem completion is always based on verified correct answers.
      requireAllCorrect: true,
    })
    if (graded.error) return graded.error
    return Response.json({
      completed: graded.data.completed,
      score: graded.data.score,
      maxScore: graded.data.maxScore,
      seed,
      persisted: false,
    })
  }

  let lessonAssignmentKey = LIBRARY_ASSIGNMENT
  let lessonRelation: number | undefined

  if (hasLessonContext) {
    const lesson = await req.payload.findByID({
      collection: 'lessons', id: lessonId as number, depth: 0, overrideAccess: false, req, draft: false,
    }).catch(() => null)
    const assignment = (lesson?.layout as Array<Record<string, unknown>> | undefined)?.find(
      (block) =>
        block.blockType === 'practiceProblem' &&
        block.assignmentKey === assignmentKey &&
        block.problemId === problemId,
    )
    if (!assignment || lesson?._status !== 'published') {
      return Response.json({ error: 'This assignment is unavailable.' }, { status: 404 })
    }
    lessonRelation = lessonId as number
    lessonAssignmentKey = assignmentKey as string
  }

  // Library progress only records meaningful attempts (submit), not page opens.
  if (opening && !hasLessonContext) {
    return Response.json({ completed: false, score: null, maxScore: null, persisted: true })
  }

  const learner = Number(account.id)
  const key = hasLessonContext
    ? `${learner}:${lessonRelation}:${lessonAssignmentKey}:${opening ? 'open' : submissionId}`
    : `${learner}:${LIBRARY_ASSIGNMENT}:${problemId}:${submissionId}`

  let data: {
    lesson?: number
    learner: number
    assignmentKey: string
    problemId: string
    key: string
    completed: boolean
    submitted: boolean
    snapshot: Record<string, unknown>
    score: number | null
    maxScore: number | null
  } = {
    ...(lessonRelation != null ? { lesson: lessonRelation } : {}),
    learner,
    assignmentKey: lessonAssignmentKey,
    problemId,
    key,
    completed: false,
    submitted: !opening,
    snapshot: {},
    score: null,
    maxScore: null,
  }

  if (!opening) {
    if (typeof seed !== 'string' || !idPattern.test(seed) || typeof submissionId !== 'string' ||
      !idPattern.test(submissionId)) {
      return Response.json({ error: 'Invalid practice submission.' }, { status: 400 })
    }
    const graded = await gradeSubmission({
      problemId,
      seed,
      version,
      responses,
      // Shared problem completion is always based on verified correct answers.
      requireAllCorrect: true,
    })
    if (graded.error) return graded.error
    data = { ...data, ...graded.data, submitted: true }
  }

  const findExisting = async () => (await req.payload.find({
    collection: 'practice-attempts', where: { key: { equals: key } }, depth: 0, limit: 1, overrideAccess: true,
  })).docs[0]
  let attempt = await findExisting()
  if (!attempt) {
    try {
      attempt = await req.payload.create({ collection: 'practice-attempts', data, overrideAccess: true })
    } catch (error) {
      attempt = await findExisting()
      if (!attempt) throw error
    }
  } else if (!opening) {
    // Upsert progress for an existing submission key (retry / regrade).
    attempt = await req.payload.update({
      collection: 'practice-attempts',
      id: attempt.id,
      data: {
        completed: data.completed,
        submitted: true,
        score: data.score,
        maxScore: data.maxScore,
        snapshot: data.snapshot,
      },
      overrideAccess: true,
    })
  }

  return Response.json({
    completed: attempt.completed,
    score: attempt.score,
    maxScore: attempt.maxScore,
    persisted: true,
    seed: isRecord(attempt.snapshot) && typeof attempt.snapshot.seed === 'string'
      ? attempt.snapshot.seed
      : null,
  })
}

const attemptRank = (attempt: { completed?: boolean | null; submitted?: boolean | null }) =>
  attempt.completed ? 3 : attempt.submitted ? 2 : 1

const readStatus: PayloadHandler = async (req) => {
  const lessonId = Number(req.query.lesson)
  if (req.user?.collection !== 'accounts' || !Number.isSafeInteger(lessonId) || lessonId < 1) {
    return Response.json({ statuses: {} }, { headers: { 'Cache-Control': 'private, no-store' } })
  }

  const lesson = await req.payload.findByID({
    collection: 'lessons',
    id: lessonId,
    depth: 0,
    overrideAccess: false,
    req,
    draft: false,
  }).catch(() => null)

  const blocks = (lesson?.layout as Array<Record<string, unknown>> | undefined)?.filter(
    (block) => block.blockType === 'practiceProblem' && typeof block.problemId === 'string',
  ) ?? []
  const problemIds = [...new Set(blocks.map((block) => block.problemId as string))]

  // Shared progress: any attempt for these canonical problem IDs counts,
  // whether the student opened them from this lesson or the practice library.
  const where: Where = problemIds.length
    ? {
        and: [
          { learner: { equals: req.user.id } },
          {
            or: [
              { lesson: { equals: lessonId } },
              { problemId: { in: problemIds } },
            ],
          },
        ],
      }
    : {
        and: [
          { learner: { equals: req.user.id } },
          { lesson: { equals: lessonId } },
        ],
      }

  const { docs } = await req.payload.find({
    collection: 'practice-attempts',
    depth: 0,
    pagination: false,
    overrideAccess: true,
    where,
  })

  const byProblem = new Map<string, number>()
  for (const attempt of docs) {
    if (typeof attempt.problemId !== 'string' || !attempt.problemId) continue
    byProblem.set(
      attempt.problemId,
      Math.max(byProblem.get(attempt.problemId) ?? 0, attemptRank(attempt)),
    )
  }

  const statuses: Record<string, number> = {}
  for (const block of blocks) {
    const problemId = block.problemId as string
    const assignmentKey = typeof block.assignmentKey === 'string' ? block.assignmentKey : ''
    const rank = byProblem.get(problemId) ?? 0
    if (rank > 0 && assignmentKey) {
      statuses[`${assignmentKey}:${problemId}`] = rank
    }
  }

  return Response.json({ statuses }, { headers: { 'Cache-Control': 'private, no-store' } })
}

const readLibraryStatus: PayloadHandler = async (req) => {
  if (req.user?.collection !== 'accounts') {
    return Response.json(
      { signedIn: false, problems: {} },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  // Aggregate across lesson-embedded and library attempts by canonical problemId.
  const { docs } = await req.payload.find({
    collection: 'practice-attempts',
    depth: 0,
    pagination: false,
    overrideAccess: true,
    sort: '-updatedAt',
    where: {
      and: [
        { learner: { equals: req.user.id } },
        { submitted: { equals: true } },
      ],
    },
  })

  type ProblemProgress = {
    status: 'in-progress' | 'completed'
    seed: string | null
    updatedAt: string | null
    score: number | null
    maxScore: number | null
  }

  const problems: Record<string, ProblemProgress> = {}
  for (const attempt of docs) {
    const problemId = attempt.problemId
    if (typeof problemId !== 'string' || !problemId) continue
    const existing = problems[problemId]
    const nextStatus = attempt.completed ? 'completed' : 'in-progress'
    const snapshot = isRecord(attempt.snapshot) ? attempt.snapshot : null
    const seed = snapshot && typeof snapshot.seed === 'string' ? snapshot.seed : null
    if (!existing) {
      problems[problemId] = {
        status: nextStatus,
        seed,
        updatedAt: attempt.updatedAt ?? null,
        score: typeof attempt.score === 'number' ? attempt.score : null,
        maxScore: typeof attempt.maxScore === 'number' ? attempt.maxScore : null,
      }
      continue
    }
    if (existing.status !== 'completed' && nextStatus === 'completed') {
      existing.status = 'completed'
    }
    // Prefer the most recent seed (docs are sorted -updatedAt).
    if (!existing.seed && seed) existing.seed = seed
    if (typeof attempt.score === 'number') existing.score = attempt.score
    if (typeof attempt.maxScore === 'number') existing.maxScore = attempt.maxScore
  }

  return Response.json(
    { signedIn: true, problems },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}

export const PracticeAttempts: CollectionConfig = {
  slug: 'practice-attempts',
  lockDocuments: false,
  admin: { hidden: true },
  access: { read: () => false, create: () => false, update: () => false, delete: () => false },
  endpoints: [
    { path: '/record', method: 'post', handler: recordAttempt },
    { path: '/status', method: 'get', handler: readStatus },
    { path: '/library-status', method: 'get', handler: readLibraryStatus },
  ],
  fields: [
    { name: 'lesson', type: 'relationship', relationTo: 'lessons', required: false, index: true },
    { name: 'learner', type: 'relationship', relationTo: 'accounts', required: true, index: true },
    { name: 'assignmentKey', type: 'text', required: true },
    { name: 'problemId', type: 'text', required: true, index: true },
    { name: 'key', type: 'text', required: true, unique: true },
    { name: 'submitted', type: 'checkbox', defaultValue: false },
    { name: 'completed', type: 'checkbox', defaultValue: false },
    { name: 'score', type: 'number' },
    { name: 'maxScore', type: 'number' },
    { name: 'snapshot', type: 'json' },
  ],
}
