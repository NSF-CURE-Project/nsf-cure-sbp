'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import type { ChapterNode, CourseNode, DragMeta, EntityId, LessonNode, SaveStatus } from './types'
import SortableChapterRow from './SortableChapterRow'
import EmptyChapterState from './EmptyChapterState'
import SaveStatusIndicator from './SaveStatusIndicator'
import EntityInspector, { type Selection } from './EntityInspector'
import LessonAssignmentDrawer from './LessonAssignmentDrawer'
import QuizAssignmentDrawer from './QuizAssignmentDrawer'
import {
  cloneCourses,
  getCourseByChapterId,
  normalizeCourseOrders,
  reorderInArray,
} from './reorder-utils'
import {
  createChapterInCourse,
  deleteChapter,
  deleteLesson,
  duplicateLesson,
  getChangedChapters,
  getChangedLessons,
  saveChapterOrder,
  saveLessonPositions,
} from './courses-order-api'

type CourseOutlineBoardProps = {
  initialCourse: CourseNode
  onCourseChange?: (course: CourseNode) => void
}

type PersistAction =
  | { type: 'chapter'; previous: CourseNode[]; next: CourseNode[] }
  | { type: 'lesson'; previous: CourseNode[]; next: CourseNode[]; chapterIds: EntityId[] }

const getDragMeta = (eventData: unknown): DragMeta | null => {
  const current = eventData as { current?: DragMeta }
  return current?.current ?? null
}

const flattenLessonsByChapter = (course: CourseNode, chapterIds: EntityId[]) => {
  const chapterSet = new Set(chapterIds)
  return course.chapters
    .filter((chapter) => chapterSet.has(chapter.id))
    .flatMap((chapter) => chapter.lessons)
}

const findLessonContainer = (course: CourseNode, lessonId: EntityId) => {
  for (const chapter of course.chapters) {
    const lessonIndex = chapter.lessons.findIndex((lesson) => lesson.id === lessonId)
    if (lessonIndex >= 0) {
      return { chapterId: chapter.id, lessonIndex }
    }
  }
  return null
}

const operationFailedMessage = 'Error saving order'

const resolveSelection = (
  course: CourseNode,
  selectedKey:
    | { type: 'chapter'; id: EntityId }
    | { type: 'lesson'; id: EntityId }
    | null,
): Selection => {
  if (!selectedKey) return null
  if (selectedKey.type === 'chapter') {
    const chapter = course.chapters.find((item) => item.id === selectedKey.id)
    return chapter ? { type: 'chapter', chapter } : null
  }
  for (const chapter of course.chapters) {
    const lesson = chapter.lessons.find((item) => item.id === selectedKey.id)
    if (lesson) return { type: 'lesson', lesson, chapterTitle: chapter.title }
  }
  return null
}

