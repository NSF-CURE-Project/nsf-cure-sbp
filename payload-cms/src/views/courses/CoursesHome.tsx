'use client'

import React, { useMemo, useRef, useState } from 'react'
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
import type { DragMeta, EntityId, SaveStatus } from './types'
import SaveStatusIndicator from './SaveStatusIndicator'
import CoursesHomeCard, { type CourseCatalogItem } from './CoursesHomeCard'
import { HelpLink } from '../admin/HelpLink'
import { useConfirm } from '../admin/useConfirm'
import { reorderInArray } from './reorder-utils'
import { deleteCourse, saveCourseOrder } from './courses-order-api'

type CoursesHomeProps = {
  initialCourses: CourseCatalogItem[]
}

const getDragMeta = (eventData: unknown): DragMeta | null => {
  const current = eventData as { current?: DragMeta }
  return current?.current ?? null
}

const reindexOrder = (items: CourseCatalogItem[]): CourseCatalogItem[] =>
  items.map((item, index) => ({ ...item, order: index + 1 }))

const getChangedOrders = (
  previous: CourseCatalogItem[],
  next: CourseCatalogItem[],
): CourseCatalogItem[] => {
  const prevMap = new Map(previous.map((item) => [item.id, item.order]))
  return next.filter((item) => prevMap.get(item.id) !== item.order)
}

export default function CoursesHome({ initialCourses }: CoursesHomeProps) {
  const router = useRouter()
  const [courses, setCourses] = useState<CourseCatalogItem[]>(() => reindexOrder(initialCourses))
  const [searchValue, setSearchValue] = useState('')
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [activeMeta, setActiveMeta] = useState<DragMeta | null>(null)
  const [dropTargetId, setDropTargetId] = useState<EntityId | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<EntityId | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { confirm, dialog: confirmDialog } = useConfirm()

  const committedRef = useRef<CourseCatalogItem[]>(reindexOrder(initialCourses))
  const saveQueueRef = useRef(Promise.resolve())
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const filteredCourses = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return courses
    return courses.filter((course) => course.title.toLowerCase().includes(query))
  }, [courses, searchValue])

  const setSavedStatus = () => {
    if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current)
    setStatus('saved')
    saveStatusTimerRef.current = setTimeout(() => setStatus('idle'), 1800)
  }

  const enqueuePersist = (previous: CourseCatalogItem[], next: CourseCatalogItem[]) => {
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        setStatus('saving')
        try {
          const changed = getChangedOrders(previous, next)
          if (changed.length) {
            await saveCourseOrder(
              changed.map((item) => ({
                id: item.id,
                title: item.title,
                order: item.order,
                chapters: [],
              })),
            )
          }
          committedRef.current = next
          setSavedStatus()
        } catch (_error) {
          setCourses(committedRef.current)
          setStatus('error')
          if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current)
        }
      })
  }

  const handleDeleteCourse = async (course: CourseCatalogItem) => {
    if (deletingCourseId) return

    // Fold any related-content counts into the confirm message so the user
    // knows what's about to disappear. The server-side beforeDelete on
    // `classes` cascades chapters → lessons and classrooms → memberships,
    // so the UI doesn't need a separate "empty out first" step.
    const parts: string[] = []
    if (course.chapterCount > 0)
      parts.push(`${course.chapterCount} chapter${course.chapterCount === 1 ? '' : 's'}`)
    if (course.lessonCount > 0)
      parts.push(`${course.lessonCount} lesson${course.lessonCount === 1 ? '' : 's'}`)
    if (course.classroomCount > 0)
      parts.push(
        `${course.classroomCount} classroom${course.classroomCount === 1 ? '' : 's'}`,
      )
    const joined =
      parts.length === 0
        ? ''
        : parts.length === 1
          ? parts[0]
          : parts.length === 2
            ? `${parts[0]} and ${parts[1]}`
            : `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
    const contentLine = joined
      ? ` This will also delete ${joined}${course.classroomCount > 0 ? ' (students will lose access)' : ''}.`
      : ''

    const confirmed = await confirm({
      title: `Delete "${course.title}"?`,
      message: `This permanently removes the course.${contentLine} This cannot be undone.`,
      confirmLabel: 'Delete course',
      destructive: true,
    })
    if (!confirmed) return

    setDeleteError(null)
    setDeletingCourseId(course.id)

    try {
      await deleteCourse(course.id)
      const next = reindexOrder(courses.filter((item) => item.id !== course.id))
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
    setActiveMeta(getDragMeta(event.active.data))
  }

  const onDragMove = (event: { over: DragEndEvent['over'] }) => {
    const overMeta = getDragMeta(event.over?.data)
    if (!overMeta || overMeta.type !== 'course') {
      setDropTargetId(null)
      return
    }
    setDropTargetId(overMeta.courseId)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const active = getDragMeta(event.active.data)
    const over = getDragMeta(event.over?.data)
    setActiveMeta(null)
    setDropTargetId(null)

    if (!active || !over) return
    if (active.type !== 'course' || over.type !== 'course') return
    if (active.courseId === over.courseId) return

    const previous = courses.map((item) => ({ ...item }))
    const fromIndex = courses.findIndex((course) => course.id === active.courseId)
    const toIndex = courses.findIndex((course) => course.id === over.courseId)
    const next = reindexOrder(reorderInArray(courses, fromIndex, toIndex))
    setCourses(next)
    enqueuePersist(previous, next)
  }

  const overlayLabel =
    activeMeta?.type === 'course'
      ? courses.find((course) => course.id === activeMeta.courseId)?.title
      : null

  const totals = useMemo(() => {
    const lessonCount = courses.reduce((sum, course) => sum + course.lessonCount, 0)
    const chapterCount = courses.reduce((sum, course) => sum + course.chapterCount, 0)
    return { lessonCount, chapterCount }
  }, [courses])

  return (
    <>
      {confirmDialog}
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
            Courses
          </div>
          <h1 className="m-0 mt-1 text-2xl font-semibold text-[var(--cpp-ink)]">
            Course catalog
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--cpp-muted)]">
            Manage course structure, publication status, and curriculum health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SaveStatusIndicator status={status} />
          <HelpLink topic="courses" />
          <Link
            href="/admin/courses/new"
            className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white no-underline hover:bg-slate-800"
          >
            Create course
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search courses…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full max-w-sm rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] placeholder:text-[var(--cpp-muted)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          aria-label="Search courses"
        />
        <div className="text-xs text-[var(--cpp-muted)]">
          {courses.length} course{courses.length === 1 ? '' : 's'} · {totals.chapterCount}{' '}
          chapter{totals.chapterCount === 1 ? '' : 's'} · {totals.lessonCount} lesson
          {totals.lessonCount === 1 ? '' : 's'}
        </div>
      </div>

      {status === 'error' ? (
        <div className="text-xs text-red-700">Error saving order</div>
      ) : null}
      {deleteError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {deleteError}
        </div>
      ) : null}

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-6 text-sm text-[var(--cpp-muted)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>No courses yet. Create your first course to begin building curriculum.</div>
            <Link
              href="/admin/courses/new"
              className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white no-underline"
            >
              Create first course
            </Link>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-6 text-sm text-[var(--cpp-muted)]">
          No courses match “{searchValue}”.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={filteredCourses.map((course) => `course:${course.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-2">
              {filteredCourses.map((course, index) => (
                <CoursesHomeCard
                  key={course.id}
                  course={course}
                  index={index}
                  isDropTarget={dropTargetId === course.id}
                  deleting={deletingCourseId === course.id}
                  onDelete={handleDeleteCourse}
                />
              ))}
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
      )}
    </div>
    </>
  )
}
