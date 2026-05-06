'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import type { CourseNode, DragMeta, EntityId, SaveStatus } from './types'
import CourseReorderHelperBanner from './CourseReorderHelperBanner'
import SaveStatusIndicator from './SaveStatusIndicator'
import SortableCourseSection from './SortableCourseSection'
import {
  cloneCourses,
  computeCourseCounts,
  getCourseByChapterId,
  normalizeCourseOrders,
  reorderInArray,
} from './reorder-utils'
import {
  deleteChapter,
  deleteCourse,
  deleteLesson,
  getChangedChapters,
  getChangedCourses,
  getChangedLessons,
  saveChapterOrder,
  saveCourseOrder,
  saveLessonPositions,
} from './courses-order-api'

type CourseBuilderPageProps = {
  initialCourses: CourseNode[]
}

type PersistAction =
  | { type: 'course'; previous: CourseNode[]; next: CourseNode[] }
  | {
      type: 'chapter'
      previous: CourseNode[]
      next: CourseNode[]
      courseId: EntityId
    }
  | {
      type: 'lesson'
      previous: CourseNode[]
      next: CourseNode[]
      chapterIds: EntityId[]
    }

const findLessonContainer = (courses: CourseNode[], lessonId: EntityId) => {
  for (const course of courses) {
    for (const chapter of course.chapters) {
      const lessonIndex = chapter.lessons.findIndex((lesson) => lesson.id === lessonId)
      if (lessonIndex >= 0) {
        return { courseId: course.id, chapterId: chapter.id, lessonIndex }
      }
    }
  }
  return null
}

const getDragMeta = (eventData: unknown): DragMeta | null => {
  const current = eventData as { current?: DragMeta }
  return current?.current ?? null
}

const flattenLessonsByChapter = (courses: CourseNode[], chapterIds: EntityId[]) => {
  const chapterSet = new Set(chapterIds)
  return courses
    .flatMap((course) => course.chapters)
    .filter((chapter) => chapterSet.has(chapter.id))
    .flatMap((chapter) => chapter.lessons)
}

const operationFailedMessage = 'Error saving order'

