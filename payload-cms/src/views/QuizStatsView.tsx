'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Stats = {
  count: number
  mean: number | null
  median: number | null
  min: number | null
  max: number | null
  range: number | null
  stdDev: number | null
}

type AttemptRow = {
  id: string | number
  userId: string | number | null
  userLabel: string | null
  userEmail: string | null
  score: number | null
  maxScore: number | null
  scorePercent: number | null
  durationSec: number | null
  startedAt: string | null
  completedAt: string | null
}

type Payload = {
  quiz: { id: string | number; title: string | null; description: string | null }
  attemptCount: number
  uniqueStudentCount: number
  scorePercent: Stats
  scoreRaw: Stats
  durationSec: Stats
  attempts: AttemptRow[]
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

const statCellStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-panel-bg-muted)',
  padding: '12px 14px',
}

const formatStat = (value: number | null, suffix = '') =>
  value == null || Number.isNaN(value) ? '—' : `${value}${suffix}`

const formatSeconds = (sec: number | null) => {
  if (sec == null || !Number.isFinite(sec) || sec <= 0) return '—'
  const total = Math.round(sec)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
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

const StatGrid = ({ title, stats, suffix = '' }: { title: string; stats: Stats; suffix?: string }) => (
  <div style={{ display: 'grid', gap: 8 }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>{title}</div>
    <div
      style={{
        display: 'grid',
        gap: 10,
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      }}
    >
      <div style={statCellStyle}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
          Mean
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)' }}>
          {formatStat(stats.mean, suffix)}
        </div>
      </div>
      <div style={statCellStyle}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
          Median
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)' }}>
          {formatStat(stats.median, suffix)}
        </div>
      </div>
      <div style={statCellStyle}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
          Range
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cpp-ink)' }}>
          {stats.min != null && stats.max != null
            ? `${stats.min}${suffix} – ${stats.max}${suffix}`
            : '—'}
        </div>
      </div>
      <div style={statCellStyle}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
          Std deviation
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)' }}>
          {formatStat(stats.stdDev, suffix)}
        </div>
      </div>
    </div>
  </div>
)

export default function QuizStatsView({ quizId }: { quizId: string }) {
  const [data, setData] = useState<Payload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/staff/quiz-stats?quizId=${encodeURIComponent(quizId)}`,
          { credentials: 'include' },
        )
                if (res.status === 401 && typeof window !== 'undefined') {
                  window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
                  return
                }
        if (!res.ok) {
          throw new Error(res.status === 403 ? 'You do not have access.' : 'Unable to load stats.')
        }
        const payload = (await res.json()) as Payload
        if (!cancelled) setData(payload)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load stats.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [quizId])

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: '#c6982f', fontWeight: 800 }}>
          Quiz Statistics
        </div>
        <h1 style={{ margin: '6px 0 8px', fontSize: 28, lineHeight: 1.15, color: '#1553cf' }}>
          {data?.quiz.title ?? 'Quiz'}
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--cpp-muted)', fontSize: 13 }}>
            {data ? `${data.attemptCount} attempts · ${data.uniqueStudentCount} unique students` : ''}
          </span>
          <Link
            href="/admin/quiz-bank"
            style={{
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--admin-surface-border)',
              background: 'var(--admin-chip-bg)',
              color: 'var(--cpp-ink)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Back to Quiz Bank
          </Link>
          {data ? (
            <Link
              href={`/admin/quizzes/${data.quiz.id}/edit`}
              style={{
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--admin-surface-border)',
                background: 'var(--admin-chip-bg)',
                color: 'var(--cpp-ink)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Edit quiz
            </Link>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div style={{ ...sectionStyle, color: 'var(--cpp-muted)' }}>Loading attempt data…</div>
      ) : error ? (
        <div style={{ ...sectionStyle, color: '#b91c1c' }}>{error}</div>
      ) : data == null ? null : data.attemptCount === 0 ? (
        <div style={{ ...sectionStyle, color: 'var(--cpp-muted)', textAlign: 'center' }}>
          No attempts yet for this quiz.
        </div>
      ) : (
        <>
          <div style={{ ...sectionStyle, display: 'grid', gap: 18 }}>
            <StatGrid title="Score (percent)" stats={data.scorePercent} suffix="%" />
            <StatGrid title="Score (raw points)" stats={data.scoreRaw} />
            <StatGrid title="Duration (seconds)" stats={data.durationSec} suffix="s" />
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)', marginBottom: 10 }}>
              Recent attempts
            </div>
            <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--admin-surface-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--admin-panel-bg-muted)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                      Student
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                      Score
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                      Percent
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
                  {data.attempts.map((row) => (
                    <tr key={String(row.id)} style={{ borderTop: '1px solid var(--admin-surface-border)' }}>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--cpp-ink)' }}>
                          {row.userLabel || row.userEmail || (row.userId != null ? `Student #${row.userId}` : 'Unknown')}
                        </div>
                        {row.userEmail && row.userLabel ? (
                          <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>{row.userEmail}</div>
                        ) : null}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        {row.score != null && row.maxScore != null ? `${row.score} / ${row.maxScore}` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        {row.scorePercent != null ? `${row.scorePercent}%` : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        {formatSeconds(row.durationSec)}
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--cpp-muted)' }}>
                        {formatDate(row.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
