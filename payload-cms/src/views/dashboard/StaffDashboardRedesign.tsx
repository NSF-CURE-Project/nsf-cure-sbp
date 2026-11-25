import type { ReactNode } from 'react'
import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'

import AnimatedNumber from './AnimatedNumber'
import styles from './StaffDashboardRedesign.module.css'

type DashboardIconName =
  | 'arrow'
  | 'book'
  | 'check'
  | 'chevron'
  | 'clipboard'
  | 'feedback'
  | 'gear'
  | 'graduation'
  | 'help'
  | 'people'
  | 'person'
  | 'pencil'
  | 'reporting'
  | 'thumb'

const iconPaths: Record<DashboardIconName, ReactNode> = {
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </>
  ),
  book: (
    <>
      <path d="M3 4.5h6a3 3 0 0 1 3 3V21a3 3 0 0 0-3-3H3z" />
      <path d="M21 4.5h-6a3 3 0 0 0-3 3V21a3 3 0 0 1 3-3h6z" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clipboard: (
    <>
      <rect x="7" y="4" width="10" height="16" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="M10 9h4M10 13h4M10 17h3" />
    </>
  ),
  feedback: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05-2.87 2.87-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21h-4v-.05a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.05.05-2.87-2.87.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.05A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.05-.05 2.87-2.87.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.05A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.05-.05 2.87 2.87-.05.05A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21v4h-.05A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  graduation: (
    <>
      <path d="m2.5 9 9.5-5 9.5 5-9.5 5z" />
      <path d="M6 11v5c3 2.5 9 2.5 12 0v-5" />
      <path d="M21.5 9v6" />
    </>
  ),
  help: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M9.8 9a2.3 2.3 0 1 1 3.6 1.9c-.9.6-1.4 1-1.4 2.1" />
      <path d="M12 15.5h.01" />
    </>
  ),
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  pencil: (
    <>
      <path d="m4 20 4.5-1 10-10-3.5-3.5-10 10z" />
      <path d="m13.5 7 3.5 3.5" />
    </>
  ),
  reporting: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  thumb: (
    <>
      <path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
      <path d="M7 10 11 3a2 2 0 0 1 3.8 1.2L14 10h5.2a2 2 0 0 1 2 2.4l-1.3 6a2 2 0 0 1-2 1.6H7" />
    </>
  ),
}

const DashboardIcon = ({ name, size = 18 }: { name: DashboardIconName; size?: number }) => (
  <svg
    aria-hidden="true"
    className={styles.icon}
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
  >
    {iconPaths[name]}
  </svg>
)

export type StaffDashboardRedesignProps = {
  user?: AdminViewServerProps['initPageResult']['req']['user']
  stats: {
    accounts: number | null
    unanswered: number | null
    unreadFeedback: number | null
    awaitingLessonFeedback: number | null
    helpfulnessAvg: number | null
    activeStudents: number | null
    publishedLessons: number | null
    avgCompletion: number | null
  }
  managementCounts?: {
    coursesTotal: number | null
    chaptersTotal: number | null
    lessonsTotal: number | null
    publishedLessonsCount: number | null
    quizzesTotal: number | null
    quizQuestionsTotal: number | null
    classroomsTotal: number | null
    classroomEnrollmentsTotal: number | null
    pagesTotal: number | null
    lastLessonUpdatedAt: string | null
  }
  contentHealth: {
    available: boolean
    lowCompletion: { id: string | number; title: string; rate: number }[]
    highQuestions: { id: string | number; title: string; count: number }[]
    lowHelpfulness: { id: string | number; title: string; rating: number }[]
  }
  reportingGateway: {
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
  }
}

const formatCount = (value: number, singular: string, plural = `${singular}s`) =>
  `${value} ${value === 1 ? singular : plural}`

const formatAvailableCount = (
  value: number | null | undefined,
  singular: string,
  plural = `${singular}s`,
) => (value == null ? `${plural} unavailable` : formatCount(value, singular, plural))

const formatDateRange = (start: string | null, end: string | null) => {
  if (!start || !end) return null
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null

  const short: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' }
  const withYear: Intl.DateTimeFormatOptions = { ...short, year: 'numeric' }
  return `${startDate.toLocaleDateString('en-US', short)} – ${endDate.toLocaleDateString('en-US', withYear)}`
}

