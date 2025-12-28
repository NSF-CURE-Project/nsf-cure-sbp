'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'

type IdValue = string | number | null | undefined

type FeedbackEntry = {
  id: string | number
  rating?: number
  message?: string
  reply?: string
  createdAt?: string
  user?: { email?: string } | string | null
}

const ratingLabels: Record<number, string> = {
  1: 'Not helpful',
  2: 'Somewhat helpful',
  3: 'Helpful',
  4: 'Very helpful',
}

export default function LessonFeedbackPanel() {
  const { value: idValue } = useField<IdValue>({ path: 'id' })
  const { value: legacyIdValue } = useField<IdValue>({ path: '_id' })
  const [pathId, setPathId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [savingReply, setSavingReply] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    const pathname = window.location.pathname
    const match = pathname.match(/lessons\/([^/]+)/)
    if (match?.[1]) {
      setPathId(match[1])
    }
  }, [])

  const lessonId = useMemo(() => {
    if (typeof idValue === 'string') return idValue
    if (typeof idValue === 'number') return String(idValue)
    if (typeof legacyIdValue === 'string') return legacyIdValue
    if (typeof legacyIdValue === 'number') return String(legacyIdValue)
    return pathId
  }, [idValue, legacyIdValue, pathId])

  useEffect(() => {
    if (!lessonId) return
    const controller = new AbortController()
    const loadFeedback = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/lesson-feedback?where[lesson][equals]=${lessonId}&limit=50&sort=-createdAt`,
          { credentials: 'include', signal: controller.signal },
        )
        if (!res.ok) {
          setFeedback([])
          return
        }
        const data = (await res.json()) as { docs?: FeedbackEntry[] }
        setFeedback(data.docs ?? [])
        setReplyDrafts((prev) => {
          const next = { ...prev }
          ;(data.docs ?? []).forEach((entry) => {
            const key = String(entry.id)
            if (next[key] === undefined) {
              next[key] = entry.reply ?? ''
            }
          })
          return next
        })
      } catch {
        if (!controller.signal.aborted) {
          setFeedback([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }
    loadFeedback()
    return () => controller.abort()
  }, [lessonId])

  const handleSaveReply = async (entryId: string) => {
    const nextReply = replyDrafts[entryId] ?? ''
    setSavingReply((prev) => ({ ...prev, [entryId]: true }))
    try {
      const res = await fetch(`/api/lesson-feedback/${entryId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply: nextReply }),
      })
      if (!res.ok) {
        throw new Error('Failed to save reply.')
      }
      setFeedback((prev) =>
        prev.map((entry) =>
          String(entry.id) === entryId
            ? { ...entry, reply: nextReply }
            : entry,
        ),
      )
    } finally {
      setSavingReply((prev) => ({ ...prev, [entryId]: false }))
    }
  }

  const averageRating = useMemo(() => {
    if (!feedback.length) return null
    const totals = feedback.reduce(
      (acc, entry) => {
        const rating = Number(entry.rating)
        if (!Number.isFinite(rating)) return acc
        return { sum: acc.sum + rating, count: acc.count + 1 }
      },
      { sum: 0, count: 0 },
    )
    if (!totals.count) return null
    return totals.sum / totals.count
  }, [feedback])

  if (!lessonId) {
    return (
      <div style={{ margin: '8px 0 20px', fontSize: 12, color: '#64748b' }}>
        Save this lesson to view feedback responses.
      </div>
    )
  }

  return (
    <div style={{ margin: '8px 0 20px' }}>
      <div style={{ fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: '#334155', fontWeight: 700 }}>
        Lesson Feedback
      </div>
      {averageRating !== null ? (
        <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
          Average rating: {averageRating.toFixed(1)} / 4
        </div>
      ) : null}
      <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
        {loading ? (
          <div style={{ fontSize: 12, color: '#64748b' }}>Loading feedback…</div>
        ) : feedback.length ? (
          feedback.map((entry) => (
            <div
              key={String(entry.id)}
              style={{
                border: '1px solid rgba(15, 23, 42, 0.12)',
                borderRadius: 0,
                padding: '10px 12px',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {ratingLabels[Number(entry.rating) || 0] ?? 'Unrated'}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}
                </div>
              </div>
              {entry.message ? (
                <p style={{ marginTop: 6, fontSize: 12, color: '#334155', whiteSpace: 'pre-wrap' }}>
                  {entry.message}
                </p>
              ) : (
                <p style={{ marginTop: 6, fontSize: 12, color: '#94a3b8' }}>
                  No message provided.
                </p>
              )}
              <div style={{ marginTop: 6, fontSize: 11, color: '#64748b' }}>
                {typeof entry.user === 'object' && entry.user?.email
                  ? entry.user.email
                  : 'Anonymous'}
              </div>
              <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                  Staff reply
                </div>
                <textarea
                  value={replyDrafts[String(entry.id)] ?? ''}
                  onChange={(event) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [String(entry.id)]: event.target.value,
                    }))
                  }
                  rows={3}
                  style={{
                    width: '100%',
                    borderRadius: 0,
                    border: '1px solid rgba(15, 23, 42, 0.16)',
                    padding: '8px',
                    fontSize: 12,
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleSaveReply(String(entry.id))}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 0,
                      border: '1px solid rgba(15, 23, 42, 0.16)',
                      background: '#0f172a',
                      color: '#f8fafc',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    disabled={savingReply[String(entry.id)]}
                  >
                    {savingReply[String(entry.id)] ? 'Saving…' : 'Save reply'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12, color: '#64748b' }}>No feedback yet.</div>
        )}
      </div>
    </div>
  )
}
