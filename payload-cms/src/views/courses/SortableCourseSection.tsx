'use client'

import React from 'react'
import Link from 'next/link'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CourseCounts, CourseNode, DragMeta, EntityId } from './types'
import CourseAccordionHeader from './CourseAccordionHeader'
import SortableChapterRow from './SortableChapterRow'
import EmptyChapterState from './EmptyChapterState'
import DropIndicator from './DropIndicator'

type SortableCourseSectionProps = {
  course: CourseNode
  expanded: boolean
  onToggleExpanded: (courseId: EntityId) => void
  counts: CourseCounts
  lessonDropTargetId: EntityId | null
  chapterDropTargetId: EntityId | null
  courseDropTargetId: EntityId | null
  deletingChapterId: EntityId | null
  deletingCourseId: EntityId | null
  deletingLessonId: EntityId | null
  onDeleteChapter: (chapter: CourseNode['chapters'][number]) => void
  onDeleteCourse: (course: CourseNode) => void
  onDeleteLesson: (lesson: CourseNode['chapters'][number]['lessons'][number]) => void
}

export default function SortableCourseSection({
  course,
  expanded,
  onToggleExpanded,
  counts,
  lessonDropTargetId,
  chapterDropTargetId,
  courseDropTargetId,
  deletingChapterId,
  deletingCourseId,
  deletingLessonId,
  onDeleteChapter,
  onDeleteCourse,
  onDeleteLesson,
}: SortableCourseSectionProps) {
  const sortable = useSortable({
    id: `course:${course.id}`,
    data: {
      type: 'course',
      courseId: course.id,
      index: Math.max(course.order - 1, 0),
    } satisfies DragMeta,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }

  return (
    <section
      ref={sortable.setNodeRef}
      style={style}
      className={`relative overflow-hidden rounded-lg border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] ${
        sortable.isDragging ? 'opacity-60' : ''
      }`}
    >
      <DropIndicator visible={courseDropTargetId === course.id} />
      <CourseAccordionHeader
        courseId={course.id}
        title={course.title}
        chapterCount={counts.chapterCount}
        lessonCount={counts.lessonCount}
        expanded={expanded}
        onToggle={() => onToggleExpanded(course.id)}
        deleting={deletingCourseId === course.id}
        onDelete={() => onDeleteCourse(course)}
        dragHandle={{
          listeners: sortable.listeners as Record<string, unknown>,
          attributes: sortable.attributes as unknown as Record<string, unknown>,
        }}
      />

      {expanded ? (
        <div className="border-t border-[var(--admin-surface-border)] px-2 py-2">
          <SortableContext
            items={course.chapters.map((chapter) => `chapter:${chapter.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-2">
              {course.chapters.length ? (
                course.chapters.map((chapter, index) => (
                  <SortableChapterRow
                    key={chapter.id}
                    chapter={chapter}
                    courseId={course.id}
                    index={index}
                    lessonDropTargetId={lessonDropTargetId}
                    chapterDropTargetId={chapterDropTargetId}
                    deleting={deletingChapterId === chapter.id}
                    deletingLessonId={deletingLessonId}
                    onDeleteChapter={onDeleteChapter}
                    onDeleteLesson={onDeleteLesson}
                  />
                ))
              ) : (
                <EmptyChapterState />
              )}
            </div>
          </SortableContext>

          <div className="mt-2 pl-1">
            <Link
              href={`/admin/collections/chapters/create?class=${course.id}`}
              className="inline-flex rounded-md px-1 py-1 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
            >
              + Add chapter
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  )
}
