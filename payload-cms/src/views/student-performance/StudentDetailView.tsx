'use client'

import Link from 'next/link'
import React, { useMemo } from 'react'
import { formatPercent } from './shared'

export type StudentDetailClassroom = {
  classroomId: string
  title: string
  joinedAt: string | null
  completionRate: number
  completedLessons: number
  totalLessons: number
  lastActivityAt: string | null
}

export type StudentDetailQuizRow = {
  id: string
  quizTitle: string
  lessonTitle: string
  completedAt: string | null
  scorePercent: number | null
  durationSec: number | null
}

export type StudentDetailLessonRow = {
  id: string
  lessonTitle: string
  completed: boolean
  completedAt: string | null
  updatedAt: string | null
}

type Props = {
  accountId: string
  displayName: string
  email: string | null
  participantType: string | null
  currentStreak: number
  longestStreak: number
  loginCount: number
  lastLoginAt: string | null
  lastSeenAt: string | null
  classrooms: StudentDetailClassroom[]
  quizAttempts: StudentDetailQuizRow[]
  lessonProgress: StudentDetailLessonRow[]
}

const styles = `
  .sdv-shell { display: grid; gap: 14px; padding: 8px 0 0; }
  .sdv-breadcrumb { display: flex; flex-wrap: wrap; gap: 6px; font-size: 12px; color: var(--cpp-muted); align-items: center; }
  .sdv-breadcrumb a { color: #1553cf; text-decoration: none; font-weight: 700; }
  .sdv-breadcrumb a:hover { text-decoration: underline; }
  .sdv-hero { border-radius: 14px; border: 1px solid var(--admin-surface-border); background: var(--admin-hero-bg); padding: 14px 16px; box-shadow: 0 4px 14px rgba(19, 80, 191, 0.08); display: grid; gap: 8px; }
  .sdv-hero__top { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: flex-start; }
  .sdv-eyebrow { font-size: 10.5px; letter-spacing: 0.9px; text-transform: uppercase; color: #c6982f; font-weight: 800; }
  .sdv-title { margin: 0; font-size: 24px; line-height: 1.1; color: #1553cf; letter-spacing: -0.01em; }
  .sdv-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: var(--cpp-muted); }
  .sdv-meta b { color: var(--cpp-ink); font-weight: 700; }
  .sdv-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 800; border: 1px solid; }
  .sdv-pill--blue { color: #1553cf; background: rgba(21,83,207,0.08); border-color: rgba(21,83,207,0.20); }
  .sdv-pill--green { color: #127455; background: rgba(16,185,129,0.10); border-color: rgba(5,150,105,0.22); }
  .sdv-pill--amber { color: #b45309; background: rgba(245,158,11,0.10); border-color: rgba(217,119,6,0.22); }
  .sdv-kpis { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
  .sdv-kpi { border: 1px solid var(--admin-surface-border); background: var(--admin-panel-bg); border-radius: 10px; padding: 10px 12px; box-shadow: 0 1px 0 rgba(18, 65, 147, 0.06); }
  .sdv-kpi__eyebrow { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.7px; font-weight: 800; }
  .sdv-kpi__value { font-size: 24px; font-weight: 900; color: var(--cpp-ink); margin-top: 4px; letter-spacing: -0.01em; }
  .sdv-kpi__detail { font-size: 11.5px; color: var(--cpp-muted); margin-top: 4px; line-height: 1.4; }
  .sdv-grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.95fr); align-items: start; }
  .sdv-card { border: 1px solid var(--admin-surface-border); background: var(--admin-panel-bg); border-radius: 12px; padding: 14px; box-shadow: 0 1px 0 rgba(18, 65, 147, 0.06); }
  .sdv-card__head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 8px; }
  .sdv-card__eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #1553cf; font-weight: 800; }
  .sdv-card__hint { font-size: 11.5px; color: var(--cpp-muted); }
  table.sdv-table { width: 100%; border-collapse: collapse; }
  table.sdv-table th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.7px; color: var(--cpp-muted); padding: 8px 10px; border-bottom: 1px solid var(--admin-surface-border); font-weight: 800; }
  table.sdv-table td { padding: 10px 10px; font-size: 12.5px; color: var(--cpp-ink); border-top: 1px solid rgba(18, 65, 147, 0.06); vertical-align: middle; }
  .sdv-score { font-weight: 900; }
  .sdv-score--high { color: #127455; }
  .sdv-score--mid { color: #b45309; }
  .sdv-score--low { color: #b91c1c; }
  .sdv-score--empty { color: var(--cpp-muted); font-weight: 700; }
  .sdv-progress { display: flex; align-items: center; gap: 8px; }
  .sdv-progress__track { flex: 1; height: 6px; border-radius: 999px; background: rgba(21,83,207,0.10); overflow: hidden; }
  .sdv-progress__fill { height: 100%; background: #1553cf; border-radius: 999px; }
  .sdv-classroom { display: grid; gap: 6px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--admin-surface-border); background: var(--admin-panel-bg-muted); }
  .sdv-classroom + .sdv-classroom { margin-top: 8px; }
  .sdv-classroom__title { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
  .sdv-classroom__name { font-weight: 800; color: var(--cpp-ink); font-size: 13px; }
  .sdv-classroom__meta { font-size: 11.5px; color: var(--cpp-muted); }
  .sdv-empty { font-size: 12.5px; color: var(--cpp-muted); text-align: center; padding: 18px 12px; border: 1px dashed rgba(21,83,207,0.18); background: var(--admin-panel-bg-muted); border-radius: 10px; }
  .sdv-spark { display: block; }
`

