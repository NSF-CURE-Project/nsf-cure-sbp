'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type ConceptRow = {
  id: string | number
  name: string
  slug: string
  subject: string | null
  bloomLevel: string | null
  description: string | null
  questionCount: number
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

export default function ConceptLibraryView() {
  const [concepts, setConcepts] = useState<ConceptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/staff/concept-list', { credentials: 'include' })
        if (!res.ok) {
          throw new Error(res.status === 403 ? 'You do not have access.' : 'Unable to load concepts.')
        }
        const data = (await res.json()) as { concepts: ConceptRow[] }
        if (!cancelled) setConcepts(Array.isArray(data.concepts) ? data.concepts : [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load concepts.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return concepts.filter((c) => {
      if (subject && c.subject !== subject) return false
      if (!q) return true
      return c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
    })
  }, [concepts, search, subject])

  const subjects = useMemo(() => {
    const set = new Set<string>()
    concepts.forEach((c) => c.subject && set.add(c.subject))
    return Array.from(set)
  }, [concepts])

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: '#c6982f', fontWeight: 800 }}>
          Concept Library
        </div>
        <h1 style={{ margin: '6px 0 8px', fontSize: 28, lineHeight: 1.15, color: '#1553cf' }}>
          Concepts
        </h1>
        <p style={{ margin: 0, color: 'var(--cpp-muted)', maxWidth: 720, lineHeight: 1.55 }}>
          The atomic learning concepts that anchor mastery, remediation, and analytics. Tag
          questions, lessons, and problems with concepts so every per-student or per-cohort metric
          can be sliced by topic.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Link
            href="/admin/collections/concepts/create"
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
            New concept
          </Link>
          <Link
            href="/admin/collections/concepts"
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
            Open collection editor
          </Link>
        </div>
      </div>

      <div style={{ ...sectionStyle, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description"
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
          {subjects.length ? (
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--admin-surface-border)',
                background: 'var(--admin-panel-bg-muted)',
                color: 'var(--cpp-ink)',
                fontSize: 14,
              }}
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : null}
          <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
            {loading ? 'Loading…' : `${filtered.length} of ${concepts.length} concepts`}
          </div>
        </div>
        {error ? <div style={{ color: '#b91c1c', fontSize: 13 }}>{error}</div> : null}
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--admin-surface-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--admin-panel-bg-muted)' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                  Concept
                </th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                  Subject
                </th>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                  Bloom
                </th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                  Questions tagged
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={String(c.id)} style={{ borderTop: '1px solid var(--admin-surface-border)' }}>
                  <td style={{ padding: '8px 10px' }}>
                    <Link
                      href={`/admin/concepts/${encodeURIComponent(c.slug)}`}
                      style={{ color: 'var(--cpp-ink)', fontWeight: 600, textDecoration: 'none' }}
                    >
                      {c.name}
                    </Link>
                    {c.description ? (
                      <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>
                        {c.description.length > 90 ? c.description.slice(0, 90) + '…' : c.description}
                      </div>
                    ) : null}
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--cpp-muted)' }}>{c.subject ?? '—'}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--cpp-muted)' }}>{c.bloomLevel ?? '—'}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {c.questionCount}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--cpp-muted)' }}>
                    {concepts.length === 0
                      ? 'No concepts yet. Create one to start tagging questions.'
                      : 'No concepts match the filters.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