export default function CourseOutlineBoard({
  initialCourse,
  onCourseChange,
}: CourseOutlineBoardProps) {
  const router = useRouter()
  const [courses, setCourses] = useState<CourseNode[]>(() =>
    normalizeCourseOrders([initialCourse]),
  )
  const course = courses[0]

  const [status, setStatus] = useState<SaveStatus>('idle')
  const [activeMeta, setActiveMeta] = useState<DragMeta | null>(null)
  const [chapterDropTargetId, setChapterDropTargetId] = useState<EntityId | null>(null)
  const [lessonDropTargetId, setLessonDropTargetId] = useState<EntityId | null>(null)
  const [deletingLessonId, setDeletingLessonId] = useState<EntityId | null>(null)
  const [duplicatingLessonId, setDuplicatingLessonId] = useState<EntityId | null>(null)
  const [deletingChapterId, setDeletingChapterId] = useState<EntityId | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [reorderMode, setReorderMode] = useState(false)
  const [selectedKey, setSelectedKey] = useState<
    { type: 'chapter'; id: EntityId } | { type: 'lesson'; id: EntityId } | null
  >(null)
  const [attachLessonChapterId, setAttachLessonChapterId] = useState<EntityId | null>(null)
  const [quizAssignLessonId, setQuizAssignLessonId] = useState<EntityId | null>(null)
  // Inline chapter create — replaces the legacy Link to the now-hidden
  // /admin/collections/chapters/create route. Press the toolbar button to
  // expand a title input; Enter commits via createChapterInCourse and keeps
  // the input open so multiple chapters can be added in a row.
  const [addingChapter, setAddingChapter] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [creatingChapter, setCreatingChapter] = useState(false)
  const [createChapterError, setCreateChapterError] = useState<string | null>(null)
  const deleteErrorRef = useRef<HTMLDivElement | null>(null)

  const committedRef = useRef<CourseNode[]>(courses)
  const saveQueueRef = useRef(Promise.resolve())
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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

  useEffect(() => {
    onCourseChange?.(course)
  }, [course, onCourseChange])

  // --- Staged (unsaved) lessons -------------------------------------------
  // Lessons typed into the inline add-row live only in client state +
  // sessionStorage until the user explicitly enters the custom editor and
  // hits Save. They're identified by `staged: true` and a "staged-..." id.
  const stagedStorageKey = `staged-lessons:${course.id}`

  type StagedRecord = {
    id: EntityId
    chapterId: EntityId
    title: string
    order: number
  }

  // Hydrate sessionStorage staged lessons into the visible course on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let stored: StagedRecord[] = []
    try {
      const raw = window.sessionStorage.getItem(stagedStorageKey)
      stored = raw ? (JSON.parse(raw) as StagedRecord[]) : []
    } catch {
      stored = []
    }
    if (!stored.length) return
    setCourses((prev) =>
      prev.map((courseItem) => ({
        ...courseItem,
        chapters: courseItem.chapters.map((chapter) => {
          const ownStaged = stored.filter((entry) => entry.chapterId === chapter.id)
          if (!ownStaged.length) return chapter
          const appended: LessonNode[] = ownStaged.map((entry) => ({
            id: entry.id,
            title: entry.title,
            order: entry.order,
            chapterId: chapter.id,
            quizTitle: null,
            status: 'draft',
            staged: true,
          }))
          return {
            ...chapter,
            lessons: [...chapter.lessons, ...appended].sort((a, b) => a.order - b.order),
          }
        }),
      })),
    )
    // committedRef intentionally NOT updated: staged lessons aren't committed.
  }, [stagedStorageKey])

  // Persist whatever staged lessons currently live in state. Runs on every
  // state change so adds, edits, and discards stay durable across refresh.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const staged: StagedRecord[] = course.chapters.flatMap((chapter) =>
      chapter.lessons
        .filter((lesson) => lesson.staged)
        .map((lesson) => ({
          id: lesson.id,
          chapterId: chapter.id,
          title: lesson.title,
          order: lesson.order,
        })),
    )
    if (staged.length === 0) {
      window.sessionStorage.removeItem(stagedStorageKey)
    } else {
      window.sessionStorage.setItem(stagedStorageKey, JSON.stringify(staged))
    }
  }, [course, stagedStorageKey])

  const handleCreateLesson = (chapter: ChapterNode, title: string) => {
    const stagedId = `staged-${Math.random().toString(36).slice(2, 10)}`
    const nextOrder =
      chapter.lessons.reduce((max, lesson) => Math.max(max, lesson.order), 0) + 1
    setCourses((prev) =>
      prev.map((courseItem) => ({
        ...courseItem,
        chapters: courseItem.chapters.map((item) =>
          item.id === chapter.id
            ? {
                ...item,
                lessons: [
                  ...item.lessons,
                  {
                    id: stagedId,
                    title,
                    order: nextOrder,
                    chapterId: chapter.id,
                    quizTitle: null,
                    status: 'draft',
                    staged: true,
                  },
                ],
              }
            : item,
        ),
      })),
    )
    // committedRef left untouched: nothing has been persisted.
  }

  const handleCreateChapter = async () => {
    const title = newChapterTitle.trim()
    if (!title || creatingChapter) return
    setCreatingChapter(true)
    setCreateChapterError(null)
    try {
      const nextOrder =
        course.chapters.reduce((max, chapter) => Math.max(max, chapter.order), 0) + 1
      const created = await createChapterInCourse(course.id, title, nextOrder)
      setCourses((prev) =>
        prev.map((courseItem) =>
          courseItem.id !== course.id
            ? courseItem
            : {
                ...courseItem,
                chapters: [
                  ...courseItem.chapters,
                  {
                    id: created.id,
                    title: created.title,
                    order: created.order,
                    courseId: course.id,
                    lessons: [],
                  },
                ],
              },
        ),
      )
      committedRef.current = committedRef.current.map((courseItem) =>
        courseItem.id !== course.id
          ? courseItem
          : {
              ...courseItem,
              chapters: [
                ...courseItem.chapters,
                {
                  id: created.id,
                  title: created.title,
                  order: created.order,
                  courseId: course.id,
                  lessons: [],
                },
              ],
            },
      )
      setNewChapterTitle('')
      router.refresh()
    } catch (err) {
      setCreateChapterError(err instanceof Error ? err.message : 'Could not create chapter.')
    } finally {
      setCreatingChapter(false)
    }
  }

  const handleSetUpLesson = (lesson: LessonNode) => {
    if (!lesson.staged) return
    const params = new URLSearchParams({
      chapterId: lesson.chapterId,
      title: lesson.title,
      order: String(lesson.order),
      stagedId: lesson.id,
    })
    router.push(`/admin/courses/${course.id}/lessons/new?${params.toString()}`)
  }

  const counts = useMemo(
    () => ({
      chapterCount: course.chapters.length,
      lessonCount: course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0),
    }),
    [course],
  )

  const clearDropTargets = () => {
    setChapterDropTargetId(null)
    setLessonDropTargetId(null)
  }

  const setSavedStatus = () => {
    if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current)
    setStatus('saved')
    saveStatusTimerRef.current = setTimeout(() => setStatus('idle'), 1800)
  }

  const enqueuePersist = (action: PersistAction) => {
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        setStatus('saving')
        try {
          if (action.type === 'chapter') {
            const previousChapters = action.previous[0]?.chapters ?? []
            const nextChapters = action.next[0]?.chapters ?? []
            const changedChapters = getChangedChapters(previousChapters, nextChapters)
            if (changedChapters.length) await saveChapterOrder(changedChapters)
          }

          if (action.type === 'lesson') {
            const previousLessons = flattenLessonsByChapter(action.previous[0], action.chapterIds)
            const nextLessons = flattenLessonsByChapter(action.next[0], action.chapterIds)
            const changedLessons = getChangedLessons(previousLessons, nextLessons)
            if (changedLessons.length) await saveLessonPositions(changedLessons)
          }

          committedRef.current = action.next
          setSavedStatus()
        } catch (_error) {
          setCourses(committedRef.current)
          setStatus('error')
          if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current)
        }
      })
  }

  const handleDeleteLesson = async (lesson: ChapterNode['lessons'][number]) => {
    // Staged lessons live only in client state — no DB row, no API call, no
    // confirm prompt (discarding an unsaved title isn't destructive).
    if (lesson.staged) {
      setCourses((prev) =>
        prev.map((courseItem) => ({
          ...courseItem,
          chapters: courseItem.chapters.map((chapter) => ({
            ...chapter,
            lessons: chapter.lessons.filter((item) => item.id !== lesson.id),
          })),
        })),
      )
      return
    }

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
        courses.map((courseItem) => ({
          ...courseItem,
          chapters: courseItem.chapters.map((chapter) => ({
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

  const handleDuplicateLesson = async (lesson: LessonNode) => {
    if (duplicatingLessonId || lesson.staged) return
    const owningChapter = course.chapters.find((chapter) =>
      chapter.lessons.some((entry) => entry.id === lesson.id),
    )
    if (!owningChapter) return
    setDuplicatingLessonId(lesson.id)
    setDeleteError(null)
    try {
      const nextOrder =
        owningChapter.lessons.reduce((max, entry) => Math.max(max, entry.order), 0) + 1
      const created = await duplicateLesson(lesson.id, owningChapter.id, nextOrder)
      const newLesson: LessonNode = {
        id: created.id,
        title: created.title,
        order: created.order,
        chapterId: owningChapter.id,
        quizTitle: lesson.quizTitle ?? null,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      }
      const next = normalizeCourseOrders(
        courses.map((courseItem) => ({
          ...courseItem,
          chapters: courseItem.chapters.map((chapter) =>
            chapter.id === owningChapter.id
              ? { ...chapter, lessons: [...chapter.lessons, newLesson] }
              : chapter,
          ),
        })),
      )
      setCourses(next)
      committedRef.current = next
      router.refresh()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : `Unable to duplicate "${lesson.title}".`,
      )
    } finally {
      setDuplicatingLessonId(null)
    }
  }

  const handleDeleteChapter = async (chapter: ChapterNode) => {
    if (deletingChapterId) return

    if (chapter.lessons.length > 0) {
      const message = `Cannot delete "${chapter.title}" because it still contains ${chapter.lessons.length} lesson${chapter.lessons.length === 1 ? '' : 's'}. Delete or move those lessons first.`
      setDeleteError(message)
      if (typeof window !== 'undefined') window.alert(message)
      return
    }

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Delete chapter "${chapter.title}"? This cannot be undone.`)
      if (!confirmed) return
    }

    setDeleteError(null)
    setDeletingChapterId(chapter.id)

    try {
      await deleteChapter(chapter.id)
      const next = normalizeCourseOrders(
        courses.map((courseItem) => ({
          ...courseItem,
          chapters: courseItem.chapters.filter((item) => item.id !== chapter.id),
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

  const onDragStart = (event: DragStartEvent) => {
    setActiveMeta(getDragMeta(event.active.data))
  }

  const onDragMove = (event: { over: DragEndEvent['over'] }) => {
    const overMeta = getDragMeta(event.over?.data)
    clearDropTargets()
    if (!overMeta) return
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

    if (
      active.type === 'chapter' &&
      (over.type === 'chapter' || over.type === 'chapter-lessons') &&
      active.courseId === over.courseId
    ) {
      const targetChapterId = over.chapterId
      if (active.chapterId === targetChapterId) return
      const previous = cloneCourses(courses)
      const chapters = courses[0].chapters
      const fromIndex = chapters.findIndex((chapter) => chapter.id === active.chapterId)
      const toIndex = chapters.findIndex((chapter) => chapter.id === targetChapterId)
      const nextChapters = reorderInArray(chapters, fromIndex, toIndex)
      const nextCourses: CourseNode[] = [{ ...courses[0], chapters: nextChapters }]
      const next = normalizeCourseOrders(nextCourses)
      setCourses(next)
      if (!reorderMode) enqueuePersist({ type: 'chapter', previous, next })
      return
    }

    if (active.type === 'lesson' && (over.type === 'lesson' || over.type === 'chapter-lessons')) {
      if (over.type === 'lesson' && active.lessonId === over.lessonId) return
      const source = findLessonContainer(courses[0], active.lessonId)
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

      const targetChapterId = over.chapterId
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
        if (!reorderMode)
          enqueuePersist({ type: 'lesson', previous, next, chapterIds: [source.chapterId] })
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
      if (!reorderMode)
        enqueuePersist({
          type: 'lesson',
          previous,
          next,
          chapterIds: Array.from(new Set([source.chapterId, targetChapter.id])),
        })
    }
  }

  const persistCurrentReorder = async () => {
    setStatus('saving')
    try {
      const previousChapters = committedRef.current[0]?.chapters ?? []
      const nextChapters = courses[0]?.chapters ?? []
      const changedChapters = getChangedChapters(previousChapters, nextChapters)
      if (changedChapters.length) await saveChapterOrder(changedChapters)

      const allChapterIds = nextChapters.map((chapter) => chapter.id)
      const previousLessons = flattenLessonsByChapter(committedRef.current[0], allChapterIds)
      const nextLessons = flattenLessonsByChapter(courses[0], allChapterIds)
      const changedLessons = getChangedLessons(previousLessons, nextLessons)
      if (changedLessons.length) await saveLessonPositions(changedLessons)

      committedRef.current = courses
      setSavedStatus()
      return true
    } catch (_error) {
      setCourses(committedRef.current)
      setStatus('error')
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current)
      return false
    }
  }

  const handleSaveReorder = async () => {
    const success = await persistCurrentReorder()
    if (success) setReorderMode(false)
  }

  const handleCancelReorder = () => {
    setCourses(committedRef.current)
    setReorderMode(false)
    setStatus('idle')
  }

  const overlayLabel =
    activeMeta?.type === 'chapter'
      ? course.chapters.find((chapter) => chapter.id === activeMeta.chapterId)?.title
      : activeMeta?.type === 'lesson'
        ? course.chapters
            .flatMap((chapter) => chapter.lessons)
            .find((lesson) => lesson.id === activeMeta.lessonId)?.title
        : null

  const hasPendingReorder = courses !== committedRef.current

  return (
    <div className="cw-outline">
      <div className="cw-outline__toolbar">
        <div className="cw-outline__summary">
          <span>
            <strong>{counts.chapterCount}</strong> chapter
            {counts.chapterCount === 1 ? '' : 's'}
          </span>
          <span aria-hidden className="cw-outline__sep">
            •
          </span>
          <span>
            <strong>{counts.lessonCount}</strong> lesson
            {counts.lessonCount === 1 ? '' : 's'}
          </span>
          {reorderMode ? (
            <span className="cw-outline__mode-pill">Reorder mode</span>
          ) : null}
        </div>
        <div className="cw-outline__toolbar-actions">
          <SaveStatusIndicator status={status} />
          {reorderMode ? null : (
            <>
              <button
                type="button"
                onClick={() => setReorderMode(true)}
                disabled={counts.chapterCount === 0}
                className="cw-btn cw-btn--ghost"
              >
                Reorder chapters
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingChapter((prev) => !prev)
                  setCreateChapterError(null)
                }}
                className="cw-btn cw-btn--primary"
              >
                + Add chapter
              </button>
            </>
          )}
        </div>
      </div>

      {addingChapter && !reorderMode ? (
        <div className="cw-chapter__add-row cw-chapter__add-row--expanded">
          <input
            type="text"
            autoFocus
            value={newChapterTitle}
            onChange={(event) => setNewChapterTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void handleCreateChapter()
              } else if (event.key === 'Escape') {
                event.preventDefault()
                setAddingChapter(false)
                setNewChapterTitle('')
                setCreateChapterError(null)
              }
            }}
            placeholder="Chapter title — press Enter to add"
            disabled={creatingChapter}
            className="cw-chapter__add-input"
            aria-label="New chapter title"
          />
          <button
            type="button"
            onClick={() => {
              setAddingChapter(false)
              setNewChapterTitle('')
              setCreateChapterError(null)
            }}
            disabled={creatingChapter}
            className="cw-chapter__attach-link"
          >
            cancel
          </button>
        </div>
      ) : null}
      {createChapterError ? (
        <div className="cw-error-banner" role="alert">
          {createChapterError}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="cw-error-banner">{operationFailedMessage}</div>
      ) : null}
      {deleteError ? (
        <div ref={deleteErrorRef} className="cw-error-banner" role="alert">
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
          items={course.chapters.map((chapter) => `chapter:${chapter.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="cw-chapter-list">
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
                  duplicatingLessonId={duplicatingLessonId}
                  reorderMode={reorderMode}
                  isSelected={selectedKey?.type === 'chapter' && selectedKey.id === chapter.id}
                  selectedLessonId={
                    selectedKey?.type === 'lesson' ? selectedKey.id : null
                  }
                  onDeleteChapter={handleDeleteChapter}
                  onDeleteLesson={handleDeleteLesson}
                  onSelectChapter={(node) =>
                    setSelectedKey({ type: 'chapter', id: node.id })
                  }
                  onSelectLesson={(lesson) =>
                    setSelectedKey({ type: 'lesson', id: lesson.id })
                  }
                  onCreateLesson={handleCreateLesson}
                  onAttachLesson={(node) => setAttachLessonChapterId(node.id)}
                  onSetUpLesson={handleSetUpLesson}
                  onAssignQuiz={(lesson) => setQuizAssignLessonId(lesson.id)}
                  onDuplicateLesson={handleDuplicateLesson}
                />
              ))
            ) : (
              <EmptyChapterState />
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {overlayLabel ? (
            <div className="cw-drag-overlay">{overlayLabel}</div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <QuizAssignmentDrawer
        lesson={
          quizAssignLessonId
            ? (course.chapters
                .flatMap((chapter) => chapter.lessons)
                .find((lesson) => lesson.id === quizAssignLessonId) ?? null)
            : null
        }
        onClose={() => setQuizAssignLessonId(null)}
        onQuizChanged={(lessonId, quizTitle) => {
          setCourses((prev) => {
            const next = prev.map((courseItem) => ({
              ...courseItem,
              chapters: courseItem.chapters.map((chapter) => ({
                ...chapter,
                lessons: chapter.lessons.map((lesson) =>
                  lesson.id === lessonId ? { ...lesson, quizTitle } : lesson,
                ),
              })),
            }))
            committedRef.current = next
            return next
          })
        }}
      />

      <LessonAssignmentDrawer
        chapter={
          attachLessonChapterId
            ? (course.chapters.find((chapter) => chapter.id === attachLessonChapterId) ?? null)
            : null
        }
        onClose={() => setAttachLessonChapterId(null)}
        onLessonsAdded={(added) => {
          setCourses((prev) => {
            const next = prev.map((courseItem) => ({
              ...courseItem,
              chapters: courseItem.chapters.map((chapter) => {
                const matchingAdds = added.filter((entry) => entry.chapterId === chapter.id)
                if (!matchingAdds.length) {
                  return {
                    ...chapter,
                    lessons: chapter.lessons.filter(
                      (lesson) => !added.some((entry) => entry.id === lesson.id),
                    ),
                  }
                }
                const remainingLessons = chapter.lessons.filter(
                  (lesson) => !matchingAdds.some((entry) => entry.id === lesson.id),
                )
                const appended = matchingAdds.map((entry) => ({
                  id: entry.id,
                  title: entry.title,
                  order: entry.order,
                  chapterId: entry.chapterId,
                  quizTitle: null as string | null,
                }))
                return {
                  ...chapter,
                  lessons: [...remainingLessons, ...appended],
                }
              }),
            }))
            const normalized = normalizeCourseOrders(next)
            committedRef.current = normalized
            return normalized
          })
          router.refresh()
        }}
      />

      <EntityInspector
        selection={resolveSelection(course, selectedKey)}
        courseId={course.id}
        onClose={() => setSelectedKey(null)}
        onAssignQuiz={(lesson) => {
          setSelectedKey(null)
          setQuizAssignLessonId(lesson.id)
        }}
        onTitleSaved={({ type, id, title }) => {
          setCourses((prev) =>
            prev.map((courseItem) => ({
              ...courseItem,
              chapters: courseItem.chapters.map((chapter) =>
                type === 'chapter' && chapter.id === id
                  ? { ...chapter, title }
                  : {
                      ...chapter,
                      lessons: chapter.lessons.map((lesson) =>
                        type === 'lesson' && lesson.id === id ? { ...lesson, title } : lesson,
                      ),
                    },
              ),
            })),
          )
          committedRef.current = committedRef.current.map((courseItem) => ({
            ...courseItem,
            chapters: courseItem.chapters.map((chapter) =>
              type === 'chapter' && chapter.id === id
                ? { ...chapter, title }
                : {
                    ...chapter,
                    lessons: chapter.lessons.map((lesson) =>
                      type === 'lesson' && lesson.id === id ? { ...lesson, title } : lesson,
                    ),
                  },
            ),
          }))
          router.refresh()
        }}
        onDeleteChapter={(chapter) => {
          setSelectedKey(null)
          handleDeleteChapter(chapter)
        }}
        onDeleteLesson={(lesson) => {
          setSelectedKey(null)
          handleDeleteLesson(lesson)
        }}
        deleting={
          (selectedKey?.type === 'chapter' && deletingChapterId === selectedKey.id) ||
          (selectedKey?.type === 'lesson' && deletingLessonId === selectedKey.id)
        }
      />

      {reorderMode ? (
        <div
          className="cw-reorder-bar"
          role="region"
          aria-label="Reorder mode toolbar"
        >
          <div className="cw-reorder-bar__inner">
            <div className="cw-reorder-bar__hint">
              Drag chapters and lessons to reorder.{' '}
              {hasPendingReorder ? 'Unsaved changes — Save to apply.' : 'No changes yet.'}
            </div>
            <div className="cw-reorder-bar__actions">
              <button
                type="button"
                onClick={handleCancelReorder}
                disabled={status === 'saving'}
                className="cw-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReorder}
                disabled={!hasPendingReorder || status === 'saving'}
                className="cw-btn cw-btn--primary"
              >
                {status === 'saving' ? 'Saving…' : 'Save order'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
