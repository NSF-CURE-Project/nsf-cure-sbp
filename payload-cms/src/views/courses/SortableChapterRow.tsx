'use client'

import React, { useEffect, useState } from 'react'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ChapterNode, DragMeta, EntityId } from './types'
import DragHandle from './DragHandle'
import DropIndicator from './DropIndicator'
import SortableLessonRow from './SortableLessonRow'
import EmptyLessonState from './EmptyLessonState'
import RowOverflowMenu, { type OverflowAction } from './RowOverflowMenu'
import InlineLessonInput from './InlineLessonInput'

type SortableChapterRowProps = {
  chapter: ChapterNode
  courseId: string
  index: number
  lessonDropTargetId: EntityId | null
  chapterDropTargetId: EntityId | null
  deleting: boolean
  deletingLessonId: EntityId | null
  duplicatingLessonId: EntityId | null
  reorderMode: boolean
  isSelected: boolean
  selectedLessonId: EntityId | null
  onDeleteChapter: (chapter: ChapterNode) => void
  onDeleteLesson: (lesson: ChapterNode['lessons'][number]) => void
  onSelectChapter: (chapter: ChapterNode) => void
  onSelectLesson: (lesson: ChapterNode['lessons'][number], chapter: ChapterNode) => void
  onCreateLesson: (chapter: ChapterNode, title: string) => void
  onAttachLesson: (chapter: ChapterNode) => void
  onSetUpLesson: (lesson: ChapterNode['lessons'][number]) => void
  onAssignQuiz: (lesson: ChapterNode['lessons'][number]) => void
  onDuplicateLesson: (lesson: ChapterNode['lessons'][number]) => void
}

// Persist per-chapter collapse state in sessionStorage so navigating away
// and back keeps the author's focus context. Keyed by course+chapter so
// collapsing on one course doesn't bleed into another.
const collapseKey = (courseId: EntityId, chapterId: EntityId) =>
  `chapter-collapsed:${courseId}:${chapterId}`

const readCollapsed = (courseId: EntityId, chapterId: EntityId): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(collapseKey(courseId, chapterId)) === '1'
  } catch {
    return false
  }
}

export default function SortableChapterRow({
  chapter,
  courseId,
  index,
  lessonDropTargetId,
  chapterDropTargetId,
  deleting,
  deletingLessonId,
  duplicatingLessonId,
  reorderMode,
  isSelected,
  selectedLessonId,
  onDeleteChapter,
  onDeleteLesson,
  onSelectChapter,
  onSelectLesson,
  onCreateLesson,
  onAttachLesson,
  onSetUpLesson,
  onAssignQuiz,
  onDuplicateLesson,
}: SortableChapterRowProps) {
  const sortable = useSortable({
    id: `chapter:${chapter.id}`,
    data: {
      type: 'chapter',
      courseId,
      chapterId: chapter.id,
      index,
    } satisfies DragMeta,
  })

  const lessonContainer = useDroppable({
    id: `chapter-lessons:${chapter.id}`,
    data: {
      type: 'chapter-lessons',
      chapterId: chapter.id,
      courseId,
    } satisfies DragMeta,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.55 : 1,
  }

  // Default to expanded server-side to avoid hydration mismatch; rehydrate
  // from sessionStorage on the client after mount.
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    setCollapsed(readCollapsed(courseId, chapter.id))
  }, [courseId, chapter.id])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        if (next) {
          window.sessionStorage.setItem(collapseKey(courseId, chapter.id), '1')
        } else {
          window.sessionStorage.removeItem(collapseKey(courseId, chapter.id))
        }
      } catch {
        // sessionStorage unavailable (private mode, quota) — degrade
        // silently; UI state still works for the session.
      }
      return next
    })
  }

  const lessonCount = chapter.lessons.length
  // Force-expand while dragging or in reorder mode so authors can still drop
  // into a chapter they previously collapsed.
  const visuallyCollapsed = collapsed && !reorderMode

  return (
    <section
      ref={sortable.setNodeRef}
      style={style}
      className={`cw-chapter${isSelected ? ' cw-chapter--selected' : ''}${visuallyCollapsed ? ' cw-chapter--collapsed' : ''}`}
      data-reorder={reorderMode || undefined}
    >
      <DropIndicator visible={chapterDropTargetId === chapter.id} />

      <header className="cw-chapter__header">
        <div className="cw-chapter__handle">
          <DragHandle
            label={`Reorder chapter ${chapter.title}`}
            listeners={sortable.listeners as Record<string, unknown>}
            attributes={sortable.attributes as unknown as Record<string, unknown>}
          />
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          className="cw-chapter__collapse"
          aria-expanded={!visuallyCollapsed}
          aria-controls={`chapter-lessons-${chapter.id}`}
          aria-label={visuallyCollapsed ? `Expand ${chapter.title}` : `Collapse ${chapter.title}`}
        >
          <span aria-hidden>{visuallyCollapsed ? '▸' : '▾'}</span>
        </button>
        <span className="cw-chapter__badge">Chapter</span>
        <span className="cw-chapter__index">#{chapter.order}</span>
        <button
          type="button"
          onClick={() => onSelectChapter(chapter)}
          className="cw-chapter__titlebtn"
          aria-pressed={isSelected}
        >
          <span className="cw-chapter__title">{chapter.title}</span>
        </button>
        <span className="cw-chapter__meta">
          {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
        </span>
        {reorderMode ? null : (
          <div className="cw-chapter__actions">
            <RowOverflowMenu
              ariaLabel={`More actions for chapter ${chapter.title}`}
              actions={
                [
                  {
                    kind: 'button',
                    label: 'Delete chapter',
                    destructive: true,
                    disabled: deleting,
                    pendingLabel: 'Deleting…',
                    onClick: () => onDeleteChapter(chapter),
                  },
                ] satisfies OverflowAction[]
              }
            />
          </div>
        )}
      </header>

      {visuallyCollapsed ? null : (
        <div
          ref={lessonContainer.setNodeRef}
          id={`chapter-lessons-${chapter.id}`}
          className="cw-chapter__lessons"
        >
          <SortableContext
            items={chapter.lessons.map((lesson) => `lesson:${lesson.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {chapter.lessons.length ? (
              chapter.lessons.map((lesson, lessonIndex) => (
                <SortableLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  chapterId={chapter.id}
                  courseId={courseId}
                  index={lessonIndex}
                  isDropTarget={lessonDropTargetId === lesson.id}
                  deleting={deletingLessonId === lesson.id}
                  duplicating={duplicatingLessonId === lesson.id}
                  reorderMode={reorderMode}
                  isSelected={selectedLessonId === lesson.id}
                  onDelete={onDeleteLesson}
                  onSelect={(lessonNode) => onSelectLesson(lessonNode, chapter)}
                  onSetUp={onSetUpLesson}
                  onAssignQuiz={onAssignQuiz}
                  onDuplicate={onDuplicateLesson}
                />
              ))
            ) : (
              <EmptyLessonState />
            )}
          </SortableContext>

          {reorderMode ? null : (
            <InlineLessonInput
              onSubmit={(title) => onCreateLesson(chapter, title)}
              onAttachExisting={() => onAttachLesson(chapter)}
            />
          )}
        </div>
      )}
    </section>
  )
}
