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
import RowOverflowMenu from '@/views/courses/RowOverflowMenu'
import { useConfirm } from '@/views/admin/useConfirm'

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
  gap: 14,
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
  padding: '16px 20px',
  borderRadius: 18,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  background: 'rgba(255, 255, 255, 0.98)',
  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.045), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
  transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
}

const utilityButtonStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  background: 'rgba(255, 255, 255, 0.98)',
  color: 'var(--cpp-ink)',
  fontSize: 13,
  fontWeight: 700,
  padding: '10px 14px',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
}

const primaryButtonStyle: React.CSSProperties = {
  ...utilityButtonStyle,
  background: '#1f4578',
  borderColor: 'rgba(31, 69, 120, 0.4)',
  color: '#ffffff',
  boxShadow: '0 6px 18px rgba(31, 69, 120, 0.25)',
}

const reorderButtonStyle: React.CSSProperties = {
  ...utilityButtonStyle,
  width: 36,
  height: 36,
  padding: 0,
}

const ArrowIcon = ({ direction }: { direction: 'up' | 'down' }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    style={{ transform: direction === 'down' ? 'rotate(180deg)' : undefined }}
  >
    <path
      d="M8 12V4M4 7.5L8 3.5L12 7.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const QuizLinkedChip = ({ linked }: { linked: boolean }) => {
  const styles: React.CSSProperties = linked
    ? {
        ...adminChipStyle,
        background: 'rgba(0, 80, 48, 0.12)',
        border: '1px solid rgba(0, 80, 48, 0.22)',
        color: '#003820',
      }
    : {
        ...adminChipStyle,
        background: 'rgba(15, 23, 42, 0.05)',
        border: '1px solid rgba(15, 23, 42, 0.1)',
        color: 'var(--cpp-muted)',
      }
  return (
    <span style={styles}>
      <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        style={{ marginRight: 4 }}
      >
        {linked ? (
          <path
            d="M2.5 6.25L4.75 8.5L9.5 3.75"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <circle
            cx="6"
            cy="6"
            r="3.25"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="2 2"
          />
        )}
      </svg>
      {linked ? 'Quiz linked' : 'No quiz'}
    </span>
  )
}

