import type { CollectionConfig, PayloadHandler } from 'payload'
import catalog from '../practice/numeric.generated.json'
import { generateNumeric, matchesSignificantFigures, parseResponse } from '../practice/engine.generated.mjs'
import simulationCatalog from '../practice/simulations/metadata.generated.json'
import simulationLoaders from '../practice/simulations/loaders.generated.mjs'

const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
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

const recordAttempt: PayloadHandler = async (req) => {
  if (req.user?.collection !== 'accounts') {
    return Response.json({ error: 'Sign in to save your practice progress.' }, { status: 401 })
  }
  const body = await req.json?.().catch(() => null)
  if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request.' }, { status: 400 })
  const { lessonId, assignmentKey, problemId, seed, submissionId, version, responses } = body
  if (!Number.isSafeInteger(lessonId) || lessonId < 1 || typeof assignmentKey !== 'string' ||
      !idPattern.test(assignmentKey) || typeof problemId !== 'string' || !/^[0-9a-f]{20}$/.test(problemId)) {
    return Response.json({ error: 'Invalid lesson assignment.' }, { status: 400 })
  }
  const lesson = await req.payload.findByID({
    collection: 'lessons', id: lessonId, depth: 0, overrideAccess: false, req, draft: false,
  }).catch(() => null)
  const assignment = (lesson?.layout as Array<Record<string, unknown>> | undefined)?.find(
    (block) => block.blockType === 'practiceProblem' && block.assignmentKey === assignmentKey && block.problemId === problemId,
  )
  if (!assignment || lesson?._status !== 'published') {
    return Response.json({ error: 'This assignment is unavailable.' }, { status: 404 })
  }

  const opening = body.action === 'open'
  if (!opening && body.action !== 'submit') return Response.json({ error: 'Invalid request.' }, { status: 400 })
  const learner = req.user.id
  const key = `${learner}:${lessonId}:${assignmentKey}:${opening ? 'open' : submissionId}`
  let data = {
    lesson: lessonId,
    learner,
    assignmentKey,
    problemId,
    key,
    completed: false,
    submitted: !opening,
    snapshot: {} as Record<string, unknown>,
    score: null as number | null,
    maxScore: null as number | null,
  }

  if (!opening) {
    if (typeof seed !== 'string' || !idPattern.test(seed) || typeof submissionId !== 'string' ||
      !idPattern.test(submissionId)) {
      return Response.json({ error: 'Invalid practice submission.' }, { status: 400 })
    }
    const problem = numeric.get(problemId)
    const simulation = simulations[problemId]
    if ((!problem && !simulation) || version !== (problem ?? simulation)?.version) {
      return Response.json({ error: 'This problem was updated. Refresh before submitting.' }, { status: 409 })
    }
    if (problem) {
      if (!Array.isArray(responses) || responses.length !== problem.parts.length ||
          !responses.every((response) => typeof response === 'string' && response.length <= 100)) {
        return Response.json({ error: 'Invalid practice submission.' }, { status: 400 })
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
        return Response.json({ error: 'Enter at least one valid answer to save an attempt.' }, { status: 422 })
      }
      data = {
        ...data, completed: results.every((part) => part.valid),
        score: results.filter((part) => part.correct).length, maxScore: results.length,
        snapshot: { seed, version, parameters: generated.params, results },
      }
    } else {
      const load = loaders[problemId]
      if (!load || !validSimulationInput(responses)) {
        return Response.json({ error: 'Invalid simulation submission.' }, { status: 400 })
      }
      const { default: grade } = await load()
      const { parameters, results } = grade({ seed, gradeResponses: responses })
      if (!results.some((result) => result.entered)) {
        return Response.json({ error: 'Enter an answer or draw part of the diagram to save an attempt.' }, { status: 422 })
      }
      data = {
        ...data,
        completed: results.every((result) => result.entered) && (!responses.step || responses.step === 'resolve'),
        score: results.filter((part) => part.correct).length,
        maxScore: results.length,
        snapshot: { seed, version, parameters, responses, results },
      }
    }
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
  }
  return Response.json({ completed: attempt.completed, score: attempt.score, maxScore: attempt.maxScore })
}

const readStatus: PayloadHandler = async (req) => {
  const lessonId = Number(req.query.lesson)
  if (req.user?.collection !== 'accounts' || !Number.isSafeInteger(lessonId) || lessonId < 1) {
    return Response.json({ statuses: {} }, { headers: { 'Cache-Control': 'private, no-store' } })
  }
  const { docs } = await req.payload.find({
    collection: 'practice-attempts', depth: 0, pagination: false, overrideAccess: true,
    where: { and: [{ learner: { equals: req.user.id } }, { lesson: { equals: lessonId } }] },
  })
  const statuses = new Map<string, number>()
  for (const attempt of docs) {
    const key = `${attempt.assignmentKey}:${attempt.problemId}`
    const status = attempt.completed ? 3 : attempt.submitted ? 2 : 1
    statuses.set(key, Math.max(status, statuses.get(key) ?? 0))
  }
  return Response.json({ statuses: Object.fromEntries(statuses) }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export const PracticeAttempts: CollectionConfig = {
  slug: 'practice-attempts',
  lockDocuments: false,
  admin: { hidden: true },
  access: { read: () => false, create: () => false, update: () => false, delete: () => false },
  endpoints: [
    { path: '/record', method: 'post', handler: recordAttempt },
    { path: '/status', method: 'get', handler: readStatus },
  ],
  fields: [
    { name: 'lesson', type: 'relationship', relationTo: 'lessons', required: true, index: true },
    { name: 'learner', type: 'relationship', relationTo: 'accounts', required: true, index: true },
    { name: 'assignmentKey', type: 'text', required: true },
    { name: 'problemId', type: 'text', required: true },
    { name: 'key', type: 'text', required: true, unique: true },
    { name: 'submitted', type: 'checkbox', defaultValue: false },
    { name: 'completed', type: 'checkbox', defaultValue: false },
    { name: 'score', type: 'number' },
    { name: 'maxScore', type: 'number' },
    { name: 'snapshot', type: 'json' },
  ],
}
