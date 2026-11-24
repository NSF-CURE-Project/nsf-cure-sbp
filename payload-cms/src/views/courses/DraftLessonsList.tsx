'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { HelpLink } from '../admin/HelpLink'

export type DraftLessonEntry = {
  lessonId: string
  lessonTitle: string
  chapterId: string | null
  chapterTitle: string | null
  courseId: string | null
  courseTitle: string | null
  updatedAt: string | null
  blockCount: number
}

type Props = {
  initialDrafts: DraftLessonEntry[]
}

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatRelative = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return formatDate(iso)
}

export default function DraftLessonsList({ initialDrafts }: Props) {
  const [searchValue, setSearchValue] = useState('')
  const [groupByCourse, setGroupByCourse] = useState(true)

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return initialDrafts
    return initialDrafts.filter((entry) => {
      const haystack = [
        entry.lessonTitle,
        entry.chapterTitle ?? '',
        entry.courseTitle ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [initialDrafts, searchValue])

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { courseId: string | null; courseTitle: string; entries: DraftLessonEntry[] }
    >()
    for (const entry of filtered) {
      const key = entry.courseId ?? '__orphan__'
      const courseTitle = entry.courseTitle ?? 'Unassigned'
      if (!map.has(key)) {
        map.set(key, { courseId: entry.courseId, courseTitle, entries: [] })
      }
      map.get(key)!.entries.push(entry)
    }
    return Array.from(map.values()).sort((a, b) => a.courseTitle.localeCompare(b.courseTitle))
  }, [filtered])

  const totalCount = initialDrafts.length
  const filteredCount = filtered.length

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--cpp-muted)]">
            <Link
              href="/admin/courses"
              className="font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
            >
              Courses
            </Link>
            <span aria-hidden>›</span>
            <span>Draft lessons</span>
          </div>
          <h1 className="m-0 mt-1 text-2xl font-semibold text-[var(--cpp-ink)]">
            Draft lessons
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--cpp-muted)]">
            Every lesson that hasn&apos;t been published yet. Open one to finish the content
            and publish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HelpLink topic="courses" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search by lesson, chapter, or course…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full max-w-md rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] placeholder:text-[var(--cpp-muted)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          aria-label="Search draft lessons"
        />
        <label className="inline-flex items-center gap-1.5 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--cpp-ink)]">
          <input
            type="checkbox"
            checked={groupByCourse}
            onChange={(event) => setGroupByCourse(event.target.checked)}
          />
          Group by course
        </label>
        <div className="text-xs text-[var(--cpp-muted)]">
          {searchValue
            ? `${filteredCount} of ${totalCount} draft${totalCount === 1 ? '' : 's'}`
            : `${totalCount} draft${totalCount === 1 ? '' : 's'}`}
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-8 text-center text-sm text-[var(--cpp-muted)]">
          <p className="font-semibold text-[var(--cpp-ink)]">No draft lessons</p>
          <p className="mt-1">Every lesson across every course is published. Nice.</p>
          <Link
            href="/admin/courses"
            className="mt-3 inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline"
          >
            Back to courses
          </Link>
        </div>
      ) : filteredCount === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-6 text-sm text-[var(--cpp-muted)]">
          No drafts match “{searchValue}”.
        </div>
      ) : groupByCourse ? (
        <div className="grid gap-4">
          {grouped.map((group) => (
            <DraftGroupCard key={group.courseId ?? '__orphan__'} group={group} />
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((entry) => (
            <DraftRow key={entry.lessonId} entry={entry} showCourse />
          ))}
        </div>
      )}
    </div>
  )
}

function DraftGroupCard({
  group,
}: {
  group: { courseId: string | null; courseTitle: string; entries: DraftLessonEntry[] }
}) {
  return (
    <section className="rounded-lg border border-[var(--admin-surface-border)] bg-[var(--admin-surface)]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--admin-surface-border)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
            Course
          </span>
          {group.courseId ? (
            <Link
              href={`/admin/courses/${group.courseId}`}
              className="text-sm font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
            >
              {group.courseTitle}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-[var(--cpp-ink)]">
              {group.courseTitle}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-amber-700">
          {group.entries.length} draft{group.entries.length === 1 ? '' : 's'}
        </span>
      </header>
      <ul className="divide-y divide-[var(--admin-surface-border)]">
        {group.entries.map((entry) => (
          <li key={entry.lessonId}>
            <DraftRow entry={entry} showCourse={false} embedded />
          </li>
        ))}
      </ul>
    </section>
  )
}

function DraftRow({
  entry,
  showCourse,
  embedded = false,
}: {
  entry: DraftLessonEntry
  showCourse: boolean
  embedded?: boolean
}) {
  const updatedRel = formatRelative(entry.updatedAt)
  const editorHref =
    entry.courseId && entry.lessonId
      ? `/admin/courses/${entry.courseId}/lessons/${entry.lessonId}/edit`
      : null

  const inner = (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-[var(--cpp-ink)]">
            {entry.lessonTitle || 'Untitled lesson'}
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
            Draft
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--cpp-muted)]">
          {showCourse && entry.courseTitle ? (
            <>
              <span>
                Course: <strong className="text-[var(--cpp-ink)]">{entry.courseTitle}</strong>
              </span>
              <span aria-hidden>·</span>
            </>
          ) : null}
          {entry.chapterTitle ? (
            <span>Chapter: {entry.chapterTitle}</span>
          ) : (
            <span>No chapter</span>
          )}
          <span aria-hidden>·</span>
          <span>
            {entry.blockCount} block{entry.blockCount === 1 ? '' : 's'}
          </span>
          {updatedRel ? (
            <>
              <span aria-hidden>·</span>
              <span>Updated {updatedRel}</span>
            </>
          ) : null}
        </div>
      </div>
      {editorHref ? (
        <span className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
          Open editor →
        </span>
      ) : (
        <span className="text-xs text-[var(--cpp-muted)]">No editor link</span>
      )}
    </div>
  )

  if (!editorHref) {
    return (
      <div
        className={
          embedded
            ? 'block'
            : 'block rounded-lg border border-[var(--admin-surface-border)] bg-[var(--admin-surface)]'
        }
      >
        {inner}
      </div>
    )
  }

  return (
    <Link
      href={editorHref}
      className={
        embedded
          ? 'block no-underline text-[var(--cpp-ink)] transition hover:bg-[var(--admin-surface-muted)]'
          : 'block rounded-lg border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] no-underline text-[var(--cpp-ink)] transition hover:border-sky-300'
      }
    >
      {inner}
    </Link>
  )
}