const StatusChip = ({ status }: { status: 'draft' | 'published' }) => {
  const styles: React.CSSProperties =
    status === 'published'
      ? {
          ...adminChipStyle,
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.26)',
          color: '#15803d',
        }
      : {
          ...adminChipStyle,
          background: 'rgba(245, 158, 11, 0.10)',
          border: '1px solid rgba(245, 158, 11, 0.24)',
          color: '#a16207',
        }
  return <span style={styles}>{status === 'published' ? 'Published' : 'Draft'}</span>
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

  const { confirm, dialog: confirmDialog } = useConfirm()

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
    const confirmed = await confirm({
      title: 'Delete lesson?',
      message: `"${lesson.title ?? 'this lesson'}" will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    })
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
    <>
      {confirmDialog}
    <div style={{ margin: '18px 0 20px', display: 'grid', gap: 18 }}>
      <style>{`
        .chapter-workspace-row:hover { border-color: rgba(15, 23, 42, 0.18); box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7); }
        .chapter-workspace-utility-button:not(:disabled):hover { background: rgba(248, 250, 252, 1); border-color: rgba(15, 23, 42, 0.18); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08); }
        .chapter-workspace-primary-button:not(:disabled):hover { background: #18365d; box-shadow: 0 10px 22px rgba(31, 69, 120, 0.32); transform: translateY(-1px); }
        .chapter-workspace-reorder-button:not(:disabled):hover { background: #1f4578; border-color: rgba(31, 69, 120, 0.4); color: #ffffff; box-shadow: 0 6px 14px rgba(31, 69, 120, 0.25); }
        .chapter-workspace-reorder-button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
      <AdminCard variant="form" style={{ gap: 16 }}>
        <AdminCardHeader
          eyebrow="Chapter lessons"
          title="Lessons in this chapter"
          description={`Create and organize the lessons that belong to ${chapterTitle}. New lessons created here are automatically linked to this chapter.`}
          actions={
            chapterId ? (
              <button
                type="button"
                className="chapter-workspace-primary-button"
                style={primaryButtonStyle}
                onClick={() => setCreateOpen((current) => !current)}
              >
                {createOpen ? 'Cancel' : '+ Add lesson'}
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
              padding: '20px 22px',
              borderRadius: 18,
              border: '1px solid rgba(31, 69, 120, 0.18)',
              background:
                'linear-gradient(180deg, rgba(239, 246, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(31, 69, 120, 0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1f4578',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M8 3V13M3 8H13"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--cpp-ink)' }}>
                Quick create lesson
              </div>
            </div>
            <input
              value={newLessonTitle}
              onChange={(event) => setNewLessonTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !saving) {
                  event.preventDefault()
                  void createLesson()
                }
              }}
              placeholder="Enter lesson title"
              style={{ ...adminInputShellStyle, minHeight: 42 }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="chapter-workspace-primary-button"
                style={primaryButtonStyle}
                onClick={() => void createLesson()}
                disabled={saving || !newLessonTitle.trim()}
              >
                Create lesson
              </button>
              <button
                type="button"
                className="chapter-workspace-utility-button"
                style={utilityButtonStyle}
                onClick={() => setCreateOpen(false)}
              >
                Keep browsing
              </button>
            </div>
          </div>
        ) : null}

        {chapterId ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
              {loading
                ? 'Loading lessons…'
                : `${lessons.length} ${lessons.length === 1 ? 'lesson' : 'lessons'}`}
            </div>
            {saving ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'rgba(31, 69, 120, 0.10)',
                  border: '1px solid rgba(31, 69, 120, 0.22)',
                  color: '#1f4578',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="3.5" fill="currentColor" />
                </svg>
                Saving
              </span>
            ) : null}
          </div>
        ) : null}

        {chapterId && !loading && lessons.length === 0 ? (
          <div
            style={{
              borderRadius: 18,
              border: '1px dashed rgba(15, 23, 42, 0.16)',
              background: 'rgba(255, 255, 255, 0.66)',
              padding: '30px 24px',
              display: 'grid',
              gap: 8,
              justifyItems: 'center',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(31, 69, 120, 0.10)',
                color: '#1f4578',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 6h16M4 12h12M4 18h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--cpp-ink)' }}>
              No lessons yet
            </div>
            <div style={{ fontSize: 13, color: 'var(--cpp-muted)', lineHeight: 1.6, maxWidth: 360 }}>
              Start building this chapter by adding your first lesson. Use{' '}
              <span style={{ fontWeight: 700, color: 'var(--cpp-ink)' }}>+ Add lesson</span> above
              to create one.
            </div>
          </div>
        ) : null}

        {chapterId && lessons.length > 0 ? (
          <div style={lessonListShellStyle}>
            {lessons.map((lesson, index) => {
              const quizLinked = hasQuizLinked(lesson.layout)
              const status = lesson._status === 'published' ? 'published' : 'draft'

              return (
                <div key={lesson.id} className="chapter-workspace-row" style={lessonRowStyle}>
                  <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
                    <button
                      type="button"
                      className="chapter-workspace-reorder-button"
                      onClick={() => void moveLesson(lesson.id, -1)}
                      disabled={index === 0 || saving}
                      style={reorderButtonStyle}
                      aria-label={`Move ${lesson.title ?? 'lesson'} up`}
                    >
                      <ArrowIcon direction="up" />
                    </button>
                    <button
                      type="button"
                      className="chapter-workspace-reorder-button"
                      onClick={() => void moveLesson(lesson.id, 1)}
                      disabled={index === lessons.length - 1 || saving}
                      style={reorderButtonStyle}
                      aria-label={`Move ${lesson.title ?? 'lesson'} down`}
                    >
                      <ArrowIcon direction="down" />
                    </button>
                  </div>

                  <div style={{ minWidth: 0, display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: 'var(--cpp-ink)',
                          letterSpacing: '-0.01em',
                          minWidth: 0,
                        }}
                      >
                        {lesson.title ?? lesson.slug ?? 'Untitled lesson'}
                      </div>
                      <span style={adminChipStyle}>Lesson {index + 1}</span>
                      <StatusChip status={status} />
                      <QuizLinkedChip linked={quizLinked} />
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
                      gap: 8,
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <Link
                      href={`/admin/collections/lessons/${lesson.id}`}
                      className="chapter-workspace-utility-button"
                      style={utilityButtonStyle}
                    >
                      Edit lesson
                    </Link>
                    <RowOverflowMenu
                      ariaLabel={`More actions for ${lesson.title ?? 'lesson'}`}
                      actions={[
                        {
                          kind: 'link',
                          label: quizLinked ? 'Change quiz' : 'Assign quiz',
                          href: `/admin/collections/lessons/${lesson.id}`,
                        },
                        {
                          kind: 'button',
                          label: 'Duplicate',
                          onClick: () => void duplicateLesson(lesson),
                          disabled: saving,
                          pendingLabel: 'Duplicating…',
                        },
                        {
                          kind: 'button',
                          label: 'Delete',
                          onClick: () => void deleteLesson(lesson),
                          destructive: true,
                          disabled: saving,
                          pendingLabel: 'Deleting…',
                        },
                      ]}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </AdminCard>
    </div>
    </>
  )
}