const formatDate = (value: string | null): string => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

const formatRelative = (value: string | null): string => {
  if (!value) return 'No activity yet'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No activity yet'
  const diffMs = Date.now() - parsed.getTime()
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

const formatDuration = (seconds: number | null): string => {
  if (seconds == null || Number.isNaN(seconds) || seconds <= 0) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return secs ? `${mins}m ${secs}s` : `${mins}m`
}

const scoreToneClass = (percent: number | null): string => {
  if (percent == null) return 'sdv-score--empty'
  if (percent >= 80) return 'sdv-score--high'
  if (percent >= 60) return 'sdv-score--mid'
  return 'sdv-score--low'
}

const Sparkline = ({ values, height = 40 }: { values: number[]; height?: number }) => {
  if (values.length < 2) {
    return (
      <div
        aria-hidden
        style={{
          height,
          borderRadius: 6,
          background:
            'repeating-linear-gradient(90deg, rgba(21,83,207,0.06) 0 6px, transparent 6px 12px)',
        }}
      />
    )
  }
  const width = 220
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const stepX = width / (values.length - 1)
  const points = values
    .map((value, index) => {
      const x = index * stepX
      const y = height - ((value - min) / span) * (height - 6) - 3
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
  const last = values[values.length - 1]
  const lastX = (values.length - 1) * stepX
  const lastY = height - ((last - min) / span) * (height - 6) - 3
  return (
    <svg
      className="sdv-spark"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Score trend"
      preserveAspectRatio="none"
    >
      <path d={points} fill="none" stroke="#0a89c2" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill="#0a89c2" />
    </svg>
  )
}

const formatParticipant = (value: string | null): string => {
  if (!value) return 'Participant'
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function StudentDetailView({
  accountId,
  displayName,
  email,
  participantType,
  currentStreak,
  longestStreak,
  loginCount,
  lastLoginAt,
  lastSeenAt,
  classrooms,
  quizAttempts,
  lessonProgress,
}: Props) {
  const stats = useMemo(() => {
    const scores = quizAttempts
      .map((row) => row.scorePercent)
      .filter((value): value is number => value != null)
    const sum = scores.reduce((acc, value) => acc + value, 0)
    const average = scores.length ? sum / scores.length : null
    const lastScore = quizAttempts.find((row) => row.scorePercent != null)?.scorePercent ?? null
    const firstScore = [...quizAttempts].reverse().find((row) => row.scorePercent != null)?.scorePercent ?? null
    const trend = lastScore != null && firstScore != null ? lastScore - firstScore : null

    const totalLessons = lessonProgress.length
    const completedLessons = lessonProgress.filter((row) => row.completed).length
    const completionRate = totalLessons ? (completedLessons / totalLessons) * 100 : null

    const sortedSeries = [...quizAttempts]
      .filter((row) => row.scorePercent != null && row.completedAt)
      .sort((a, b) => {
        const at = a.completedAt ? new Date(a.completedAt).getTime() : 0
        const bt = b.completedAt ? new Date(b.completedAt).getTime() : 0
        return at - bt
      })
      .map((row) => row.scorePercent as number)

    return {
      averageScore: average,
      lastScore,
      trend,
      attempts: quizAttempts.length,
      completionRate,
      completedLessons,
      totalLessons,
      sortedSeries,
    }
  }, [quizAttempts, lessonProgress])

  const sortedClassrooms = useMemo(
    () =>
      [...classrooms].sort((a, b) => {
        const at = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
        const bt = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
        return bt - at
      }),
    [classrooms],
  )

  const formatTrend = (value: number | null): { label: string; tone: 'green' | 'red' | 'muted' } => {
    if (value == null) return { label: '—', tone: 'muted' }
    const rounded = Math.round(value * 10) / 10
    if (rounded === 0) return { label: '0.0%', tone: 'muted' }
    return {
      label: rounded > 0 ? `+${rounded.toFixed(1)}%` : `${rounded.toFixed(1)}%`,
      tone: rounded > 0 ? 'green' : 'red',
    }
  }

  const trend = formatTrend(stats.trend)

  return (
    <div className="sdv-shell">
      <style>{styles}</style>

      <div className="sdv-breadcrumb">
        <Link href="/admin/student-performance">Student Performance</Link>
        <span aria-hidden>›</span>
        <span>{displayName}</span>
      </div>

      <div className="sdv-hero">
        <div className="sdv-hero__top">
          <div style={{ minWidth: 0 }}>
            <div className="sdv-eyebrow">Student profile</div>
            <h1 className="sdv-title">{displayName}</h1>
            <div className="sdv-meta" style={{ marginTop: 6 }}>
              <span>{email ?? 'No email on file'}</span>
              <span aria-hidden>·</span>
              <span>{formatParticipant(participantType)}</span>
              {sortedClassrooms.length ? (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    Enrolled in <b>{sortedClassrooms.length}</b> classroom
                    {sortedClassrooms.length === 1 ? '' : 's'}
                  </span>
                </>
              ) : null}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {currentStreak > 0 ? (
              <span className="sdv-pill sdv-pill--green">🔥 {currentStreak}d streak</span>
            ) : null}
            {longestStreak > 0 ? (
              <span className="sdv-pill sdv-pill--blue">Best {longestStreak}d</span>
            ) : null}
            {stats.attempts > 0 ? (
              <span className="sdv-pill sdv-pill--amber">{stats.attempts} attempts</span>
            ) : null}
          </div>
        </div>
        <div className="sdv-meta">
          <span>
            Last login <b>{lastLoginAt ? formatRelative(lastLoginAt) : 'never'}</b>
          </span>
          <span aria-hidden>·</span>
          <span>
            Last seen <b>{lastSeenAt ? formatRelative(lastSeenAt) : 'never'}</b>
          </span>
          <span aria-hidden>·</span>
          <span>
            <b>{loginCount}</b> total logins
          </span>
        </div>
      </div>

      <div className="sdv-kpis">
        <div className="sdv-kpi">
          <div className="sdv-kpi__eyebrow" style={{ color: '#0a89c2' }}>Avg score</div>
          <div className="sdv-kpi__value">{formatPercent(stats.averageScore, '—')}</div>
          <div className="sdv-kpi__detail">
            Last quiz {formatPercent(stats.lastScore, 'no attempts')} · trend{' '}
            <span
              style={{
                color:
                  trend.tone === 'green'
                    ? '#127455'
                    : trend.tone === 'red'
                      ? '#b91c1c'
                      : 'var(--cpp-muted)',
                fontWeight: 800,
              }}
            >
              {trend.label}
            </span>
          </div>
          <div style={{ marginTop: 6 }}>
            <Sparkline values={stats.sortedSeries} />
          </div>
        </div>
        <div className="sdv-kpi">
          <div className="sdv-kpi__eyebrow" style={{ color: '#1553cf' }}>Completion</div>
          <div className="sdv-kpi__value">{formatPercent(stats.completionRate, '0.0%')}</div>
          <div className="sdv-kpi__detail">
            {stats.completedLessons} of {stats.totalLessons} lessons completed.
          </div>
          <div
            aria-hidden
            style={{
              marginTop: 8,
              height: 4,
              borderRadius: 999,
              background: 'rgba(21,83,207,0.10)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.max(0, Math.min(100, stats.completionRate ?? 0))}%`,
                background: '#1553cf',
                borderRadius: 999,
              }}
            />
          </div>
        </div>
        <div className="sdv-kpi">
          <div className="sdv-kpi__eyebrow" style={{ color: '#047857' }}>Engagement</div>
          <div className="sdv-kpi__value">{currentStreak}d</div>
          <div className="sdv-kpi__detail">
            Current streak · best {longestStreak}d · {loginCount} logins
          </div>
        </div>
        <div className="sdv-kpi">
          <div className="sdv-kpi__eyebrow" style={{ color: '#b45309' }}>Attempts</div>
          <div className="sdv-kpi__value">{stats.attempts}</div>
          <div className="sdv-kpi__detail">Quizzes submitted across all classrooms.</div>
        </div>
      </div>

      <div className="sdv-grid">
        <section className="sdv-card">
          <div className="sdv-card__head">
            <span className="sdv-card__eyebrow">Quiz attempts</span>
            <span className="sdv-card__hint">
              {quizAttempts.length} recorded{quizAttempts.length > 10 ? ' · showing latest 10' : ''}
            </span>
          </div>
          {quizAttempts.length === 0 ? (
            <div className="sdv-empty">No quiz attempts yet. Submissions will appear here once the student begins.</div>
          ) : (
            <table className="sdv-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Lesson</th>
                  <th>Score</th>
                  <th>Duration</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {quizAttempts.slice(0, 10).map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 700 }}>{row.quizTitle}</td>
                    <td>{row.lessonTitle}</td>
                    <td className={`sdv-score ${scoreToneClass(row.scorePercent)}`}>
                      {row.scorePercent == null ? '—' : `${row.scorePercent.toFixed(1)}%`}
                    </td>
                    <td>{formatDuration(row.durationSec)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div>{formatDate(row.completedAt)}</div>
                      <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>
                        {formatRelative(row.completedAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="sdv-card">
          <div className="sdv-card__head">
            <span className="sdv-card__eyebrow">Classrooms</span>
            <span className="sdv-card__hint">{sortedClassrooms.length}</span>
          </div>
          {sortedClassrooms.length === 0 ? (
            <div className="sdv-empty">Not enrolled in any classrooms yet.</div>
          ) : (
            <div>
              {sortedClassrooms.map((classroom) => {
                const completion = Math.max(
                  0,
                  Math.min(
                    100,
                    classroom.completionRate <= 1
                      ? classroom.completionRate * 100
                      : classroom.completionRate,
                  ),
                )
                return (
                  <div key={classroom.classroomId} className="sdv-classroom">
                    <div className="sdv-classroom__title">
                      <Link
                        href={`/admin/classrooms/${classroom.classroomId}/students`}
                        className="sdv-classroom__name"
                        style={{ color: '#1553cf', textDecoration: 'none' }}
                      >
                        {classroom.title}
                      </Link>
                      <span className="sdv-classroom__meta">{formatDate(classroom.joinedAt)}</span>
                    </div>
                    <div className="sdv-progress">
                      <div className="sdv-progress__track">
                        <div className="sdv-progress__fill" style={{ width: `${completion}%` }} />
                      </div>
                      <span className="sdv-classroom__meta">
                        {Math.round(completion)}% · {classroom.completedLessons}/{classroom.totalLessons}
                      </span>
                    </div>
                    <div className="sdv-classroom__meta">
                      Last activity {formatRelative(classroom.lastActivityAt)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <section className="sdv-card">
        <div className="sdv-card__head">
          <span className="sdv-card__eyebrow">Lesson progress</span>
          <span className="sdv-card__hint">
            {stats.completedLessons} of {stats.totalLessons} completed
            {lessonProgress.length > 12 ? ' · showing latest 12' : ''}
          </span>
        </div>
        {lessonProgress.length === 0 ? (
          <div className="sdv-empty">No lesson activity yet. Progress entries appear after the first lesson view.</div>
        ) : (
          <table className="sdv-table">
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Status</th>
                <th>Completed</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {lessonProgress.slice(0, 12).map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 700 }}>{row.lessonTitle}</td>
                  <td>
                    <span
                      className={`sdv-pill ${row.completed ? 'sdv-pill--green' : 'sdv-pill--amber'}`}
                    >
                      {row.completed ? 'Completed' : 'In progress'}
                    </span>
                  </td>
                  <td>{formatDate(row.completedAt)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div>{formatDate(row.updatedAt)}</div>
                    <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>
                      {formatRelative(row.updatedAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>
        Account ID <code>{accountId}</code>
      </div>
    </div>
  )
}
