'use client'

import React, { useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type CourseTree = {
  id: string | number
  title: string
  chapters: {
    id: string | number
    title: string
    chapterNumber?: number | null
    lessons: {
      id: string | number
      title: string
      order?: number | null
      quizTitle?: string | null
    }[]
  }[]
}

type CourseCardListProps = {
  initialCourses: CourseTree[]
}

const cppInk = 'var(--cpp-ink)'

const panelStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface)',
  boxShadow: 'var(--admin-shadow)',
}

const courseCardStyle: React.CSSProperties = {
  ...panelStyle,
  padding: '16px 16px 14px',
  cursor: 'grab',
}

const chapterCardStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid var(--admin-surface-border)',
  background: '#fbfcff',
  padding: '10px 12px',
}

const actionChipStyle: React.CSSProperties = {
  borderRadius: 9,
  padding: '7px 11px',
  fontSize: 12,
  fontWeight: 600,
  background: '#f8fafc',
  color: cppInk,
  border: '1px solid var(--admin-surface-border)',
}

const primaryActionStyle: React.CSSProperties = {
  ...actionChipStyle,
  background: '#111827',
  color: '#f8fafc',
  borderColor: '#111827',
}

const subtleBadgeStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--cpp-muted)',
  borderRadius: 999,
  border: '1px solid var(--admin-surface-border)',
  background: '#f8fafc',
  padding: '4px 8px',
}

const lessonRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0,1fr) auto',
  alignItems: 'center',
  gap: 10,
  border: '1px solid var(--admin-surface-border)',
  borderRadius: 8,
  background: '#ffffff',
  padding: '8px 10px',
}

const lessonActionStyle: React.CSSProperties = {
  borderRadius: 7,
  border: '1px solid var(--admin-surface-border)',
  background: '#f8fafc',
  color: cppInk,
  padding: '5px 8px',
  fontSize: 11,
  fontWeight: 700,
  textDecoration: 'none',
}

