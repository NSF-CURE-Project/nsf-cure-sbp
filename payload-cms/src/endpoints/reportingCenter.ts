import type { PayloadHandler } from 'payload'
import { resolvePeriodFromQuery } from '../reporting/data'
import { createReportingAuditEvent } from '../reporting/audit'
import { canAccessLearnerLevelReporting, isReportingStaff } from '../reporting/permissions'
import { getReportingCenterPayload } from '../reporting/reportingCenter'
import { createReportingSnapshot } from '../reporting/snapshots'
import { getMetricDrilldown } from '../reporting/drilldowns'
import { periodToken } from '../reporting/period'
import {
  rpprEvidenceToCsv,
  rpprOrganizationsToCsv,
  rpprParticipantsToCsv,
  rpprProductsToCsv,
} from '../reporting/nsfRpprSummary'
import { reportRowsToCsv } from '../utils/analyticsSummary'

const toBool = (value: unknown): boolean | null => {
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

const parseFilters = (query: Record<string, unknown> | undefined) => ({
  classId: typeof query?.classId === 'string' ? query.classId : null,
  professorId: typeof query?.professorId === 'string' ? query.professorId : null,
  classroomId: typeof query?.classroomId === 'string' ? query.classroomId : null,
  firstGen: toBool(query?.firstGen),
  transfer: toBool(query?.transfer),
})

const parsePeriodId = (value: unknown): number | null => {
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

const parseNumericId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : null
  }
  return null
}

