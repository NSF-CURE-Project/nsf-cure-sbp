import React from 'react'
import { notFound } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import StudentDetailView, {
  type StudentDetailLessonRow,
  type StudentDetailQuizRow,
  type StudentDetailClassroom,
} from '@/views/student-performance/StudentDetailView'
import { buildUserDisplayName } from '@/views/classrooms/classrooms-api'

type AccountDoc = {
  id?: string | number
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  participantType?: string | null
  currentStreak?: number | null
  longestStreak?: number | null
  lastLoginAt?: string | null
  lastSeenAt?: string | null
  loginCount?: number | null
}

type MembershipDoc = {
  id?: string | number
  classroom?:
    | { id?: string | number; title?: string; class?: { id?: string; title?: string } | string }
    | string
    | number
    | null
  joinedAt?: string | null
  completionRate?: number | null
  completedLessons?: number | null
  totalLessons?: number | null
  lastActivityAt?: string | null
}

type QuizAttemptDoc = {
  id?: string | number
  quiz?: { id?: string; title?: string } | string | number | null
  lesson?: { id?: string; title?: string } | string | number | null
  score?: number | null
  maxScore?: number | null
  completedAt?: string | null
  createdAt?: string | null
  durationSec?: number | null
}

type LessonProgressDoc = {
  id?: string | number
  lesson?: { id?: string; title?: string } | string | number | null
  completed?: boolean
  completedAt?: string | null
  updatedAt?: string | null
}

const refTitle = (value: unknown, fallback = 'Untitled'): string => {
  if (value && typeof value === 'object') {
    const title = (value as { title?: string }).title
    if (typeof title === 'string' && title.trim()) return title
  }
  return fallback
}

const refId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object') {
    const id = (value as { id?: string | number }).id
    if (id != null) return String(id)
  }
  return null
}

const normalizeScorePercent = (
  score: number | null | undefined,
  maxScore: number | null | undefined,
): number | null => {
  if (score == null || Number.isNaN(score)) return null
  if (maxScore != null && maxScore > 0) {
    return Math.max(0, Math.min(100, (score / maxScore) * 100))
  }
  if (score <= 1) return Math.max(0, Math.min(100, score * 100))
  return Math.max(0, Math.min(100, score))
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  const { accountId } = await params
  const payload = await getPayload({ config: configPromise })

  const account = (await payload
    .findByID({
      collection: 'accounts',
      id: accountId,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null)) as AccountDoc | null

  if (!account) notFound()

  const [memberships, quizAttempts, lessonProgress] = await Promise.all([
    payload
      .find({
        collection: 'classroom-memberships',
        depth: 2,
        limit: 100,
        where: { student: { equals: accountId } },
        sort: '-joinedAt',
        overrideAccess: true,
      })
      .catch(() => ({ docs: [] as MembershipDoc[] })),
    payload
      .find({
        collection: 'quiz-attempts',
        depth: 1,
        limit: 200,
        where: { user: { equals: accountId } },
        sort: '-completedAt',
        overrideAccess: true,
      })
      .catch(() => ({ docs: [] as QuizAttemptDoc[] })),
    payload
      .find({
        collection: 'lesson-progress',
        depth: 1,
        limit: 500,
        where: { user: { equals: accountId } },
        sort: '-updatedAt',
        overrideAccess: true,
      })
      .catch(() => ({ docs: [] as LessonProgressDoc[] })),
  ])

  const classrooms: StudentDetailClassroom[] = (memberships.docs ?? []).map((entry) => {
    const membership = entry as MembershipDoc
    const classroomValue = membership.classroom
    const id = refId(classroomValue) ?? ''
    const title = refTitle(classroomValue, 'Classroom')
    return {
      classroomId: id,
      title,
      joinedAt: membership.joinedAt ?? null,
      completionRate:
        typeof membership.completionRate === 'number' ? membership.completionRate : 0,
      completedLessons:
        typeof membership.completedLessons === 'number' ? membership.completedLessons : 0,
      totalLessons:
        typeof membership.totalLessons === 'number' ? membership.totalLessons : 0,
      lastActivityAt: membership.lastActivityAt ?? null,
    }
  })

  const quizRows: StudentDetailQuizRow[] = (quizAttempts.docs ?? []).map((entry) => {
    const attempt = entry as QuizAttemptDoc
    return {
      id: String(attempt.id ?? ''),
      quizTitle: refTitle(attempt.quiz, 'Quiz'),
      lessonTitle: refTitle(attempt.lesson, '—'),
      completedAt: attempt.completedAt ?? attempt.createdAt ?? null,
      scorePercent: normalizeScorePercent(attempt.score, attempt.maxScore),
      durationSec: typeof attempt.durationSec === 'number' ? attempt.durationSec : null,
    }
  })

  const lessonRows: StudentDetailLessonRow[] = (lessonProgress.docs ?? []).map((entry) => {
    const progress = entry as LessonProgressDoc
    return {
      id: String(progress.id ?? ''),
      lessonTitle: refTitle(progress.lesson, 'Lesson'),
      completed: Boolean(progress.completed),
      completedAt: progress.completedAt ?? null,
      updatedAt: progress.updatedAt ?? null,
    }
  })

  const displayName =
    account.fullName?.trim() ||
    buildUserDisplayName(account.firstName ?? '', account.lastName ?? '', account.email ?? '') ||
    account.email ||
    'Student'

  return (
    <Gutter>
      <div style={{ maxWidth: 1180, margin: '0 auto 64px' }}>
        <StudentDetailView
          accountId={String(account.id ?? accountId)}
          displayName={displayName}
          email={account.email ?? null}
          participantType={account.participantType ?? null}
          currentStreak={typeof account.currentStreak === 'number' ? account.currentStreak : 0}
          longestStreak={typeof account.longestStreak === 'number' ? account.longestStreak : 0}
          loginCount={typeof account.loginCount === 'number' ? account.loginCount : 0}
          lastLoginAt={account.lastLoginAt ?? null}
          lastSeenAt={account.lastSeenAt ?? null}
          classrooms={classrooms}
          quizAttempts={quizRows}
          lessonProgress={lessonRows}
        />
      </div>
    </Gutter>
  )
}
