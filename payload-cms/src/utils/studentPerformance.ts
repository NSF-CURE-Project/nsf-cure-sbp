import type { Payload, PayloadRequest } from 'payload'
import { findAllDocs } from '../reporting/data'

type StaffUser = PayloadRequest['user']

export type StudentPerformanceStudent = {
  accountId: string
  name: string
  email: string | null
  participantType: string | null
  classroomTitles: string[]
  classroomCount: number
  lessonsCompleted: number
  lessonCompletionRate: number
  quizAttempts: number
  quizAverage: number | null
  quizStdDev: number | null
  overallAverage: number | null
  overallStdDev: number | null
  currentStreak: number
  longestStreak: number
  lastActivityAt: string | null
}

export type StudentPerformanceSummary = {
  studentCount: number
  activeStudents30d: number
  averageScore: number | null
  medianScore: number | null
  scoreStdDev: number | null
  averageQuizScore: number | null
  averageLessonCompletionRate: number | null
  averageAttemptsPerStudent: number
  publishedLessonCount: number
}

export type StudentPerformanceTrendBucket = {
  bucketStart: string
  label: string
  activeStudents: number
  averageQuizScore: number | null
}

export type StudentPerformanceRange = '7d' | '30d' | 'semester' | 'all'

export type StudentPerformanceClassroomOption = {
  id: string
  title: string
}

export type StudentPerformanceDeltas = {
  activeStudentsChange: number | null
  averageScoreChange: number | null
  completionRateChange: number | null
}

export type StudentPerformancePayload = {
  summary: StudentPerformanceSummary
  students: StudentPerformanceStudent[]
  trend: StudentPerformanceTrendBucket[]
  deltas: StudentPerformanceDeltas
  classrooms: StudentPerformanceClassroomOption[]
  range: StudentPerformanceRange
  generatedAt: string
}

export type GetStudentPerformanceOptions = {
  range?: StudentPerformanceRange
  classroomId?: string | null
}

const isStaffUser = (user?: StaffUser | null) =>
  user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(user.role ?? '')

