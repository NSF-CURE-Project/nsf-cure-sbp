import type { Payload } from 'payload'
import { findAllDocs } from './data'
import type { ReportingSummary } from './types'

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

export type ReportingCrossCheck = {
  key: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  details?: Record<string, number>
}

export const runReportingCrossChecks = async (
  payload: Payload,
  summary: ReportingSummary,
): Promise<ReportingCrossCheck[]> => {
  const [memberships, progress, attempts] = await Promise.all([
    findAllDocs(payload, 'classroom-memberships'),
    findAllDocs(payload, 'lesson-progress'),
    findAllDocs(payload, 'quiz-attempts'),
  ])

  const membershipUsers = new Set(
    memberships.map((doc) => toId(doc.student)).filter((id): id is string => Boolean(id)),
  )
  const progressUsers = new Set(
    progress.map((doc) => toId(doc.user)).filter((id): id is string => Boolean(id)),
  )
  const attemptUsers = new Set(
    attempts.map((doc) => toId(doc.user)).filter((id): id is string => Boolean(id)),
  )

  const progressWithoutMembership = [...progressUsers].filter((id) => !membershipUsers.has(id)).length
  const attemptsWithoutProgress = [...attemptUsers].filter((id) => !progressUsers.has(id)).length

  const checks: ReportingCrossCheck[] = [
    {
      key: 'active_learners_consistency',
      status:
        summary.participation.uniqueLearnersActive >= summary.participation.uniqueLearnersWithProgress
          ? 'pass'
          : 'fail',
      message: 'Unique active learners should be >= learners with progress.',
      details: {
        uniqueLearnersActive: summary.participation.uniqueLearnersActive,
        uniqueLearnersWithProgress: summary.participation.uniqueLearnersWithProgress,
      },
    },
    {
      key: 'progress_membership_alignment',
      status: progressWithoutMembership > 0 ? 'warn' : 'pass',
      message:
        progressWithoutMembership > 0
          ? `${progressWithoutMembership} learners with progress are missing classroom membership records.`
          : 'Progress and membership coverage aligned.',
      details: {
        progressWithoutMembership,
      },
    },
    {
      key: 'attempt_progress_alignment',
      status: attemptsWithoutProgress > 0 ? 'warn' : 'pass',
      message:
        attemptsWithoutProgress > 0
          ? `${attemptsWithoutProgress} learners have quiz attempts but no lesson progress rows.`
          : 'Quiz attempts are aligned with progress rows.',
      details: {
        attemptsWithoutProgress,
      },
    },
  ]

  return checks
}