export default function CourseBuilderPage({ initialCourses }: CourseBuilderPageProps) {
  const router = useRouter()
  const [courses, setCourses] = useState<CourseNode[]>(() => normalizeCourseOrders(initialCourses))
  const [expandedIds, setExpandedIds] = useState<Set<EntityId>>(
    () => new Set(initialCourses.map((course) => course.id)),
  )
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [activeMeta, setActiveMeta] = useState<DragMeta | null>(null)
  const [courseDropTargetId, setCourseDropTargetId] = useState<EntityId | null>(null)
  const [chapterDropTargetId, setChapterDropTargetId] = useState<EntityId | null>(null)
  const [lessonDropTargetId, setLessonDropTargetId] = useState<EntityId | null>(null)
  const [deletingLessonId, setDeletingLessonId] = useState<EntityId | null>(null)
  const [deletingChapterId, setDeletingChapterId] = useState<EntityId | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<EntityId | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const deleteErrorRef = useRef<HTMLDivElement | null>(null)

  const committedRef = useRef<CourseNode[]>(normalizeCourseOrders(initialCourses))
  const saveQueueRef = useRef(Promise.resolve())
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    return () => {
      if (saveStatusTimerRef.current) {
        clearTimeout(saveStatusTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!deleteError || !deleteErrorRef.current) return
    deleteErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [deleteError])

  const courseCounts = useMemo(() => computeCourseCounts(courses), [courses])

  const clearDropTargets = () => {
    setCourseDropTargetId(null)
    setChapterDropTargetId(null)
    setLessonDropTargetId(null)
  }

  const setSavedStatus = () => {
    if (saveStatusTimerRef.current) {
      clearTimeout(saveStatusTimerRef.current)
    }
    setStatus('saved')
    saveStatusTimerRef.current = setTimeout(() => {
      setStatus('idle')
    }, 1800)
  }

  const enqueuePersist = (action: PersistAction) => {
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        setStatus('saving')
        try {
          if (action.type === 'course') {
            const changed = getChangedCourses(action.previous, action.next)
            if (changed.length) {
              await saveCourseOrder(changed)
            }
          }

          if (action.type === 'chapter') {
            const previousCourse = action.previous.find((course) => course.id === action.courseId)
            const nextCourse = action.next.find((course) => course.id === action.courseId)
            if (previousCourse && nextCourse) {
              const changedChapters = getChangedChapters(
                previousCourse.chapters,
                nextCourse.chapters,
              )
              if (changedChapters.length) {
                await saveChapterOrder(changedChapters)
              }
            }
          }

          if (action.type === 'lesson') {
            const previousLessons = flattenLessonsByChapter(action.previous, action.chapterIds)
            const nextLessons = flattenLessonsByChapter(action.next, action.chapterIds)
            const changedLessons = getChangedLessons(previousLessons, nextLessons)
            if (changedLessons.length) {
              await saveLessonPositions(changedLessons)
            }
          }

          committedRef.current = action.next
          setSavedStatus()
        } catch (_error) {
          setCourses(committedRef.current)
          setStatus('error')
          if (saveStatusTimerRef.current) {
            clearTimeout(saveStatusTimerRef.current)
          }
        }
      })
  }

  const handleToggleExpanded = (courseId: EntityId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
  }

  const handleDeleteLesson = async (lesson: CourseNode['chapters'][number]['lessons'][number]) => {
    if (deletingLessonId) return

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        `Delete "${lesson.title}"? This removes the lesson from the chapter and cannot be undone.`,
      )
      if (!confirmed) return
    }

    setDeleteError(null)
    setDeletingLessonId(lesson.id)

    try {
      await deleteLesson(lesson.id)
      const next = normalizeCourseOrders(
        courses.map((course) => ({
          ...course,
          chapters: course.chapters.map((chapter) => ({
            ...chapter,
            lessons: chapter.lessons.filter((item) => item.id !== lesson.id),
          })),
        })),
      )
      setCourses(next)
      committedRef.current = next
      router.refresh()
    } catch (_error) {
      setDeleteError(`Unable to delete "${lesson.title}".`)
    } finally {
      setDeletingLessonId(null)
    }
  }

  const handleDeleteChapter = async (chapter: CourseNode['chapters'][number]) => {
    if (deletingChapterId) return

    if (chapter.lessons.length > 0) {
      const message = `Cannot delete "${chapter.title}" because it still contains ${chapter.lessons.length} lesson${chapter.lessons.length === 1 ? '' : 's'}. Delete or move those lessons first.`
      setDeleteError(message)
      if (typeof window !== 'undefined') window.alert(message)
      return
    }

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        `Delete chapter "${chapter.title}"? This cannot be undone.`,
      )
      if (!confirmed) return
    }

    setDeleteError(null)
    setDeletingChapterId(chapter.id)

    try {
      await deleteChapter(chapter.id)
      const next = normalizeCourseOrders(
        courses.map((course) => ({
          ...course,
          chapters: course.chapters.filter((item) => item.id !== chapter.id),
        })),
      )
      setCourses(next)
      committedRef.current = next
      router.refresh()
    } catch (_error) {
      setDeleteError(`Unable to delete chapter "${chapter.title}".`)
    } finally {
      setDeletingChapterId(null)
    }
  }

  const handleDeleteCourse = async (course: CourseNode) => {
    if (deletingCourseId) return

    const chapterCount = course.chapters.length
    const lessonCount = course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)
    const classroomCount = course.classroomCount ?? 0

    if (chapterCount > 0 || lessonCount > 0 || classroomCount > 0) {
      const parts: string[] = []
      if (chapterCount > 0) parts.push(`${chapterCount} chapter${chapterCount === 1 ? '' : 's'}`)
      if (lessonCount > 0) parts.push(`${lessonCount} lesson${lessonCount === 1 ? '' : 's'}`)
      if (classroomCount > 0)
        parts.push(`${classroomCount} classroom${classroomCount === 1 ? '' : 's'}`)
      const joined =
        parts.length === 1
          ? parts[0]
          : parts.length === 2
            ? `${parts[0]} and ${parts[1]}`
            : `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
      const message = `Cannot delete "${course.title}" because it still contains ${joined}. Delete or move that content first.`
      setDeleteError(message)
      if (typeof window !== 'undefined') window.alert(message)
      return
    }

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Delete course "${course.title}"? This cannot be undone.`)
      if (!confirmed) return
    }

    setDeleteError(null)
    setDeletingCourseId(course.id)

    try {
      await deleteCourse(course.id)
      const next = normalizeCourseOrders(courses.filter((item) => item.id !== course.id))
      setCourses(next)
      committedRef.current = next
      router.refresh()
    } catch (_error) {
      setDeleteError(`Unable to delete course "${course.title}".`)
    } finally {
      setDeletingCourseId(null)
    }
  }

  const onDragStart = (event: DragStartEvent) => {
    const meta = getDragMeta(event.active.data)
    setActiveMeta(meta)
  }

  const onDragMove = (event: { over: DragEndEvent['over'] }) => {
    const overMeta = getDragMeta(event.over?.data)
    clearDropTargets()
    if (!overMeta) return
    if (overMeta.type === 'course') setCourseDropTargetId(overMeta.courseId)
    if (overMeta.type === 'chapter') setChapterDropTargetId(overMeta.chapterId)
    if (overMeta.type === 'lesson') setLessonDropTargetId(overMeta.lessonId)
    if (overMeta.type === 'chapter-lessons') setChapterDropTargetId(overMeta.chapterId)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const active = getDragMeta(event.active.data)
    const over = getDragMeta(event.over?.data)
    setActiveMeta(null)
    clearDropTargets()

    if (!active || !over) return

    if (active.type === 'course' && over.type === 'course') {
      if (active.courseId === over.courseId) return
      const previous = cloneCourses(courses)
      const fromIndex = courses.findIndex((course) => course.id === active.courseId)
      const toIndex = courses.findIndex((course) => course.id === over.courseId)
      const reordered = reorderInArray(courses, fromIndex, toIndex)
      const next = normalizeCourseOrders(reordered)
      setCourses(next)
      enqueuePersist({ type: 'course', previous, next })
      return
    }

    if (
      active.type === 'chapter' &&
      (over.type === 'chapter' || over.type === 'chapter-lessons') &&
      active.courseId === over.courseId
    ) {
      const targetChapterId = over.chapterId
      if (active.chapterId === targetChapterId) return
      const previous = cloneCourses(courses)
      const courseIndex = courses.findIndex((course) => course.id === active.courseId)
      if (courseIndex < 0) return
      const chapters = courses[courseIndex].chapters
      const fromIndex = chapters.findIndex((chapter) => chapter.id === active.chapterId)
      const toIndex = chapters.findIndex((chapter) => chapter.id === targetChapterId)
      const nextChapters = reorderInArray(chapters, fromIndex, toIndex)
      const nextCourses = [...courses]
      nextCourses[courseIndex] = {
        ...nextCourses[courseIndex],
        chapters: nextChapters,
      }
      const next = normalizeCourseOrders(nextCourses)
      setCourses(next)
      enqueuePersist({ type: 'chapter', previous, next, courseId: active.courseId })
      return
    }

    if (active.type === 'lesson' && (over.type === 'lesson' || over.type === 'chapter-lessons')) {
      if (over.type === 'lesson' && active.lessonId === over.lessonId) return
      const source = findLessonContainer(courses, active.lessonId)
      if (!source) return

      const previous = cloneCourses(courses)
      const nextCourses = cloneCourses(courses)
      const sourceInfo = getCourseByChapterId(nextCourses, source.chapterId)
      if (!sourceInfo) return

      const sourceChapter = sourceInfo.course.chapters[sourceInfo.chapterIndex]
      const movingLessonIndex = sourceChapter.lessons.findIndex(
        (lesson) => lesson.id === active.lessonId,
      )
      if (movingLessonIndex < 0) return

      const targetChapterId = over.type === 'lesson' ? over.chapterId : over.chapterId
      if (targetChapterId === source.chapterId && over.type === 'lesson') {
        const targetLessonIndex = sourceChapter.lessons.findIndex(
          (lesson) => lesson.id === over.lessonId,
        )
        if (targetLessonIndex < 0 || targetLessonIndex === movingLessonIndex) return
        sourceChapter.lessons = reorderInArray(
          sourceChapter.lessons,
          movingLessonIndex,
          targetLessonIndex,
        )
        const next = normalizeCourseOrders(nextCourses)
        setCourses(next)
        enqueuePersist({
          type: 'lesson',
          previous,
          next,
          chapterIds: [source.chapterId],
        })
        return
      }

      const [movingLesson] = sourceChapter.lessons.splice(movingLessonIndex, 1)
      const targetInfo = getCourseByChapterId(nextCourses, targetChapterId)
      if (!targetInfo) return

      const targetChapter = targetInfo.course.chapters[targetInfo.chapterIndex]
      const targetIndex =
        over.type === 'lesson'
          ? Math.max(
              0,
              targetChapter.lessons.findIndex((lesson) => lesson.id === over.lessonId),
            )
          : targetChapter.lessons.length

      targetChapter.lessons.splice(targetIndex, 0, {
        ...movingLesson,
        chapterId: targetChapter.id,
      })

      const next = normalizeCourseOrders(nextCourses)
      setCourses(next)
      enqueuePersist({
        type: 'lesson',
        previous,
        next,
        chapterIds: Array.from(new Set([source.chapterId, targetChapter.id])),
      })
    }
  }

  if (!courses.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-4 text-sm text-[var(--cpp-muted)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>No courses yet. Create your first course to begin building curriculum.</div>
          <Link
            href="/admin/collections/classes/create"
            className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white no-underline"
          >
            Create first course
          </Link>
        </div>
      </div>
    )
  }

  const overlayLabel =
    activeMeta?.type === 'course'
      ? courses.find((course) => course.id === activeMeta.courseId)?.title
      : activeMeta?.type === 'chapter'
        ? courses
            .flatMap((course) => course.chapters)
            .find((chapter) => chapter.id === activeMeta.chapterId)?.title
        : activeMeta?.type === 'lesson'
          ? courses
              .flatMap((course) => course.chapters)
              .flatMap((chapter) => chapter.lessons)
              .find((lesson) => lesson.id === activeMeta.lessonId)?.title
          : null

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CourseReorderHelperBanner />
        <Link
          href="/admin/collections/classes/create"
          className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white no-underline"
        >
          Add course
        </Link>
      </div>

      <SaveStatusIndicator status={status} />
      {status === 'error' ? (
        <div className="text-xs text-red-700">{operationFailedMessage}</div>
      ) : null}
      {deleteError ? (
        <div
          ref={deleteErrorRef}
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {deleteError}
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={courses.map((course) => `course:${course.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-2">
            {courses.map((course) => {
              const counts = courseCounts.get(course.id) ?? { chapterCount: 0, lessonCount: 0 }
              return (
                <SortableCourseSection
                  key={course.id}
                  course={course}
                  expanded={expandedIds.has(course.id)}
                  onToggleExpanded={handleToggleExpanded}
                  counts={counts}
                  lessonDropTargetId={lessonDropTargetId}
                  chapterDropTargetId={chapterDropTargetId}
                  courseDropTargetId={courseDropTargetId}
                  deletingChapterId={deletingChapterId}
                  deletingCourseId={deletingCourseId}
                  deletingLessonId={deletingLessonId}
                  onDeleteChapter={handleDeleteChapter}
                  onDeleteCourse={handleDeleteCourse}
                  onDeleteLesson={handleDeleteLesson}
                />
              )
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {overlayLabel ? (
            <div className="rounded-md border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-lg">
              {overlayLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