const formatRelativeTime = (iso: string) => {
  const timestamp = new Date(iso).getTime()
  if (!Number.isFinite(timestamp)) return null
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

const Arrow = () => <DashboardIcon name="arrow" size={14} />

type AttentionItem = {
  count: number | null
  description: string
  href: string
  icon: DashboardIconName
  label: string
  shortLabel: string
}

const AttentionPanel = ({
  drafts,
  items,
}: {
  drafts: AttentionItem
  items: AttentionItem[]
}) => {
  const total = items.reduce((sum, item) => sum + (item.count ?? 0), 0)
  const hasUnavailable = items.some((item) => item.count == null)
  const allClear = !hasUnavailable && total === 0
  const urgentItems = items.filter((item) => (item.count ?? 0) > 0 || item.count == null)

  return (
    <section
      aria-labelledby="attention-heading"
      className={`${styles.panel} ${styles.attentionPanel} ${allClear ? styles.attentionClear : styles.attentionActive}`}
    >
      {allClear ? (
        <div className={styles.attentionCompact}>
          <div className={styles.attentionCompactLead}>
            <span className={styles.attentionCompactIcon}>
              <DashboardIcon name="check" size={16} />
            </span>
            <div>
              <h2 className={styles.panelTitle} id="attention-heading">
                All caught up
              </h2>
              <p className={styles.attentionCompactCopy}>
                No student questions or feedback need a response.
              </p>
            </div>
          </div>
          <div aria-label="Support queues" className={styles.attentionPills}>
            {items.map((item) => (
              <Link
                aria-label={`${item.label}: 0`}
                className={styles.attentionPill}
                href={item.href}
                key={item.label}
              >
                <strong>0</strong>
                <span>{item.shortLabel}</span>
              </Link>
            ))}
            <Link
              aria-label={`${drafts.label}: ${drafts.count == null ? 'unavailable' : drafts.count}`}
              className={styles.attentionPill}
              href={drafts.href}
            >
              <strong>{drafts.count ?? '—'}</strong>
              <span>{drafts.shortLabel}</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.attentionSummary}>
            <h2 className={styles.panelTitle} id="attention-heading">
              Needs attention
            </h2>
            <p className={styles.attentionStateTitle}>
              {hasUnavailable
                ? total > 0
                  ? `${formatCount(total, 'known item')} ${total === 1 ? 'needs' : 'need'} a response`
                  : 'Some queue data is unavailable'
                : `${formatCount(total, 'item')} ${total === 1 ? 'needs' : 'need'} a response`}
            </p>
            <p className={styles.attentionStateCopy}>
              {hasUnavailable
                ? 'Refresh before treating this list as complete.'
                : 'Review open student support first. Draft lessons are listed separately.'}
            </p>
          </div>
          <div aria-label="Support and publishing queues" className={styles.attentionList}>
            {urgentItems.map((item) => (
              <Link
                aria-label={`${item.label}: ${item.count == null ? 'unavailable' : item.count}. ${item.description}`}
                className={`${styles.attentionRow} ${item.count != null && item.count > 0 ? styles.needsResponse : ''} ${item.count == null ? styles.isUnavailable : ''}`}
                href={item.href}
                key={item.label}
              >
                <span className={styles.rowIcon}>
                  <DashboardIcon name={item.icon} size={16} />
                </span>
                <span className={styles.rowCopy}>
                  <span className={styles.rowLabel}>{item.label}</span>
                  <span className={styles.rowHint}>{item.description}</span>
                </span>
                <span className={styles.rowStatus}>
                  <strong>{item.count ?? '—'}</strong>
                  {item.count == null ? (
                    <span>Unavailable</span>
                  ) : item.count > 0 ? (
                    <span>Needs response</span>
                  ) : null}
                </span>
                <DashboardIcon name="chevron" size={16} />
              </Link>
            ))}
            <Link
              aria-label={`${drafts.label}: ${drafts.count == null ? 'unavailable' : drafts.count}. ${drafts.description}`}
              className={`${styles.attentionRow} ${styles.attentionDraftRow} ${drafts.count == null ? styles.isUnavailable : ''}`}
              href={drafts.href}
            >
              <span className={styles.rowIcon}>
                <DashboardIcon name={drafts.icon} size={16} />
              </span>
              <span className={styles.rowCopy}>
                <span className={styles.rowLabel}>{drafts.label}</span>
                <span className={styles.rowHint}>{drafts.description}</span>
              </span>
              <span className={styles.rowStatus}>
                <strong>{drafts.count ?? '—'}</strong>
              </span>
              <DashboardIcon name="chevron" size={16} />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

type SnapshotItem = {
  actionHref?: string
  actionLabel?: string
  description: string
  label: string
  value: number | null
  suffix?: string
}

const SnapshotCard = ({ item }: { item: SnapshotItem }) => (
  <div className={styles.snapshotCard}>
    <span className={styles.snapshotLabel}>{item.label}</span>
    <strong className={styles.snapshotValue}>
      {item.value == null ? '—' : <AnimatedNumber suffix={item.suffix} value={item.value} />}
    </strong>
    <span className={styles.snapshotDescription}>{item.description}</span>
    {item.actionHref && item.actionLabel ? (
      <Link className={styles.snapshotAction} href={item.actionHref}>
        {item.actionLabel}
        <Arrow />
      </Link>
    ) : null}
  </div>
)

type WorkspaceItem = {
  description: string
  href: string
  icon: DashboardIconName
  secondary?: { href: string; label: string }
  title: string
}

const WorkspaceCard = ({ item }: { item: WorkspaceItem }) => (
  <article className={styles.workspaceCard}>
    <Link className={styles.workspacePrimary} href={item.href}>
      <span className={styles.workspaceIcon}>
        <DashboardIcon name={item.icon} size={16} />
      </span>
      <span className={styles.workspaceBody}>
        <span className={styles.workspaceTitle}>{item.title}</span>
        <span className={styles.workspaceDescription}>{item.description}</span>
      </span>
      <DashboardIcon name="chevron" size={16} />
    </Link>
    {item.secondary ? (
      <Link className={styles.workspaceSecondary} href={item.secondary.href}>
        {item.secondary.label}
        <Arrow />
      </Link>
    ) : null}
  </article>
)

type HealthItem = { href: string; id: string | number; metric: string; title: string }

const HealthSignal = ({
  available,
  description,
  emptyAction,
  icon,
  items,
  title,
}: {
  available: boolean
  description: string
  emptyAction?: { href: string; label: string }
  icon: DashboardIconName
  items: HealthItem[]
  title: string
}) => (
  <div className={styles.healthSignal}>
    <div className={styles.healthSummary}>
      <span className={styles.healthIcon}>
        <DashboardIcon name={icon} size={16} />
      </span>
      <div>
        <h3 className={styles.healthTitle}>{title}</h3>
        <p className={styles.healthDescription}>{description}</p>
      </div>
      {!available ? (
        <span className={styles.healthUnavailable}>Data unavailable</span>
      ) : items.length === 0 ? (
        <span className={styles.healthClear}>No lessons flagged</span>
      ) : (
        <span className={styles.healthFlagged}>{formatCount(items.length, 'lesson')} flagged</span>
      )}
    </div>
    {available && items.length > 0 ? (
      <ul className={styles.healthItems}>
        {items.slice(0, 4).map((item) => (
          <li key={String(item.id)}>
            <Link className={styles.healthItemLink} href={item.href}>
              <span>{item.title}</span>
              <span>{item.metric}</span>
              <DashboardIcon name="chevron" size={14} />
            </Link>
          </li>
        ))}
      </ul>
    ) : available && emptyAction ? (
      <div className={styles.healthEmptyAction}>
        <Link href={emptyAction.href}>
          {emptyAction.label}
          <Arrow />
        </Link>
      </div>
    ) : null}
  </div>
)

type ActivityItem = {
  href: string
  label: string
  time: string
}

export default function StaffDashboardRedesign({
  stats,
  managementCounts,
  contentHealth,
  reportingGateway,
}: StaffDashboardRedesignProps) {
  const draftLessons =
    managementCounts?.lessonsTotal == null || managementCounts.publishedLessonsCount == null
      ? null
      : Math.max(0, managementCounts.lessonsTotal - managementCounts.publishedLessonsCount)

  const responseItems: AttentionItem[] = [
    {
      count: stats.unanswered,
      description:
        stats.unanswered == null
          ? 'Question count unavailable'
          : stats.unanswered > 0
            ? 'Open student questions'
            : 'No open student questions',
      href: '/admin/collections/questions?where[status][equals]=open',
      icon: 'help',
      label: 'Unanswered questions',
      shortLabel: 'Questions',
    },
    {
      count: stats.awaitingLessonFeedback,
      description:
        stats.awaitingLessonFeedback == null
          ? 'Lesson reply count unavailable'
          : stats.awaitingLessonFeedback > 0
            ? 'Lesson threads awaiting staff reply'
            : 'No lesson threads awaiting reply',
      href: '/admin/collections/lesson-feedback',
      icon: 'book',
      label: 'Lesson replies',
      shortLabel: 'Replies',
    },
    {
      count: stats.unreadFeedback,
      description:
        stats.unreadFeedback == null
          ? 'Site feedback count unavailable'
          : stats.unreadFeedback > 0
            ? 'Unread site feedback'
            : 'Site feedback inbox is clear',
      href: '/admin/feedback',
      icon: 'feedback',
      label: 'Unread site feedback',
      shortLabel: 'Feedback',
    },
  ]

  const draftItem: AttentionItem = {
    count: draftLessons,
    description:
      draftLessons == null
        ? 'Draft lesson count unavailable'
        : draftLessons > 0
          ? 'Lessons not yet visible to students'
          : 'Every lesson is published',
    href: '/admin/courses/drafts',
    icon: 'pencil',
    label: 'Draft lessons',
    shortLabel: 'Drafts',
  }

  const snapshotItems: SnapshotItem[] = [
    {
      actionHref:
        stats.activeStudents === 0 ? '/admin/classrooms' : undefined,
      actionLabel: stats.activeStudents === 0 ? 'View enrollments' : undefined,
      description:
        stats.activeStudents == null
          ? 'Activity data unavailable'
          : stats.activeStudents === 0
            ? 'No students active in the last 7 days'
            : 'Unique students active · Last 7 days',
      label: 'Active learners',
      value: stats.activeStudents,
    },
    {
      description: 'Enrollment records · All time',
      label: 'Enrollments',
      value: managementCounts?.classroomEnrollmentsTotal ?? null,
      actionHref:
        (managementCounts?.classroomEnrollmentsTotal ?? 0) === 0
          ? '/admin/classrooms'
          : undefined,
      actionLabel:
        (managementCounts?.classroomEnrollmentsTotal ?? 0) === 0
          ? 'Open classrooms'
          : undefined,
    },
    {
      description: !contentHealth.available
        ? 'Completion data unavailable'
        : stats.avgCompletion == null
          ? 'Insufficient data — appears once lessons are started'
          : 'All-time completion of started lessons',
      label: 'Completion rate',
      suffix: stats.avgCompletion == null ? undefined : '%',
      value:
        contentHealth.available && stats.avgCompletion != null
          ? Math.round(stats.avgCompletion * 100)
          : null,
      actionHref:
        contentHealth.available && stats.avgCompletion == null
          ? '/admin/student-performance'
          : undefined,
      actionLabel:
        contentHealth.available && stats.avgCompletion == null
          ? 'Review student performance'
          : undefined,
    },
    {
      description:
        stats.publishedLessons == null
          ? 'Lesson count unavailable'
          : 'Available to students',
      label: 'Published lessons',
      value: stats.publishedLessons,
      actionHref: '/admin/courses',
      actionLabel: stats.publishedLessons === 0 ? 'Publish a lesson' : undefined,
    },
  ]

  const workspaceItems: WorkspaceItem[] = [
    {
      description: `${formatAvailableCount(managementCounts?.coursesTotal, 'course')} · ${formatAvailableCount(managementCounts?.lessonsTotal, 'lesson')}`,
      href: '/admin/courses',
      icon: 'graduation',
      title: 'Courses',
    },
    {
      description: `${formatAvailableCount(managementCounts?.classroomsTotal, 'classroom')} · ${formatAvailableCount(managementCounts?.classroomEnrollmentsTotal, 'enrollment')}`,
      href: '/admin/classrooms',
      icon: 'people',
      title: 'Classrooms',
    },
    {
      description: `${formatAvailableCount(managementCounts?.quizzesTotal, 'quiz', 'quizzes')} · ${formatAvailableCount(managementCounts?.quizQuestionsTotal, 'question')}`,
      href: '/admin/quiz-bank',
      icon: 'clipboard',
      secondary: { href: '/admin/question-bank', label: 'Question bank' },
      title: 'Quizzes & Questions',
    },
    {
      description:
        managementCounts?.pagesTotal == null
          ? 'Pages · users · permissions'
          : `${formatCount(managementCounts.pagesTotal, 'page')} · users · permissions`,
      href: '/admin/site-management',
      icon: 'gear',
      title: 'Site Administration',
    },
  ]

  const lowCompletionItems: HealthItem[] = contentHealth.lowCompletion.map((item) => ({
    href: `/admin/lessons/${item.id}/edit`,
    id: item.id,
    metric: `${Math.round(item.rate * 100)}% complete`,
    title: item.title,
  }))
  const highQuestionItems: HealthItem[] = contentHealth.highQuestions.map((item) => ({
    href: `/admin/lessons/${item.id}/edit`,
    id: item.id,
    metric: formatCount(item.count, 'question'),
    title: item.title,
  }))
  const lowHelpfulnessItems: HealthItem[] = contentHealth.lowHelpfulness.map((item) => ({
    href: `/admin/lessons/${item.id}/edit`,
    id: item.id,
    metric: `${item.rating.toFixed(1)} / 4`,
    title: item.title,
  }))

  const activePeriod = reportingGateway.activePeriod
  const latestSnapshot = reportingGateway.latestSnapshot
  const latestActiveLearners = stats.activeStudents

  const activityItems: ActivityItem[] = []
  if (managementCounts?.lastLessonUpdatedAt) {
    const time = formatRelativeTime(managementCounts.lastLessonUpdatedAt)
    if (time) {
      activityItems.push({
        href: '/admin/courses',
        label: 'Lesson content was updated',
        time,
      })
    }
  }
  if (reportingGateway.available && latestSnapshot?.createdAt) {
    const time = formatRelativeTime(latestSnapshot.createdAt)
    if (time) {
      activityItems.push({
        href: '/admin/collections/reporting-snapshots',
        label: `Reporting snapshot ${latestSnapshot.versionLabel || latestSnapshot.label || 'captured'}`,
        time,
      })
    }
  }

  return (
    <Gutter>
      <main className={styles.dashboard}>
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.pageEyebrow}>
              NSF CURE SBP <span aria-hidden="true">/</span> Administration
            </p>
            <h1 className={styles.pageTitle}>Overview</h1>
            <p className={styles.pageIntro}>
              Monitor program activity, manage learning content, and review student engagement.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link className={styles.primaryAction} href="/admin/courses">
              Manage courses
              <Arrow />
            </Link>
            <Link className={styles.textAction} href="/admin/student-performance">
              Student performance
              <Arrow />
            </Link>
          </div>
        </header>

        <AttentionPanel drafts={draftItem} items={responseItems} />

        <section
          aria-labelledby="snapshot-heading"
          className={`${styles.panel} ${styles.snapshotPanel}`}
        >
          <div className={styles.sectionHeading}>
            <h2 className={styles.panelTitle} id="snapshot-heading">
              Program overview
            </h2>
            <p>Last 7 days unless noted</p>
          </div>
          <div className={styles.snapshotGrid}>
            {snapshotItems.map((item) => (
              <SnapshotCard item={item} key={item.label} />
            ))}
          </div>
        </section>

        <section
          aria-labelledby="workspaces-heading"
          className={`${styles.panel} ${styles.workspacesPanel}`}
        >
          <div className={styles.sectionHeading}>
            <h2 className={styles.panelTitle} id="workspaces-heading">
              Workspaces
            </h2>
            <p>Manage program operations</p>
          </div>
          <div className={styles.workspaceGrid}>
            {workspaceItems.map((item) => (
              <WorkspaceCard item={item} key={item.title} />
            ))}
          </div>
        </section>

        {activityItems.length > 0 ? (
          <section
            aria-labelledby="activity-heading"
            className={`${styles.panel} ${styles.activityPanel}`}
          >
            <div className={styles.sectionHeading}>
              <h2 className={styles.panelTitle} id="activity-heading">
                Recent activity
              </h2>
              <p>Verified events from this program</p>
            </div>
            <ul className={styles.activityList}>
              {activityItems.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link className={styles.activityRow} href={item.href}>
                    <span className={styles.activityLabel}>{item.label}</span>
                    <time className={styles.activityTime}>{item.time}</time>
                    <DashboardIcon name="chevron" size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className={styles.bottomGrid}>
          <section
            aria-labelledby="health-heading"
            className={`${styles.panel} ${styles.healthPanel}`}
          >
            <div className={styles.sectionHeading}>
              <h2 className={styles.panelTitle} id="health-heading">
                Content health
              </h2>
              <p>Lessons that may need a closer look</p>
            </div>
            <div className={styles.healthList}>
              <HealthSignal
                available={contentHealth.available}
                description="Lowest completion among started lessons"
                emptyAction={{ href: '/admin/student-performance', label: 'Open student performance' }}
                icon="check"
                items={lowCompletionItems}
                title="Low completion"
              />
              <HealthSignal
                available={contentHealth.available}
                description="Highest student question volume"
                emptyAction={{
                  href: '/admin/collections/questions?where[status][equals]=open',
                  label: 'Review open questions',
                }}
                icon="feedback"
                items={highQuestionItems}
                title="High question volume"
              />
              <HealthSignal
                available={contentHealth.available}
                description="Lowest helpfulness ratings"
                emptyAction={{ href: '/admin/courses', label: 'Review published lessons' }}
                icon="thumb"
                items={lowHelpfulnessItems}
                title="Low helpfulness"
              />
            </div>
          </section>

          <section
            aria-labelledby="reporting-heading"
            className={`${styles.panel} ${styles.reportingPanel}`}
          >
            <div className={styles.sectionHeading}>
              <h2 className={styles.panelTitle} id="reporting-heading">
                NSF reporting
              </h2>
              <p>Track cohort metrics and prepare reports</p>
            </div>
            <div className={styles.reportingPeriod}>
              <span>Active reporting period</span>
              <strong>
                {reportingGateway.available
                  ? (activePeriod?.label ?? 'No active period')
                  : 'Reporting data unavailable'}
              </strong>
              <p>
                {!reportingGateway.available
                  ? 'Refresh before relying on reporting status.'
                  : activePeriod
                    ? (formatDateRange(activePeriod.startDate, activePeriod.endDate) ??
                      'Dates not set')
                    : 'Choose a reporting period to scope exports and snapshots.'}
              </p>
              {reportingGateway.available && !activePeriod ? (
                <Link className={styles.reportingEmptyAction} href="/admin/collections/reporting-periods">
                  Configure reporting periods
                  <Arrow />
                </Link>
              ) : null}
            </div>
            <div className={styles.reportingStats}>
              <div>
                <span>RPPR drafts</span>
                <strong>{reportingGateway.rpprDraftCount ?? '—'}</strong>
                <small>
                  {reportingGateway.rpprDraftCount == null
                    ? 'Data unavailable'
                    : reportingGateway.rpprDraftCount === 0
                      ? 'None in progress'
                      : 'In progress'}
                </small>
              </div>
              <div>
                <span>Latest snapshot</span>
                <strong>
                  {reportingGateway.available
                    ? latestSnapshot?.versionLabel || latestSnapshot?.label || 'None yet'
                    : '—'}
                </strong>
                <small>
                  {!reportingGateway.available
                    ? 'Data unavailable'
                    : latestSnapshot
                      ? formatRelativeTime(latestSnapshot.createdAt)
                      : 'No snapshots generated'}
                </small>
              </div>
              <div>
                <span>Active learners</span>
                <strong>{latestActiveLearners ?? '—'}</strong>
                <small>{latestActiveLearners == null ? 'Data unavailable' : 'Last 7 days'}</small>
              </div>
            </div>
            <div className={styles.reportingActions}>
              <Link className={styles.primaryAction} href="/admin/reporting">
                Open reporting suite
                <Arrow />
              </Link>
              <Link href="/admin/collections/reporting-periods">
                Reporting periods
                <Arrow />
              </Link>
              <Link href="/admin/collections/rppr-reports">
                RPPR drafts
                <Arrow />
              </Link>
              <Link href="/admin/collections/reporting-snapshots">
                Snapshots
                <Arrow />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </Gutter>
  )
}
