import type { Payload } from 'payload'

type CompletionSummary = {
  id: string
  title: string
  total: number
  completed: number
  completionRate: number
}

type MasteryBand = {
  label: string
  min: number
  max: number
  count: number
  percentage: number
}

type WeeklyEngagement = {
  weekStart: string
  activeStudents: number
  weekOverWeekChange: number | null
}

type ReportingSummary = {
  classCompletion: CompletionSummary[]
  chapterCompletion: CompletionSummary[]
  quizMasteryDistribution: MasteryBand[]
  weeklyEngagement: WeeklyEngagement[]
  generatedAt: string
}

const MASTERY_BANDS = [
  { label: '0-59%', min: 0, max: 0.6 },
  { label: '60-69%', min: 0.6, max: 0.7 },
  { label: '70-79%', min: 0.7, max: 0.8 },
  { label: '80-89%', min: 0.8, max: 0.9 },
  { label: '90-100%', min: 0.9, max: 1.000_001 },
]

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

const findAllDocs = async (
  payload: Payload,
  collection: 'classes' | 'chapters' | 'lesson-progress' | 'quiz-attempts',
) => {
  const docs: Record<string, unknown>[] = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 500,
      page,
      sort: 'id',
    })

    docs.push(...(result.docs as Record<string, unknown>[]))
    hasNextPage = Boolean(result.hasNextPage)
    page += 1
  }

  return docs
}

export const getReportingSummary = async (payload: Payload): Promise<ReportingSummary> => {
  const [classes, chapters, lessonProgress, quizAttempts] = await Promise.all([
    findAllDocs(payload, 'classes'),
    findAllDocs(payload, 'chapters'),
    findAllDocs(payload, 'lesson-progress'),
    findAllDocs(payload, 'quiz-attempts'),
  ])

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

  const classTotals = new Map<string, { total: number; completed: number }>()
  const chapterTotals = new Map<string, { total: number; completed: number }>()
  const weeklyUsers = new Map<string, Set<string>>()

  lessonProgress.forEach((item) => {
    const classId = toId(item.class)
    const chapterId = toId(item.chapter)
    const userId = toId(item.user)
    const isCompleted = Boolean(item.completed)

    if (classId) {
      const current = classTotals.get(classId) ?? { total: 0, completed: 0 }
      current.total += 1
      if (isCompleted) current.completed += 1
      classTotals.set(classId, current)
    }

    if (chapterId) {
      const current = chapterTotals.get(chapterId) ?? { total: 0, completed: 0 }
      current.total += 1
      if (isCompleted) current.completed += 1
      chapterTotals.set(chapterId, current)
    }

    const weekStart = getUtcWeekStart(item.updatedAt)
    if (weekStart && userId) {
      const set = weeklyUsers.get(weekStart) ?? new Set<string>()
      set.add(userId)
      weeklyUsers.set(weekStart, set)
    }
  })

  const classCompletion = Array.from(classTotals.entries())
    .map(([id, totals]) => ({
      id,
      title: classTitleById.get(id) ?? `Class ${id}`,
      total: totals.total,
      completed: totals.completed,
      completionRate: totals.total ? totals.completed / totals.total : 0,
    }))
    .sort((a, b) => b.completionRate - a.completionRate)

  const chapterCompletion = Array.from(chapterTotals.entries())
    .map(([id, totals]) => ({
      id,
      title: chapterTitleById.get(id) ?? `Chapter ${id}`,
      total: totals.total,
      completed: totals.completed,
      completionRate: totals.total ? totals.completed / totals.total : 0,
    }))
    .sort((a, b) => b.completionRate - a.completionRate)

  const scoredAttempts = quizAttempts
    .map((item) => normalizeScore(item as { score?: unknown; maxScore?: unknown }))
    .filter((value): value is number => value != null)

  const quizMasteryDistribution: MasteryBand[] = MASTERY_BANDS.map((band) => {
    const count = scoredAttempts.filter((score) => score >= band.min && score < band.max).length
    const percentage = scoredAttempts.length ? count / scoredAttempts.length : 0
    return { ...band, count, percentage }
  })

  const orderedWeeks = Array.from(weeklyUsers.keys()).sort()
  const last8Weeks = orderedWeeks.slice(-8)
  const weeklyEngagement: WeeklyEngagement[] = []
  let previousCount: number | null = null

  last8Weeks.forEach((weekStart) => {
    const activeStudents = weeklyUsers.get(weekStart)?.size ?? 0
    let weekOverWeekChange: number | null = null
    if (previousCount != null && previousCount > 0) {
      weekOverWeekChange = (activeStudents - previousCount) / previousCount
    }
    weeklyEngagement.push({ weekStart, activeStudents, weekOverWeekChange })
    previousCount = activeStudents
  })

  return {
    classCompletion,
    chapterCompletion,
    quizMasteryDistribution,
    weeklyEngagement,
    generatedAt: new Date().toISOString(),
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
