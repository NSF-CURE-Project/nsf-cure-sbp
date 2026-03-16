'use client'

import React from 'react'
import Link from 'next/link'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ChapterNode, DragMeta, EntityId } from './types'
import DragHandle from './DragHandle'
import DropIndicator from './DropIndicator'
import SortableLessonRow from './SortableLessonRow'
import EmptyLessonState from './EmptyLessonState'

type SortableChapterRowProps = {
  chapter: ChapterNode
  courseId: string
  index: number
  lessonDropTargetId: EntityId | null
  chapterDropTargetId: EntityId | null
}

export default function SortableChapterRow({
  chapter,
  courseId,
  index,
  lessonDropTargetId,
  chapterDropTargetId,
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
      className={`relative rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] ${
        sortable.isDragging ? 'opacity-60' : ''
      }`}
    >
      <DropIndicator visible={chapterDropTargetId === chapter.id} />
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2 py-2">
        <DragHandle
          label={`Reorder chapter ${chapter.title}`}
          listeners={sortable.listeners as Record<string, unknown>}
          attributes={sortable.attributes as unknown as Record<string, unknown>}
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[var(--cpp-ink)]">{chapter.title}</div>
          <div className="text-xs text-[var(--cpp-muted)]">
            {chapter.lessons.length} lesson{chapter.lessons.length === 1 ? '' : 's'}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/collections/chapters/${chapter.id}`}
            className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
            aria-label={`Edit chapter ${chapter.title}`}
          >
            Edit chapter
          </Link>
          <Link
            href={`/admin/collections/lessons/create?chapter=${chapter.id}`}
            className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
            aria-label={`Add lesson to chapter ${chapter.title}`}
          >
            Add lesson
          </Link>
        </div>
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
                />
              ))
            ) : (
              <EmptyLessonState />
            )}
          </SortableContext>

          <Link
            href={`/admin/collections/lessons/create?chapter=${chapter.id}`}
            className="inline-flex w-fit rounded-md px-1 py-1 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
          >
            + Add lesson
          </Link>
        </div>
      </div>
    </div>
  )
}
