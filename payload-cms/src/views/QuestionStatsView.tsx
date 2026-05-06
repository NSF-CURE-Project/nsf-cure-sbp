'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Distractor = {
  optionId: string
  label: string
  isCorrect: boolean
  count: number
  fraction: number
}

type Concept = { id: string | number; name: string; slug?: string }

type RecentAttempt = {
  attemptId: string | number
  isCorrect: boolean | null
  score: number | null
  overallPercent: number | null
  selectedOptionIds: string[]
  textAnswer: string | null
  numericAnswer: number | null
}

type Payload = {
  question: {
    id: string | number
    title: string | null
    questionType: string | null
    difficulty: string | null
    bloomLevel: string | null
    concepts: Concept[]
  }
  quizCount: number
  attemptCount: number
  correctCount: number
  pValue: number | null
  discrimination: number | null
  distractors: Distractor[]
  recentAttempts: RecentAttempt[]
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

const formatPct = (value: number | null, digits = 1) =>
  value == null || Number.isNaN(value) ? '—' : `${(value * 100).toFixed(digits)}%`

const interpretDiscrimination = (d: number | null) => {
  if (d == null) return null
  if (d >= 0.4) return { label: 'Excellent', tone: '#127455' }
  if (d >= 0.3) return { label: 'Good', tone: '#127455' }
  if (d >= 0.2) return { label: 'Fair', tone: '#b45309' }
  if (d >= 0.0) return { label: 'Poor — review', tone: '#b91c1c' }
  return { label: 'Negative — flag', tone: '#b91c1c' }
}

const interpretP = (p: number | null) => {
  if (p == null) return null
  if (p >= 0.85) return { label: 'Very easy', tone: '#475569' }
  if (p >= 0.7) return { label: 'Easy', tone: '#475569' }
  if (p >= 0.4) return { label: 'Target band', tone: '#127455' }
  if (p >= 0.25) return { label: 'Hard', tone: '#b45309' }
  return { label: 'Very hard', tone: '#b91c1c' }
}

export default function QuestionStatsView({ questionId }: { questionId: string }) {
  const [data, setData] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/staff/question-stats?questionId=${encodeURIComponent(questionId)}`,
          { credentials: 'include' },
        )
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
  }, [questionId])

  const pInterp = data ? interpretP(data.pValue) : null
  const dInterp = data ? interpretDiscrimination(data.discrimination) : null

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: '#c6982f', fontWeight: 800 }}>
          Question Statistics
        </div>
        <h1 style={{ margin: '6px 0 8px', fontSize: 26, lineHeight: 1.2, color: '#1553cf' }}>
          {data?.question.title ?? 'Question'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--cpp-muted)' }}>
          {data ? (
            <>
              <span>Type: {data.question.questionType ?? '—'}</span>
              {data.question.difficulty ? <span>· Difficulty: {data.question.difficulty}</span> : null}
              {data.question.bloomLevel ? <span>· Bloom: {data.question.bloomLevel}</span> : null}
              <span>· In {data.quizCount} quiz{data.quizCount === 1 ? '' : 'zes'}</span>
              <span>· {data.attemptCount} attempts</span>
            </>
          ) : null}
          {data && data.question.concepts.length ? (
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {data.question.concepts.map((c) => (
                <span
                  key={String(c.id)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'var(--admin-chip-bg)',
                    border: '1px solid var(--admin-surface-border)',
                    fontSize: 11,
                    color: 'var(--cpp-ink)',
                  }}
                >
                  {c.name}
                </span>
              ))}
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Link
            href="/admin/collections/quiz-questions"
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
            Back to questions
          </Link>
          {data ? (
            <Link
              href={`/admin/collections/quiz-questions/${data.question.id}`}
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
              Edit question
            </Link>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div style={{ ...sectionStyle, color: 'var(--cpp-muted)' }}>Loading…</div>
      ) : error ? (
        <div style={{ ...sectionStyle, color: '#b91c1c' }}>{error}</div>
      ) : !data ? null : data.attemptCount === 0 ? (
        <div style={{ ...sectionStyle, color: 'var(--cpp-muted)', textAlign: 'center' }}>
          No attempts yet for this question.
        </div>
      ) : (
        <>
          <div style={{ ...sectionStyle, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                p-value (proportion correct)
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {formatPct(data.pValue)}
              </div>
              {pInterp ? (
                <div style={{ fontSize: 12, color: pInterp.tone, fontWeight: 700, marginTop: 4 }}>
                  {pInterp.label}
                </div>
              ) : null}
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Discrimination (point-biserial)
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {data.discrimination != null ? data.discrimination.toFixed(3) : '—'}
              </div>
              {dInterp ? (
                <div style={{ fontSize: 12, color: dInterp.tone, fontWeight: 700, marginTop: 4 }}>
                  {dInterp.label}
                </div>
              ) : null}
            </div>
            <div style={statCellStyle}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Attempts
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                {data.attemptCount}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                {data.correctCount} correct
              </div>
            </div>
          </div>

          {data.distractors.length ? (
            <div style={sectionStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)', marginBottom: 10 }}>
                Distractor analysis
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {data.distractors.map((d) => (
                  <div
                    key={d.optionId || d.label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 60px',
                      gap: 10,
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--admin-surface-border)',
                      background: d.isCorrect ? 'rgba(20, 131, 92, 0.08)' : 'transparent',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--cpp-ink)' }}>
                        {d.label} {d.isCorrect ? '✓' : ''}
                      </div>
                      <div style={{ height: 6, background: 'var(--admin-panel-bg-muted)', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.round(d.fraction * 100)}%`,
                            height: '100%',
                            background: d.isCorrect ? '#127455' : '#b45309',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {d.count} pick{d.count === 1 ? '' : 's'}
                    </div>
                    <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {(d.fraction * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
