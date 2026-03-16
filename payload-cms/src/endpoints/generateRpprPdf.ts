import type { PayloadHandler } from 'payload'

import { authenticateApiKey, hasApiScope } from '../middleware/apiKeyAuth'
import { isReportingStaff } from '../reporting/permissions'

type GenerateRpprBody = {
  meta?: {
    reportType?: string
    periodStart?: string
    periodEnd?: string
    awardNumber?: string
    projectTitle?: string
  }
  sections?: Record<string, string>
  metrics?: Record<string, unknown>
  includeDataAppendix?: boolean
}

const requireReportingAccess = async (req: Parameters<PayloadHandler>[0]) => {
  if (isReportingStaff(req)) return true
  const apiAuth = await authenticateApiKey(req, { requiredScope: 'reporting:read' })
  return Boolean(apiAuth && hasApiScope(apiAuth.scopes, 'reporting:read'))
}

export const generateRpprPdfHandler: PayloadHandler = async (req) => {
  const access = await requireReportingAccess(req)
  if (!access) {
    return Response.json({ error: 'Not authorized.' }, { status: 403 })
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as GenerateRpprBody
  const meta = body.meta ?? {}
  const sections = body.sections ?? {}
  const metrics = body.metrics ?? {}
  const generatedAt = new Date().toISOString()

  const [{ renderToBuffer }, { RpprReportDocument }, React] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../pdf/RpprReportDocument'),
    import('react'),
  ])

  const document = React.createElement(RpprReportDocument, {
    meta: {
      reportType: meta.reportType ?? 'annual',
      periodStart: meta.periodStart ?? '',
      periodEnd: meta.periodEnd ?? '',
      awardNumber: meta.awardNumber ?? process.env.NSF_AWARD_NUMBER ?? null,
      projectTitle: meta.projectTitle ?? 'NSF CURE SBP',
    },
    sections,
    metrics,
    includeDataAppendix: Boolean(body.includeDataAppendix),
    generatedAt,
  }) as never

  const pdf = await renderToBuffer(document)
  const start = (meta.periodStart ?? '').slice(0, 10) || 'start'
  const end = (meta.periodEnd ?? '').slice(0, 10) || 'end'

  return new Response(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="nsf-rppr-${start}-${end}.pdf"`,
      'Cache-Control': 'private, no-store, max-age=0',
    },
  })
}
