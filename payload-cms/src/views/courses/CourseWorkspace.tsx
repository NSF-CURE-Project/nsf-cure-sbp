'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CourseNode } from './types'
import CourseOutlineBoard from './CourseOutlineBoard'
import {
  LessonsTab,
  PreviewTab,
  PublishTab,
  QuizzesTab,
  SettingsTab,
} from './WorkspaceTabs'
import { HelpLink } from '../admin/HelpLink'

type WorkspaceTab = 'outline' | 'lessons' | 'quizzes' | 'preview' | 'settings' | 'publish'

type CourseWorkspaceProps = {
  initialCourse: CourseNode
}

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: 'outline', label: 'Outline' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'quizzes', label: 'Quizzes' },
  { id: 'preview', label: 'Preview' },
  { id: 'settings', label: 'Settings' },
  { id: 'publish', label: 'Publish' },
]

export default function CourseWorkspace({ initialCourse }: CourseWorkspaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('outline')
  const [course, setCourse] = useState<CourseNode>(initialCourse)

  const chapterCount = course.chapters.length
  const lessonCount = course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)
  const status = chapterCount === 0 ? 'Empty' : 'Active'
  const previewPath = course.slug ? `/classes/${course.slug}` : null

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
            <HelpLink topic="courses" />
            <Link
              href={`/admin/collections/classes/${course.id}`}
              className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
            >
              Edit details
            </Link>
            {previewPath ? (
              <a
                href={previewPath}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
              >
                Preview
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
                title="Set a slug to enable public preview"
              >
                Preview
              </button>
            )}
            <Link
              href={`/admin/collections/classes/${course.id}`}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-slate-800"
            >
              Publish
            </Link>
          </div>
        </div>

        <nav className="mt-3 flex flex-wrap gap-1" aria-label="Course workspace sections">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-t-md border-b-2 px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-sky-600 text-[var(--cpp-ink)]'
                    : 'border-transparent text-[var(--cpp-muted)] hover:text-[var(--cpp-ink)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div>
        {activeTab === 'outline' ? (
          <CourseOutlineBoard initialCourse={course} onCourseChange={setCourse} />
        ) : null}
        {activeTab === 'lessons' ? <LessonsTab course={course} /> : null}
        {activeTab === 'quizzes' ? <QuizzesTab course={course} /> : null}
        {activeTab === 'preview' ? <PreviewTab course={course} /> : null}
        {activeTab === 'settings' ? (
          <SettingsTab
            course={course}
            onCourseChanged={({ title, slug }) => {
              setCourse((prev) => ({ ...prev, title, slug }))
              router.refresh()
            }}
          />
        ) : null}
        {activeTab === 'publish' ? <PublishTab course={course} /> : null}
      </div>

      <div className="text-xs text-[var(--cpp-muted)]">
        {chapterCount} chapter{chapterCount === 1 ? '' : 's'} · {lessonCount} lesson
        {lessonCount === 1 ? '' : 's'}
      </div>
    </div>
  )
}