export default function CourseCardList({ initialCourses }: CourseCardListProps) {
  const [courses, setCourses] = useState<CourseTree[]>(initialCourses)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [draggingChapterId, setDraggingChapterId] = useState<string | null>(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [isSavingChapterOrder, setIsSavingChapterOrder] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingCourses, setPendingCourses] = useState<CourseTree[] | null>(null)
  const [pendingChapters, setPendingChapters] = useState<{
    courseId: string
    chapters: CourseTree['chapters']
  } | null>(null)
  const previousCoursesRef = useRef<CourseTree[]>(initialCourses)

  const courseLessonCount = useMemo(() => {
    return new Map(
      courses.map((course) => [
        String(course.id),
        course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0),
      ]),
    )
  }, [courses])

  const visibleCourses = useMemo(() => {
    if (selectedCourseId === 'all') return courses
    return courses.filter((course) => String(course.id) === selectedCourseId)
  }, [courses, selectedCourseId])

  const persistClassOrder = async (nextCourses: CourseTree[]) => {
    if (!nextCourses.length) return
    setIsSavingOrder(true)
    try {
      const updates = nextCourses.map((item, index) => {
        const nextOrder = index + 1
        return fetch(`/api/classes/${item.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order: nextOrder }),
        })
      })
      await Promise.all(updates)
    } finally {
      setIsSavingOrder(false)
    }
  }

  const persistChapterOrder = async (courseId: string, chapters: CourseTree['chapters']) => {
    if (!chapters.length) return
    setIsSavingChapterOrder(true)
    try {
      const updates = chapters.map((chapter, index) =>
        fetch(`/api/chapters/${chapter.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chapterNumber: index + 1 }),
        }),
      )
      await Promise.all(updates)
    } finally {
      setIsSavingChapterOrder(false)
    }
  }

  const handleDrop = async (targetId: string) => {
    if (confirmOpen) return
    if (!draggingId || draggingId === targetId) return
    const current = [...courses]
    const fromIndex = current.findIndex((item) => String(item.id) === draggingId)
    const toIndex = current.findIndex((item) => String(item.id) === targetId)
    if (fromIndex < 0 || toIndex < 0) return
    const [moved] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, moved)
    previousCoursesRef.current = courses
    setCourses(current)
    setPendingCourses(current)
    setConfirmOpen(true)
  }

  const handleChapterDrop = async (courseId: string, targetChapterId: string) => {
    if (confirmOpen) return
    if (!draggingChapterId || draggingChapterId === targetChapterId) return
    const current = courses.map((course) => ({ ...course, chapters: [...course.chapters] }))
    const courseIndex = current.findIndex((course) => String(course.id) === courseId)
    if (courseIndex < 0) return
    const chapters = current[courseIndex].chapters
    const fromIndex = chapters.findIndex((chapter) => String(chapter.id) === draggingChapterId)
    const toIndex = chapters.findIndex((chapter) => String(chapter.id) === targetChapterId)
    if (fromIndex < 0 || toIndex < 0) return
    const [moved] = chapters.splice(fromIndex, 1)
    chapters.splice(toIndex, 0, moved)
    const reindexed = chapters.map((chapter, index) => ({
      ...chapter,
      chapterNumber: index + 1,
    }))
    current[courseIndex] = { ...current[courseIndex], chapters: reindexed }
    previousCoursesRef.current = courses
    setCourses(current)
    setPendingChapters({ courseId, chapters: reindexed })
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingCourses && !pendingChapters) {
      setConfirmOpen(false)
      return
    }
    setConfirmOpen(false)
    if (pendingCourses) {
      await persistClassOrder(pendingCourses)
      setPendingCourses(null)
    }
    if (pendingChapters) {
      await persistChapterOrder(pendingChapters.courseId, pendingChapters.chapters)
      setPendingChapters(null)
    }
  }

  const handleCancel = () => {
    setCourses(previousCoursesRef.current)
    setPendingCourses(null)
    setPendingChapters(null)
    setConfirmOpen(false)
  }

  if (!courses.length) {
    return (
      <div
        style={{
          borderRadius: 12,
          border: '1px dashed rgba(15, 23, 42, 0.2)',
          background: '#f8fafc',
          padding: '18px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 13, color: '#64748b' }}>
          No courses yet. Create your first course to begin building curriculum.
        </div>
        <Link href="/admin/collections/classes/create" style={{ textDecoration: 'none' }}>
          <div style={primaryActionStyle} className="dashboard-chip">
            Create first course
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {selectedCourseId !== 'all' ? (
        <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
          Showing 1 of {courses.length} courses.
        </div>
      ) : null}

      <div
        style={{
          ...panelStyle,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
          background: '#fbfcff',
        }}
      >
        <div style={{ display: 'grid', gap: 10, minWidth: 260 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <label
              htmlFor="course-filter"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--cpp-muted)',
              }}
            >
              Show
            </label>
            <select
              id="course-filter"
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              style={{
                borderRadius: 9,
                border: '1px solid var(--admin-surface-border)',
                background: '#ffffff',
                color: cppInk,
                fontSize: 12,
                fontWeight: 600,
                padding: '7px 10px',
                minWidth: 210,
              }}
            >
              <option value="all">All courses</option>
              {courses.map((course) => (
                <option key={String(course.id)} value={String(course.id)}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--cpp-muted)',
            }}
          >
            <span style={{ fontSize: 13 }}>↕</span>
            <span>Drag a course card to reorder courses site-wide.</span>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--cpp-muted)',
            }}
          >
            <span style={{ fontSize: 13 }}>↕</span>
            <span>Drag a course card to reorder courses site-wide.</span>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--cpp-muted)',
            }}
          >
            <span style={{ fontSize: 13 }}>≡</span>
            <span>Drag chapter cards to reorder chapters within each course.</span>
          </div>
        </div>
        <Link href="/admin/collections/classes/create" style={{ textDecoration: 'none' }}>
          <div style={primaryActionStyle} className="dashboard-chip">
            Add course
          </div>
        </Link>
      </div>

      {isSavingOrder ? (
        <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Saving course order…</div>
      ) : null}
      {isSavingChapterOrder ? (
        <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Saving chapter order…</div>
      ) : null}

      {visibleCourses.map((course) => (
        <section
          key={String(course.id)}
          style={courseCardStyle}
          className="dashboard-panel"
          draggable
          onDragStart={() => setDraggingId(String(course.id))}
          onDragEnd={() => setDraggingId(null)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(String(course.id))}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cpp-muted)', fontWeight: 700 }}>
                Course
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: cppInk, marginTop: 4 }}>{course.title}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={subtleBadgeStyle}>
                  {course.chapters.length} chapter{course.chapters.length === 1 ? '' : 's'}
                </span>
                <span style={subtleBadgeStyle}>
                  {courseLessonCount.get(String(course.id)) ?? 0} lesson
                  {(courseLessonCount.get(String(course.id)) ?? 0) === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link
                href={`/admin/collections/chapters/create?class=${course.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={primaryActionStyle} className="dashboard-chip">
                  Add chapter
                </div>
              </Link>
              <Link
                href={`/admin/collections/classes/${course.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={actionChipStyle} className="dashboard-chip">
                  Edit course
                </div>
              </Link>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 10, paddingLeft: 6 }}>
            {course.chapters.length ? (
              course.chapters.map((chapter) => (
                <article
                  key={String(chapter.id)}
                  style={chapterCardStyle}
                  draggable
                  onDragStart={() => setDraggingChapterId(String(chapter.id))}
                  onDragEnd={() => setDraggingChapterId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleChapterDrop(String(course.id), String(chapter.id))}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: cppInk }}>
                        {chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}: ` : 'Chapter: '}
                        {chapter.title}
                      </div>
                      <div style={{ marginTop: 5, fontSize: 12, color: 'var(--cpp-muted)' }}>
                        {chapter.lessons.length} lesson{chapter.lessons.length === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link
                        href={`/admin/collections/lessons/create?chapter=${chapter.id}`}
                        style={{ textDecoration: 'none' }}
                        draggable={false}
                      >
                        <div style={primaryActionStyle} className="dashboard-chip">
                          Add lesson
                        </div>
                      </Link>
                      <Link
                        href={`/admin/collections/chapters/${chapter.id}`}
                        style={{ textDecoration: 'none' }}
                        draggable={false}
                      >
                        <div style={actionChipStyle} className="dashboard-chip">
                          Edit chapter
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                    {chapter.lessons.length ? (
                      chapter.lessons.map((lesson) => {
                        const hasQuiz = Boolean(lesson.quizTitle)
                        const quizLabel = hasQuiz ? lesson.quizTitle : 'Not assigned'
                        const actionLabel = hasQuiz ? 'Change quiz' : 'Assign quiz'
                        return (
                          <div key={String(lesson.id)} style={lessonRowStyle}>
                            <div style={{ minWidth: 0 }}>
                              <Link
                                href={`/admin/collections/lessons/${lesson.id}`}
                                style={{
                                  textDecoration: 'none',
                                  color: cppInk,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {lesson.title}
                              </Link>
                              <div style={{ marginTop: 3, fontSize: 11, color: 'var(--cpp-muted)' }}>
                                Quiz: {quizLabel}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Link href={`/admin/collections/lessons/${lesson.id}`} style={lessonActionStyle}>
                                Edit lesson
                              </Link>
                              <Link href={`/admin/collections/lessons/${lesson.id}`} style={lessonActionStyle}>
                                {actionLabel}
                              </Link>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--cpp-muted)',
                          border: '1px dashed var(--admin-surface-border)',
                          borderRadius: 8,
                          padding: '8px 10px',
                          background: '#ffffff',
                        }}
                      >
                        No lessons yet. Add your first lesson to start this chapter.
                      </div>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--cpp-muted)',
                  border: '1px dashed var(--admin-surface-border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  background: '#fbfcff',
                }}
              >
                No chapters yet. Add a chapter to structure this course.
              </div>
            )}
          </div>
        </section>
      ))}

      {confirmOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              width: 'min(92vw, 420px)',
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid rgba(15, 23, 42, 0.16)',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
              padding: 18,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: cppInk }}>Save new order?</div>
            <p style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>
              This updates the display order used across the curriculum builder.
            </p>
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(15, 23, 42, 0.16)',
                  background: '#f8fafc',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #0f172a',
                  background: '#0f172a',
                  color: '#f8fafc',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save order
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