export const reportingCenterHandler: PayloadHandler = async (req) => {
  if (!isReportingStaff(req)) {
    return Response.json({ error: 'Not authorized.' }, { status: 403 })
  }

  try {
    const period = await resolvePeriodFromQuery(
      req.payload,
      req.query as Record<string, unknown> | undefined,
    )
    if (!period) {
      return Response.json(
        {
          error: 'Reporting center requires periodId or startDate/endDate query params.',
        },
        { status: 400 },
      )
    }

    const mode = req.query?.mode === 'internal' ? 'internal' : 'rppr'
    const filters = parseFilters(req.query as Record<string, unknown> | undefined)
    const reportingPeriodId = parsePeriodId(req.query?.periodId)
    const action = typeof req.query?.action === 'string' ? req.query.action : 'summary'

    if (action === 'create-snapshot') {
      const result = await createReportingSnapshot(req.payload, req, {
        mode,
        period,
        reportingPeriodId,
        filters,
        label: typeof req.query?.label === 'string' ? req.query.label : null,
        reuseIfUnchanged: req.query?.reuseIfUnchanged !== 'false',
      })
      return Response.json({
        message: result.reused ? 'Existing snapshot reused.' : 'Snapshot created.',
        snapshot: result.snapshot,
        reused: result.reused,
      })
    }

    if (action === 'drilldown') {
      const metricKey = typeof req.query?.metricKey === 'string' ? req.query.metricKey : ''
      if (!metricKey) {
        return Response.json({ error: 'metricKey is required for drilldown.' }, { status: 400 })
      }
      const drilldown = await getMetricDrilldown(req.payload, req, {
        metricKey,
        period,
        filters,
      })

      await createReportingAuditEvent(req, {
        eventType: 'drilldown_viewed',
        reportType: period.reportType,
        reportingPeriod: reportingPeriodId,
        periodStart: period.startDate,
        periodEnd: period.endDate,
        filters,
        metricKey,
      })

      if (req.query?.format === 'csv') {
        const rows = drilldown.rows as Array<Record<string, string | number | boolean | null>>
        const headers = Array.from(
          rows.reduce((set, row) => {
            Object.keys(row).forEach((key) => set.add(key))
            return set
          }, new Set<string>()),
        )
        const csv = reportRowsToCsv(
          rows.map((row) =>
            Object.fromEntries(
              Object.entries(row).map(([key, value]) => [key, value == null ? '' : String(value)]),
            ),
          ),
          headers,
        )
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename=\"reporting-drilldown-${metricKey}-${periodToken(period)}.csv\"`,
          },
        })
      }

      return Response.json(drilldown)
    }

    if (action === 'save-view') {
      const label =
        typeof req.query?.label === 'string' && req.query.label.trim()
          ? req.query.label.trim()
          : `Saved view ${new Date().toISOString().slice(0, 10)}`
      const ownerId = parseNumericId(req.user?.id)
      if (ownerId == null) {
        return Response.json({ error: 'Unable to resolve reporting view owner.' }, { status: 400 })
      }
      const saved = await req.payload.create({
        collection: 'reporting-saved-views',
        data: {
          label,
          owner: ownerId,
          reportType: period.reportType,
          reportingPeriod: reportingPeriodId ?? undefined,
          startDate: period.startDate,
          endDate: period.endDate,
          filters,
          isShared: req.query?.shared === 'true',
        },
        overrideAccess: true,
        depth: 0,
      })
      await createReportingAuditEvent(req, {
        eventType: 'saved_view_created',
        reportType: period.reportType,
        periodStart: period.startDate,
        periodEnd: period.endDate,
        filters,
        notes: `Saved reporting view ${saved.id}`,
      })
      return Response.json({ message: 'Saved view created.', view: saved })
    }

    const centerPayload = await getReportingCenterPayload(req.payload, {
      mode,
      period,
      filters,
    })

    const format = req.query?.format === 'csv' ? 'csv' : 'json'
    if (req.query?.format === 'pdf') {
      return Response.json(
        {
          error: 'PDF export scaffold is in place but renderer is not yet configured.',
        },
        { status: 501 },
      )
    }
    const exportType = typeof req.query?.type === 'string' ? req.query.type : 'summary'

    if (format === 'csv') {
      const token = periodToken(period)
      if (exportType === 'participants') {
        if (!centerPayload.rppr) {
          return Response.json({ error: 'RPPR payload unavailable for participant export.' }, { status: 400 })
        }
        if (!canAccessLearnerLevelReporting(req)) {
          return Response.json({ error: 'Not authorized for participant-level export.' }, { status: 403 })
        }
        await createReportingAuditEvent(req, {
          eventType: 'export_generated',
          reportType: period.reportType,
          periodStart: period.startDate,
          periodEnd: period.endDate,
          filters,
          exportType,
          exportFormat: 'csv',
        })
        return new Response(rpprParticipantsToCsv(centerPayload.rppr), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="reporting-center-participants-${token}.csv"`,
          },
        })
      }
      if (exportType === 'organizations') {
        if (!centerPayload.rppr) {
          return Response.json({ error: 'RPPR payload unavailable for organization export.' }, { status: 400 })
        }
        await createReportingAuditEvent(req, {
          eventType: 'export_generated',
          reportType: period.reportType,
          periodStart: period.startDate,
          periodEnd: period.endDate,
          filters,
          exportType,
          exportFormat: 'csv',
        })
        return new Response(rpprOrganizationsToCsv(centerPayload.rppr), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="reporting-center-organizations-${token}.csv"`,
          },
        })
      }
      if (exportType === 'products') {
        if (!centerPayload.rppr) {
          return Response.json({ error: 'RPPR payload unavailable for product export.' }, { status: 400 })
        }
        await createReportingAuditEvent(req, {
          eventType: 'export_generated',
          reportType: period.reportType,
          periodStart: period.startDate,
          periodEnd: period.endDate,
          filters,
          exportType,
          exportFormat: 'csv',
        })
        return new Response(rpprProductsToCsv(centerPayload.rppr), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="reporting-center-products-${token}.csv"`,
          },
        })
      }
      if (exportType === 'evidence') {
        if (!centerPayload.rppr) {
          return Response.json({ error: 'RPPR payload unavailable for evidence export.' }, { status: 400 })
        }
        await createReportingAuditEvent(req, {
          eventType: 'export_generated',
          reportType: period.reportType,
          periodStart: period.startDate,
          periodEnd: period.endDate,
          filters,
          exportType,
          exportFormat: 'csv',
        })
        return new Response(rpprEvidenceToCsv(centerPayload.rppr), {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="reporting-center-evidence-${token}.csv"`,
          },
        })
      }
      if (exportType === 'data-quality') {
        const csv = reportRowsToCsv(
          centerPayload.dataQuality.issues.map((issue) => ({
            key: issue.key,
            severity: issue.severity,
            category: issue.category,
            message: issue.message,
            count: issue.count ?? '',
            recommendation: issue.recommendation ?? '',
          })),
          ['key', 'severity', 'category', 'message', 'count', 'recommendation'],
        )
        await createReportingAuditEvent(req, {
          eventType: 'export_generated',
          reportType: period.reportType,
          periodStart: period.startDate,
          periodEnd: period.endDate,
          filters,
          exportType,
          exportFormat: 'csv',
        })
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="reporting-center-data-quality-${token}.csv"`,
          },
        })
      }

      const summaryRows = [
        { metric: 'uniqueLearnersActive', value: centerPayload.summary.participation.uniqueLearnersActive },
        {
          metric: 'uniqueLearnersWithProgress',
          value: centerPayload.summary.participation.uniqueLearnersWithProgress,
        },
        {
          metric: 'uniqueLearnersWithQuizAttempts',
          value: centerPayload.summary.participation.uniqueLearnersWithQuizAttempts,
        },
        { metric: 'productsInPeriod', value: centerPayload.summary.productsInPeriod.total },
        { metric: 'evidenceLinks', value: centerPayload.rppr?.evidence.totalEvidenceLinks ?? 0 },
      ]
      const csv = reportRowsToCsv(summaryRows, ['metric', 'value'])
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: period.reportType,
        periodStart: period.startDate,
        periodEnd: period.endDate,
        filters,
        exportType: 'summary',
        exportFormat: 'csv',
      })
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=\"reporting-center-summary-${token}.csv\"`,
        },
      })
    }

    await createReportingAuditEvent(req, {
      eventType: 'report_generated',
      reportType: period.reportType,
      reportingPeriod: reportingPeriodId,
      periodStart: period.startDate,
      periodEnd: period.endDate,
      filters,
      exportType: 'summary',
      exportFormat: format,
    })

    if (!canAccessLearnerLevelReporting(req) && centerPayload.rppr) {
      return Response.json({
        ...centerPayload,
        rppr: {
          ...centerPayload.rppr,
          participantsOrganizations: {
            ...centerPayload.rppr.participantsOrganizations,
            data: {
              ...centerPayload.rppr.participantsOrganizations.data,
              participants: centerPayload.rppr.participantsOrganizations.data.participants.map(
                (participant) => ({
                  ...participant,
                  email: '',
                }),
              ),
            },
          },
        },
      })
    }

    return Response.json(centerPayload)
  } catch {
    return Response.json({ error: 'Unable to generate reporting center payload.' }, { status: 500 })
  }
}
