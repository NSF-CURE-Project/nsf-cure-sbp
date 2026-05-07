'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useField } from '@payloadcms/ui'
import {
  AdminCard,
  AdminCardHeader,
  adminChipStyle,
  adminInputShellStyle,
} from '@/views/admin/AdminCardPrimitives'

type IdValue = string | number | null | undefined

type LessonDoc = {
  id: string
  title?: string | null
  slug?: string | null
  order?: number | null
  _status?: 'draft' | 'published' | null
  layout?: Array<{ blockType?: string | null } | null> | null
}

const sectionGridStyle: React.CSSProperties = { display: 'grid', gap: 14 }

const lessonListShellStyle: React.CSSProperties = {
  display: 'grid',
  gap: 18,
  borderRadius: 20,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  background: 'rgba(255, 255, 255, 0.56)',
  padding: '18px',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
}

const lessonRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  gap: 18,
  alignItems: 'center',
  padding: '18px 20px',
  borderRadius: 22,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  background: 'rgba(255, 255, 255, 0.98)',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
}

const utilityButtonStyle: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  background: 'rgba(255, 255, 255, 0.98)',
  color: 'var(--cpp-ink)',
  fontSize: 13,
  fontWeight: 700,
  padding: '12px 16px',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
}

const primaryButtonStyle: React.CSSProperties = {
  ...utilityButtonStyle,
  background: '#1f4578',
  borderColor: 'rgba(31, 69, 120, 0.4)',
  color: '#ffffff',
}

const reorderButtonStyle: React.CSSProperties = {
  ...utilityButtonStyle,
  width: 42,
  height: 50,
  padding: 0,
  fontSize: 18,
  lineHeight: 1,
}

const getId = (value: IdValue) => {
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return null
}

const hasQuizLinked = (layout: LessonDoc['layout']) =>
  Array.isArray(layout) && layout.some((block) => block?.blockType === 'quizBlock')

