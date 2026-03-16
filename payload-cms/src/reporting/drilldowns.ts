import type { Payload, PayloadRequest } from 'payload'
import { getReportingSummary } from '../utils/analyticsSummary'
import type { ReportingCohortFilters, ReportingSummary } from './types'
import type { ReportingPeriodInput } from './period'
import { metricDefinitionByKey } from './metricDefinitions'
import { canAccessLearnerLevelReporting } from './permissions'
import { findAllDocs } from './data'
import { resolveReportingScope } from './cohorts'

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

export type DrilldownResponse = {
  metricKey: string
  metricDefinition: ReturnType<typeof metricDefinitionByKey>
  rows: Array<Record<string, string | number | boolean | null>>
  note: string
  trend: ReportingSummary['weeklyEngagement']
}

export const getMetricDrilldown = async (
  payload: Payload,
  req: PayloadRequest,
  input: {
    metricKey: string
    period: ReportingPeriodInput
    filters?: Partial<ReportingCohortFilters> | null
  },
): Promise<DrilldownResponse> => {
  if (!canAccessLearnerLevelReporting(req)) {
    throw new Error('Not authorized for learner-level reporting drilldowns.')
  }

  const summary = await getReportingSummary(payload, {
    mode: 'rppr',
    period: input.period,
    filters: input.filters,
  })
  const scope = await resolveReportingScope(payload, input.filters)

  const metricDefinition = metricDefinitionByKey(input.metricKey)
  const rows: Array<Record<string, string | number | boolean | null>> = []

  if (input.metricKey === 'class_completion_rate') {
    const progress = await findAllDocs(payload, 'lesson-progress', {
      where: {
        updatedAt: {
          greater_than_equal: summary.reportMeta.period?.startDate,
          less_than_equal: summary.reportMeta.period?.endDate,
        },
      },
    })

    const byClassAndUser = new Map<string, { classId: string; userId: string; completed: boolean; activityCount: number }>()
    progress.forEach((entry) => {
      const classId = toId(entry.class)
      const userId = toId(entry.user)
      if (!classId || !userId) return
      if (scope.userIds && !scope.userIds.has(userId)) return
      if (scope.classIds && !scope.classIds.has(classId)) return
      const key = `${classId}::${userId}`
      const current = byClassAndUser.get(key) ?? { classId, userId, completed: false, activityCount: 0 }
      current.completed = current.completed || Boolean(entry.completed)
      current.activityCount += 1
      byClassAndUser.set(key, current)
    })

    byClassAndUser.forEach((item) => {
      rows.push({
        classId: item.classId,
        learnerId: item.userId,
        started: true,
        completed: item.completed,
        activityCount: item.activityCount,
      })
    })
  } else if (input.metricKey === 'quiz_mastery_rate') {
    const attempts = await findAllDocs(payload, 'quiz-attempts', {
      where: {
        createdAt: {
          greater_than_equal: summary.reportMeta.period?.startDate,
          less_than_equal: summary.reportMeta.period?.endDate,
        },
      },
    })

    attempts.forEach((entry) => {
      const userId = toId(entry.user)
      const quizId = toId(entry.quiz)
      if (!userId || !quizId) return
      if (scope.userIds && !scope.userIds.has(userId)) return
      const score = typeof entry.score === 'number' ? entry.score : Number(entry.score)
      const maxScore = typeof entry.maxScore === 'number' ? entry.maxScore : Number(entry.maxScore)
      const pct = Number.isFinite(score) && Number.isFinite(maxScore) && maxScore > 0 ? score / maxScore : null
      rows.push({
        quizId,
        learnerId: userId,
        score: Number.isFinite(score) ? score : null,
        maxScore: Number.isFinite(maxScore) ? maxScore : null,
        scorePct: pct,
        mastered: pct != null ? pct >= 0.8 : null,
      })
    })
  } else if (input.metricKey === 'weekly_active_learners') {
    summary.weeklyEngagement.forEach((item) => {
      rows.push({
        weekStart: item.weekStart,
        activeStudents: item.activeStudents,
        weekOverWeekChange: item.weekOverWeekChange,
      })
    })
  }

  return {
    metricKey: input.metricKey,
    metricDefinition,
    rows,
    note:
      rows.length > 0
        ? 'Learner-level rows shown for authorized staff only.'
        : 'No drilldown rows available for selected metric/filter scope.',
    trend: summary.weeklyEngagement,
  }
}
