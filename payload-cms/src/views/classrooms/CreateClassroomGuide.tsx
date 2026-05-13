'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  createClassroom,
  searchCourses,
  searchProfessors,
  type CourseOption,
  type EntityId,
  type ProfessorOption,
} from './classrooms-api'
import { HelpLink } from '../admin/HelpLink'

type Props = {
  initialCourses: CourseOption[]
  initialProfessors: ProfessorOption[]
  defaultProfessorId: EntityId | null
}

const SEARCH_DEBOUNCE_MS = 200

export default function CreateClassroomGuide({
  initialCourses,
  initialProfessors,
  defaultProfessorId,
}: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')

  const [courseQuery, setCourseQuery] = useState('')
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>(initialCourses)
  const [courseId, setCourseId] = useState<EntityId | ''>('')

  const [professorQuery, setProfessorQuery] = useState('')
  const [professorOptions, setProfessorOptions] =
    useState<ProfessorOption[]>(initialProfessors)
  const [professorId, setProfessorId] = useState<EntityId | ''>(defaultProfessorId ?? '')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced course-search. Empty query refreshes back to the initial slice
  // so the dropdown never goes blank between searches.
  useEffect(() => {
    const query = courseQuery.trim()
    const handle = window.setTimeout(async () => {
      try {
        const results = await searchCourses(query)
        setCourseOptions(results)
      } catch {
        // network or auth failure — fall back to the initial slice
        if (!query) setCourseOptions(initialCourses)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [courseQuery, initialCourses])

  useEffect(() => {
    const query = professorQuery.trim()
    const handle = window.setTimeout(async () => {
      try {
        const results = await searchProfessors(query)
        setProfessorOptions(results)
      } catch {
        if (!query) setProfessorOptions(initialProfessors)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [professorQuery, initialProfessors])

  const canSubmit = useMemo(
    () => title.trim().length > 0 && courseId !== '' && professorId !== '',
    [title, courseId, professorId],
  )

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Title, course, and professor are required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const created = await createClassroom({
        title: title.trim(),
        classId: courseId as EntityId,
        professorId: professorId as EntityId,
      })
      router.push(`/admin/classrooms/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create classroom.')
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-5">
      <header className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--cpp-muted)]">
          <Link
            href="/admin/classrooms"
            className="font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
          >
            Classrooms
          </Link>
          <span aria-hidden>›</span>
          <span>Create classroom</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="m-0 text-2xl font-semibold text-[var(--cpp-ink)]">
            Create a new classroom
          </h1>
          <HelpLink topic="classrooms" />
        </div>
        <p className="text-sm text-[var(--cpp-muted)]">
          A classroom pairs a course with a professor and generates a unique join code for
          students. You can adjust the join code length, duration, and active status after
          creation.
        </p>
      </header>

      <section className="grid max-w-2xl gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
            Classroom title <span className="text-red-600">*</span>
          </span>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. ME 214 — Fall 2026"
            className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <span className="text-xs text-[var(--cpp-muted)]">
            Shown to staff. Often the course code plus term.
          </span>
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
            Course <span className="text-red-600">*</span>
          </span>
          <input
            type="search"
            value={courseQuery}
            onChange={(event) => setCourseQuery(event.target.value)}
            placeholder="Search courses…"
            className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            aria-label="Search courses"
          />
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value as EntityId | '')}
            className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">Select a course…</option>
            {courseOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
            Professor <span className="text-red-600">*</span>
          </span>
          <input
            type="search"
            value={professorQuery}
            onChange={(event) => setProfessorQuery(event.target.value)}
            placeholder="Search by name or email…"
            className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            aria-label="Search professors"
          />
          <select
            value={professorId}
            onChange={(event) => setProfessorId(event.target.value as EntityId | '')}
            className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">Select a professor…</option>
            {professorOptions.map((option) => {
              // If display name happens to equal the email (firstName/lastName
              // both blank), don't render the email again as a suffix.
              const showEmailSuffix = option.email && option.email !== option.name
              return (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {showEmailSuffix ? ` — ${option.email}` : ''}
                </option>
              )
            })}
          </select>
          <span className="text-xs text-[var(--cpp-muted)]">
            Defaults to you if you have an eligible role.
          </span>
        </label>
      </section>

      {error ? <div className="text-xs text-red-700">{error}</div> : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-surface-border)] pt-3">
        <Link
          href="/admin/classrooms"
          className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy || !canSubmit}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create classroom'}
        </button>
      </div>
    </div>
  )
}
