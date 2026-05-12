'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import type { CourseNode } from './types'
import { updateCourseSettings } from './courses-order-api'

type FlatLesson = {
  id: string
  title: string
  chapterTitle: string
  chapterId: string
  order: number
  quizTitle: string | null
}

const flattenLessons = (course: CourseNode): FlatLesson[] =>
  course.chapters.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      chapterTitle: chapter.title,
      chapterId: chapter.id,
      order: lesson.order,
      quizTitle: lesson.quizTitle ?? null,
    })),
  )

export function LessonsTab({ course }: { course: CourseNode }) {
  const [query, setQuery] = useState('')
  const lessons = useMemo(() => flattenLessons(course), [course])
  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return lessons
    return lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(trimmed) ||
        lesson.chapterTitle.toLowerCase().includes(trimmed),
    )
  }, [lessons, query])

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search lessons by title or chapter…"
          className="w-full max-w-sm rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          aria-label="Search lessons"
        />
        <div className="text-xs text-[var(--cpp-muted)]">
          {filtered.length} of {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-3 py-6 text-center text-sm text-[var(--cpp-muted)]">
          {lessons.length === 0
            ? 'This course has no lessons yet. Add chapters and lessons from the Outline tab.'
            : `No lessons match “${query}”.`}
        </div>
      ) : (
        <div className="grid gap-1.5">
          {filtered.map((lesson) => (
            <div
              key={lesson.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[var(--cpp-ink)]">
                  {lesson.title}
                </div>
                <div className="truncate text-xs text-[var(--cpp-muted)]">
                  {lesson.chapterTitle} · Position {lesson.order}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    lesson.quizTitle
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {lesson.quizTitle ? 'Quiz' : 'No quiz'}
                </span>
                <Link
                  href={`/admin/courses/${course.id}/lessons/${lesson.id}/edit`}
                  className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function QuizzesTab({ course }: { course: CourseNode }) {
  const lessons = useMemo(() => flattenLessons(course), [course])
  const totalLessons = lessons.length
  const lessonsWithQuiz = lessons.filter((lesson) => lesson.quizTitle)
  const lessonsWithoutQuiz = lessons.filter((lesson) => !lesson.quizTitle)
  const coverage =
    totalLessons === 0 ? 0 : Math.round((lessonsWithQuiz.length / totalLessons) * 100)

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
            Lessons with quiz
          </div>
          <div className="mt-1 text-xl font-semibold text-[var(--cpp-ink)]">
            {lessonsWithQuiz.length}
          </div>
        </div>
        <div className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
            Missing quiz
          </div>
          <div className="mt-1 text-xl font-semibold text-amber-700">
            {lessonsWithoutQuiz.length}
          </div>
        </div>
        <div className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
            Coverage
          </div>
          <div className="mt-1 text-xl font-semibold text-[var(--cpp-ink)]">{coverage}%</div>
        </div>
      </div>

      {totalLessons === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--admin-surface-border)] bg-[var(--admin-surface-muted)] px-3 py-6 text-center text-sm text-[var(--cpp-muted)]">
          No lessons yet. Add lessons from the Outline tab to start tracking quiz coverage.
        </div>
      ) : (
        <div className="grid gap-1.5">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[var(--cpp-ink)]">
                  {lesson.title}
                </div>
                <div className="truncate text-xs text-[var(--cpp-muted)]">{lesson.chapterTitle}</div>
              </div>
              <div className="min-w-0 truncate text-xs">
                {lesson.quizTitle ? (
                  <span className="text-[var(--cpp-ink)]">{lesson.quizTitle}</span>
                ) : (
                  <span className="text-amber-700">Not assigned</span>
                )}
              </div>
              <Link
                href={`/admin/courses/${course.id}/lessons/${lesson.id}/edit`}
                className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
              >
                Edit lesson
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function PreviewTab({
  course,
  publicOrigin,
}: {
  course: CourseNode
  publicOrigin?: string
}) {
  const slug = course.slug ?? ''
  const trimmedOrigin = (publicOrigin ?? '').replace(/\/+$/, '')
  const previewPath = slug ? `/classes/${slug}` : null
  const previewHref = slug
    ? trimmedOrigin
      ? `${trimmedOrigin}/classes/${slug}`
      : `/classes/${slug}`
    : null

  return (
    <div className="grid gap-3">
      <div className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
          Public preview
        </div>
        {previewHref ? (
          <>
            <div className="mt-1 text-sm text-[var(--cpp-ink)]">
              The course is available on the public site at:
            </div>
            <code className="mt-1 inline-block rounded bg-[var(--admin-surface-muted)] px-2 py-0.5 text-xs">
              {trimmedOrigin ? previewHref : previewPath}
            </code>
            <div className="mt-3">
              <a
                href={previewHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-slate-800"
              >
                Open public preview
              </a>
            </div>
          </>
        ) : (
          <div className="mt-1 text-sm text-[var(--cpp-muted)]">
            This course has no slug yet. Set a slug in the Settings tab to enable public preview.
          </div>
        )}
      </div>
    </div>
  )
}

export function SettingsTab({
  course,
  onCourseChanged,
}: {
  course: CourseNode
  onCourseChanged: (next: { title: string; slug: string }) => void
}) {
  const [title, setTitle] = useState(course.title)
  const [slug, setSlug] = useState(course.slug ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const titleDirty = title.trim() !== course.title.trim()
  const slugDirty = slug.trim() !== (course.slug ?? '').trim()
  const dirty = titleDirty || slugDirty

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const data: { title?: string; slug?: string } = {}
      if (titleDirty) data.title = title.trim()
      if (slugDirty) data.slug = slug.trim() || ''
      await updateCourseSettings(course.id, data)
      onCourseChanged({ title: title.trim(), slug: slug.trim() })
      setSavedAt(Date.now())
    } catch (_err) {
      setError('Could not save course settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid max-w-2xl gap-4">
      <label className="grid gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
          Course title
        </span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
          Slug
        </span>
        <input
          type="text"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="auto-generated-from-title"
          className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <span className="text-xs text-[var(--cpp-muted)]">
          Used in the public URL. Letters, numbers, and dashes only.
        </span>
      </label>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
      {savedAt ? (
        <div className="text-xs text-emerald-700">
          Saved at{' '}
          {new Date(savedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric' })}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/admin/collections/classes/${course.id}`}
          className="text-xs font-semibold text-[var(--cpp-ink)] underline-offset-2 hover:underline"
        >
          Open full course editor for advanced fields
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}

export function PublishTab({ course }: { course: CourseNode }) {
  const lessons = flattenLessons(course)
  const lessonsWithoutQuiz = lessons.filter((lesson) => !lesson.quizTitle).length
  const emptyChapters = course.chapters.filter((chapter) => chapter.lessons.length === 0).length
  const checks = [
    {
      ok: course.chapters.length > 0,
      label: 'Has at least one chapter',
      detail: `${course.chapters.length} chapter${course.chapters.length === 1 ? '' : 's'}`,
    },
    {
      ok: lessons.length > 0,
      label: 'Has at least one lesson',
      detail: `${lessons.length} lesson${lessons.length === 1 ? '' : 's'}`,
    },
    {
      ok: emptyChapters === 0,
      label: 'No empty chapters',
      detail: emptyChapters === 0 ? 'all chapters have lessons' : `${emptyChapters} empty`,
    },
    {
      ok: lessonsWithoutQuiz === 0,
      label: 'All lessons have a quiz',
      detail:
        lessonsWithoutQuiz === 0
          ? 'fully covered'
          : `${lessonsWithoutQuiz} missing quiz`,
    },
    {
      ok: Boolean(course.slug && course.slug.length > 0),
      label: 'Course has a slug',
      detail: course.slug ? course.slug : 'missing — set in Settings',
    },
  ]
  const ready = checks.every((check) => check.ok)

  return (
    <div className="grid max-w-2xl gap-4">
      <div
        className={`rounded-md border px-4 py-3 ${
          ready
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}
      >
        <div className="text-xs font-semibold uppercase tracking-wider">
          {ready ? 'Ready to publish' : 'Items to address'}
        </div>
        <div className="mt-1 text-sm">
          {ready
            ? 'All publish checks pass. Open the full course editor to set publish status.'
            : 'Fix the items below to clear the publish checklist.'}
        </div>
      </div>

      <ul className="grid gap-1.5">
        {checks.map((check) => (
          <li
            key={check.label}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm"
          >
            <span aria-hidden className={check.ok ? 'text-emerald-600' : 'text-amber-600'}>
              {check.ok ? '✓' : '!'}
            </span>
            <span className="truncate text-[var(--cpp-ink)]">{check.label}</span>
            <span className="text-xs text-[var(--cpp-muted)]">{check.detail}</span>
          </li>
        ))}
      </ul>

      <div>
        <Link
          href={`/admin/collections/classes/${course.id}`}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-slate-800"
        >
          Open full course editor
        </Link>
      </div>
    </div>
  )
}
