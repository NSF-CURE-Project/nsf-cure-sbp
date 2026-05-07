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

const formatRelativeUpdated = (iso: string | null | undefined): string | null => {
  if (!iso) return null
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return null
  const diffMs = Date.now() - ts
  if (diffMs < 0) return null
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diffMs < minute) return 'Edited just now'
  if (diffMs < hour) return `Edited ${Math.floor(diffMs / minute)}m ago`
  if (diffMs < day) return `Edited ${Math.floor(diffMs / hour)}h ago`
  if (diffMs < 30 * day) return `Edited ${Math.floor(diffMs / day)}d ago`
  return `Edited ${new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
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
    opacity: sortable.isDragging ? 0.6 : 1,
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

  const status = lesson.status ?? 'published'
  const updatedLabel = formatRelativeUpdated(lesson.updatedAt)
  const hasQuiz = Boolean(lesson.quizTitle)

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`cw-lesson${isSelected ? ' cw-lesson--selected' : ''}`}
      data-reorder={reorderMode || undefined}
    >
      <DropIndicator visible={isDropTarget} />
      <div className="cw-lesson__handle">
        <DragHandle
          label={`Reorder lesson ${lesson.title}`}
          listeners={sortable.listeners as Record<string, unknown>}
          attributes={sortable.attributes as unknown as Record<string, unknown>}
        />
      </div>
      <button
        type="button"
        onClick={() => onSelect(lesson)}
        className="cw-lesson__titlebtn"
        aria-pressed={isSelected}
      >
        <div className="cw-lesson__title">{lesson.title}</div>
        <div className="cw-lesson__meta">
          <span
            className={`cw-status ${status === 'published' ? 'cw-status--ok' : 'cw-status--draft'}`}
          >
            {status === 'published' ? 'Published' : 'Draft'}
          </span>
          {updatedLabel ? (
            <>
              <span className="cw-lesson__sep" aria-hidden>
                •
              </span>
              <span>{updatedLabel}</span>
            </>
          ) : null}
        </div>
      </button>
      {reorderMode ? null : (
        <div className="cw-lesson__actions">
          <button
            type="button"
            onClick={() => onAssignQuiz(lesson)}
            className={`cw-quiz-badge ${hasQuiz ? 'cw-quiz-badge--ok' : 'cw-quiz-badge--missing'}`}
            aria-label={
              hasQuiz
                ? `Change quiz for lesson ${lesson.title}`
                : `Assign quiz to lesson ${lesson.title}`
            }
            title={hasQuiz ? `Quiz: ${lesson.quizTitle}` : 'No quiz assigned'}
          >
            <span aria-hidden className="cw-quiz-badge__glyph">
              {hasQuiz ? '✓' : '⚠'}
            </span>
            <span className="cw-quiz-badge__label">
              {hasQuiz ? 'Quiz attached' : 'No quiz'}
            </span>
          </button>
          <Link
            href={`/admin/collections/lessons/${lesson.id}`}
            className="cw-btn cw-btn--ghost cw-lesson__edit"
            aria-label={`Edit lesson ${lesson.title}`}
          >
            Edit
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
