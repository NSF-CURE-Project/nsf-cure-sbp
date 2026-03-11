import type { Payload } from 'payload'
import { findAllDocs, findAllDocsInPeriod } from '../reporting/data'
import { resolveReportingPeriod, type ReportingPeriodInput } from '../reporting/period'
import { resolveReportingScope } from '../reporting/cohorts'
import type { ReportingSummary, ReportMode, ReportingCohortFilters } from '../reporting/types'

const MASTERY_BANDS = [
  { label: '0-59%', min: 0, max: 0.6 },
  { label: '60-69%', min: 0.6, max: 0.7 },
  { label: '70-79%', min: 0.7, max: 0.8 },
  { label: '80-89%', min: 0.8, max: 0.9 },
  { label: '90-100%', min: 0.9, max: 1.000_001 },
]

const MASTERY_THRESHOLD = 0.8

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const normalizeScore = (attempt: { score?: unknown; maxScore?: unknown }) => {
  const score = toNumber(attempt.score)
  if (score == null) return null
  const maxScore = toNumber(attempt.maxScore)
  if (maxScore != null && maxScore > 0) {
    return Math.max(0, Math.min(1, score / maxScore))
  }
  if (score <= 1) return Math.max(0, Math.min(1, score))
  return Math.max(0, Math.min(1, score / 100))
}

const getUtcWeekStart = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  const day = parsed.getUTCDay()
  const offset = (day + 6) % 7
  parsed.setUTCDate(parsed.getUTCDate() - offset)
  parsed.setUTCHours(0, 0, 0, 0)
  return parsed.toISOString().slice(0, 10)
}

const isDateInPeriod = (value: unknown, startIso: string, endIso: string): boolean => {
  if (typeof value !== 'string') return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  const ts = parsed.getTime()
  return ts >= new Date(startIso).getTime() && ts <= new Date(endIso).getTime()
}

