'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Item = {
  id: string | number
  title: string
  preTitle: string | null
  postTitle: string | null
  classroomTitle: string | null
  updatedAt: string | null
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

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
}

export default function PrePostListView() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/staff/pre-post/list', { credentials: 'include' })
        if (!res.ok) {
          throw new Error(res.status === 403 ? 'You do not have access.' : 'Unable to load.')
        }
        const data = (await res.json()) as { items: Item[] }
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : [])
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
  }, [])

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: '#c6982f', fontWeight: 800 }}>
          Pre/Post Workspace
        </div>
        <h1 style={{ margin: '6px 0 6px', fontSize: 28, color: '#1553cf' }}>Pre/Post Assessments</h1>
        <p style={{ margin: 0, color: 'var(--cpp-muted)', maxWidth: 720, lineHeight: 1.55 }}>
          Pair a pre-instruction quiz with a post-instruction quiz to measure how much students
          learned. Each pair produces a normalized-gain (Hake) report so you can quote a clean
          effect size in NSF reporting.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Link
            href="/admin/collections/pre-post-assessments/create"
            style={{
              fontSize: 12,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--admin-surface-border)',
              background: 'var(--admin-chip-primary-bg)',
              color: 'var(--admin-chip-primary-text)',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            New pre/post pair
          </Link>
        </div>
      </div>

      <div style={sectionStyle}>
        {loading ? (
          <div style={{ color: 'var(--cpp-muted)' }}>Loading…</div>
        ) : error ? (
          <div style={{ color: '#b91c1c' }}>{error}</div>
        ) : items.length === 0 ? (
          <div style={{ color: 'var(--cpp-muted)', textAlign: 'center', padding: '20px' }}>
            No pre/post pairs yet. Create one to start measuring gain.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--admin-surface-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--admin-panel-bg-muted)' }}>
                  <th style={th()}>Title</th>
                  <th style={th()}>Pre quiz</th>
                  <th style={th()}>Post quiz</th>
                  <th style={th()}>Classroom</th>
                  <th style={th()}>Updated</th>
                  <th style={th()} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={String(item.id)} style={{ borderTop: '1px solid var(--admin-surface-border)' }}>
                    <td style={{ padding: '8px 10px', color: 'var(--cpp-ink)', fontWeight: 600 }}>{item.title}</td>
                    <td style={td()}>{item.preTitle ?? '—'}</td>
                    <td style={td()}>{item.postTitle ?? '—'}</td>
                    <td style={td()}>{item.classroomTitle ?? 'all classrooms'}</td>
                    <td style={td()}>{formatDate(item.updatedAt)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <Link
                        href={`/admin/pre-post/${item.id}`}
                        style={{
                          fontSize: 11,
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid var(--admin-surface-border)',
                          background: 'var(--admin-chip-bg)',
                          color: 'var(--cpp-ink)',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Analyze
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
})
