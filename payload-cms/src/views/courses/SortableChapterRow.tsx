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
  }

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`relative rounded-md border bg-[var(--admin-surface)] ${
        isSelected ? 'border-sky-400 ring-1 ring-sky-200' : 'border-[var(--admin-surface-border)]'
      } ${sortable.isDragging ? 'opacity-60' : ''}`}
    >
      <DropIndicator visible={chapterDropTargetId === chapter.id} />
      <div className="group/row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2 py-2">
        <div
          className={
            reorderMode
              ? 'opacity-100'
              : 'opacity-30 transition group-hover/row:opacity-100 focus-within:opacity-100'
          }
        >
          <DragHandle
            label={`Reorder chapter ${chapter.title}`}
            listeners={sortable.listeners as Record<string, unknown>}
            attributes={sortable.attributes as unknown as Record<string, unknown>}
          />
        </div>
        <button
          type="button"
          onClick={() => onSelectChapter(chapter)}
          className="min-w-0 cursor-pointer rounded-sm bg-transparent px-1 py-0.5 text-left transition hover:bg-[var(--admin-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-pressed={isSelected}
        >
          <div className="truncate text-sm font-semibold text-[var(--cpp-ink)]">
            {chapter.title}
          </div>
          <div className="text-xs text-[var(--cpp-muted)]">
            {chapter.lessons.length} lesson{chapter.lessons.length === 1 ? '' : 's'}
          </div>
        </button>
        {reorderMode ? null : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAddLesson(chapter)}
              className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
              aria-label={`Add lesson to chapter ${chapter.title}`}
            >
              Add lesson
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
      </div>

      <div className="border-t border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-2 py-2">
        <div ref={lessonContainer.setNodeRef} className="ml-6 grid gap-1.5">
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
              className="inline-flex w-fit rounded-md bg-transparent px-1 py-1 text-xs font-semibold text-[var(--cpp-ink)] hover:underline"
            >
              + Add lesson
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
