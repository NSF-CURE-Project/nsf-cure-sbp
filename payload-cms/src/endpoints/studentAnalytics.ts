import type { PayloadHandler } from 'payload'

const jsonError = (error: string, status: number) =>
  Response.json(
    {
      error,
    },
    { status },
  )

const toDateKey = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

const daysAgo = (days: number) => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

export const studentAnalyticsHandler: PayloadHandler = async (req) => {
  if (req.user?.collection !== 'accounts') {
    return jsonError('Unauthorized', 401)
  }

  const userId = req.user.id

  const [lessonProgressRes, quizAttemptsRes, problemAttemptsRes, membershipsRes, account] =
    await Promise.all([
      req.payload.find({
        collection: 'lesson-progress',
        where: { user: { equals: userId } },
        depth: 0,
        limit: 2000,
        overrideAccess: true,
      }),
      req.payload.find({
        collection: 'quiz-attempts',
        where: { user: { equals: userId } },
        depth: 0,
        limit: 500,
        overrideAccess: true,
      }),
      req.payload.find({
        collection: 'problem-attempts',
        where: { user: { equals: userId } },
        depth: 0,
        limit: 500,
        overrideAccess: true,
      }),
      req.payload.find({
        collection: 'classroom-memberships',
        where: { student: { equals: userId } },
        depth: 2,
        limit: 50,
        overrideAccess: true,
      }),
      req.payload.findByID({
        collection: 'accounts',
        id: userId,
        depth: 0,
        overrideAccess: true,
      }),
    ])

  const lessonDocs = Array.isArray(lessonProgressRes.docs) ? lessonProgressRes.docs : []
  const quizDocs = Array.isArray(quizAttemptsRes.docs) ? quizAttemptsRes.docs : []
  const problemDocs = Array.isArray(problemAttemptsRes.docs) ? problemAttemptsRes.docs : []
  const membershipDocs = Array.isArray(membershipsRes.docs) ? membershipsRes.docs : []

  const totalLessonsCompleted = lessonDocs.filter((doc) => Boolean((doc as { completed?: boolean }).completed)).length

  const totalTimeSpentSec =
    quizDocs.reduce((sum, doc) => {
      const duration = (doc as { durationSec?: number }).durationSec
      return sum + (typeof duration === 'number' && Number.isFinite(duration) ? duration : 0)
    }, 0) +
    problemDocs.reduce((sum, doc) => {
      const duration = (doc as { durationSec?: number }).durationSec
      return sum + (typeof duration === 'number' && Number.isFinite(duration) ? duration : 0)
    }, 0)

  const quizScoreHistory = quizDocs
    .map((doc) => {
      const score = (doc as { score?: number }).score
      const maxScore = (doc as { maxScore?: number }).maxScore
      const completedAt =
        (doc as { completedAt?: string; createdAt?: string }).completedAt ??
        (doc as { createdAt?: string }).createdAt
      const scorePercent =
        typeof score === 'number' &&
        typeof maxScore === 'number' &&
        Number.isFinite(score) &&
        Number.isFinite(maxScore) &&
        maxScore > 0
          ? Number(((score / maxScore) * 100).toFixed(1))
          : 0
      return {
        date: completedAt ?? null,
        scorePercent,
        attemptId: String((doc as { id?: string | number }).id ?? ''),
      }
    })
    .filter((item) => Boolean(item.date))
    .sort((a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime())

  const problemScoreHistory = problemDocs
    .map((doc) => {
      const score = (doc as { score?: number }).score
      const maxScore = (doc as { maxScore?: number }).maxScore
      const completedAt =
        (doc as { completedAt?: string; createdAt?: string }).completedAt ??
        (doc as { createdAt?: string }).createdAt
      const scorePercent =
        typeof score === 'number' &&
        typeof maxScore === 'number' &&
        Number.isFinite(score) &&
        Number.isFinite(maxScore) &&
        maxScore > 0
          ? Number(((score / maxScore) * 100).toFixed(1))
          : 0
      return {
        date: completedAt ?? null,
        scorePercent,
        attemptId: String((doc as { id?: string | number }).id ?? ''),
      }
    })
    .filter((item) => Boolean(item.date))
    .sort((a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime())

  const recentThreshold = daysAgo(30).getTime()
  const dayMap = new Map<
    string,
    { date: string; lessonsCompleted: number; quizzesTaken: number; problemSetsTaken: number }
  >()

  const bump = (
    dateKey: string | null,
    key: 'lessonsCompleted' | 'quizzesTaken' | 'problemSetsTaken',
  ) => {
    if (!dateKey) return
    const dateTs = new Date(`${dateKey}T00:00:00.000Z`).getTime()
    if (dateTs < recentThreshold) return
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        date: dateKey,
        lessonsCompleted: 0,
        quizzesTaken: 0,
        problemSetsTaken: 0,
      })
    }
    const entry = dayMap.get(dateKey)
    if (entry) entry[key] += 1
  }

  for (const lesson of lessonDocs) {
    if (!(lesson as { completed?: boolean }).completed) continue
    const dateKey = toDateKey(
      (lesson as { completedAt?: string; updatedAt?: string }).completedAt ??
        (lesson as { updatedAt?: string }).updatedAt,
    )
    bump(dateKey, 'lessonsCompleted')
  }
  for (const quiz of quizDocs) {
    const dateKey = toDateKey(
      (quiz as { completedAt?: string; createdAt?: string }).completedAt ??
        (quiz as { createdAt?: string }).createdAt,
    )
    bump(dateKey, 'quizzesTaken')
  }
  for (const problem of problemDocs) {
    const dateKey = toDateKey(
      (problem as { completedAt?: string; createdAt?: string }).completedAt ??
        (problem as { createdAt?: string }).createdAt,
    )
    bump(dateKey, 'problemSetsTaken')
  }

  const recentActivity = [...dayMap.values()].sort((a, b) => a.date.localeCompare(b.date))

  const classroomSummaries = membershipDocs.map((membership) => {
    const classroom = (membership as { classroom?: unknown }).classroom
    const classroomObj =
      typeof classroom === 'object' && classroom !== null
        ? (classroom as {
            id?: string | number
            title?: string
            class?: { title?: string } | string | number
          })
        : null
    const classObj =
      typeof classroomObj?.class === 'object' && classroomObj.class !== null
        ? (classroomObj.class as { title?: string })
        : null
    return {
      classroomId: String(classroomObj?.id ?? ''),
      classroomTitle: classroomObj?.title ?? 'Classroom',
      classTitle: classObj?.title ?? 'Class',
      completionRate:
        typeof (membership as { completionRate?: number }).completionRate === 'number'
          ? (membership as { completionRate?: number }).completionRate ?? 0
          : 0,
      completedLessons:
        typeof (membership as { completedLessons?: number }).completedLessons === 'number'
          ? (membership as { completedLessons?: number }).completedLessons ?? 0
          : 0,
      totalLessons:
        typeof (membership as { totalLessons?: number }).totalLessons === 'number'
          ? (membership as { totalLessons?: number }).totalLessons ?? 0
          : 0,
    }
  })

  return Response.json({
    totalLessonsCompleted,
    totalTimeSpentSec,
    quizScoreHistory,
    problemScoreHistory,
    recentActivity,
    currentStreak:
      typeof (account as { currentStreak?: number }).currentStreak === 'number'
        ? (account as { currentStreak?: number }).currentStreak ?? 0
        : 0,
    longestStreak:
      typeof (account as { longestStreak?: number }).longestStreak === 'number'
        ? (account as { longestStreak?: number }).longestStreak ?? 0
        : 0,
    classroomSummaries,
  })
}
