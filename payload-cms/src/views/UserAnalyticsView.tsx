'use client'

import React, { useEffect, useMemo, useState } from 'react'

type StudentRow = {
  id: string | number
  email: string
  fullName: string | null
  loginCount: number
  lastLoginAt: string | null
  lastSeenAt: string | null
  totalActiveSeconds: number
  currentStreak: number
}

type AttemptRow = {
  id: string | number
  quizId?: string | number | null
  quizTitle?: string | null
  problemSetId?: string | number | null
  problemSetTitle?: string | null
  score: number | null
  maxScore: number | null
  durationSec: number | null
  startedAt: string | null
  completedAt: string | null
}

type DetailPayload = {
  account: {
    id: string | number
    email: string
    fullName: string | null
    organizationLabel: string | null
    createdAt: string | null
    loginCount: number
    lastLoginAt: string | null
    lastSeenAt: string | null
    totalActiveSeconds: number
    currentStreak: number
    longestStreak: number
  }
  totals: {
    quizAttemptCount: number
    quizDurationSec: number
    quizAveragePercent: number | null
    problemAttemptCount: number
    problemDurationSec: number
    problemAveragePercent: number | null
    lessonsCompleted: number
    lessonsTouched: number
  }
  quizAttempts: AttemptRow[]
  problemAttempts: AttemptRow[]
}

const shellStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '28px 20px 64px',
  display: 'grid',
  gap: 18,
}

const heroStyle: React.CSSProperties = {
  borderRadius: 18,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-hero-bg)',
  padding: '18px 20px',
  boxShadow: '0 8px 24px rgba(19, 80, 191, 0.12)',
}

const sectionStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-panel-bg)',
  padding: 16,
  boxShadow: '0 1px 0 rgba(18, 65, 147, 0.08)',
}

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-panel-bg-muted)',
  padding: '14px 14px 12px',
}

const formatSeconds = (sec: number | null | undefined) => {
  if (sec == null || !Number.isFinite(sec) || sec <= 0) return '—'
  const total = Math.round(sec)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

const formatPercent = (value: number | null) =>
  value == null || Number.isNaN(value) ? '—' : `${value.toFixed(1)}%`

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div style={cardStyle}>
    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
      {label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)', marginTop: 6 }}>{value}</div>
    {hint ? (
      <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>{hint}</div>
    ) : null}
  </div>
)

