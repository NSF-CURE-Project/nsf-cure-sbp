'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createChapterInCourse, createCourse } from './courses-order-api'
import { HelpLink } from '../admin/HelpLink'

type Step = 'basics' | 'chapters' | 'review'

type ChapterDraft = { id: string; title: string }

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const newChapterDraft = (): ChapterDraft => ({
  id: `draft-${Math.random().toString(36).slice(2, 9)}`,
  title: '',
})

export default function CreateCourseGuide() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('basics')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [chapters, setChapters] = useState<ChapterDraft[]>([newChapterDraft()])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)

  const effectiveSlug = useMemo(() => {
    const fromTitle = slugify(title)
    return slugTouched ? slug : fromTitle
  }, [slug, slugTouched, title])

  const filledChapters = chapters.filter((chapter) => chapter.title.trim().length > 0)
  const canAdvanceFromBasics = title.trim().length > 0

  const goNext = () => {
    setError(null)
    if (step === 'basics') setStep('chapters')
    else if (step === 'chapters') setStep('review')
  }
  const goBack = () => {
    setError(null)
    if (step === 'chapters') setStep('basics')
    else if (step === 'review') setStep('chapters')
  }

  const handleAddChapter = () => {
    setChapters((prev) => [...prev, newChapterDraft()])
  }

  const handleChapterChange = (id: string, value: string) => {
    setChapters((prev) =>
      prev.map((chapter) => (chapter.id === id ? { ...chapter, title: value } : chapter)),
    )
  }

  const handleRemoveChapter = (id: string) => {
    setChapters((prev) => {
      const next = prev.filter((chapter) => chapter.id !== id)
      return next.length === 0 ? [newChapterDraft()] : next
    })
  }

  const handleCreate = async () => {
    if (!canAdvanceFromBasics) {
      setError('Course title is required.')
      setStep('basics')
      return
    }
    setBusy(true)
    setError(null)
    setProgress('Creating course…')
    try {
      const created = await createCourse({
        title: title.trim(),
        slug: effectiveSlug || undefined,
      })

      let i = 0
      for (const chapter of filledChapters) {
        i += 1
        setProgress(`Creating chapter ${i} of ${filledChapters.length}…`)
        try {
          await createChapterInCourse(created.id, chapter.title.trim(), i)
        } catch {
          throw new Error(`Could not create chapter “${chapter.title.trim()}”.`)
        }
      }

      router.push(`/admin/courses/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create course.')
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="grid gap-5">
      <header className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--cpp-muted)]">
          <Link
            href="/admin/courses"
            className="font-semibold text-[var(--cpp-ink)] no-underline hover:underline"
          >
            Courses
          </Link>
          <span aria-hidden>›</span>
          <span>Create course</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="m-0 text-2xl font-semibold text-[var(--cpp-ink)]">
            Create a new course
          </h1>
          <HelpLink topic="courses" />
        </div>
        <p className="text-sm text-[var(--cpp-muted)]">
          A short guided flow. You can add lessons, quizzes, and finer settings from the course
          workspace after creation.
        </p>
      </header>

      <ol className="flex flex-wrap gap-1 text-xs">
        {(['basics', 'chapters', 'review'] satisfies Step[]).map((entry, index) => {
          const isActive = step === entry
          const labels: Record<Step, string> = {
            basics: '1. Basics',
            chapters: '2. Structure',
            review: '3. Review',
          }
          return (
            <li
              key={entry}
              className={`rounded-md border px-3 py-1 font-semibold transition ${
                isActive
                  ? 'border-sky-400 bg-sky-50 text-sky-800'
                  : index < (['basics', 'chapters', 'review'] as Step[]).indexOf(step)
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-[var(--admin-surface-border)] bg-[var(--admin-surface)] text-[var(--cpp-muted)]'
              }`}
            >
              {labels[entry]}
            </li>
          )
        })}
      </ol>

      {step === 'basics' ? (
        <section className="grid max-w-2xl gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
              Course title <span className="text-red-600">*</span>
            </span>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Statics"
              className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--cpp-muted)]">
              Slug
            </span>
            <input
              type="text"
              value={effectiveSlug}
              onChange={(event) => {
                setSlug(event.target.value)
                setSlugTouched(true)
              }}
              placeholder="auto-generated"
              className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--cpp-ink)] focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <span className="text-xs text-[var(--cpp-muted)]">
              Used in the public URL. Leave blank to auto-generate from title.
            </span>
          </label>
        </section>
      ) : null}

      {step === 'chapters' ? (
        <section className="grid max-w-2xl gap-3">
          <p className="text-sm text-[var(--cpp-muted)]">
            Outline your course with chapter titles. You can reorder, edit, and add lessons inside
            each chapter from the course workspace next.
          </p>
          <div className="grid gap-2">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-2"
              >
                <span className="text-xs font-semibold text-[var(--cpp-muted)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(event) => handleChapterChange(chapter.id, event.target.value)}
                  placeholder={`Chapter ${index + 1} title`}
                  className="rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-[var(--cpp-ink)] focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveChapter(chapter.id)}
                  aria-label={`Remove chapter ${index + 1}`}
                  className="rounded-md border border-[var(--admin-surface-border)] px-2 py-1 text-xs text-[var(--cpp-muted)] hover:bg-[var(--admin-surface-muted)]"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddChapter}
              className="inline-flex w-fit rounded-md border border-dashed border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)]"
            >
              + Add chapter
            </button>
          </div>
          <p className="text-xs text-[var(--cpp-muted)]">
            Empty chapter slots are skipped. You can also create the course with no chapters and
            add them in the workspace.
          </p>
        </section>
      ) : null}

      {step === 'review' ? (
        <section className="grid max-w-2xl gap-3">
          <div className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
              Course
            </div>
            <div className="mt-1 text-base font-semibold text-[var(--cpp-ink)]">
              {title.trim() || '(untitled)'}
            </div>
            <div className="mt-0.5 text-xs text-[var(--cpp-muted)]">
              Slug: {effectiveSlug || '(will be auto-generated)'}
            </div>
          </div>
          <div className="rounded-md border border-[var(--admin-surface-border)] bg-[var(--admin-surface)] px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--cpp-muted)]">
              Chapters ({filledChapters.length})
            </div>
            {filledChapters.length === 0 ? (
              <div className="mt-1 text-sm text-[var(--cpp-muted)]">
                No chapters — you can add them later.
              </div>
            ) : (
              <ol className="mt-1 grid gap-1 text-sm text-[var(--cpp-ink)]">
                {filledChapters.map((chapter, index) => (
                  <li key={chapter.id}>
                    {index + 1}. {chapter.title.trim()}
                  </li>
                ))}
              </ol>
            )}
          </div>
          {progress ? <div className="text-xs text-[var(--cpp-muted)]">{progress}</div> : null}
        </section>
      ) : null}

      {error ? <div className="text-xs text-red-700">{error}</div> : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-surface-border)] pt-3">
        <Link
          href="/admin/courses"
          className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] no-underline hover:bg-[var(--admin-surface-muted)]"
        >
          Cancel
        </Link>
        <div className="flex items-center gap-2">
          {step !== 'basics' ? (
            <button
              type="button"
              onClick={goBack}
              disabled={busy}
              className="rounded-md border border-[var(--admin-surface-border)] px-3 py-1.5 text-xs font-semibold text-[var(--cpp-ink)] hover:bg-[var(--admin-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Back
            </button>
          ) : null}
          {step !== 'review' ? (
            <button
              type="button"
              onClick={goNext}
              disabled={step === 'basics' && !canAdvanceFromBasics}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={busy || !canAdvanceFromBasics}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create course'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
