'use client'

import React from 'react'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ChapterNode, DragMeta, EntityId } from './types'
import DragHandle from './DragHandle'
import DropIndicator from './DropIndicator'
import SortableLessonRow from './SortableLessonRow'
import EmptyLessonState from './EmptyLessonState'
import RowOverflowMenu, { type OverflowAction } from './RowOverflowMenu'

type SortableChapterRowProps = {
  chapter: ChapterNode
  courseId: string
  index: number
  lessonDropTargetId: EntityId | null
  chapterDropTargetId: EntityId | null
  deleting: boolean
  deletingLessonId: EntityId | null
  reorderMode: boolean
  isSelected: boolean
  selectedLessonId: EntityId | null
  onDeleteChapter: (chapter: ChapterNode) => void
  onDeleteLesson: (lesson: ChapterNode['lessons'][number]) => void
  onSelectChapter: (chapter: ChapterNode) => void
  onSelectLesson: (lesson: ChapterNode['lessons'][number], chapter: ChapterNode) => void
  onAddLesson: (chapter: ChapterNode) => void
  onAssignQuiz: (lesson: ChapterNode['lessons'][number]) => void
}

export default function SortableChapterRow({
  chapter,
  courseId,
  index,
  lessonDropTargetId,
  chapterDropTargetId,
  deleting,
  deletingLessonId,
  reorderMode,
  isSelected,
  selectedLessonId,
  onDeleteChapter,
  onDeleteLesson,
  onSelectChapter,
  onSelectLesson,
  onAddLesson,
  onAssignQuiz,
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

  const lessonCount = chapter.lessons.length

  return (
    <section
      ref={sortable.setNodeRef}
      style={style}
      className={`cw-chapter${isSelected ? ' cw-chapter--selected' : ''}`}
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
          onClick={() => onSelectChapter(chapter)}
          className="cw-chapter__titlebtn"
          aria-pressed={isSelected}
        >
          <div className="cw-chapter__eyebrow">
            Chapter {chapter.order}
          </div>
          <div className="cw-chapter__title">{chapter.title}</div>
          <div className="cw-chapter__meta">
            {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
          </div>
        </button>

        {reorderMode ? null : (
          <div className="cw-chapter__actions">
            <button
              type="button"
              onClick={() => onAddLesson(chapter)}
              className="cw-btn cw-btn--ghost"
              aria-label={`Add lesson to chapter ${chapter.title}`}
            >
              + Add lesson
            </button>
            <RowOverflowMenu
              ariaLabel={`More actions for chapter ${chapter.title}`}
              actions={
                [
                  {
                    kind: 'link',
                    label: 'Edit chapter',
                    href: `/admin/collections/chapters/${chapter.id}`,
                  },
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

      <div ref={lessonContainer.setNodeRef} className="cw-chapter__lessons">
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
                reorderMode={reorderMode}
                isSelected={selectedLessonId === lesson.id}
                onDelete={onDeleteLesson}
                onSelect={(lessonNode) => onSelectLesson(lessonNode, chapter)}
                onAssignQuiz={onAssignQuiz}
              />
            ))
          ) : (
            <EmptyLessonState />
          )}
        </SortableContext>

        {reorderMode ? null : (
          <button
            type="button"
            onClick={() => onAddLesson(chapter)}
            className="cw-chapter__add-inline"
          >
            <span aria-hidden="true">+</span>
            <span>Add lesson</span>
          </button>
        )}
      </div>
    </section>
  )
}