export default function ChapterWorkspaceField() {
  const { value: idValue } = useField<IdValue>({ path: 'id' })
  const { value: legacyIdValue } = useField<IdValue>({ path: '_id' })
  const { value: titleValue } = useField<string>({ path: 'title' })

  const [pathId, setPathId] = useState<string | null>(null)
  const [lessons, setLessons] = useState<LessonDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newLessonTitle, setNewLessonTitle] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const pathname = window.location.pathname
    const match = pathname.match(/chapters\/([^/]+)/)
    if (match?.[1] && match[1] !== 'create') {
      setPathId(match[1])
    }
  }, [])

  const chapterId = useMemo(
    () => getId(idValue) ?? getId(legacyIdValue) ?? getId(pathId),
    [idValue, legacyIdValue, pathId],
  )

  const loadLessons = useCallback(async () => {
    if (!chapterId) {
      setLessons([])
      return
    }
    setLoading(true)
    try {
      const response = await fetch(
        `/api/lessons?limit=200&sort=order&where[chapter][equals]=${encodeURIComponent(chapterId)}`,
        {
          credentials: 'include',
        },
      )
      if (!response.ok) {
        setLessons([])
        return
      }
      const data = (await response.json()) as { docs?: LessonDoc[] }
      const nextLessons = [...(data.docs ?? [])].sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
        const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
        if (orderA !== orderB) return orderA - orderB
        return (a.title ?? '').localeCompare(b.title ?? '')
      })
      setLessons(nextLessons)
    } finally {
      setLoading(false)
    }
  }, [chapterId])

  useEffect(() => {
    void loadLessons()
  }, [loadLessons])

  const persistOrder = async (nextLessons: LessonDoc[]) => {
    setSaving(true)
    try {
      const updates = nextLessons.map((lesson, index) =>
        fetch(`/api/lessons/${lesson.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order: index + 1 }),
        }),
      )
      await Promise.all(updates)
      setLessons(nextLessons.map((lesson, index) => ({ ...lesson, order: index + 1 })))
    } finally {
      setSaving(false)
    }
  }

  const moveLesson = async (lessonId: string, direction: -1 | 1) => {
    const index = lessons.findIndex((lesson) => lesson.id === lessonId)
    const targetIndex = index + direction
    if (index < 0 || targetIndex < 0 || targetIndex >= lessons.length) return
    const next = [...lessons]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    setLessons(next)
    await persistOrder(next)
  }

  const createLesson = async () => {
    if (!chapterId || !newLessonTitle.trim()) return
    setSaving(true)
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newLessonTitle.trim(),
          chapter: chapterId,
          order: lessons.length + 1,
          layout: [],
          _status: 'draft',
        }),
      })
      if (!response.ok) return
      setNewLessonTitle('')
      setCreateOpen(false)
      await loadLessons()
    } finally {
      setSaving(false)
    }
  }

  const duplicateLesson = async (lesson: LessonDoc) => {
    if (!chapterId) return
    setSaving(true)
    try {
      await fetch('/api/lessons', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${lesson.title ?? 'Untitled lesson'} Copy`,
          chapter: chapterId,
          order: lessons.length + 1,
          layout: lesson.layout ?? [],
          _status: 'draft',
        }),
      })
      await loadLessons()
    } finally {
      setSaving(false)
    }
  }

  const deleteLesson = async (lesson: LessonDoc) => {
    const confirmed = window.confirm(`Delete "${lesson.title ?? 'this lesson'}"?`)
    if (!confirmed) return
    setSaving(true)
    try {
      await fetch(`/api/lessons/${lesson.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      await loadLessons()
    } finally {
      setSaving(false)
    }
  }

  const chapterTitle =
    typeof titleValue === 'string' && titleValue.trim().length > 0 ? titleValue.trim() : 'this chapter'

  return (
    <div style={{ margin: '18px 0 20px', display: 'grid', gap: 18 }}>
      <AdminCard variant="form" style={{ gap: 16 }}>
        <AdminCardHeader
          eyebrow="Chapter lessons"
          title="Lessons in this chapter"
          description={`Create and organize the lessons that belong to ${chapterTitle}. New lessons created here are automatically linked to this chapter.`}
          actions={
            chapterId ? (
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={() => setCreateOpen((current) => !current)}
              >
                {createOpen ? 'Cancel' : 'Add lesson'}
              </button>
            ) : null
          }
        />

        {!chapterId ? (
          <div style={{ fontSize: 13, color: 'var(--cpp-muted)', lineHeight: 1.6 }}>
            Save the chapter first, then come back here to create and organize its lessons.
          </div>
        ) : null}

        {chapterId && createOpen ? (
          <div
            style={{
              ...sectionGridStyle,
              padding: '18px 20px',
              borderRadius: 18,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'rgba(248, 250, 252, 0.96)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cpp-ink)' }}>
              Quick create lesson
            </div>
            <input
              value={newLessonTitle}
              onChange={(event) => setNewLessonTitle(event.target.value)}
              placeholder="Enter lesson title"
              style={{ ...adminInputShellStyle, minHeight: 42 }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" style={primaryButtonStyle} onClick={() => void createLesson()} disabled={saving}>
                Create lesson
              </button>
              <button type="button" style={utilityButtonStyle} onClick={() => setCreateOpen(false)}>
                Keep browsing
              </button>
            </div>
          </div>
        ) : null}

        {chapterId ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
              {loading ? 'Loading lessons…' : `${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'}`}
            </div>
            {saving ? <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Saving changes…</div> : null}
          </div>
        ) : null}

        {chapterId && !loading && lessons.length === 0 ? (
          <div
            style={{
              borderRadius: 18,
              border: '1px dashed rgba(15, 23, 42, 0.12)',
              background: 'rgba(255, 255, 255, 0.66)',
              padding: '22px 24px',
              display: 'grid',
              gap: 6,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cpp-ink)' }}>No lessons yet</div>
            <div style={{ fontSize: 13, color: 'var(--cpp-muted)', lineHeight: 1.6 }}>
              Add the first lesson to begin building this chapter.
            </div>
          </div>
        ) : null}

        {chapterId && lessons.length > 0 ? (
          <div style={lessonListShellStyle}>
            {lessons.map((lesson, index) => {
              const quizLinked = hasQuizLinked(lesson.layout)
              const statusLabel = lesson._status === 'published' ? 'Published' : 'Draft'

              return (
                <div key={lesson.id} style={lessonRowStyle}>
                  <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => void moveLesson(lesson.id, -1)}
                      disabled={index === 0 || saving}
                      style={reorderButtonStyle}
                      aria-label={`Move ${lesson.title ?? 'lesson'} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => void moveLesson(lesson.id, 1)}
                      disabled={index === lessons.length - 1 || saving}
                      style={reorderButtonStyle}
                      aria-label={`Move ${lesson.title ?? 'lesson'} down`}
                    >
                      ↓
                    </button>
                  </div>

                  <div style={{ minWidth: 0, display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: 'var(--cpp-ink)',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {lesson.title ?? lesson.slug ?? 'Untitled lesson'}
                      </div>
                      <span style={adminChipStyle}>Lesson {index + 1}</span>
                      <span style={adminChipStyle}>{statusLabel}</span>
                      <span style={adminChipStyle}>{quizLinked ? 'Quiz linked' : 'No quiz linked'}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--cpp-muted)', lineHeight: 1.6 }}>
                      {quizLinked
                        ? 'This lesson already includes a quiz block.'
                        : 'Open the lesson editor to assign or change its quiz.'}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <Link href={`/admin/collections/lessons/${lesson.id}`} style={utilityButtonStyle}>
                      Edit lesson
                    </Link>
                    <Link href={`/admin/collections/lessons/${lesson.id}`} style={utilityButtonStyle}>
                      {quizLinked ? 'Change quiz' : 'Assign quiz'}
                    </Link>
                    <button type="button" style={utilityButtonStyle} onClick={() => void duplicateLesson(lesson)} disabled={saving}>
                      Duplicate
                    </button>
                    <button type="button" style={utilityButtonStyle} onClick={() => void deleteLesson(lesson)} disabled={saving}>
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </AdminCard>
    </div>
  )
}
