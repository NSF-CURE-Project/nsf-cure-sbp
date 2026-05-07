'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { CourseNode } from './types'
import CourseOutlineBoard from './CourseOutlineBoard'

type WorkspaceTab = 'outline' | 'lessons' | 'quizzes' | 'preview' | 'settings' | 'publish'

type CourseWorkspaceProps = {
  initialCourse: CourseNode
}

const tabs: { id: WorkspaceTab; label: string; ready: boolean }[] = [
  { id: 'outline', label: 'Outline', ready: true },
  { id: 'lessons', label: 'Lessons', ready: false },
  { id: 'quizzes', label: 'Quizzes', ready: false },
  { id: 'preview', label: 'Preview', ready: false },
  { id: 'settings', label: 'Settings', ready: false },
  { id: 'publish', label: 'Publish', ready: false },
]

export default function CourseWorkspace({ initialCourse }: CourseWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('outline')
  const [course, setCourse] = useState<CourseNode>(initialCourse)

  const chapterCount = course.chapters.length
  const lessonCount = course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)
  const status = chapterCount === 0 ? 'Empty' : 'Active'

  return (
    <div className="grid gap-4">
      <div
        className="sticky top-0 z-10 -mx-4 border-b border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-4 pt-3 pb-3"
        style={{ backdropFilter: 'saturate(140%) blur(8px)' }}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--cpp-muted)]">
          <Link
            href="/admin/courses"
            className="font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
          >
            Courses
          </Link>
          <span aria-hidden>›</span>
          <span className="truncate">{course.title}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="m-0 text-2xl font-semibold text-[var(--cpp-ink)]">{course.title}</h1>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/collections/classes/${course.id}`}
              className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
            >
              Edit details
            </Link>
            <button
              type="button"
              disabled
              className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-muted)] opacity-60"
              title="Coming in Phase 2"
            >
              Preview
            </button>
            <button
              type="button"
              disabled
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-60"
              title="Coming in Phase 2"
            >
              Publish
            </button>
          </div>
        </div>

        <nav className="mt-3 flex flex-wrap gap-1" aria-label="Course workspace sections">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => tab.ready && setActiveTab(tab.id)}
                disabled={!tab.ready}
                className={`relative rounded-t-md border-b-2 px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-sky-600 text-[var(--cpp-ink)]'
                    : 'border-transparent text-[var(--cpp-muted)]'
                } ${tab.ready ? 'hover:text-[var(--cpp-ink)]' : 'cursor-not-allowed opacity-50'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
                {!tab.ready ? (
                  <span className="ml-1 align-middle text-[10px] font-normal uppercase tracking-wide text-[var(--cpp-muted)]">
                    soon
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>
      </div>

      <div>
        {activeTab === 'outline' ? (
          <CourseOutlineBoard initialCourse={course} onCourseChange={setCourse} />
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-4 py-8 text-center text-sm text-[var(--cpp-muted)]">
            This section is coming in Phase 2.
          </div>
        )}
      </div>

      <div className="text-xs text-[var(--cpp-muted)]">
        {chapterCount} chapter{chapterCount === 1 ? '' : 's'} · {lessonCount} lesson
        {lessonCount === 1 ? '' : 's'}
      </div>
    </div>
  )
}
