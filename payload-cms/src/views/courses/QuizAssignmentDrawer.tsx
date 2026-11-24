'use client'

import React, { useEffect, useState } from 'react'
import type { EntityId, LessonNode } from './types'
import SidePanel from './SidePanel'
import { useConfirm } from '../admin/useConfirm'
import {
  assignQuizToLesson,
  removeQuizFromLesson,
  searchQuizzes,
  type QuizSearchResult,
} from './courses-order-api'

type QuizAssignmentDrawerProps = {
  lesson: LessonNode | null
  onClose: () => void
  onQuizChanged: (lessonId: EntityId, quizTitle: string | null) => void
}

const formatDate = (iso: string | null) => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function QuizAssignmentDrawer({
  lesson,
  onClose,
  onQuizChanged,
}: QuizAssignmentDrawerProps) {
  const open = lesson !== null
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<QuizSearchResult[]>([])
  const [busy, setBusy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { confirm, dialog: confirmDialog } = useConfirm()

  useEffect(() => {
    if (!open) return
    setSearchQuery('')
    setError(null)
  }, [open, lesson?.id])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setBusy(true)
    setError(null)
    const handle = setTimeout(async () => {
      try {
        const docs = await searchQuizzes(searchQuery)
        if (!cancelled) setResults(docs)
      } catch (_err) {
        if (!cancelled) setError('Could not load quizzes.')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [open, searchQuery])

  if (!lesson) {
    return <SidePanel open={false} onClose={onClose} title="" />
  }

  const currentQuiz = lesson.quizTitle ?? null

  const handleAssign = async (quiz: QuizSearchResult) => {
    setSubmitting(true)
    setError(null)
    try {
      await assignQuizToLesson(lesson.id, quiz.id)
      onQuizChanged(lesson.id, quiz.title)
      onClose()
    } catch (_err) {
      setError(`Could not assign “${quiz.title}”.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async () => {
    if (!currentQuiz) return
    if (!lesson) return
    const confirmed = await confirm({
      title: 'Remove quiz?',
      message: `The quiz will be detached from "${lesson.title}". You can re-assign it any time.`,
      confirmLabel: 'Remove',
      destructive: true,
    })
    if (!confirmed) return
    setSubmitting(true)
    setError(null)
    try {
      await removeQuizFromLesson(lesson.id)
      onQuizChanged(lesson.id, null)
      onClose()
    } catch (_err) {
      setError('Could not remove quiz.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {confirmDialog}
    <SidePanel
      open={open}
      onClose={onClose}
      title="Assign quiz"
      subtitle={`Lesson: ${lesson.title}`}
      width="md"
      footer={
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleRemove}
            disabled={!currentQuiz || submitting}
            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Working…' : 'Remove quiz'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="grid gap-3 text-sm">
        <div className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-xs">
          <div className="text-[var(--cpp-muted)]">Currently assigned</div>
          <div className="mt-0.5 truncate text-sm font-semibold text-[var(--cpp-ink)]">
            {currentQuiz ?? 'No quiz assigned'}
          </div>
        </div>

        <input
          autoFocus
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search quizzes…"
          className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          aria-label="Search quizzes"
        />

        <div className="grid gap-1.5 max-h-[55vh] overflow-y-auto pr-1">
          {busy ? (
            <div className="text-xs text-[var(--cpp-muted)]">Searching…</div>
          ) : results.length === 0 ? (
            <div className="rounded-md border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-3 py-4 text-center text-xs text-[var(--cpp-muted)]">
              {searchQuery ? 'No matching quizzes.' : 'No quizzes available.'}
            </div>
          ) : (
            results.map((quiz) => {
              const isCurrent = currentQuiz === quiz.title
              const updated = formatDate(quiz.updatedAt)
              return (
                <button
                  key={quiz.id}
                  type="button"
                  onClick={() => handleAssign(quiz)}
                  disabled={submitting || isCurrent}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed ${
                    isCurrent
                      ? 'border-sky-400 bg-sky-50'
                      : 'border-[var(--admin-surface-border)] bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-muted)]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-[var(--cpp-ink)]">{quiz.title}</div>
                    <div className="truncate text-xs text-[var(--cpp-muted)]">
                      {quiz.status ? `${quiz.status}` : 'Status unknown'}
                      {updated ? ` · Updated ${updated}` : ''}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {isCurrent ? 'Assigned' : 'Assign'}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {error ? <div className="text-xs text-red-700">{error}</div> : null}
      </div>
    </SidePanel>
    </>
  )
}
