import type {
  StudentPerformancePayload,
  StudentPerformanceStudent,
} from '../../utils/studentPerformance'

export type StudentStatus = 'active' | 'inactive' | 'at-risk'

export type InsightItem = {
  id: string
  title: string
  description: string
  count: number
  tone: 'neutral' | 'warning' | 'danger' | 'positive'
}

export const shellStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '28px 20px 64px',
}

export const sectionStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-panel-bg)',
  padding: 16,
  boxShadow: '0 1px 0 rgba(18, 65, 147, 0.08)',
}

export const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-panel-bg-muted)',
  padding: '14px 14px 12px',
}

export const formatPercent = (value: number | null | undefined, emptyLabel = 'No score data') =>
  value == null || Number.isNaN(value) ? emptyLabel : `${value.toFixed(1)}%`

export const formatNumber = (value: number | null | undefined, emptyLabel = 'No data yet') =>
  value == null || Number.isNaN(value) ? emptyLabel : value.toFixed(1)

export const formatDate = (value: string | null, emptyLabel = 'No activity recorded') => {
  if (!value) return emptyLabel
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return emptyLabel
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

export const formatRelativeTime = (value: string | null) => {
  if (!value) return 'No recent activity'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No recent activity'

  const diffMs = Date.now() - parsed.getTime()
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

  if (diffDays === 0) return 'Active today'
  if (diffDays === 1) return 'Active yesterday'
  if (diffDays < 7) return `Active ${diffDays} days ago`
  if (diffDays < 30) return `Active ${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`
  return `Inactive for ${Math.floor(diffDays / 30)} month${diffDays >= 60 ? 's' : ''}`
}

export const participantLabel = (value: string | null) => {
  if (!value) return 'Participant type unavailable'
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const clampPercent = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

const getDaysSinceActivity = (value: string | null) => {
  if (!value) return Number.POSITIVE_INFINITY
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return Number.POSITIVE_INFINITY
  return (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)
}

export const getStudentStatus = (student: StudentPerformanceStudent): StudentStatus => {
  const daysSinceActivity = getDaysSinceActivity(student.lastActivityAt)
  const totalAttempts = student.quizAttempts
  const completion = clampPercent(student.lessonCompletionRate)
  const average = student.overallAverage

  if (daysSinceActivity > 30 || (totalAttempts === 0 && completion === 0)) {
    return 'inactive'
  }

  if (
    daysSinceActivity > 14 ||
    completion < 50 ||
    (average != null && average < 70) ||
    totalAttempts < 2
  ) {
    return 'at-risk'
  }

  return 'active'
}

export const getStatusMeta = (status: StudentStatus) => {
  if (status === 'active') {
    return {
      label: 'Active',
      background: 'rgba(20, 131, 92, 0.12)',
      border: 'rgba(20, 131, 92, 0.28)',
      color: '#127455',
    }
  }

  if (status === 'at-risk') {
    return {
      label: 'At Risk',
      background: 'rgba(217, 119, 6, 0.12)',
      border: 'rgba(217, 119, 6, 0.26)',
      color: '#b45309',
    }
  }

  return {
    label: 'Inactive',
    background: 'rgba(100, 116, 139, 0.12)',
    border: 'rgba(100, 116, 139, 0.22)',
    color: '#475569',
  }
}

export const getInsightItems = (data: StudentPerformancePayload): InsightItem[] => {
  const inactiveStudents = data.students.filter((student) => getStudentStatus(student) === 'inactive')
  const atRiskStudents = data.students.filter((student) => getStudentStatus(student) === 'at-risk')
  const noAssessmentStudents = data.students.filter(
    (student) => student.quizAttempts === 0,
  )
  const lowCompletionStudents = data.students.filter(
    (student) => clampPercent(student.lessonCompletionRate) < 50,
  )

  const items: InsightItem[] = [
    {
      id: 'inactive',
      title: 'No recent activity',
      description:
        inactiveStudents.length > 0
          ? 'These students have been inactive for over 30 days or have not started yet.'
          : 'All tracked students show some recent engagement.',
      count: inactiveStudents.length,
      tone: inactiveStudents.length > 0 ? 'danger' : 'positive',
    },
    {
      id: 'risk',
      title: 'Needs attention',
      description:
        atRiskStudents.length > 0
          ? 'Recent activity, low scores, or shallow attempt history suggest they may need support.'
          : 'No students currently meet the at-risk threshold.',
      count: atRiskStudents.length,
      tone: atRiskStudents.length > 0 ? 'warning' : 'positive',
    },
    {
      id: 'completion',
      title: 'Low completion',
      description:
        lowCompletionStudents.length > 0
          ? 'Lesson completion is below 50%, which may signal drop-off or pacing issues.'
          : 'Completion rates are holding above the risk threshold.',
      count: lowCompletionStudents.length,
      tone: lowCompletionStudents.length > 0 ? 'warning' : 'positive',
    },
    {
      id: 'assessments',
      title: 'No assessment data',
      description:
        noAssessmentStudents.length > 0
          ? 'These students have not submitted any quiz attempts yet.'
          : 'Every tracked student has at least one assessment attempt.',
      count: noAssessmentStudents.length,
      tone: noAssessmentStudents.length > 0 ? 'neutral' : 'positive',
    },
  ]

  return items
}
