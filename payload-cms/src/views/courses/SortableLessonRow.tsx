'use client'

import React from 'react'
import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragMeta, LessonNode } from './types'
import DragHandle from './DragHandle'
import DropIndicator from './DropIndicator'
import RowOverflowMenu, { type OverflowAction } from './RowOverflowMenu'

type SortableLessonRowProps = {
  lesson: LessonNode
  courseId: string
  chapterId: string
  index: number
  isDropTarget: boolean
  deleting: boolean
  reorderMode: boolean
  isSelected: boolean
  onDelete: (lesson: LessonNode) => void
  onSelect: (lesson: LessonNode) => void
  onAssignQuiz: (lesson: LessonNode) => void
}

export default function SortableLessonRow({
  lesson,
  courseId,
  chapterId,
  index,
  isDropTarget,
  deleting,
  reorderMode,
  isSelected,
  onDelete,
  onSelect,
  onAssignQuiz,
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

  const overflowActions: OverflowAction[] = [
    {
      kind: 'button',
      label: lesson.quizTitle ? 'Change quiz' : 'Assign quiz',
      onClick: () => onAssignQuiz(lesson),
    },
    {
      kind: 'button',
      label: 'Delete lesson',
      destructive: true,
      disabled: deleting,
      pendingLabel: 'Deleting…',
      onClick: () => onDelete(lesson),
    },
  ]

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border bg-[var(--admin-surface)] px-2 py-1.5 transition ${
        isSelected
          ? 'border-sky-400 ring-1 ring-sky-200'
          : 'border-[var(--admin-surface-border)]'
      } ${sortable.isDragging ? 'opacity-60' : 'hover:bg-[var(--admin-surface-muted)]'}`}
    >
      <DropIndicator visible={isDropTarget} />
      <div
        className={
          reorderMode
            ? 'opacity-100'
            : 'opacity-30 transition group-hover:opacity-100 focus-within:opacity-100'
        }
      >
        <DragHandle
          label={`Reorder lesson ${lesson.title}`}
          listeners={sortable.listeners as Record<string, unknown>}
          attributes={sortable.attributes as unknown as Record<string, unknown>}
        />
      </div>
      <button
        type="button"
        onClick={() => onSelect(lesson)}
        className="min-w-0 cursor-pointer rounded-sm bg-transparent px-1 py-0.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        aria-pressed={isSelected}
      >
        <div className="truncate text-sm font-medium text-[var(--cpp-ink)]">{lesson.title}</div>
      </button>
      {reorderMode ? null : (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAssignQuiz(lesson)}
            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition ${
              lesson.quizTitle
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
            aria-label={
              lesson.quizTitle
                ? `Change quiz for lesson ${lesson.title}`
                : `Assign quiz to lesson ${lesson.title}`
            }
            title={lesson.quizTitle ? `Quiz: ${lesson.quizTitle}` : 'No quiz assigned'}
          >
            {lesson.quizTitle ? `Quiz: ${lesson.quizTitle}` : 'No quiz'}
          </button>
          <Link
            href={`/admin/collections/lessons/${lesson.id}`}
            className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
            aria-label={`Edit lesson ${lesson.title}`}
          >
            Edit lesson
          </Link>
          <RowOverflowMenu
            ariaLabel={`More actions for lesson ${lesson.title}`}
            actions={overflowActions}
          />
        </div>
      )}
    </div>
  )
}
