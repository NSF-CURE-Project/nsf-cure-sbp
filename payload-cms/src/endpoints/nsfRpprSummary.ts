import type { PayloadHandler } from 'payload'
import { resolvePeriodFromQuery } from '../reporting/data'
import {
  getNsfrpprSummary,
  rpprEvidenceToCsv,
  rpprOrganizationsToCsv,
  rpprOverviewToCsv,
  rpprParticipantsToCsv,
  rpprProductsToCsv,
} from '../reporting/nsfRpprSummary'
import { periodToken } from '../reporting/period'
import { createReportingAuditEvent } from '../reporting/audit'
import { canAccessLearnerLevelReporting, isReportingStaff } from '../reporting/permissions'
import { isSchemaMismatchError, schemaRepairHint } from '../reporting/schema'

export const nsfRpprSummaryHandler: PayloadHandler = async (req) => {
  if (!isReportingStaff(req)) {
    return Response.json({ error: 'Not authorized.' }, { status: 403 })
  }

  try {
    const toBool = (value: unknown): boolean | null => {
      if (value === 'true') return true
      if (value === 'false') return false
      return null
    }

    const period = await resolvePeriodFromQuery(
      req.payload,
      req.query as Record<string, unknown> | undefined,
    )

    if (!period) {
      return Response.json(
        {
          error: 'NSF RPPR summary requires periodId or both startDate and endDate query params.',
        },
        { status: 400 },
      )
    }

    const filters = {
      classId: typeof req.query?.classId === 'string' ? req.query.classId : null,
      professorId: typeof req.query?.professorId === 'string' ? req.query.professorId : null,
      classroomId: typeof req.query?.classroomId === 'string' ? req.query.classroomId : null,
      firstGen: toBool(req.query?.firstGen),
      transfer: toBool(req.query?.transfer),
    }

    const summary = await getNsfrpprSummary(req.payload, period, {
      filters,
    })
    const format = req.query?.format === 'csv' ? 'csv' : 'json'

    if (format === 'json') {
      const jsonPayload = canAccessLearnerLevelReporting(req)
        ? summary
        : {
            ...summary,
            participantsOrganizations: {
              ...summary.participantsOrganizations,
              data: {
                ...summary.participantsOrganizations.data,
                participants: summary.participantsOrganizations.data.participants.map((participant) => ({
                  ...participant,
                  email: '',
                })),
              },
            },
          }
      await createReportingAuditEvent(req, {
        eventType: 'report_generated',
        reportType: period.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: period.startDate,
        periodEnd: period.endDate,
        exportType: 'rppr_summary',
        exportFormat: 'json',
      })
      return Response.json(jsonPayload)
    }

    const type = typeof req.query?.type === 'string' ? req.query.type : 'overview'
    const token = periodToken(period)

    if (type === 'participants') {
      if (!canAccessLearnerLevelReporting(req)) {
        return Response.json({ error: 'Not authorized for participant-level export.' }, { status: 403 })
      }
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: period.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: period.startDate,
        periodEnd: period.endDate,
        exportType: type,
        exportFormat: 'csv',
      })
      return new Response(rpprParticipantsToCsv(summary), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="nsf-rppr-participants-${token}.csv"`,
        },
      })
    }

    if (type === 'organizations') {
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: period.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: period.startDate,
        periodEnd: period.endDate,
        exportType: type,
        exportFormat: 'csv',
      })
      return new Response(rpprOrganizationsToCsv(summary), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="nsf-rppr-organizations-${token}.csv"`,
        },
      })
    }

    if (type === 'products') {
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: period.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: period.startDate,
        periodEnd: period.endDate,
        exportType: type,
        exportFormat: 'csv',
      })
      return new Response(rpprProductsToCsv(summary), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="nsf-rppr-products-${token}.csv"`,
        },
      })
    }

    if (type === 'evidence') {
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: period.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: period.startDate,
        periodEnd: period.endDate,
        exportType: type,
        exportFormat: 'csv',
      })
      return new Response(rpprEvidenceToCsv(summary), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="nsf-rppr-evidence-${token}.csv"`,
        },
      })
    }

    await createReportingAuditEvent(req, {
      eventType: 'export_generated',
      reportType: period.reportType,
      reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
      periodStart: period.startDate,
      periodEnd: period.endDate,
      exportType: 'overview',
      exportFormat: 'csv',
    })
    return new Response(rpprOverviewToCsv(summary), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nsf-rppr-overview-${token}.csv"`,
      },
    })
  } catch (error) {
    if (isSchemaMismatchError(error)) {
      return Response.json({ error: schemaRepairHint }, { status: 503 })
    }
    return Response.json(
      {
        error: 'Unable to generate NSF RPPR summary.',
      },
      { status: 500 },
    )
  }
}
