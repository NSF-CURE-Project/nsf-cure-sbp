'use client'

import React from 'react'
import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragMeta, LessonNode } from './types'
import DragHandle from './DragHandle'
import DropIndicator from './DropIndicator'

type SortableLessonRowProps = {
  lesson: LessonNode
  courseId: string
  chapterId: string
  index: number
  isDropTarget: boolean
  deleting: boolean
  onDelete: (lesson: LessonNode) => void
}

export default function SortableLessonRow({
  lesson,
  courseId,
  chapterId,
  index,
  isDropTarget,
  deleting,
  onDelete,
}: SortableLessonRowProps) {
  const sortable = useSortable({
    id: `lesson:${lesson.id}`,
    data: {
      type: 'lesson',
      lessonId: lesson.id,
      courseId,
      chapterId,
      index,
    } satisfies DragMeta,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }

  const actionLabel = lesson.quizTitle ? 'Change quiz' : 'Assign quiz'

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-2 py-1.5 transition ${
        sortable.isDragging ? 'opacity-60' : 'hover:bg-[var(--admin-surface-muted)]'
      }`}
    >
      <DropIndicator visible={isDropTarget} />
      <DragHandle
        label={`Reorder lesson ${lesson.title}`}
        listeners={sortable.listeners as Record<string, unknown>}
        attributes={sortable.attributes as unknown as Record<string, unknown>}
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-[var(--cpp-ink)]">{lesson.title}</div>
        <div className="truncate text-xs text-[var(--cpp-muted)]">
          Quiz: {lesson.quizTitle || 'Not assigned'}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Link
          href={`/admin/collections/lessons/${lesson.id}`}
          className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
          aria-label={`Edit lesson ${lesson.title}`}
        >
          Edit lesson
        </Link>
        <Link
          href={`/admin/collections/lessons/${lesson.id}`}
          className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
          aria-label={`${actionLabel} for lesson ${lesson.title}`}
        >
          {actionLabel}
        </Link>
        <button
          type="button"
          onClick={() => onDelete(lesson)}
          disabled={deleting}
          className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Delete lesson ${lesson.title}`}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
