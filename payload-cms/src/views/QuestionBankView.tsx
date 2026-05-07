'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import SavedViewsBar from './SavedViewsBar'

type Concept = { id: string | number; name: string; slug: string; subject: string | null }

type QuestionRow = {
  id: string | number
  title: string
  questionType: string | null
  difficulty: string | null
  bloomLevel: string | null
  topic: string | null
  tags: string[]
  conceptIds: Array<string | number>
  usageCount: number
  updatedAt: string | null
  status: string | null
}

const shellStyle: React.CSSProperties = {
  maxWidth: 1280,
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

const filterPill = (active: boolean): React.CSSProperties => ({
  padding: '4px 10px',
  borderRadius: 999,
  border: '1px solid var(--admin-surface-border)',
  background: active ? 'var(--admin-chip-primary-bg)' : 'var(--admin-chip-bg)',
  color: active ? 'var(--admin-chip-primary-text)' : 'var(--cpp-ink)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
})

const TYPES = ['single-select', 'multi-select', 'true-false', 'short-text', 'numeric'] as const
const DIFFICULTIES = ['intro', 'easy', 'medium', 'hard'] as const
const BLOOMS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'] as const

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
}

export default function QuestionBankView() {
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [bloom, setBloom] = useState<string>('')
  const [conceptId, setConceptId] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/staff/question-bank', { credentials: 'include' })
                if (res.status === 401 && typeof window !== 'undefined') {
                  window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
                  return
                }
        if (!res.ok) {
          throw new Error(res.status === 403 ? 'You do not have access.' : 'Unable to load.')
        }
        const data = (await res.json()) as { questions: QuestionRow[]; concepts: Concept[] }
        if (!cancelled) {
          setQuestions(Array.isArray(data.questions) ? data.questions : [])
          setConcepts(Array.isArray(data.concepts) ? data.concepts : [])
        }
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

  const conceptName = (id: string | number) =>
    concepts.find((c) => String(c.id) === String(id))?.name ?? '?'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return questions.filter((row) => {
      if (type && row.questionType !== type) return false
      if (difficulty && row.difficulty !== difficulty) return false
      if (bloom && row.bloomLevel !== bloom) return false
      if (conceptId && !row.conceptIds.some((c) => String(c) === conceptId)) return false
      if (!q) return true
      return (
        row.title.toLowerCase().includes(q) ||
        (row.topic ?? '').toLowerCase().includes(q) ||
        row.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [questions, search, type, difficulty, bloom, conceptId])

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: '#c6982f', fontWeight: 800 }}>
          Question Bank
        </div>
        <h1 style={{ margin: '6px 0 6px', fontSize: 28, color: '#1553cf' }}>All quiz questions</h1>
        <p style={{ margin: 0, color: 'var(--cpp-muted)', maxWidth: 720, lineHeight: 1.55 }}>
          Atomic items that compose every quiz. Filter by type, difficulty, Bloom level, or concept
          tag — then drill into per-question stats to inspect difficulty, discrimination, and
          distractor patterns.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Link
            href="/admin/collections/quiz-questions/create"
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
            New question
          </Link>
          <Link
            href="/admin/concepts"
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
            Concept Library
          </Link>
        </div>
      </div>

      <div style={{ ...sectionStyle, display: 'grid', gap: 12 }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, topic, or tag"
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid var(--admin-surface-border)',
            background: 'var(--admin-panel-bg-muted)',
            color: 'var(--cpp-ink)',
            fontSize: 14,
          }}
        />
        <div style={{ display: 'grid', gap: 8 }}>
          <FacetRow label="Type">
            <button type="button" onClick={() => setType('')} style={filterPill(type === '')}>All</button>
            {TYPES.map((t) => (
              <button key={t} type="button" onClick={() => setType(t)} style={filterPill(type === t)}>
                {t}
              </button>
            ))}
          </FacetRow>
          <FacetRow label="Difficulty">
            <button type="button" onClick={() => setDifficulty('')} style={filterPill(difficulty === '')}>All</button>
            {DIFFICULTIES.map((d) => (
              <button key={d} type="button" onClick={() => setDifficulty(d)} style={filterPill(difficulty === d)}>
                {d}
              </button>
            ))}
          </FacetRow>
          <FacetRow label="Bloom level">
            <button type="button" onClick={() => setBloom('')} style={filterPill(bloom === '')}>All</button>
            {BLOOMS.map((b) => (
              <button key={b} type="button" onClick={() => setBloom(b)} style={filterPill(bloom === b)}>
                {b}
              </button>
            ))}
          </FacetRow>
          {concepts.length ? (
            <FacetRow label="Concept">
              <select
                value={conceptId}
                onChange={(e) => setConceptId(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--admin-surface-border)',
                  background: 'var(--admin-panel-bg-muted)',
                  color: 'var(--cpp-ink)',
                  fontSize: 13,
                }}
              >
                <option value="">All concepts</option>
                {concepts.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FacetRow>
          ) : null}
        </div>
        <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
          {loading ? 'Loading…' : `${filtered.length} of ${questions.length} questions`}
        </div>
        <SavedViewsBar
          scope="question-bank"
          currentState={{ search, type, difficulty, bloom, conceptId }}
          onApply={(s) => {
            setSearch(s.search ?? '')
            setType(s.type ?? '')
            setDifficulty(s.difficulty ?? '')
            setBloom(s.bloom ?? '')
            setConceptId(s.conceptId ?? '')
          }}
        />
        {error ? <div style={{ color: '#b91c1c', fontSize: 13 }}>{error}</div> : null}
      </div>

      <div style={sectionStyle}>
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--admin-surface-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--admin-panel-bg-muted)' }}>
                <th style={th()}>Title</th>
                <th style={th()}>Type</th>
                <th style={th()}>Difficulty</th>
                <th style={th()}>Bloom</th>
                <th style={th()}>Concepts</th>
                <th style={{ ...th(), textAlign: 'right' }}>Used in</th>
                <th style={th()}>Updated</th>
                <th style={th()} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={String(row.id)} style={{ borderTop: '1px solid var(--admin-surface-border)' }}>
                  <td style={{ padding: '8px 10px' }}>
                    <Link
                      href={`/admin/collections/quiz-questions/${row.id}`}
                      style={{ color: 'var(--cpp-ink)', fontWeight: 600, textDecoration: 'none' }}
                    >
                      {row.title}
                    </Link>
                    {row.topic ? (
                      <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>{row.topic}</div>
                    ) : null}
                  </td>
                  <td style={td()}>{row.questionType ?? '—'}</td>
                  <td style={td()}>{row.difficulty ?? '—'}</td>
                  <td style={td()}>{row.bloomLevel ?? '—'}</td>
                  <td style={td()}>
                    {row.conceptIds.length ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {row.conceptIds.slice(0, 3).map((cid) => (
                          <span
                            key={String(cid)}
                            style={{
                              padding: '2px 6px',
                              borderRadius: 6,
                              background: 'var(--admin-chip-bg)',
                              border: '1px solid var(--admin-surface-border)',
                              fontSize: 11,
                            }}
                          >
                            {conceptName(cid)}
                          </span>
                        ))}
                        {row.conceptIds.length > 3 ? (
                          <span style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>+{row.conceptIds.length - 3}</span>
                        ) : null}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--cpp-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ ...td(), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {row.usageCount} quiz{row.usageCount === 1 ? '' : 'zes'}
                  </td>
                  <td style={td()}>{formatDate(row.updatedAt)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                    <Link
                      href={`/admin/question-stats/${row.id}`}
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
                      Stats
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--cpp-muted)' }}>
                    No questions match.
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

const th = (): React.CSSProperties => ({
  textAlign: 'left',
  padding: '8px 10px',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  color: 'var(--cpp-muted)',
  whiteSpace: 'nowrap',
})

const td = (): React.CSSProperties => ({
  padding: '8px 10px',
  color: 'var(--cpp-muted)',
})

function FacetRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700, minWidth: 90 }}>
        {label}
      </div>
      {children}
    </div>
  )
}
