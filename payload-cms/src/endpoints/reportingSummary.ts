import type { PayloadHandler } from 'payload'
import { getReportingSummary, reportRowsToCsv } from '../utils/analyticsSummary'

const toPct = (value: number) => `${Math.round(value * 1000) / 10}%`

export const reportingSummaryHandler: PayloadHandler = async (req) => {
  const isStaffUser =
    req.user?.collection === 'users' &&
    ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')
  if (!isStaffUser) {
    return Response.json(
      {
        error: 'Not authorized.',
      },
      { status: 403 },
    )
  }

  try {
    const format = req.query?.format === 'csv' ? 'csv' : 'json'
    const report = await getReportingSummary(req.payload)

    if (format === 'json') {
      return Response.json(report)
    }

    const type = typeof req.query?.type === 'string' ? req.query.type : 'all'

    if (type === 'class-completion') {
      const csv = reportRowsToCsv(
        report.classCompletion.map((row) => ({
          class: row.title,
          attempts: row.total,
          completed: row.completed,
          completionRate: toPct(row.completionRate),
        })),
        ['class', 'attempts', 'completed', 'completionRate'],
      )
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="nsf-class-completion.csv"',
        },
      })
    }

    if (type === 'chapter-completion') {
      const csv = reportRowsToCsv(
        report.chapterCompletion.map((row) => ({
          chapter: row.title,
          attempts: row.total,
          completed: row.completed,
          completionRate: toPct(row.completionRate),
        })),
        ['chapter', 'attempts', 'completed', 'completionRate'],
      )
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="nsf-chapter-completion.csv"',
        },
      })
    }

    if (type === 'quiz-mastery') {
      const csv = reportRowsToCsv(
        report.quizMasteryDistribution.map((row) => ({
          scoreBand: row.label,
          attempts: row.count,
          percentage: toPct(row.percentage),
        })),
        ['scoreBand', 'attempts', 'percentage'],
      )
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="nsf-quiz-mastery.csv"',
        },
      })
    }

    if (type === 'engagement-wow') {
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
          'Content-Disposition': 'attachment; filename="nsf-weekly-engagement.csv"',
        },
      })
    }

    const lines = [
      'NSF CURE SBP Analytics Summary',
      `Generated At,${report.generatedAt}`,
      '',
      'Class Completion',
      reportRowsToCsv(
        report.classCompletion.map((row) => ({
          class: row.title,
          attempts: row.total,
          completed: row.completed,
          completionRate: toPct(row.completionRate),
        })),
        ['class', 'attempts', 'completed', 'completionRate'],
      ),
      '',
      'Chapter Completion',
      reportRowsToCsv(
        report.chapterCompletion.map((row) => ({
          chapter: row.title,
          attempts: row.total,
          completed: row.completed,
          completionRate: toPct(row.completionRate),
        })),
        ['chapter', 'attempts', 'completed', 'completionRate'],
      ),
      '',
      'Quiz Mastery Distribution',
      reportRowsToCsv(
        report.quizMasteryDistribution.map((row) => ({
          scoreBand: row.label,
          attempts: row.count,
          percentage: toPct(row.percentage),
        })),
        ['scoreBand', 'attempts', 'percentage'],
      ),
      '',
      'Weekly Engagement',
      reportRowsToCsv(
        report.weeklyEngagement.map((row) => ({
          weekStart: row.weekStart,
          activeStudents: row.activeStudents,
          weekOverWeekChange: row.weekOverWeekChange == null ? 'N/A' : toPct(row.weekOverWeekChange),
        })),
        ['weekStart', 'activeStudents', 'weekOverWeekChange'],
      ),
    ]

    return new Response(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="nsf-reporting-summary.csv"',
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
