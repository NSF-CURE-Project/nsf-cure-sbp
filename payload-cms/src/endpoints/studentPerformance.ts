import type { PayloadHandler } from 'payload'
import {
  getStudentPerformancePayload,
  type StudentPerformanceRange,
} from '../utils/studentPerformance'

const ALLOWED_RANGES: StudentPerformanceRange[] = ['7d', '30d', 'semester', 'all']

const parseRange = (value: unknown): StudentPerformanceRange | undefined => {
  if (typeof value !== 'string') return undefined
  return ALLOWED_RANGES.includes(value as StudentPerformanceRange)
    ? (value as StudentPerformanceRange)
    : undefined
}

const parseClassroomId = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'all') return undefined
  return trimmed
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const studentPerformanceHandler: PayloadHandler = async (req) => {
  try {
    const query = (req.query ?? {}) as Record<string, unknown>
    const range = parseRange(query.range)
    const classroomId = parseClassroomId(query.classroomId)

    const data = await getStudentPerformancePayload(req.payload, req.user, {
      range,
      classroomId,
    })
    return jsonResponse(data)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return jsonResponse({ error: 'Unauthorized' }, 403)
    }
    req.payload.logger.error({
      err: error,
      msg: 'Failed to compute student performance payload',
    })
    return jsonResponse({ error: 'Unable to load student performance.' }, 500)
  }
}