export default function UserAnalyticsView() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [detail, setDetail] = useState<DetailPayload | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setListLoading(true)
      setListError(null)
      try {
        const res = await fetch('/api/staff/user-analytics/list', { credentials: 'include' })
                if (res.status === 401 && typeof window !== 'undefined') {
                  window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
                  return
                }
        if (!res.ok) {
          throw new Error(res.status === 403 ? 'You do not have access.' : 'Unable to load students.')
        }
        const data = (await res.json()) as { students: StudentRow[] }
        if (!cancelled) {
          setStudents(Array.isArray(data.students) ? data.students : [])
        }
      } catch (err) {
        if (!cancelled) setListError(err instanceof Error ? err.message : 'Unable to load students.')
      } finally {
        if (!cancelled) setListLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedId == null) {
      setDetail(null)
      return
    }
    let cancelled = false
    const load = async () => {
      setDetailLoading(true)
      setDetailError(null)
      try {
        const res = await fetch(
          `/api/staff/user-analytics?userId=${encodeURIComponent(String(selectedId))}`,
          { credentials: 'include' },
        )
                if (res.status === 401 && typeof window !== 'undefined') {
                  window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
                  return
                }
        if (!res.ok) {
          throw new Error('Unable to load this student.')
        }
        const data = (await res.json()) as DetailPayload
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) setDetailError(err instanceof Error ? err.message : 'Unable to load student.')
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) => {
      const name = (s.fullName ?? '').toLowerCase()
      const email = (s.email ?? '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [students, search])

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: '#c6982f', fontWeight: 800 }}>
          Per-Student Analytics
        </div>
        <h1 style={{ margin: '6px 0 8px', fontSize: 28, lineHeight: 1.15, color: '#1553cf' }}>
          User Analytics
        </h1>
        <p style={{ margin: 0, color: 'var(--cpp-muted)', maxWidth: 720, lineHeight: 1.55 }}>
          Pick a student to inspect their sign-in history, time spent in the app, and per-attempt
          performance on quizzes and problem sets.
        </p>
      </div>

      <div style={{ ...sectionStyle, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            style={{
              flex: '1 1 280px',
              minWidth: 220,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--admin-surface-border)',
              background: 'var(--admin-panel-bg-muted)',
              color: 'var(--cpp-ink)',
              fontSize: 14,
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
            {listLoading
              ? 'Loading students…'
              : `${filteredStudents.length} of ${students.length} students`}
          </div>
        </div>
        {listError ? (
          <div style={{ color: '#b91c1c', fontSize: 13 }}>{listError}</div>
        ) : null}
        <div style={{ maxHeight: 240, overflowY: 'auto', borderRadius: 10, border: '1px solid var(--admin-surface-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--admin-panel-bg-muted)' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                  Name
                </th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                  Email
                </th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                  Logins
                </th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                  Active time
                </th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                  Last seen
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const isSelected = selectedId === s.id
                return (
                  <tr
                    key={String(s.id)}
                    onClick={() => setSelectedId(s.id)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(21, 83, 207, 0.08)' : 'transparent',
                      borderTop: '1px solid var(--admin-surface-border)',
                    }}
                  >
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--cpp-ink)' }}>
                      {s.fullName || '—'}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--cpp-muted)' }}>{s.email}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{s.loginCount}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      {formatSeconds(s.totalActiveSeconds)}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--cpp-muted)' }}>
                      {formatDate(s.lastSeenAt)}
                    </td>
                  </tr>
                )
              })}
              {!listLoading && filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: '14px', textAlign: 'center', color: 'var(--cpp-muted)' }}
                  >
                    No students match.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId != null ? (
        <div style={sectionStyle}>
          {detailLoading ? (
            <div style={{ color: 'var(--cpp-muted)' }}>Loading student…</div>
          ) : detailError ? (
            <div style={{ color: '#b91c1c' }}>{detailError}</div>
          ) : detail ? (
            <div style={{ display: 'grid', gap: 18 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>
                  Selected student
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)', marginTop: 4 }}>
                  {detail.account.fullName || detail.account.email}
                </div>
                <div style={{ fontSize: 13, color: 'var(--cpp-muted)' }}>
                  {detail.account.email}
                  {detail.account.organizationLabel ? ` · ${detail.account.organizationLabel}` : ''}
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <Stat label="Total logins" value={String(detail.account.loginCount)} hint={`Last: ${formatDate(detail.account.lastLoginAt)}`} />
                <Stat label="Active time in app" value={formatSeconds(detail.account.totalActiveSeconds)} hint="Accumulated from minute heartbeats" />
                <Stat label="Last seen" value={formatDate(detail.account.lastSeenAt)} />
                <Stat label="Current streak" value={`${detail.account.currentStreak} days`} hint={`Longest: ${detail.account.longestStreak} days`} />
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <Stat
                  label="Time on quizzes"
                  value={formatSeconds(detail.totals.quizDurationSec)}
                  hint={`${detail.totals.quizAttemptCount} attempts · avg ${formatPercent(detail.totals.quizAveragePercent)}`}
                />
                <Stat
                  label="Time on problems"
                  value={formatSeconds(detail.totals.problemDurationSec)}
                  hint={`${detail.totals.problemAttemptCount} attempts · avg ${formatPercent(detail.totals.problemAveragePercent)}`}
                />
                <Stat
                  label="Lessons completed"
                  value={`${detail.totals.lessonsCompleted}`}
                  hint={`${detail.totals.lessonsTouched} touched`}
                />
              </div>

              <AttemptsTable
                title="Recent quiz attempts"
                rows={detail.quizAttempts}
                titleAccessor={(r) => r.quizTitle ?? `Quiz #${r.quizId ?? '?'}`}
              />
              <AttemptsTable
                title="Recent problem-set attempts"
                rows={detail.problemAttempts}
                titleAccessor={(r) => r.problemSetTitle ?? `Set #${r.problemSetId ?? '?'}`}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ ...sectionStyle, color: 'var(--cpp-muted)', textAlign: 'center', padding: '28px' }}>
          Select a student above to see their analytics.
        </div>
      )}
    </div>
  )
}

function AttemptsTable({
  title,
  rows,
  titleAccessor,
}: {
  title: string
  rows: AttemptRow[]
  titleAccessor: (row: AttemptRow) => string
}) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)', marginBottom: 8 }}>{title}</div>
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--admin-surface-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--admin-panel-bg-muted)' }}>
              <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                Title
              </th>
              <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                Score
              </th>
              <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                Duration
              </th>
              <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                Completed
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '14px', textAlign: 'center', color: 'var(--cpp-muted)' }}>
                  No attempts yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={String(r.id)} style={{ borderTop: '1px solid var(--admin-surface-border)' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--cpp-ink)' }}>{titleAccessor(r)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                    {r.score != null && r.maxScore != null ? `${r.score} / ${r.maxScore}` : '—'}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatSeconds(r.durationSec)}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--cpp-muted)' }}>{formatDate(r.completedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
