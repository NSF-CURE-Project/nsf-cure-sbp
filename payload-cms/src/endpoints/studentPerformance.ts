import type { PayloadHandler } from 'payload'
import { getStudentPerformancePayload } from '../utils/studentPerformance'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const studentPerformanceHandler: PayloadHandler = async (req) => {
  try {
    const data = await getStudentPerformancePayload(req.payload, req.user)
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
