'use client'

import React, { useRef, useState } from 'react'

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
    }[]
  }[]
}

type CourseCardListProps = {
  initialCourses: CourseTree[]
}

const cppInk = 'var(--cpp-ink)'

const courseCardStyle: React.CSSProperties = {
  borderRadius: 0,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface)',
  padding: '16px',
  boxShadow: 'var(--admin-shadow)',
  cursor: 'grab',
}

const chapterCardStyle: React.CSSProperties = {
  borderRadius: 0,
  border: '1px solid var(--admin-surface-border)',
  background: 'var(--admin-surface-muted)',
  padding: '10px 14px',
}

const actionChipStyle: React.CSSProperties = {
  borderRadius: 0,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  background: 'var(--admin-surface-muted)',
  color: cppInk,
  border: '1px solid var(--admin-surface-border)',
}

const primaryActionStyle: React.CSSProperties = {
  ...actionChipStyle,
  background: 'var(--admin-chip-primary-bg)',
  color: 'var(--admin-chip-primary-text)',
  borderColor: 'var(--admin-surface-border)',
}

export default function CourseCardList({ initialCourses }: CourseCardListProps) {
  const [courses, setCourses] = useState<CourseTree[]>(initialCourses)
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
          borderRadius: 0,
          border: '1px dashed rgba(15, 23, 42, 0.2)',
          background: '#f8fafc',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 12, color: '#64748b' }}>
          No classes yet. Create your first class to get started.
        </div>
        <a href="/admin/collections/classes/create" style={{ textDecoration: 'none' }}>
          <div style={primaryActionStyle} className="dashboard-chip">
            Create first class
          </div>
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--cpp-muted)',
            border: '1px dashed var(--admin-surface-border)',
            background: 'var(--admin-surface-muted)',
            padding: '8px 10px',
            borderRadius: 0,
            width: 'fit-content',
          }}
        >
          <span style={{ fontWeight: 700 }}>Tip</span>
          <span>Drag a course card to reorder classes across the site.</span>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--cpp-muted)',
            border: '1px dashed var(--admin-surface-border)',
            background: 'var(--admin-surface-muted)',
            padding: '8px 10px',
            borderRadius: 0,
            width: 'fit-content',
          }}
        >
          <span style={{ fontWeight: 700 }}>Tip</span>
          <span>Drag chapter cards to reorder chapters inside a course.</span>
        </div>
        <a href="/admin/collections/classes/create" style={{ textDecoration: 'none' }}>
          <div style={primaryActionStyle} className="dashboard-chip">
            Add course
          </div>
        </a>
      </div>
      {isSavingOrder ? (
        <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Saving course order…</div>
      ) : null}
      {isSavingChapterOrder ? (
        <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Saving chapter order…</div>
      ) : null}
      {courses.map((course) => (
        <div
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
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: cppInk }}>{course.title}</div>
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                {course.chapters.length} chapter
                {course.chapters.length === 1 ? '' : 's'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a
                href={`/admin/collections/chapters/create?class=${course.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={primaryActionStyle} className="dashboard-chip">
                  Add chapter
                </div>
              </a>
              <a
                href={`/admin/collections/classes/${course.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={actionChipStyle} className="dashboard-chip">
                  Edit course
                </div>
              </a>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {course.chapters.length ? (
              course.chapters.map((chapter) => (
                <div
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
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: cppInk }}>
                        {chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}: ` : ''}
                        {chapter.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                        {chapter.lessons.length} lesson
                        {chapter.lessons.length === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <a
                        href={`/admin/collections/lessons/create?chapter=${chapter.id}`}
                        style={{ textDecoration: 'none' }}
                        draggable={false}
                      >
                        <div style={primaryActionStyle} className="dashboard-chip">
                          Add lesson
                        </div>
                      </a>
                      <a
                        href={`/admin/collections/chapters/${chapter.id}`}
                        style={{ textDecoration: 'none' }}
                        draggable={false}
                      >
                        <div style={actionChipStyle} className="dashboard-chip">
                          Edit chapter
                        </div>
                      </a>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                    {chapter.lessons.length ? (
                      chapter.lessons.map((lesson) => (
                        <a
                          key={String(lesson.id)}
                          href={`/admin/collections/lessons/${lesson.id}`}
                          style={{
                            textDecoration: 'none',
                            color: cppInk,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {lesson.title}
                        </a>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                        No lessons yet.
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>No chapters yet.</div>
            )}
          </div>
        </div>
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
              borderRadius: 0,
              border: '1px solid rgba(15, 23, 42, 0.16)',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
              padding: 18,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: cppInk }}>
              Save new course order?
            </div>
            <p style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>
              This will update the class order shown across the site.
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
                  borderRadius: 0,
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
                  borderRadius: 0,
                  border: '1px solid rgba(15, 23, 42, 0.16)',
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