const getId = (value: unknown): string | null => {
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

const normalizeScorePercent = (attempt: { score?: unknown; maxScore?: unknown }): number | null => {
  const score = toNumber(attempt.score)
  if (score == null) return null
  const maxScore = toNumber(attempt.maxScore)
  if (maxScore != null && maxScore > 0) {
    return Math.max(0, Math.min(100, (score / maxScore) * 100))
  }
  if (score <= 1) return Math.max(0, Math.min(100, score * 100))
  return Math.max(0, Math.min(100, score))
}

const average = (values: number[]): number | null => {
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const median = (values: number[]): number | null => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

const standardDeviation = (values: number[]): number | null => {
  if (!values.length) return null
  const mean = average(values)
  if (mean == null) return null
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

const maxIsoDate = (current: string | null, candidate: unknown): string | null => {
  if (typeof candidate !== 'string' || !candidate) return current
  if (!current) return candidate
  return new Date(candidate).getTime() > new Date(current).getTime() ? candidate : current
}

const getWeekStart = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const day = date.getUTCDay()
  const offset = (day + 6) % 7
  date.setUTCDate(date.getUTCDate() - offset)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

const getDayStart = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

const RANGE_CONFIG: Record<
  StudentPerformanceRange,
  { granularity: 'day' | 'week'; buckets: number | null; activityWindowDays: number | null }
> = {
  '7d': { granularity: 'day', buckets: 7, activityWindowDays: 7 },
  '30d': { granularity: 'week', buckets: 5, activityWindowDays: 30 },
  semester: { granularity: 'week', buckets: 18, activityWindowDays: 120 },
  all: { granularity: 'week', buckets: null, activityWindowDays: null },
}

const bucketLabelFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

const formatBucketLabel = (iso: string) => {
  const parsed = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return iso.slice(5)
  return bucketLabelFormatter.format(parsed)
}

const roundMetric = (value: number | null): number | null =>
  value == null ? null : Math.round(value * 10) / 10

const buildEmptyPayload = (
  range: StudentPerformanceRange,
  classrooms: StudentPerformanceClassroomOption[] = [],
): StudentPerformancePayload => ({
  summary: {
    studentCount: 0,
    activeStudents30d: 0,
    averageScore: null,
    medianScore: null,
    scoreStdDev: null,
    averageQuizScore: null,
    averageLessonCompletionRate: null,
    averageAttemptsPerStudent: 0,
    publishedLessonCount: 0,
  },
  students: [],
  trend: [],
  deltas: {
    activeStudentsChange: null,
    averageScoreChange: null,
    completionRateChange: null,
  },
  classrooms,
  range,
  generatedAt: new Date().toISOString(),
})

export const getStudentPerformancePayload = async (
  payload: Payload,
  user?: StaffUser | null,
  options: GetStudentPerformanceOptions = {},
): Promise<StudentPerformancePayload> => {
  if (!isStaffUser(user)) {
    throw new Error('Unauthorized')
  }

  const range: StudentPerformanceRange = options.range ?? '30d'
  const rangeConfig = RANGE_CONFIG[range]
  const classroomFilterId = options.classroomId?.trim() || null

  let scopedClassroomIds: string[] | null = null

  if (user?.role === 'professor') {
    const professorClassrooms = await findAllDocs(payload, 'classrooms', {
      where: {
        professor: {
          equals: user.id,
        },
      },
    })
    scopedClassroomIds = professorClassrooms
      .map((doc) => getId(doc.id))
      .filter((id): id is string => Boolean(id))
    if (!scopedClassroomIds.length) return buildEmptyPayload(range)
  }

  const classroomDocs = await findAllDocs(payload, 'classrooms', {
    where: scopedClassroomIds ? { id: { in: scopedClassroomIds } } : undefined,
  })
  const classroomOptions: StudentPerformanceClassroomOption[] = classroomDocs
    .map((doc) => {
      const id = getId(doc.id)
      const rawTitle = (doc as { title?: unknown }).title
      const title = typeof rawTitle === 'string' ? rawTitle.trim() : ''
      if (!id) return null
      return { id, title: title || 'Untitled classroom' }
    })
    .filter((option): option is StudentPerformanceClassroomOption => Boolean(option))
    .sort((a, b) => a.title.localeCompare(b.title))

  let scopedStudentIds: Set<string> | null = null
  const effectiveClassroomIds = (() => {
    if (classroomFilterId) {
      if (scopedClassroomIds && !scopedClassroomIds.includes(classroomFilterId)) return []
      return [classroomFilterId]
    }
    return scopedClassroomIds
  })()

  if (effectiveClassroomIds) {
    if (!effectiveClassroomIds.length) return buildEmptyPayload(range, classroomOptions)

    const scopedMemberships = await findAllDocs(payload, 'classroom-memberships', {
      where: {
        classroom: {
          in: effectiveClassroomIds,
        },
      },
      depth: 2,
    })
    scopedStudentIds = new Set(
      scopedMemberships
        .map((doc) => getId((doc as { student?: unknown }).student))
        .filter((id): id is string => Boolean(id)),
    )

    if (!scopedStudentIds.size) return buildEmptyPayload(range, classroomOptions)
  }

  const [accounts, lessons, lessonProgress, quizAttempts, memberships] = await Promise.all([
    findAllDocs(payload, 'accounts'),
    findAllDocs(payload, 'lessons', {
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
    findAllDocs(payload, 'lesson-progress'),
    findAllDocs(payload, 'quiz-attempts'),
    findAllDocs(payload, 'classroom-memberships', { depth: 2 }),
  ])

  const publishedLessonCount = lessons.length
  const studentIds = scopedStudentIds
  const isRelevantStudent = (accountId: string) => (studentIds ? studentIds.has(accountId) : true)

  const classroomTitlesByStudent = new Map<string, Set<string>>()
  const completionRatesByStudent = new Map<string, number[]>()
  const lastActivityByStudent = new Map<string, string | null>()

  memberships.forEach((membership) => {
    const studentId = getId((membership as { student?: unknown }).student)
    if (!studentId || !isRelevantStudent(studentId)) return

    const classroomValue = (membership as { classroom?: unknown }).classroom
    const classroomTitle =
      typeof classroomValue === 'object' && classroomValue !== null
        ? (((classroomValue as { title?: unknown }).title as string | undefined) ?? 'Classroom')
        : 'Classroom'

    const classroomTitles = classroomTitlesByStudent.get(studentId) ?? new Set<string>()
    if (classroomTitle.trim()) classroomTitles.add(classroomTitle)
    classroomTitlesByStudent.set(studentId, classroomTitles)

    const completionRate = toNumber((membership as { completionRate?: unknown }).completionRate)
    if (completionRate != null) {
      const rates = completionRatesByStudent.get(studentId) ?? []
      rates.push(completionRate * 100)
      completionRatesByStudent.set(studentId, rates)
    }

    const membershipLastActivity = (membership as { lastActivityAt?: unknown }).lastActivityAt
    lastActivityByStudent.set(
      studentId,
      maxIsoDate(lastActivityByStudent.get(studentId) ?? null, membershipLastActivity),
    )
  })

  const completedLessonsByStudent = new Map<string, Set<string>>()
  lessonProgress.forEach((entry) => {
    const studentId = getId((entry as { user?: unknown }).user)
    if (!studentId || !isRelevantStudent(studentId)) return

    lastActivityByStudent.set(
      studentId,
      maxIsoDate(
        lastActivityByStudent.get(studentId) ?? null,
        (entry as { completedAt?: unknown; updatedAt?: unknown }).completedAt ??
          (entry as { updatedAt?: unknown }).updatedAt,
      ),
    )

    if (!(entry as { completed?: boolean }).completed) return
    const lessonId = getId((entry as { lesson?: unknown }).lesson)
    if (!lessonId) return
    const lessonsForStudent = completedLessonsByStudent.get(studentId) ?? new Set<string>()
    lessonsForStudent.add(lessonId)
    completedLessonsByStudent.set(studentId, lessonsForStudent)
  })

  const quizScoresByStudent = new Map<string, number[]>()
  const weeklyTrendMap = new Map<
    string,
    {
      activeStudents: Set<string>
      quizScores: number[]
    }
  >()
  const dailyTrendMap = new Map<
    string,
    {
      activeStudents: Set<string>
      quizScores: number[]
    }
  >()

  const recordTrend = (studentId: string, dateValue: unknown, score: number | null) => {
    const weekStart = getWeekStart(dateValue)
    if (weekStart) {
      const current = weeklyTrendMap.get(weekStart) ?? {
        activeStudents: new Set<string>(),
        quizScores: [],
      }
      current.activeStudents.add(studentId)
      if (score != null) current.quizScores.push(score)
      weeklyTrendMap.set(weekStart, current)
    }

    const dayStart = getDayStart(dateValue)
    if (dayStart) {
      const current = dailyTrendMap.get(dayStart) ?? {
        activeStudents: new Set<string>(),
        quizScores: [],
      }
      current.activeStudents.add(studentId)
      if (score != null) current.quizScores.push(score)
      dailyTrendMap.set(dayStart, current)
    }
  }

  quizAttempts.forEach((attempt) => {
    const studentId = getId((attempt as { user?: unknown }).user)
    if (!studentId || !isRelevantStudent(studentId)) return

    const score = normalizeScorePercent(attempt as { score?: unknown; maxScore?: unknown })
    if (score != null) {
      const current = quizScoresByStudent.get(studentId) ?? []
      current.push(score)
      quizScoresByStudent.set(studentId, current)
    }

    const activityDate =
      (attempt as { completedAt?: unknown; createdAt?: unknown }).completedAt ??
      (attempt as { createdAt?: unknown }).createdAt
    lastActivityByStudent.set(
      studentId,
      maxIsoDate(lastActivityByStudent.get(studentId) ?? null, activityDate),
    )
    recordTrend(studentId, activityDate, score)
  })

  const students: StudentPerformanceStudent[] = accounts
    .map((account) => {
      const accountId = getId(account.id)
      if (!accountId || !isRelevantStudent(accountId)) return null

      const quizScores = quizScoresByStudent.get(accountId) ?? []
      const overallScores = quizScores
      const membershipCompletionRates = completionRatesByStudent.get(accountId) ?? []
      const completedLessons = completedLessonsByStudent.get(accountId)?.size ?? 0
      const completionRate =
        membershipCompletionRates.length > 0
          ? average(membershipCompletionRates)
          : publishedLessonCount > 0
            ? (completedLessons / publishedLessonCount) * 100
            : 0

      return {
        accountId,
        name:
          typeof (account as { fullName?: unknown }).fullName === 'string' &&
          (account as { fullName?: string }).fullName?.trim()
            ? ((account as { fullName?: string }).fullName ?? '').trim()
            : typeof (account as { email?: unknown }).email === 'string'
              ? ((account as { email?: string }).email ?? 'Student').trim()
              : 'Student',
        email:
          typeof (account as { email?: unknown }).email === 'string'
            ? ((account as { email?: string }).email ?? null)
            : null,
        participantType:
          typeof (account as { participantType?: unknown }).participantType === 'string'
            ? ((account as { participantType?: string }).participantType ?? null)
            : null,
        classroomTitles: [
          ...(classroomTitlesByStudent.get(accountId) ?? new Set<string>()),
        ].sort((a, b) => a.localeCompare(b)),
        classroomCount: classroomTitlesByStudent.get(accountId)?.size ?? 0,
        lessonsCompleted: completedLessons,
        lessonCompletionRate: roundMetric(completionRate) ?? 0,
        quizAttempts: quizScores.length,
        quizAverage: roundMetric(average(quizScores)),
        quizStdDev: roundMetric(standardDeviation(quizScores)),
        overallAverage: roundMetric(average(overallScores)),
        overallStdDev: roundMetric(standardDeviation(overallScores)),
        currentStreak: toNumber((account as { currentStreak?: unknown }).currentStreak) ?? 0,
        longestStreak: toNumber((account as { longestStreak?: unknown }).longestStreak) ?? 0,
        lastActivityAt: lastActivityByStudent.get(accountId) ?? null,
      }
    })
    .filter((student): student is StudentPerformanceStudent => Boolean(student))
    .sort((a, b) => {
      const aScore = a.overallAverage ?? -1
      const bScore = b.overallAverage ?? -1
      if (aScore !== bScore) return bScore - aScore
      return a.name.localeCompare(b.name)
    })

  const now = Date.now()
  const activeThreshold = now - 30 * 24 * 60 * 60 * 1000
  const overallScores = students
    .map((student) => student.overallAverage)
    .filter((value): value is number => value != null)
  const quizAverages = students
    .map((student) => student.quizAverage)
    .filter((value): value is number => value != null)
  const completionRates = students.map((student) => student.lessonCompletionRate)
  const totalAttempts = students.reduce((sum, student) => sum + student.quizAttempts, 0)

  const sourceMap = rangeConfig.granularity === 'day' ? dailyTrendMap : weeklyTrendMap
  const allBuckets = [...sourceMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucketStart, entry]) => ({
      bucketStart,
      label: formatBucketLabel(bucketStart),
      activeStudents: entry.activeStudents.size,
      averageQuizScore: roundMetric(average(entry.quizScores)),
    }))
  const trend: StudentPerformanceTrendBucket[] =
    rangeConfig.buckets == null ? allBuckets : allBuckets.slice(-rangeConfig.buckets)

  const computeDelta = (values: (number | null)[]): number | null => {
    const numeric = values.filter((v): v is number => v != null)
    if (numeric.length < 2) return null
    const recentSlice = Math.min(2, Math.max(1, Math.floor(numeric.length / 2)))
    const recent = numeric.slice(-recentSlice)
    const prior = numeric.slice(-recentSlice * 2, -recentSlice)
    if (!recent.length || !prior.length) return null
    const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length
    const priorAvg = prior.reduce((s, v) => s + v, 0) / prior.length
    return roundMetric(recentAvg - priorAvg)
  }

  const computeActiveDelta = (buckets: StudentPerformanceTrendBucket[]): number | null => {
    if (buckets.length < 2) return null
    const last = buckets[buckets.length - 1]?.activeStudents ?? null
    const prev = buckets[buckets.length - 2]?.activeStudents ?? null
    if (last == null || prev == null) return null
    return last - prev
  }

  const deltas: StudentPerformanceDeltas = {
    activeStudentsChange: computeActiveDelta(trend),
    averageScoreChange: computeDelta(trend.map((b) => b.averageQuizScore)),
    completionRateChange: null,
  }

  const activityWindowDays = rangeConfig.activityWindowDays
  const activeStudentsRange = activityWindowDays
    ? students.filter((student) => {
        if (!student.lastActivityAt) return false
        const threshold = now - activityWindowDays * 24 * 60 * 60 * 1000
        return new Date(student.lastActivityAt).getTime() >= threshold
      }).length
    : students.filter((student) => Boolean(student.lastActivityAt)).length

  return {
    summary: {
      studentCount: students.length,
      activeStudents30d: activityWindowDays
        ? activeStudentsRange
        : students.filter((student) => {
            if (!student.lastActivityAt) return false
            return new Date(student.lastActivityAt).getTime() >= activeThreshold
          }).length,
      averageScore: roundMetric(average(overallScores)),
      medianScore: roundMetric(median(overallScores)),
      scoreStdDev: roundMetric(standardDeviation(overallScores)),
      averageQuizScore: roundMetric(average(quizAverages)),
      averageLessonCompletionRate: roundMetric(average(completionRates)),
      averageAttemptsPerStudent: students.length
        ? Math.round((totalAttempts / students.length) * 10) / 10
        : 0,
      publishedLessonCount,
    },
    students,
    trend,
    deltas,
    classrooms: classroomOptions,
    range,
    generatedAt: new Date().toISOString(),
  }
}
