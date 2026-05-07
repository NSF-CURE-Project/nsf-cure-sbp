'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Stats = {
  count: number
  mean: number | null
  median: number | null
  stdDev: number | null
}

type Pair = {
  studentId: string
  fullName: string | null
  email: string | null
  pre: number
  post: number
  delta: number
  normalizedGain: number | null
}

type Payload = {
  pair: {
    id: string | number
    title: string
    description: string | null
    preQuizId: string | number | null
    postQuizId: string | number | null
    classroomId: string | number | null
  }
  summary: {
    preCount: number
    postCount: number
    matchedCount: number
    preStats: Stats
    postStats: Stats
    deltaStats: Stats
    normalizedGain: Stats
    cohensD: number | null
  }
  pairs: Pair[]
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
}

const statCellStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-panel-bg-muted)',
  padding: '12px 14px',
}

const fmt = (value: number | null, suffix = '') =>
  value == null || Number.isNaN(value) ? '—' : `${value}${suffix}`

const interpretGain = (g: number | null) => {
  if (g == null) return null
  if (g >= 0.7) return { label: 'High', tone: '#127455' }
  if (g >= 0.3) return { label: 'Medium', tone: '#127455' }
  if (g >= 0.0) return { label: 'Low', tone: '#b45309' }
  return { label: 'Negative', tone: '#b91c1c' }
}

const interpretD = (d: number | null) => {
  if (d == null) return null
  const m = Math.abs(d)
  if (m >= 0.8) return { label: 'Large effect', tone: '#127455' }
  if (m >= 0.5) return { label: 'Medium effect', tone: '#127455' }
  if (m >= 0.2) return { label: 'Small effect', tone: '#b45309' }
  return { label: 'Negligible', tone: '#475569' }
}

export default function PrePostDetailView({ id }: { id: string }) {
  const [data, setData] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/staff/pre-post/detail?id=${encodeURIComponent(id)}`, {
          credentials: 'include',
        })
                if (res.status === 401 && typeof window !== 'undefined') {
                  window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
                  return
                }
        if (!res.ok) {
          throw new Error(res.status === 403 ? 'You do not have access.' : 'Unable to load pre/post pair.')
        }
        const payload = (await res.json()) as Payload
        if (!cancelled) setData(payload)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const gainInterp = data ? interpretGain(data.summary.normalizedGain.mean) : null
  const dInterp = data ? interpretD(data.summary.cohensD) : null

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: '#c6982f', fontWeight: 800 }}>
          Pre/Post Analysis
        </div>
        <h1 style={{ margin: '6px 0 6px', fontSize: 26, color: '#1553cf' }}>{data?.pair.title ?? 'Loading…'}</h1>
        {data?.pair.description ? (
          <p style={{ margin: '0 0 6px', color: 'var(--cpp-ink)' }}>{data.pair.description}</p>
        ) : null}
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <Link
            href="/admin/pre-post"
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
            All pairs
          </Link>
          {data ? (
            <Link
              href={`/admin/collections/pre-post-assessments/${data.pair.id}`}
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
              Edit pair
            </Link>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div style={{ ...sectionStyle, color: 'var(--cpp-muted)' }}>Loading…</div>
      ) : error ? (
        <div style={{ ...sectionStyle, color: '#b91c1c' }}>{error}</div>
      ) : !data ? null : data.summary.matchedCount === 0 ? (
        <div style={{ ...sectionStyle, color: 'var(--cpp-muted)', textAlign: 'center' }}>
          No matched students yet. {data.summary.preCount} pre attempt{data.summary.preCount === 1 ? '' : 's'} and{' '}
          {data.summary.postCount} post attempt{data.summary.postCount === 1 ? '' : 's'} on file, but
          none from the same student.
        </div>
      ) : (
        <>
          <div style={{ ...sectionStyle, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Matched students
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {data.summary.matchedCount}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                of {data.summary.preCount} pre / {data.summary.postCount} post
              </div>
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Mean pre score
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {fmt(data.summary.preStats.mean, '%')}
              </div>
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Mean post score
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {fmt(data.summary.postStats.mean, '%')}
              </div>
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Mean change
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {fmt(data.summary.deltaStats.mean, '%')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                σ = {fmt(data.summary.deltaStats.stdDev)}
              </div>
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Hake’s normalized gain ⟨g⟩
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {fmt(data.summary.normalizedGain.mean)}
              </div>
              {gainInterp ? (
                <div style={{ fontSize: 12, color: gainInterp.tone, fontWeight: 700, marginTop: 2 }}>
                  {gainInterp.label}
                </div>
              ) : null}
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Cohen’s d (paired)
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {fmt(data.summary.cohensD)}
              </div>
              {dInterp ? (
                <div style={{ fontSize: 12, color: dInterp.tone, fontWeight: 700, marginTop: 2 }}>
                  {dInterp.label}
                </div>
              ) : null}
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)', marginBottom: 10 }}>
              Per-student pairs
            </div>
            <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--admin-surface-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--admin-panel-bg-muted)' }}>
                    <th style={th()}>Student</th>
                    <th style={{ ...th(), textAlign: 'right' }}>Pre</th>
                    <th style={{ ...th(), textAlign: 'right' }}>Post</th>
                    <th style={{ ...th(), textAlign: 'right' }}>Δ</th>
                    <th style={{ ...th(), textAlign: 'right' }}>⟨g⟩</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pairs.map((p) => (
                    <tr key={p.studentId} style={{ borderTop: '1px solid var(--admin-surface-border)' }}>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--cpp-ink)' }}>
                          {p.fullName || p.email || `#${p.studentId}`}
                        </div>
                        {p.fullName && p.email ? (
                          <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>{p.email}</div>
                        ) : null}
                      </td>
                      <td style={{ ...td(), textAlign: 'right' }}>{p.pre.toFixed(1)}%</td>
                      <td style={{ ...td(), textAlign: 'right' }}>{p.post.toFixed(1)}%</td>
                      <td
                        style={{
                          ...td(),
                          textAlign: 'right',
                          color: p.delta > 0 ? '#127455' : p.delta < 0 ? '#b91c1c' : 'var(--cpp-muted)',
                          fontWeight: 600,
                        }}
                      >
                        {p.delta > 0 ? '+' : ''}
                        {p.delta.toFixed(1)}%
                      </td>
                      <td style={{ ...td(), textAlign: 'right' }}>
                        {p.normalizedGain == null ? '—' : p.normalizedGain.toFixed(2)}
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

const th = (): React.CSSProperties => ({
  textAlign: 'left',
  padding: '8px 10px',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  color: 'var(--cpp-muted)',
})

const td = (): React.CSSProperties => ({
  padding: '8px 10px',
  color: 'var(--cpp-muted)',
  fontVariantNumeric: 'tabular-nums',
})
