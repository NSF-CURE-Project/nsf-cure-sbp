import type { AdminViewServerProps } from 'payload'
import { findAllDocs } from '../reporting/data'
import StaffDashboardRedesign from './dashboard/StaffDashboardRedesign'

const ratingScoreMap: Record<string, number> = {
  not_helpful: 1,
  somewhat_helpful: 2,
  helpful: 3,
  very_helpful: 4,
}

const resolveRatingScore = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && ratingScoreMap[value] != null) {
    return ratingScoreMap[value]
  }
  return null
}

export default async function StaffDashboardView({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult
  const user = req.user
  const payload = req.payload

  let unansweredCount: number | null = null
  let unreadFeedbackCount: number | null = null
  let awaitingLessonFeedbackCount: number | null = null
  let accountsCount: number | null = null
  let activeStudentsCount: number | null = null
  let publishedLessonsCount: number | null = null
  let avgCompletionRate: number | null = null
  let helpfulnessAvg: number | null = null
  const LOW_COMPLETION_THRESHOLD = 0.4
  const HIGH_QUESTION_THRESHOLD = 5
  const LOW_HELPFULNESS_THRESHOLD = 2.5
  let contentHealth = {
    available: false,
    lowCompletion: [] as { id: string | number; title: string; rate: number }[],
    highQuestions: [] as { id: string | number; title: string; count: number }[],
    lowHelpfulness: [] as { id: string | number; title: string; rating: number }[],
  }
  try {
    const unanswered = await payload.count({
      collection: 'questions',
      overrideAccess: false,
      req,
      where: {
        status: {
          equals: 'open',
        },
      },
    })
    unansweredCount = unanswered.totalDocs ?? 0
  } catch {
    unansweredCount = null
  }

  try {
    const accounts = await payload.count({
      collection: 'accounts',
      overrideAccess: false,
      req,
    })
    accountsCount = accounts.totalDocs ?? 0
  } catch {
    accountsCount = null
  }

  try {
    const unreadFeedback = await payload.count({
      collection: 'feedback',
      overrideAccess: false,
      req,
      where: {
        read: {
          equals: false,
        },
      },
    })
    unreadFeedbackCount = unreadFeedback.totalDocs ?? 0
  } catch {
    unreadFeedbackCount = null
  }

  try {
    const publishedLessons = await payload.count({
      collection: 'lessons',
      overrideAccess: false,
      req,
      where: {
        _status: {
          equals: 'published',
        },
      },
    })
    publishedLessonsCount = publishedLessons.totalDocs ?? 0
  } catch {
    publishedLessonsCount = null
  }

  // Operational counts shown inline in the management cards. Fail soft with
  // null so an unavailable query is never presented as a true zero.
  let coursesTotal: number | null = null
  let chaptersTotal: number | null = null
  let lessonsTotal: number | null = null
  let quizzesTotal: number | null = null
  let quizQuestionsTotal: number | null = null
  let classroomsTotal: number | null = null
  let classroomEnrollmentsTotal: number | null = null
  let pagesTotal: number | null = null
  let lastLessonUpdatedAt: string | null = null
  try {
    const [
      courses,
      chapters,
      lessonsAll,
      quizzes,
      qbank,
      classrooms,
      classroomMemberships,
      pages,
      recentLesson,
    ] = await Promise.all([
      payload
        .count({ collection: 'classes', overrideAccess: false, req })
        .catch(() => ({ totalDocs: null })),
      payload
        .count({ collection: 'chapters', overrideAccess: false, req })
        .catch(() => ({ totalDocs: null })),
      payload
        .count({ collection: 'lessons', overrideAccess: false, req })
        .catch(() => ({ totalDocs: null })),
      payload
        .count({ collection: 'quizzes', overrideAccess: false, req })
        .catch(() => ({ totalDocs: null })),
      payload
        .count({ collection: 'quiz-questions', overrideAccess: false, req })
        .catch(() => ({ totalDocs: null })),
      payload
        .count({ collection: 'classrooms', overrideAccess: false, req })
        .catch(() => ({ totalDocs: null })),
      payload
        .count({ collection: 'classroom-memberships', overrideAccess: false, req })
        .catch(() => ({ totalDocs: null })),
      payload
        .count({ collection: 'pages', overrideAccess: false, req })
        .catch(() => ({ totalDocs: null })),
      payload
        .find({
          collection: 'lessons',
          depth: 0,
          limit: 1,
          overrideAccess: false,
          req,
          sort: '-updatedAt',
        })
        .catch(() => ({ docs: [] as Array<{ updatedAt?: string }> })),
    ])
    coursesTotal = (courses as { totalDocs?: number | null }).totalDocs ?? null
    chaptersTotal = (chapters as { totalDocs?: number | null }).totalDocs ?? null
    lessonsTotal = (lessonsAll as { totalDocs?: number | null }).totalDocs ?? null
    quizzesTotal = (quizzes as { totalDocs?: number | null }).totalDocs ?? null
    quizQuestionsTotal = (qbank as { totalDocs?: number | null }).totalDocs ?? null
    classroomsTotal = (classrooms as { totalDocs?: number | null }).totalDocs ?? null
    classroomEnrollmentsTotal =
      (classroomMemberships as { totalDocs?: number | null }).totalDocs ?? null
    pagesTotal = (pages as { totalDocs?: number | null }).totalDocs ?? null
    const lessonDoc = (recentLesson as { docs?: Array<{ updatedAt?: string }> }).docs?.[0]
    lastLessonUpdatedAt = lessonDoc?.updatedAt ?? null
  } catch {
    // leave defaults
  }

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const recentProgress = await findAllDocs(payload, 'lesson-progress', {
      overrideAccess: false,
      req,
      where: {
        updatedAt: {
          greater_than: since,
        },
      },
    })
    const activeUsers = new Set<string>()
    recentProgress.forEach((doc) => {
      const userValue = (doc as { user?: string | number | { id?: string | number } | null }).user
      const id =
        typeof userValue === 'string'
          ? userValue
          : typeof userValue === 'number'
            ? String(userValue)
            : userValue?.id != null
              ? String(userValue.id)
              : null
      if (id) activeUsers.add(id)
    })
    activeStudentsCount = activeUsers.size
  } catch {
    activeStudentsCount = null
  }

  try {
    const [lessons, lessonFeedback, progress, completed, questions] = await Promise.all([
      findAllDocs(payload, 'lessons', { overrideAccess: false, req }),
      findAllDocs(payload, 'lesson-feedback', { overrideAccess: false, req }),
      findAllDocs(payload, 'lesson-progress', { overrideAccess: false, req }),
      findAllDocs(payload, 'lesson-progress', {
        overrideAccess: false,
        req,
        where: {
          completed: {
            equals: true,
          },
        },
      }),
      findAllDocs(payload, 'questions', { overrideAccess: false, req }),
    ])

    awaitingLessonFeedbackCount = lessonFeedback.filter((doc) => {
      const reply = (doc as { reply?: unknown }).reply
      return !(typeof reply === 'string' && reply.trim())
    }).length

    const lessonById = new Map<string, { id: string | number; title: string }>()
    lessons.forEach((lesson) => {
      const lessonId = String(lesson.id ?? '')
      if (!lessonId) return
      const lessonTitle =
        typeof lesson.title === 'string' && lesson.title.trim() ? lesson.title : 'Untitled lesson'
      lessonById.set(lessonId, {
        id: lessonId,
        title: lessonTitle,
      })
    })

    const progressTotals = new Map<string, number>()
    progress.forEach((doc) => {
      const lessonValue = (doc as { lesson?: string | { id?: string | number } }).lesson
      const id =
        typeof lessonValue === 'string'
          ? lessonValue
          : lessonValue?.id != null
            ? String(lessonValue.id)
            : null
      if (!id) return
      progressTotals.set(id, (progressTotals.get(id) ?? 0) + 1)
    })

    const progressCompleted = new Map<string, number>()
    completed.forEach((doc) => {
      const lessonValue = (doc as { lesson?: string | { id?: string | number } }).lesson
      const id =
        typeof lessonValue === 'string'
          ? lessonValue
          : lessonValue?.id != null
            ? String(lessonValue.id)
            : null
      if (!id) return
      progressCompleted.set(id, (progressCompleted.get(id) ?? 0) + 1)
    })

    const questionTotals = new Map<string, number>()
    questions.forEach((doc) => {
      const lessonValue = (doc as { lesson?: string | { id?: string | number } }).lesson
      const id =
        typeof lessonValue === 'string'
          ? lessonValue
          : lessonValue?.id != null
            ? String(lessonValue.id)
            : null
      if (!id) return
      questionTotals.set(id, (questionTotals.get(id) ?? 0) + 1)
    })

    const lowCompletion: { id: string | number; title: string; rate: number }[] = []
    progressTotals.forEach((total, id) => {
      if (!total) return
      const completedCount = progressCompleted.get(id) ?? 0
      const rate = completedCount / total
      if (rate < LOW_COMPLETION_THRESHOLD) {
        const lesson = lessonById.get(id)
        if (lesson) {
          lowCompletion.push({ id: lesson.id, title: lesson.title, rate })
        }
      }
    })

    const highQuestions: { id: string | number; title: string; count: number }[] = []
    questionTotals.forEach((count, id) => {
      if (count < HIGH_QUESTION_THRESHOLD) return
      const lesson = lessonById.get(id)
      if (lesson) {
        highQuestions.push({ id: lesson.id, title: lesson.title, count })
      }
    })

    contentHealth = {
      available: true,
      lowCompletion: lowCompletion.sort((a, b) => a.rate - b.rate).slice(0, 6),
      highQuestions: highQuestions.sort((a, b) => b.count - a.count).slice(0, 6),
      lowHelpfulness: [],
    }

    const feedbackTotals = new Map<string, { sum: number; count: number }>()
    lessonFeedback.forEach((doc) => {
      const lessonValue = (
        doc as {
          lesson?: string | number | { id?: string | number } | null
          rating?: unknown
        }
      ).lesson
      const id =
        typeof lessonValue === 'string'
          ? lessonValue
          : typeof lessonValue === 'number'
            ? String(lessonValue)
            : lessonValue?.id != null
              ? String(lessonValue.id)
              : null
      const rating = resolveRatingScore(doc.rating)
      if (!id || rating == null) return
      const current = feedbackTotals.get(id) ?? { sum: 0, count: 0 }
      feedbackTotals.set(id, { sum: current.sum + rating, count: current.count + 1 })
    })

    let totalRating = 0
    let totalCount = 0
    const lowHelpfulness: { id: string | number; title: string; rating: number }[] = []
    feedbackTotals.forEach((totals, id) => {
      if (!totals.count) return
      const avg = totals.sum / totals.count
      totalRating += totals.sum
      totalCount += totals.count
      if (avg < LOW_HELPFULNESS_THRESHOLD) {
        const lesson = lessonById.get(id)
        if (lesson) {
          lowHelpfulness.push({ id: lesson.id, title: lesson.title, rating: avg })
        }
      }
    })

    helpfulnessAvg = totalCount ? totalRating / totalCount : null
    const totalProgressCount = Array.from(progressTotals.values()).reduce(
      (sum, value) => sum + value,
      0,
    )
    const totalCompletedCount = Array.from(progressCompleted.values()).reduce(
      (sum, value) => sum + value,
      0,
    )
    avgCompletionRate = totalProgressCount ? totalCompletedCount / totalProgressCount : null
    contentHealth.lowHelpfulness = lowHelpfulness.sort((a, b) => a.rating - b.rating).slice(0, 6)
  } catch {
    contentHealth = { available: false, lowCompletion: [], highQuestions: [], lowHelpfulness: [] }
    awaitingLessonFeedbackCount = null
  }

  // Reporting Suite gateway: a tiny set of headline numbers + the active period
  // and most recent snapshot. Keeps the dashboard slim while letting users
  // assess "where are we right now?" in one glance before opening /admin/reporting.
  const reportingGateway: {
    activePeriod: {
      id: string | number
      label: string
      reportType: string
      startDate: string | null
      endDate: string | null
    } | null
    latestSnapshot: {
      id: string | number
      label: string
      createdAt: string
      versionLabel: string | null
    } | null
    available: boolean
    rpprDraftCount: number | null
    snapshotCount: number | null
    savedViewCount: number | null
    productCount: number | null
  } = {
    available: false,
    activePeriod: null,
    latestSnapshot: null,
    rpprDraftCount: null,
    snapshotCount: null,
    savedViewCount: null,
    productCount: null,
  }
  try {
    const [periodRes, snapshotRes, rpprRes, savedViewsRes, productsRes] = await Promise.all([
      payload.find({
        collection: 'reporting-periods',
        where: { status: { equals: 'active' } },
        sort: '-startDate',
        limit: 1,
        depth: 0,
        overrideAccess: false,
        req,
      }),
      payload.find({
        collection: 'reporting-snapshots',
        sort: '-createdAt',
        limit: 1,
        depth: 0,
        overrideAccess: false,
        req,
      }),
      payload.count({ collection: 'rppr-reports', overrideAccess: false, req }),
      payload.count({ collection: 'reporting-saved-views', overrideAccess: false, req }),
      payload.count({ collection: 'reporting-product-records', overrideAccess: false, req }),
    ])
    const period = periodRes.docs[0] as
      | {
          id: string | number
          label?: string
          reportType?: string
          startDate?: string | null
          endDate?: string | null
        }
      | undefined
    if (period) {
      reportingGateway.activePeriod = {
        id: period.id,
        label: period.label ?? '(untitled period)',
        reportType: period.reportType ?? 'annual',
        startDate: period.startDate ?? null,
        endDate: period.endDate ?? null,
      }
    }
    const snap = snapshotRes.docs[0] as
      | {
          id: string | number
          label?: string
          versionLabel?: string | null
          createdAt?: string
        }
      | undefined
    if (snap?.createdAt) {
      reportingGateway.latestSnapshot = {
        id: snap.id,
        label: snap.label ?? '(untitled snapshot)',
        createdAt: snap.createdAt,
        versionLabel: snap.versionLabel ?? null,
      }
    }
    reportingGateway.snapshotCount = snapshotRes.totalDocs ?? 0
    reportingGateway.rpprDraftCount = rpprRes.totalDocs ?? 0
    reportingGateway.savedViewCount = savedViewsRes.totalDocs ?? 0
    reportingGateway.productCount = productsRes.totalDocs ?? 0
    reportingGateway.available = true
  } catch {
    // leave defaults; dashboard still renders
  }

  const stats = {
    accounts: accountsCount,
    unanswered: unansweredCount,
    unreadFeedback: unreadFeedbackCount,
    awaitingLessonFeedback: awaitingLessonFeedbackCount,
    helpfulnessAvg,
    activeStudents: activeStudentsCount,
    publishedLessons: publishedLessonsCount,
    avgCompletion: avgCompletionRate,
  }

  const managementCounts = {
    coursesTotal,
    chaptersTotal,
    lessonsTotal,
    publishedLessonsCount,
    quizzesTotal,
    quizQuestionsTotal,
    classroomsTotal,
    classroomEnrollmentsTotal,
    pagesTotal,
    lastLessonUpdatedAt,
  }

  return (
    <StaffDashboardRedesign
      user={user}
      stats={stats}
      contentHealth={contentHealth}
      managementCounts={managementCounts}
      reportingGateway={reportingGateway}
    />
  )
}
