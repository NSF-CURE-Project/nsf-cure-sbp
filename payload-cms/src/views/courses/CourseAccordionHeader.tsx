'use client'

import React from 'react'
import Link from 'next/link'
import DragHandle from './DragHandle'

type CourseAccordionHeaderProps = {
  courseId: string
  title: string
  chapterCount: number
  lessonCount: number
  expanded: boolean
  onToggle: () => void
  dragHandle: {
    listeners?: Record<string, unknown>
    attributes?: Record<string, unknown>
    disabled?: boolean
  }
}

export default function CourseAccordionHeader({
  courseId,
  title,
  chapterCount,
  lessonCount,
  expanded,
  onToggle,
  dragHandle,
}: CourseAccordionHeaderProps) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2">
      <DragHandle label={`Reorder course ${title}`} {...dragHandle} />

      <button
        type="button"
        onClick={onToggle}
        className="flex min-w-0 items-center gap-3 rounded-md px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} course ${title}`}
      >
        <span className="truncate text-sm font-semibold text-[var(--cpp-ink)]">{title}</span>
        <span className="rounded-full border border-[var(--admin-surface-border)] px-2 py-0.5 text-xs text-[var(--cpp-muted)]">
          {chapterCount} chapter{chapterCount === 1 ? '' : 's'}
        </span>
        <span className="rounded-full border border-[var(--admin-surface-border)] px-2 py-0.5 text-xs text-[var(--cpp-muted)]">
          {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
        </span>
      </button>

      <div className="flex items-center gap-2">
        <Link
          href={`/admin/collections/classes/${courseId}`}
          className="rounded-md border border-[var(--admin-surface-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] no-underline transition hover:bg-[var(--admin-surface-muted)]"
          aria-label={`Edit course ${title}`}
        >
          Edit course
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-surface-border)] text-[var(--cpp-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} course ${title}`}
          aria-expanded={expanded}
        >
          <span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
      </div>
    </div>
  )
}
