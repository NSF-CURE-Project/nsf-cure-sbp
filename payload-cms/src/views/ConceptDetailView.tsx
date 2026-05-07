'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Concept = {
  id: string | number
  name: string
  slug: string
  subject: string | null
  bloomLevel: string | null
  description: string | null
}

type Question = {
  id: string | number
  title: string
  questionType: string | null
  difficulty: string | null
  bloomLevel: string | null
}

type Aggregate = {
  questionCount: number
  attemptCount: number
  pValue: number | null
  studentsTracked: number
  studentsMastered: number
  studentsStruggling: number
}

type Payload = {
  concept: Concept
  prerequisites: Array<{ id: string | number; name: string; slug: string }>
  questions: Question[]
  aggregate: Aggregate
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

export default function ConceptDetailView({ slug }: { slug: string }) {
  const [data, setData] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/staff/concept-detail?slug=${encodeURIComponent(slug)}`, {
          credentials: 'include',
        })
                if (res.status === 401 && typeof window !== 'undefined') {
                  window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
                  return
                }
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Concept not found.' : 'Unable to load concept.')
        }
        const payload = (await res.json()) as Payload
        if (!cancelled) setData(payload)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load concept.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: '#c6982f', fontWeight: 800 }}>
          Concept
        </div>
        <h1 style={{ margin: '6px 0 6px', fontSize: 28, color: '#1553cf' }}>
          {data?.concept.name ?? slug}
        </h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 13, color: 'var(--cpp-muted)' }}>
          {data?.concept.subject ? <span>Subject: {data.concept.subject}</span> : null}
          {data?.concept.bloomLevel ? <span>· Bloom: {data.concept.bloomLevel}</span> : null}
          <span>· slug: {data?.concept.slug ?? slug}</span>
        </div>
        {data?.concept.description ? (
          <p style={{ margin: '10px 0 0', maxWidth: 720, color: 'var(--cpp-ink)' }}>{data.concept.description}</p>
        ) : null}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
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
            All concepts
          </Link>
          {data ? (
            <Link
              href={`/admin/collections/concepts/${data.concept.id}`}
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
              Edit concept
            </Link>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div style={{ ...sectionStyle, color: 'var(--cpp-muted)' }}>Loading…</div>
      ) : error ? (
        <div style={{ ...sectionStyle, color: '#b91c1c' }}>{error}</div>
      ) : !data ? null : (
        <>
          <div style={{ ...sectionStyle, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Questions tagged
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {data.aggregate.questionCount}
              </div>
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Concept p-value (overall)
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {data.aggregate.pValue != null ? `${(data.aggregate.pValue * 100).toFixed(1)}%` : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                across {data.aggregate.attemptCount} answers
              </div>
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Mastered students
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#127455' }}>
                {data.aggregate.studentsMastered}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                ≥80% on ≥3 attempts
              </div>
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Struggling students
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#b91c1c' }}>
                {data.aggregate.studentsStruggling}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                &lt;50% on ≥3 attempts
              </div>
            </div>
          </div>

          {data.prerequisites.length ? (
            <div style={sectionStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)', marginBottom: 10 }}>
                Prerequisite concepts
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.prerequisites.map((p) => (
                  <Link
                    key={String(p.id)}
                    href={`/admin/concepts/${encodeURIComponent(p.slug)}`}
                    style={{
                      fontSize: 13,
                      padding: '6px 10px',
                      borderRadius: 999,
                      border: '1px solid var(--admin-surface-border)',
                      background: 'var(--admin-chip-bg)',
                      color: 'var(--cpp-ink)',
                      textDecoration: 'none',
                    }}
                  >
                    ← {p.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div style={sectionStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)', marginBottom: 10 }}>
              Questions tagged with this concept
            </div>
            {data.questions.length === 0 ? (
              <div style={{ color: 'var(--cpp-muted)', textAlign: 'center', padding: '14px' }}>
                No questions yet. Tag a quiz question with this concept from the question editor.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--admin-surface-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--admin-panel-bg-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                        Title
                      </th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                        Type
                      </th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                        Difficulty
                      </th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)' }}>
                        Bloom
                      </th>
                      <th style={{ padding: '8px 10px' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {data.questions.map((q) => (
                      <tr key={String(q.id)} style={{ borderTop: '1px solid var(--admin-surface-border)' }}>
                        <td style={{ padding: '8px 10px', color: 'var(--cpp-ink)', fontWeight: 600 }}>{q.title}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--cpp-muted)' }}>{q.questionType ?? '—'}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--cpp-muted)' }}>{q.difficulty ?? '—'}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--cpp-muted)' }}>{q.bloomLevel ?? '—'}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          <Link
                            href={`/admin/question-stats/${q.id}`}
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
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
