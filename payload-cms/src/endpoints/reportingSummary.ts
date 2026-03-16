import type { PayloadHandler } from 'payload'
import { resolvePeriodFromQuery } from '../reporting/data'
import { periodToken } from '../reporting/period'
import { getReportingSummary, reportRowsToCsv } from '../utils/analyticsSummary'
import { createReportingAuditEvent } from '../reporting/audit'
import { isReportingStaff } from '../reporting/permissions'

const toPct = (value: number) => `${Math.round(value * 1000) / 10}%`
const toBool = (value: unknown): boolean | null => {
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

export const reportingSummaryHandler: PayloadHandler = async (req) => {
  if (!isReportingStaff(req)) {
    return Response.json(
      {
        error: 'Not authorized.',
      },
      { status: 403 },
    )
  }

  try {
    const format = req.query?.format === 'csv' ? 'csv' : 'json'
    const mode = req.query?.mode === 'rppr' ? 'rppr' : 'internal'
    const filters = {
      classId: typeof req.query?.classId === 'string' ? req.query.classId : null,
      professorId: typeof req.query?.professorId === 'string' ? req.query.professorId : null,
      classroomId: typeof req.query?.classroomId === 'string' ? req.query.classroomId : null,
      firstGen: toBool(req.query?.firstGen),
      transfer: toBool(req.query?.transfer),
    }
    const period = await resolvePeriodFromQuery(
      req.payload,
      req.query as Record<string, unknown> | undefined,
    )

    if (mode === 'rppr' && !period) {
      return Response.json(
        {
          error:
            'RPPR mode requires periodId or both startDate and endDate query params (YYYY-MM-DD).',
        },
        { status: 400 },
      )
    }

    const report = await getReportingSummary(req.payload, {
      mode,
      period,
      filters,
    })

    if (format === 'json') {
      await createReportingAuditEvent(req, {
        eventType: 'report_generated',
        reportType: report.reportMeta.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: report.reportMeta.period?.startDate ?? null,
        periodEnd: report.reportMeta.period?.endDate ?? null,
        filters: report.reportMeta.filters,
        exportType: 'analytics_summary',
        exportFormat: 'json',
      })
      return Response.json(report)
    }

    const type = typeof req.query?.type === 'string' ? req.query.type : 'all'

    if (type === 'class-completion') {
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: report.reportMeta.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: report.reportMeta.period?.startDate ?? null,
        periodEnd: report.reportMeta.period?.endDate ?? null,
        filters: report.reportMeta.filters,
        exportType: type,
        exportFormat: 'csv',
      })
      const csv = reportRowsToCsv(
        report.classCompletion.map((row) => ({
          class: row.title,
          uniqueLearnersStarted: row.uniqueLearnersStarted,
          uniqueLearnersCompleted: row.uniqueLearnersCompleted,
          completionRate: toPct(row.completionRate),
        })),
        ['class', 'uniqueLearnersStarted', 'uniqueLearnersCompleted', 'completionRate'],
      )
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${mode}-class-completion-${period ? periodToken(period) : 'all-time'}.csv"`,
        },
      })
    }

    if (type === 'chapter-completion') {
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: report.reportMeta.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: report.reportMeta.period?.startDate ?? null,
        periodEnd: report.reportMeta.period?.endDate ?? null,
        filters: report.reportMeta.filters,
        exportType: type,
        exportFormat: 'csv',
      })
      const csv = reportRowsToCsv(
        report.chapterCompletion.map((row) => ({
          chapter: row.title,
          uniqueLearnersStarted: row.uniqueLearnersStarted,
          uniqueLearnersCompleted: row.uniqueLearnersCompleted,
          completionRate: toPct(row.completionRate),
        })),
        ['chapter', 'uniqueLearnersStarted', 'uniqueLearnersCompleted', 'completionRate'],
      )
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${mode}-chapter-completion-${period ? periodToken(period) : 'all-time'}.csv"`,
        },
      })
    }

    if (type === 'quiz-performance' || type === 'quiz-mastery') {
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: report.reportMeta.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: report.reportMeta.period?.startDate ?? null,
        periodEnd: report.reportMeta.period?.endDate ?? null,
        filters: report.reportMeta.filters,
        exportType: type,
        exportFormat: 'csv',
      })
      const csv = reportRowsToCsv(
        report.quizPerformance.map((row) => ({
          quiz: row.title,
          attempts: row.attempts,
          uniqueLearnersAttempted: row.uniqueLearnersAttempted,
          uniqueLearnersMastered: row.uniqueLearnersMastered,
          masteryRate: toPct(row.masteryRate),
        })),
        [
          'quiz',
          'attempts',
          'uniqueLearnersAttempted',
          'uniqueLearnersMastered',
          'masteryRate',
        ],
      )
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${mode}-quiz-performance-${period ? periodToken(period) : 'all-time'}.csv"`,
        },
      })
    }

    if (type === 'engagement-wow') {
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: report.reportMeta.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: report.reportMeta.period?.startDate ?? null,
        periodEnd: report.reportMeta.period?.endDate ?? null,
        filters: report.reportMeta.filters,
        exportType: type,
        exportFormat: 'csv',
      })
      const csv = reportRowsToCsv(
        report.weeklyEngagement.map((row) => ({
          weekStart: row.weekStart,
          activeStudents: row.activeStudents,
          weekOverWeekChange: row.weekOverWeekChange == null ? 'N/A' : toPct(row.weekOverWeekChange),
        })),
        ['weekStart', 'activeStudents', 'weekOverWeekChange'],
      )
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=\"${mode}-weekly-engagement-${period ? periodToken(period) : 'all-time'}.csv\"`,
        },
      })
    }

    if (type === 'products') {
      await createReportingAuditEvent(req, {
        eventType: 'export_generated',
        reportType: report.reportMeta.reportType,
        reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
        periodStart: report.reportMeta.period?.startDate ?? null,
        periodEnd: report.reportMeta.period?.endDate ?? null,
        filters: report.reportMeta.filters,
        exportType: type,
        exportFormat: 'csv',
      })
      const csv = reportRowsToCsv(
        report.productsInPeriod.artifacts.map((row) => ({
          collection: row.collection,
          id: row.id,
          title: row.title,
          createdAt: row.createdAt,
        })),
        ['collection', 'id', 'title', 'createdAt'],
      )
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${mode}-products-${period ? periodToken(period) : 'all-time'}.csv"`,
        },
      })
    }

    await createReportingAuditEvent(req, {
      eventType: 'export_generated',
      reportType: report.reportMeta.reportType,
      reportingPeriod: typeof req.query?.periodId === 'string' ? req.query.periodId : null,
      periodStart: report.reportMeta.period?.startDate ?? null,
      periodEnd: report.reportMeta.period?.endDate ?? null,
      filters: report.reportMeta.filters,
      exportType: 'analytics_summary',
      exportFormat: 'csv',
    })
    const lines = [
      'NSF CURE Analytics Summary',
      `Mode,${report.reportMeta.mode}`,
      `Report Type,${report.reportMeta.reportType}`,
      `Generated At,${report.reportMeta.generatedAt}`,
      `Period Start,${report.reportMeta.period?.startDate ?? 'all-time'}`,
      `Period End,${report.reportMeta.period?.endDate ?? 'all-time'}`,
      '',
      'Participation',
      `Unique Learners Active,${report.participation.uniqueLearnersActive}`,
      `Unique Learners With Progress,${report.participation.uniqueLearnersWithProgress}`,
      `Unique Learners With Quiz Attempts,${report.participation.uniqueLearnersWithQuizAttempts}`,
      '',
      'Class Completion',
      reportRowsToCsv(
        report.classCompletion.map((row) => ({
          class: row.title,
          uniqueLearnersStarted: row.uniqueLearnersStarted,
          uniqueLearnersCompleted: row.uniqueLearnersCompleted,
          completionRate: toPct(row.completionRate),
        })),
        ['class', 'uniqueLearnersStarted', 'uniqueLearnersCompleted', 'completionRate'],
      ),
      '',
      'Chapter Completion',
      reportRowsToCsv(
        report.chapterCompletion.map((row) => ({
          chapter: row.title,
          uniqueLearnersStarted: row.uniqueLearnersStarted,
          uniqueLearnersCompleted: row.uniqueLearnersCompleted,
          completionRate: toPct(row.completionRate),
        })),
        ['chapter', 'uniqueLearnersStarted', 'uniqueLearnersCompleted', 'completionRate'],
      ),
      '',
      'Quiz Performance',
      reportRowsToCsv(
        report.quizPerformance.map((row) => ({
          quiz: row.title,
          attempts: row.attempts,
          uniqueLearnersAttempted: row.uniqueLearnersAttempted,
          uniqueLearnersMastered: row.uniqueLearnersMastered,
          masteryRate: toPct(row.masteryRate),
        })),
        [
          'quiz',
          'attempts',
          'uniqueLearnersAttempted',
          'uniqueLearnersMastered',
          'masteryRate',
        ],
      ),
    ]

    return new Response(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="analytics-summary-${mode}-${period ? periodToken(period) : 'all-time'}.csv"`,
      },
    })
  } catch {
    return Response.json(
      {
        error: 'Unable to generate reporting summary.',
      },
      { status: 500 },
    )
  }
}
