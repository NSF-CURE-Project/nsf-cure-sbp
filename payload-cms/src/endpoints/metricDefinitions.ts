import type { PayloadHandler } from 'payload'
import { metricDefinitions } from '../reporting/metricDefinitions'
import { isReportingStaff } from '../reporting/permissions'

export const metricDefinitionsHandler: PayloadHandler = async (req) => {
  if (!isReportingStaff(req)) {
    return Response.json({ error: 'Not authorized.' }, { status: 403 })
  }

  return Response.json({
    generatedAt: new Date().toISOString(),
    metrics: metricDefinitions,
  })
}