export const getReportingSummary = async (
  payload: Payload,
  options?: {
    mode?: ReportMode
    period?: ReportingPeriodInput | null
    filters?: Partial<ReportingCohortFilters> | null
  },
): Promise<ReportingSummary> => {
  const mode = options?.mode ?? 'internal'
  const period = options?.period ? resolveReportingPeriod(options.period) : null
  const scope = await resolveReportingScope(payload, options?.filters)

  if (mode === 'rppr' && !period) {
    throw new Error('RPPR reporting requires a reporting period.')
  }

  const [classes, chapters, quizzes] = await Promise.all([
    findAllDocs(payload, 'classes'),
    findAllDocs(payload, 'chapters'),
    findAllDocs(payload, 'quizzes'),
  ])

  const [lessonProgress, quizAttempts, lessonsInPeriod, quizzesInPeriod, pagesInPeriod, questionBankInPeriod] =
    await Promise.all([
      period
        ? findAllDocsInPeriod(payload, 'lesson-progress', 'updatedAt', period)
        : findAllDocs(payload, 'lesson-progress'),
      // Pulling by createdAt avoids hidden omissions from records missing completedAt.
      findAllDocs(payload, 'quiz-attempts'),
      period
        ? findAllDocsInPeriod(payload, 'lessons', 'createdAt', period)
        : Promise.resolve([] as Record<string, unknown>[]),
      period
        ? findAllDocsInPeriod(payload, 'quizzes', 'createdAt', period)
        : Promise.resolve([] as Record<string, unknown>[]),
      period
        ? findAllDocsInPeriod(payload, 'pages', 'createdAt', period)
        : Promise.resolve([] as Record<string, unknown>[]),
      period
        ? findAllDocsInPeriod(payload, 'quiz-questions', 'createdAt', period)
        : Promise.resolve([] as Record<string, unknown>[]),
    ])

  const filteredQuizAttempts = period
    ? quizAttempts.filter((attempt) => {
        const completedAt = (attempt as { completedAt?: unknown }).completedAt
        const createdAt = (attempt as { createdAt?: unknown }).createdAt
        return (
          isDateInPeriod(completedAt, period.startDate, period.endDate) ||
          isDateInPeriod(createdAt, period.startDate, period.endDate)
        )
      })
    : quizAttempts

  const scopedLessonProgress = lessonProgress.filter((item) => {
    const userId = toId(item.user)
    const classId = toId(item.class)
    if (scope.userIds && (!userId || !scope.userIds.has(userId))) return false
    if (scope.classIds && (!classId || !scope.classIds.has(classId))) return false
    return true
  })

  const scopedQuizAttempts = filteredQuizAttempts.filter((item) => {
    const userId = toId(item.user)
    if (scope.userIds && (!userId || !scope.userIds.has(userId))) return false
    return true
  })

  const classTitleById = new Map<string, string>()
  classes.forEach((item) => {
    const id = toId(item.id)
    if (!id) return
    const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Class ${id}`
    classTitleById.set(id, title)
  })

  const chapterTitleById = new Map<string, string>()
  chapters.forEach((item) => {
    const id = toId(item.id)
    if (!id) return
    const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Chapter ${id}`
    chapterTitleById.set(id, title)
  })

  const quizTitleById = new Map<string, string>()
  quizzes.forEach((item) => {
    const id = toId(item.id)
    if (!id) return
    const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Quiz ${id}`
    quizTitleById.set(id, title)
  })

  const classProgress = new Map<string, { started: Set<string>; completed: Set<string> }>()
  const chapterProgress = new Map<string, { started: Set<string>; completed: Set<string> }>()
  const weeklyUsers = new Map<string, Set<string>>()
  const learnersWithProgress = new Set<string>()

  scopedLessonProgress.forEach((item) => {
    const classId = toId(item.class)
    const chapterId = toId(item.chapter)
    const userId = toId(item.user)
    if (!userId) return

    learnersWithProgress.add(userId)
    const isCompleted = Boolean(item.completed)

    if (classId) {
      const current = classProgress.get(classId) ?? { started: new Set<string>(), completed: new Set<string>() }
      current.started.add(userId)
      if (isCompleted) current.completed.add(userId)
      classProgress.set(classId, current)
    }

    if (chapterId) {
      const current = chapterProgress.get(chapterId) ?? {
        started: new Set<string>(),
        completed: new Set<string>(),
      }
      current.started.add(userId)
      if (isCompleted) current.completed.add(userId)
      chapterProgress.set(chapterId, current)
    }

    const weekStart = getUtcWeekStart(item.updatedAt)
    if (weekStart) {
      const set = weeklyUsers.get(weekStart) ?? new Set<string>()
      set.add(userId)
      weeklyUsers.set(weekStart, set)
    }
  })

  // Reporting-grade completion is based on unique learner denominators, not row counts.
  const classCompletion = Array.from(classProgress.entries())
    .map(([id, totals]) => {
      const uniqueLearnersStarted = totals.started.size
      const uniqueLearnersCompleted = totals.completed.size
      return {
        id,
        title: classTitleById.get(id) ?? `Class ${id}`,
        uniqueLearnersStarted,
        uniqueLearnersCompleted,
        completionRate: uniqueLearnersStarted ? uniqueLearnersCompleted / uniqueLearnersStarted : 0,
      }
    })
    .sort((a, b) => b.completionRate - a.completionRate)

  const chapterCompletion = Array.from(chapterProgress.entries())
    .map(([id, totals]) => {
      const uniqueLearnersStarted = totals.started.size
      const uniqueLearnersCompleted = totals.completed.size
      return {
        id,
        title: chapterTitleById.get(id) ?? `Chapter ${id}`,
        uniqueLearnersStarted,
        uniqueLearnersCompleted,
        completionRate: uniqueLearnersStarted ? uniqueLearnersCompleted / uniqueLearnersStarted : 0,
      }
    })
    .sort((a, b) => b.completionRate - a.completionRate)

  const scoredAttempts = scopedQuizAttempts
    .map((item) => normalizeScore(item as { score?: unknown; maxScore?: unknown }))
    .filter((value): value is number => value != null)

  const quizMasteryDistribution = MASTERY_BANDS.map((band) => {
    const count = scoredAttempts.filter((score) => score >= band.min && score < band.max).length
    const percentage = scoredAttempts.length ? count / scoredAttempts.length : 0
    return { label: band.label, count, percentage }
  })

  const quizProgress = new Map<string, { attempted: Set<string>; mastered: Set<string>; attempts: number }>()
  const learnersWithQuizAttempts = new Set<string>()

  scopedQuizAttempts.forEach((attempt) => {
    const quizId = toId(attempt.quiz)
    const userId = toId(attempt.user)
    if (!quizId || !userId) return

    learnersWithQuizAttempts.add(userId)
    const normalizedScore = normalizeScore(attempt as { score?: unknown; maxScore?: unknown })

    const current = quizProgress.get(quizId) ?? {
      attempted: new Set<string>(),
      mastered: new Set<string>(),
      attempts: 0,
    }
    current.attempted.add(userId)
    current.attempts += 1
    if (normalizedScore != null && normalizedScore >= MASTERY_THRESHOLD) {
      current.mastered.add(userId)
    }
    quizProgress.set(quizId, current)
  })

  const quizPerformance = Array.from(quizProgress.entries())
    .map(([quizId, totals]) => {
      const uniqueLearnersAttempted = totals.attempted.size
      const uniqueLearnersMastered = totals.mastered.size
      return {
        quizId,
        title: quizTitleById.get(quizId) ?? `Quiz ${quizId}`,
        uniqueLearnersAttempted,
        uniqueLearnersMastered,
        masteryRate: uniqueLearnersAttempted
          ? uniqueLearnersMastered / uniqueLearnersAttempted
          : 0,
        attempts: totals.attempts,
      }
    })
    .sort((a, b) => b.masteryRate - a.masteryRate)

  const orderedWeeks = Array.from(weeklyUsers.keys()).sort()
  const weeklyWindow = period ? orderedWeeks : orderedWeeks.slice(-8)
  const weeklyEngagement: ReportingSummary['weeklyEngagement'] = []
  let previousCount: number | null = null

  weeklyWindow.forEach((weekStart) => {
    const activeStudents = weeklyUsers.get(weekStart)?.size ?? 0
    let weekOverWeekChange: number | null = null
    if (previousCount != null && previousCount > 0) {
      weekOverWeekChange = (activeStudents - previousCount) / previousCount
    }
    weeklyEngagement.push({ weekStart, activeStudents, weekOverWeekChange })
    previousCount = activeStudents
  })

  const artifacts = [
    ...lessonsInPeriod.map((doc) => ({
      collection: 'lessons' as const,
      id: toId(doc.id) ?? '',
      title:
        typeof doc.title === 'string' && doc.title.trim() ? doc.title.trim() : `Lesson ${toId(doc.id) ?? ''}`,
      createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : '',
    })),
    ...quizzesInPeriod.map((doc) => ({
      collection: 'quizzes' as const,
      id: toId(doc.id) ?? '',
      title:
        typeof doc.title === 'string' && doc.title.trim() ? doc.title.trim() : `Quiz ${toId(doc.id) ?? ''}`,
      createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : '',
    })),
    ...pagesInPeriod.map((doc) => ({
      collection: 'pages' as const,
      id: toId(doc.id) ?? '',
      title:
        typeof doc.title === 'string' && doc.title.trim() ? doc.title.trim() : `Page ${toId(doc.id) ?? ''}`,
      createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : '',
    })),
    ...questionBankInPeriod.map((doc) => ({
      collection: 'quiz-questions' as const,
      id: toId(doc.id) ?? '',
      title:
        typeof doc.title === 'string' && doc.title.trim()
          ? doc.title.trim()
          : `Question ${toId(doc.id) ?? ''}`,
      createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : '',
    })),
  ]
    .filter((item) => item.id && item.createdAt)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const byCollection = artifacts.reduce<Record<string, number>>((acc, item) => {
    acc[item.collection] = (acc[item.collection] ?? 0) + 1
    return acc
  }, {})

  const warnings: ReportingSummary['warnings'] = []
  if (mode === 'rppr' && period && artifacts.length === 0) {
    warnings.push({
      code: 'NO_PRODUCTS_IN_PERIOD',
      message: 'No content artifacts were created during the selected reporting period.',
    })
  }
  if (!scopedLessonProgress.length) {
    warnings.push({
      code: 'NO_PROGRESS_DATA',
      message: 'No lesson progress data matched the selected scope.',
    })
  }
  warnings.push(
    ...scope.warnings.map((message) => ({
      code: 'COHORT_SCOPE_WARNING',
      message,
    })),
  )

  return {
    reportMeta: {
      mode,
      reportType: period?.reportType ?? (mode === 'rppr' ? 'custom' : 'internal'),
      period,
      filters: scope.filters,
      generatedAt: new Date().toISOString(),
    },
    participation: {
      uniqueLearnersActive: new Set([...learnersWithProgress, ...learnersWithQuizAttempts]).size,
      uniqueLearnersWithProgress: learnersWithProgress.size,
      uniqueLearnersWithQuizAttempts: learnersWithQuizAttempts.size,
    },
    classCompletion,
    chapterCompletion,
    quizPerformance,
    quizMasteryDistribution,
    weeklyEngagement,
    productsInPeriod: {
      total: artifacts.length,
      byCollection,
      artifacts,
    },
    warnings,
  }
}

export const reportRowsToCsv = (
  rows: Array<Record<string, string | number>>,
  headers: string[],
): string => {
  const escape = (value: string | number) => {
    const stringValue = String(value)
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  const lines = [headers.join(',')]
  rows.forEach((row) => {
    lines.push(headers.map((header) => escape(row[header] ?? '')).join(','))
  })
  return lines.join('\n')
}
