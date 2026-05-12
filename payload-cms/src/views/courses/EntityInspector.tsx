'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ChapterNode, LessonNode } from './types'
import SidePanel from './SidePanel'
import { updateChapterTitle, updateLessonTitle } from './courses-order-api'

export type Selection =
  | { type: 'chapter'; chapter: ChapterNode }
  | { type: 'lesson'; lesson: LessonNode; chapterTitle: string }
  | null

type EntityInspectorProps = {
  selection: Selection
  // Used to build the "Open full editor" link for lessons, which lives at
  // /admin/courses/[courseId]/lessons/[lessonId]/edit (chapters still use
  // Payload's hidden default route since there's no custom editor for them).
  courseId: string
  onClose: () => void
  onTitleSaved: (entity: { type: 'chapter' | 'lesson'; id: string; title: string }) => void
  onDeleteChapter?: (chapter: ChapterNode) => void
  onDeleteLesson?: (lesson: LessonNode) => void
  onAssignQuiz?: (lesson: LessonNode) => void
  deleting: boolean
}

export default function EntityInspector({
  selection,
  courseId,
  onClose,
  onTitleSaved,
  onDeleteChapter,
  onDeleteLesson,
  onAssignQuiz,
  deleting,
}: EntityInspectorProps) {
  const open = selection !== null
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selection) return
    setTitle(selection.type === 'chapter' ? selection.chapter.title : selection.lesson.title)
    setError(null)
  }, [selection])

  if (!selection) {
    return <SidePanel open={false} onClose={onClose} title="" />
  }

  const isChapter = selection.type === 'chapter'
  const entityId = isChapter ? selection.chapter.id : selection.lesson.id
  const initialTitle = isChapter ? selection.chapter.title : selection.lesson.title
  const titleDirty = title.trim() !== initialTitle.trim()

  const handleSaveTitle = async () => {
    const trimmed = title.trim()
    if (!trimmed || trimmed === initialTitle.trim()) return
    setSaving(true)
    setError(null)
    try {
      if (isChapter) {
        await updateChapterTitle(entityId, trimmed)
      } else {
        await updateLessonTitle(entityId, trimmed)
      }
      onTitleSaved({ type: selection.type, id: entityId, title: trimmed })
    } catch (_err) {
      setError('Could not save title — try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={isChapter ? 'Chapter details' : 'Lesson details'}
      subtitle={
        isChapter
          ? `Chapter ${selection.chapter.order}`
          : `In chapter: ${selection.chapterTitle}`
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (isChapter) onDeleteChapter?.(selection.chapter)
              else onDeleteLesson?.(selection.lesson)
            }}
            disabled={deleting}
            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : isChapter ? 'Delete chapter' : 'Delete lesson'}
          </button>
          <button
            type="button"
            onClick={handleSaveTitle}
            disabled={!titleDirty || saving}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save title'}
          </button>
        </div>
      }
    >
      <div className="grid gap-4 text-sm">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
        {error ? <div className="text-xs text-red-700">{error}</div> : null}

        <div className="grid gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-xs text-[var(--cpp-muted)]">
          {isChapter ? (
            <>
              <div>
                <span className="font-semibold text-[var(--cpp-ink)]">Lessons:</span>{' '}
                {selection.chapter.lessons.length}
              </div>
              <div>
                <span className="font-semibold text-[var(--cpp-ink)]">Chapter number:</span>{' '}
                {selection.chapter.order}
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="font-semibold text-[var(--cpp-ink)]">Quiz:</span>{' '}
                {selection.lesson.quizTitle ?? 'Not assigned'}
              </div>
              <div>
                <span className="font-semibold text-[var(--cpp-ink)]">Order:</span>{' '}
                {selection.lesson.order}
              </div>
            </>
          )}
          <div>
            <span className="font-semibold text-[var(--cpp-ink)]">ID:</span> {entityId}
          </div>
        </div>

        <div className="grid gap-1.5">
          {!isChapter && onAssignQuiz ? (
            <button
              type="button"
              onClick={() => onAssignQuiz(selection.lesson)}
              className="rounded-md border border-[var(--admin-surface-border)] px-3 py-2 text-center text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
            >
              {selection.lesson.quizTitle ? 'Change quiz' : 'Assign quiz'}
            </button>
          ) : null}
          <Link
            href={
              isChapter
                ? `/admin/collections/chapters/${entityId}`
                : `/admin/courses/${courseId}/lessons/${entityId}/edit`
            }
            className="rounded-md border border-[var(--admin-surface-border)] px-3 py-2 text-center text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
          >
            {isChapter ? 'Open full chapter editor' : 'Open full lesson editor'}
          </Link>
        </div>
      </div>
    </SidePanel>
  )
}
