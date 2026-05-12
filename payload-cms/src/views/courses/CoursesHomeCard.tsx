'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragMeta, EntityId } from './types'
import DragHandle from './DragHandle'
import DropIndicator from './DropIndicator'

export type CourseCatalogItem = {
  id: EntityId
  title: string
  order: number
  chapterCount: number
  lessonCount: number
  quizCount: number
  classroomCount: number
  updatedAt: string | null
}

type CoursesHomeCardProps = {
  course: CourseCatalogItem
  index: number
  isDropTarget: boolean
  deleting: boolean
  onDelete: (course: CourseCatalogItem) => void
}

const formatRelativeDate = (iso: string | null) => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function CoursesHomeCard({
  course,
  index,
  isDropTarget,
  deleting,
  onDelete,
}: CoursesHomeCardProps) {
  const sortable = useSortable({
    id: `course:${course.id}`,
    data: {
      type: 'course',
      courseId: course.id,
      index,
    } satisfies DragMeta,
  })

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handlePointer = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }

  const status = course.chapterCount === 0 ? 'Empty' : 'Active'
  const updatedLabel = formatRelativeDate(course.updatedAt)
  const quizCoverage =
    course.lessonCount === 0 ? null : `${course.quizCount}/${course.lessonCount} quizzes`

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      className={`group relative rounded-lg border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] p-4 transition hover:border-sky-300 ${
        sortable.isDragging ? 'opacity-60' : ''
      }`}
    >
      <DropIndicator visible={isDropTarget} />

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <div className="opacity-30 transition group-hover:opacity-100">
          <DragHandle
            label={`Reorder course ${course.title}`}
            listeners={sortable.listeners as Record<string, unknown>}
            attributes={sortable.attributes as unknown as Record<string, unknown>}
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/courses/${course.id}`}
              className="truncate text-base font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
            >
              {course.title}
            </Link>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {status}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--cpp-muted)]">
            <span>
              {course.chapterCount} chapter{course.chapterCount === 1 ? '' : 's'}
            </span>
            <span aria-hidden>·</span>
            <span>
              {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}
            </span>
            {quizCoverage ? (
              <>
                <span aria-hidden>·</span>
                <span>{quizCoverage}</span>
              </>
            ) : null}
            {course.classroomCount > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span>
                  {course.classroomCount} classroom{course.classroomCount === 1 ? '' : 's'}
                </span>
              </>
            ) : null}
            {updatedLabel ? (
              <>
                <span aria-hidden>·</span>
                <span>Updated {updatedLabel}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/courses/${course.id}`}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-slate-800"
          >
            Open workspace
          </Link>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`More actions for ${course.title}`}
              className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1.5 text-sm font-semibold text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
            >
              ⋯
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] shadow-lg"
              >
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  role="menuitem"
                  className="block px-3 py-2 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
                >
                  Edit details
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  disabled={deleting}
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(course)
                  }}
                  className="block w-full border-t border-[var(--admin-surface-border)] px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete course'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
