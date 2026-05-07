'use client'

import React, { useEffect, useState } from 'react'
import type { ChapterNode, EntityId } from './types'
import SidePanel from './SidePanel'
import {
  attachLessonToChapter,
  createLesson,
  searchUnassignedLessons,
  type LessonSearchResult,
} from './courses-order-api'

type Tab = 'create' | 'attach'

type AddedLesson = {
  id: EntityId
  title: string
  order: number
  chapterId: EntityId
}

type LessonAssignmentDrawerProps = {
  chapter: ChapterNode | null
  onClose: () => void
  onLessonsAdded: (lessons: AddedLesson[]) => void
}

export default function LessonAssignmentDrawer({
  chapter,
  onClose,
  onLessonsAdded,
}: LessonAssignmentDrawerProps) {
  const open = chapter !== null
  const [tab, setTab] = useState<Tab>('create')
  const [createTitle, setCreateTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<LessonSearchResult[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<EntityId>>(new Set())

  useEffect(() => {
    if (!open) return
    setTab('create')
    setCreateTitle('')
    setError(null)
    setSearchQuery('')
    setResults([])
    setSelectedIds(new Set())
  }, [open, chapter?.id])

  useEffect(() => {
    if (!open || tab !== 'attach') return
    let cancelled = false
    setBusy(true)
    setError(null)
    const handle = setTimeout(async () => {
      try {
        const docs = await searchUnassignedLessons(searchQuery)
        if (!cancelled) setResults(docs)
      } catch (_err) {
        if (!cancelled) setError('Could not load lessons.')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [open, tab, searchQuery])

  if (!chapter) {
    return <SidePanel open={false} onClose={onClose} title="" />
  }

  const nextOrder = chapter.lessons.length + 1

  const handleCreate = async () => {
    const title = createTitle.trim()
    if (!title) return
    setBusy(true)
    setError(null)
    try {
      const created = await createLesson(chapter.id, title, nextOrder)
      onLessonsAdded([
        {
          id: created.id,
          title: created.title,
          order: created.order,
          chapterId: chapter.id,
        },
      ])
      onClose()
    } catch (_err) {
      setError('Could not create lesson.')
    } finally {
      setBusy(false)
    }
  }

  const handleAttach = async () => {
    if (!selectedIds.size) return
    setBusy(true)
    setError(null)
    try {
      const orderedIds = Array.from(selectedIds)
      let nextSlot = nextOrder
      const added: AddedLesson[] = []
      for (const lessonId of orderedIds) {
        const result = results.find((item) => item.id === lessonId)
        if (!result) continue
        await attachLessonToChapter(lessonId, chapter.id, nextSlot)
        added.push({
          id: lessonId,
          title: result.title,
          order: nextSlot,
          chapterId: chapter.id,
        })
        nextSlot += 1
      }
      onLessonsAdded(added)
      onClose()
    } catch (_err) {
      setError('Could not attach all lessons.')
    } finally {
      setBusy(false)
    }
  }

  const toggleSelected = (id: EntityId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredResults = results.filter((result) => result.currentChapterId !== chapter.id)

  const footer =
    tab === 'create' ? (
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={busy || !createTitle.trim()}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create lesson'}
        </button>
      </div>
    ) : (
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-[var(--cpp-muted)]">
          {selectedIds.size} selected
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAttach}
            disabled={busy || selectedIds.size === 0}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Adding…' : `Add ${selectedIds.size || ''} lesson${selectedIds.size === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    )

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Add lesson"
      subtitle={`Chapter: ${chapter.title}`}
      width="md"
      footer={footer}
    >
      <div className="grid gap-3">
        <nav className="flex gap-1" aria-label="Lesson source">
          {([
            { id: 'create', label: 'Create new' },
            { id: 'attach', label: 'Attach existing' },
          ] satisfies { id: Tab; label: string }[]).map((entry) => {
            const active = tab === entry.id
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                className={`rounded-t-md border-b-2 px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? 'border-sky-600 text-[var(--cpp-ink)]'
                    : 'border-transparent text-[var(--cpp-muted)] hover:text-[var(--cpp-ink)]'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {entry.label}
              </button>
            )
          })}
        </nav>

        {tab === 'create' ? (
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
              Lesson title
            </span>
            <input
              autoFocus
              type="text"
              value={createTitle}
              onChange={(event) => setCreateTitle(event.target.value)}
              placeholder="e.g. Vector Operations"
              className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <span className="text-xs text-[var(--cpp-muted)]">
              Lesson will be added at position {nextOrder} in this chapter. Open the full lesson
              editor afterward to add content blocks.
            </span>
          </label>
        ) : (
          <div className="grid gap-2">
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search lessons…"
              className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              aria-label="Search lessons"
            />
            <div className="grid gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {busy ? (
                <div className="text-xs text-[var(--cpp-muted)]">Searching…</div>
              ) : filteredResults.length === 0 ? (
                <div className="rounded-md border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-3 py-4 text-center text-xs text-[var(--cpp-muted)]">
                  {searchQuery
                    ? 'No matching lessons.'
                    : 'Start typing to search lessons across the platform.'}
                </div>
              ) : (
                filteredResults.map((result) => {
                  const checked = selectedIds.has(result.id)
                  const sublabel = result.currentChapterTitle
                    ? `${result.currentCourseTitle ?? 'Unknown course'} › ${result.currentChapterTitle}`
                    : 'Not currently assigned'
                  return (
                    <label
                      key={result.id}
                      className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-md border px-2 py-2 text-sm transition ${
                        checked
                          ? 'border-sky-400 bg-sky-50'
                          : 'border-[var(--admin-surface-border)] bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-muted)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelected(result.id)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-[var(--cpp-ink)]">
                          {result.title}
                        </div>
                        <div className="truncate text-xs text-[var(--cpp-muted)]">{sublabel}</div>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
            {filteredResults.length > 0 ? (
              <div className="text-xs text-[var(--cpp-muted)]">
                Attaching moves the lesson to this chapter. The lesson is removed from its current
                location.
              </div>
            ) : null}
          </div>
        )}

        {error ? <div className="text-xs text-red-700">{error}</div> : null}
      </div>
    </SidePanel>
  )
}
