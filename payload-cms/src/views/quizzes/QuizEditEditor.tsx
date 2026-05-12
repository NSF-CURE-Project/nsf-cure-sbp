'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  updateQuiz,
  type QuizDifficulty,
  type QuizScoring,
} from './quiz-api'
import { useBreadcrumbChain } from '../admin/breadcrumbTitle'

type QuestionSummary = {
  id: string
  title: string
}

type CourseOption = { id: string; title: string }
type ChapterOption = { id: string; title: string; courseId: string | null }

type QuizEditEditorProps = {
  quizId: string
  initial: {
    title: string
    description: string
    courseId: string | null
    chapterId: string | null
    tags: string[]
    difficulty: QuizDifficulty
    scoring: QuizScoring
    shuffleQuestions: boolean
    shuffleOptions: boolean
    timeLimitSec: number | null
    status: 'draft' | 'published' | null
    questions: QuestionSummary[]
  }
  courses: CourseOption[]
  chapters: ChapterOption[]
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const AUTOSAVE_DEBOUNCE_MS = 1500

// Custom quiz editor. Mirrors CourseEditEditor's chrome — sticky topbar,
// breadcrumb + status chip + Cancel/Save, debounced auto-save — so the quiz
// edit screen feels like one product with the rest of the admin. The
// `questions` relationship is intentionally read-only here; bulk question
// management still lives in the Quiz Bank, which is the canonical question
// authoring surface and has the QuizQuestionPickerField wiring already.
export default function QuizEditEditor({
  quizId,
  initial,
  courses,
  chapters,
}: QuizEditEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [courseId, setCourseId] = useState<string>(initial.courseId ?? '')
  const [chapterId, setChapterId] = useState<string>(initial.chapterId ?? '')
  const [tagsInput, setTagsInput] = useState(initial.tags.join(', '))
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(initial.difficulty)
  const [scoring, setScoring] = useState<QuizScoring>(initial.scoring)
  const [shuffleQuestions, setShuffleQuestions] = useState(initial.shuffleQuestions)
  const [shuffleOptions, setShuffleOptions] = useState(initial.shuffleOptions)
  const [timeLimitSec, setTimeLimitSec] = useState<string>(
    initial.timeLimitSec != null ? String(initial.timeLimitSec) : '',
  )
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useBreadcrumbChain([
    { label: 'Dashboard', href: '/admin' },
    { label: 'Quiz Bank', href: '/admin/quiz-bank' },
    { label: initial.title || 'Quiz', href: null },
  ])

  // Filter the chapter dropdown by the selected course when available so
  // staff don't have to scroll the whole list. Falls back to "all chapters"
  // when no course is picked.
  const visibleChapters = useMemo(() => {
    if (!courseId) return chapters
    return chapters.filter(
      (chapter) => chapter.courseId === courseId || chapter.courseId == null,
    )
  }, [chapters, courseId])

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput],
  )

  // Snapshot the last persisted values so auto-save can skip no-ops.
  const lastSavedRef = useRef(
    JSON.stringify({
      title: initial.title,
      description: initial.description,
      courseId: initial.courseId ?? '',
      chapterId: initial.chapterId ?? '',
      tags: initial.tags,
      difficulty: initial.difficulty,
      scoring: initial.scoring,
      shuffleQuestions: initial.shuffleQuestions,
      shuffleOptions: initial.shuffleOptions,
      timeLimitSec: initial.timeLimitSec,
    }),
  )

  // Coerce the time-limit input to a number (or null) once for both
  // auto-save and the explicit save handler.
  const numericTimeLimit = useMemo<number | null>(() => {
    const trimmed = timeLimitSec.trim()
    if (!trimmed) return null
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed) || parsed < 0) return null
    return parsed
  }, [timeLimitSec])

  useEffect(() => {
    if (busy) return
    if (!title.trim()) return
    const snapshot = JSON.stringify({
      title,
      description,
      courseId,
      chapterId,
      tags: parsedTags,
      difficulty,
      scoring,
      shuffleQuestions,
      shuffleOptions,
      timeLimitSec: numericTimeLimit,
    })
    if (snapshot === lastSavedRef.current) return
    const handle = window.setTimeout(async () => {
      const fresh = JSON.stringify({
        title,
        description,
        courseId,
        chapterId,
        tags: parsedTags,
        difficulty,
        scoring,
        shuffleQuestions,
        shuffleOptions,
        timeLimitSec: numericTimeLimit,
      })
      if (fresh !== snapshot) return
      setStatus('saving')
      try {
        await updateQuiz(quizId, {
          title: title.trim(),
          description,
          course: courseId || null,
          chapter: chapterId || null,
          tags: parsedTags,
          difficulty,
          scoring,
          shuffleQuestions,
          shuffleOptions,
          timeLimitSec: numericTimeLimit,
        })
        lastSavedRef.current = snapshot
        setStatus('saved')
        setSavedAt(Date.now())
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Auto-save failed')
      }
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [
    quizId,
    title,
    description,
    courseId,
    chapterId,
    parsedTags,
    difficulty,
    scoring,
    shuffleQuestions,
    shuffleOptions,
    numericTimeLimit,
    busy,
  ])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await updateQuiz(quizId, {
        title: title.trim(),
        description,
        course: courseId || null,
        chapter: chapterId || null,
        tags: parsedTags,
        difficulty,
        scoring,
        shuffleQuestions,
        shuffleOptions,
        timeLimitSec: numericTimeLimit,
      })
      lastSavedRef.current = JSON.stringify({
        title,
        description,
        courseId,
        chapterId,
        tags: parsedTags,
        difficulty,
        scoring,
        shuffleQuestions,
        shuffleOptions,
        timeLimitSec: numericTimeLimit,
      })
      setStatus('saved')
      setSavedAt(Date.now())
      router.push('/admin/quiz-bank')
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Save failed')
      setBusy(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/quiz-bank')
  }

  // Re-tick every 30s so "Saved 2m ago" stays current.
  const [, forceTick] = useState(0)
  useEffect(() => {
    if (status !== 'saved' || savedAt == null) return
    const handle = window.setInterval(() => forceTick((n) => n + 1), 30_000)
    return () => window.clearInterval(handle)
  }, [status, savedAt])

  let saveLabel: string | null = null
  if (status === 'saving') saveLabel = 'Auto-saving…'
  else if (status === 'error') saveLabel = 'Auto-save failed'
  else if (status === 'saved' && savedAt != null) {
    const seconds = Math.max(1, Math.round((Date.now() - savedAt) / 1000))
    saveLabel = `Saved ${seconds < 60 ? `${seconds}s ago` : `${Math.round(seconds / 60)}m ago`}`
  }

  const publishedTone: 'ok' | 'draft' = initial.status === 'published' ? 'ok' : 'draft'
  const publishedLabel = initial.status === 'published' ? 'Published' : 'Draft'

  return (
    <div className="qee-shell">
      <style>{`
        .qee-shell { display: grid; gap: 16px; }
        .qee-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          padding: 10px 18px;
          margin: 0 -18px;
          background: var(--admin-surface, #fff);
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .qee-topbar {
          background: var(--admin-surface, #161a23);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .qee-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
        }
        .qee-breadcrumb a {
          color: var(--cpp-ink, #1b1f24);
          text-decoration: none;
          font-weight: 600;
        }
        .qee-breadcrumb a:hover { text-decoration: underline; }
        .qee-breadcrumb__current { color: var(--cpp-ink, #1b1f24); font-weight: 600; }
        .qee-chip {
          display: inline-flex;
          align-items: center;
          padding: 1px 8px;
          margin-left: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .qee-chip--ok {
          background: rgba(16, 185, 129, 0.16);
          color: #047857;
          border-color: rgba(16, 185, 129, 0.32);
        }
        .qee-chip--draft {
          background: rgba(245, 158, 11, 0.14);
          color: #b45309;
          border-color: rgba(245, 158, 11, 0.28);
        }
        :root[data-theme='dark'] .qee-chip--ok { color: #6ee7b7; }
        :root[data-theme='dark'] .qee-chip--draft { color: #fcd34d; }
        .qee-topbar-actions { display: flex; align-items: center; gap: 10px; }
        .qee-autosave {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
          min-width: 110px;
          text-align: right;
        }
        .qee-autosave--err { color: #b91c1c; }
        .qee-btn {
          display: inline-flex;
          align-items: center;
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid var(--admin-surface-border, #d6dce5);
          background: var(--admin-surface, #fff);
          color: var(--cpp-ink, #1b1f24);
          cursor: pointer;
        }
        .qee-btn:hover { background: var(--admin-surface-muted, #f5f7fa); }
        .qee-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .qee-btn--primary {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
        .qee-btn--primary:hover { background: #1e293b; }
        :root[data-theme='dark'] .qee-btn {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
          color: var(--cpp-ink, #e6e8eb);
        }
        :root[data-theme='dark'] .qee-btn--primary {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #e2e8f0;
        }

        .qee-body {
          display: grid;
          gap: 18px;
          padding: 16px 4px;
          max-width: 880px;
          margin: 0 auto;
          width: 100%;
        }
        .qee-intro h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--cpp-ink, #1b1f24);
        }
        .qee-intro p {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: var(--cpp-muted, #5d6b80);
        }
        .qee-section {
          display: grid;
          gap: 12px;
          padding: 16px 18px;
          border-radius: 10px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .qee-section {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .qee-section__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
          margin: 0 0 4px 0;
        }
        .qee-grid-2 {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
        }
        @media (max-width: 720px) {
          .qee-grid-2 { grid-template-columns: minmax(0, 1fr); }
        }
        .qee-label { display: grid; gap: 4px; }
        .qee-label__text {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
        }
        .qee-input,
        .qee-textarea,
        .qee-select {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--cpp-ink, #1b1f24);
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
          font-family: inherit;
        }
        .qee-textarea { min-height: 88px; resize: vertical; }
        .qee-input:focus, .qee-textarea:focus, .qee-select:focus {
          outline: 2px solid rgba(14, 165, 233, 0.4);
          outline-offset: 1px;
          border-color: rgba(14, 165, 233, 0.55);
        }
        :root[data-theme='dark'] .qee-input,
        :root[data-theme='dark'] .qee-textarea,
        :root[data-theme='dark'] .qee-select {
          background: var(--admin-surface-muted, #232938);
          border-color: var(--admin-surface-border, #2a3140);
          color: var(--cpp-ink, #e6e8eb);
        }
        .qee-hint { font-size: 11px; color: var(--cpp-muted, #5d6b80); }
        .qee-checkbox-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 20px;
        }
        .qee-checkbox {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--cpp-ink, #1b1f24);
          cursor: pointer;
        }
        :root[data-theme='dark'] .qee-checkbox {
          color: var(--cpp-ink, #e6e8eb);
        }
        .qee-questions {
          display: grid;
          gap: 6px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .qee-question {
          display: grid;
          grid-template-columns: 28px minmax(0, 1fr);
          gap: 10px;
          padding: 8px 10px;
          font-size: 13px;
          background: var(--admin-surface-muted, #f5f7fa);
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
          align-items: center;
        }
        :root[data-theme='dark'] .qee-question {
          background: var(--admin-surface-muted, #232938);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .qee-question__index {
          font-size: 11px;
          font-weight: 700;
          color: var(--cpp-muted, #5d6b80);
        }
        .qee-question__title {
          color: var(--cpp-ink, #1b1f24);
        }
        :root[data-theme='dark'] .qee-question__title {
          color: var(--cpp-ink, #e6e8eb);
        }
        .qee-questions-empty {
          padding: 16px;
          text-align: center;
          font-size: 13px;
          color: var(--cpp-muted, #5d6b80);
          background: var(--admin-surface-muted, #f5f7fa);
          border: 1px dashed var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
        }
        .qee-link-strong {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--cpp-ink, #1b1f24);
          background: transparent;
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 6px;
          text-decoration: none;
        }
        .qee-link-strong:hover { background: var(--admin-surface-muted, #f5f7fa); }
        :root[data-theme='dark'] .qee-link-strong {
          color: var(--cpp-ink, #e6e8eb);
          border-color: var(--admin-surface-border, #2a3140);
        }
        :root[data-theme='dark'] .qee-link-strong:hover {
          background: var(--admin-surface-muted, #232938);
        }
        .qee-error {
          font-size: 12px;
          color: #b91c1c;
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
        }
      `}</style>

      <div className="qee-topbar">
        <div className="qee-breadcrumb">
          <Link href="/admin/quiz-bank">Quiz Bank</Link>
          <span aria-hidden>›</span>
          <span className="qee-breadcrumb__current">{initial.title || 'Untitled quiz'}</span>
          <span className={`qee-chip qee-chip--${publishedTone}`}>{publishedLabel}</span>
        </div>
        <div className="qee-topbar-actions">
          <span
            className={`qee-autosave${status === 'error' ? ' qee-autosave--err' : ''}`}
            aria-live="polite"
          >
            {saveLabel}
          </span>
          <button type="button" onClick={handleCancel} disabled={busy} className="qee-btn">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || !title.trim()}
            className="qee-btn qee-btn--primary"
          >
            {busy ? 'Saving…' : 'Save & close'}
          </button>
        </div>
      </div>

      <div className="qee-body">
        <header className="qee-intro">
          <h1>Edit quiz</h1>
          <p>
            Auto-saves a couple of seconds after you stop typing. Manage the
            question set itself from the Quiz Bank — this screen owns
            settings, categorization, and behavior.
          </p>
        </header>

        <section className="qee-section">
          <div className="qee-section__title">Identity</div>
          <label className="qee-label">
            <span className="qee-label__text">
              Title <span style={{ color: '#b91c1c' }}>*</span>
            </span>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder='e.g. "Free-body diagrams — Chapter 4 check"'
              className="qee-input"
            />
          </label>
          <label className="qee-label">
            <span className="qee-label__text">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional short summary for staff context."
              className="qee-textarea"
            />
          </label>
        </section>

        <section className="qee-section">
          <div className="qee-section__title">Categorization</div>
          <div className="qee-grid-2">
            <label className="qee-label">
              <span className="qee-label__text">Course</span>
              <select
                value={courseId}
                onChange={(event) => {
                  setCourseId(event.target.value)
                  // Reset chapter if it doesn't belong to the new course.
                  const next = event.target.value
                  if (
                    chapterId &&
                    !chapters.some(
                      (chapter) =>
                        chapter.id === chapterId &&
                        (chapter.courseId === next || chapter.courseId == null),
                    )
                  ) {
                    setChapterId('')
                  }
                }}
                className="qee-select"
              >
                <option value="">— None —</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <span className="qee-hint">
                Optional. Used for filtering in the Quiz Bank.
              </span>
            </label>
            <label className="qee-label">
              <span className="qee-label__text">Chapter</span>
              <select
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                className="qee-select"
              >
                <option value="">— None —</option>
                {visibleChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
              </select>
              <span className="qee-hint">
                {courseId
                  ? 'Filtered to the selected course.'
                  : 'Pick a course first for a shorter list.'}
              </span>
            </label>
          </div>
          <div className="qee-grid-2">
            <label className="qee-label">
              <span className="qee-label__text">Tags</span>
              <input
                type="text"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="comma-separated, e.g. statics, fbd, week4"
                className="qee-input"
              />
              <span className="qee-hint">
                Free-form labels. Used for Quiz Bank filtering.
              </span>
            </label>
            <label className="qee-label">
              <span className="qee-label__text">Difficulty</span>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as QuizDifficulty)}
                className="qee-select"
              >
                <option value="">— Unrated —</option>
                <option value="intro">Intro</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>
        </section>

        <section className="qee-section">
          <div className="qee-section__title">Behavior</div>
          <div className="qee-grid-2">
            <label className="qee-label">
              <span className="qee-label__text">Scoring</span>
              <select
                value={scoring}
                onChange={(event) => setScoring(event.target.value as QuizScoring)}
                className="qee-select"
              >
                <option value="per-question">Per-question</option>
                <option value="all-or-nothing">All-or-nothing</option>
                <option value="partial">Partial (multi-select)</option>
              </select>
              <span className="qee-hint">How student answers are tallied.</span>
            </label>
            <label className="qee-label">
              <span className="qee-label__text">Time limit (seconds)</span>
              <input
                type="number"
                min={0}
                step={1}
                value={timeLimitSec}
                onChange={(event) => setTimeLimitSec(event.target.value)}
                placeholder="No limit"
                className="qee-input"
              />
              <span className="qee-hint">
                Leave blank for an untimed quiz. 0 also means untimed.
              </span>
            </label>
          </div>
          <div className="qee-checkbox-row">
            <label className="qee-checkbox">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(event) => setShuffleQuestions(event.target.checked)}
              />
              Shuffle questions
            </label>
            <label className="qee-checkbox">
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(event) => setShuffleOptions(event.target.checked)}
              />
              Shuffle answer choices
            </label>
          </div>
        </section>

        <section className="qee-section">
          <div className="qee-section__title">
            Questions ({initial.questions.length})
          </div>
          {initial.questions.length > 0 ? (
            <ol className="qee-questions">
              {initial.questions.map((question, i) => (
                <li key={question.id} className="qee-question">
                  <span className="qee-question__index">#{i + 1}</span>
                  <span className="qee-question__title">
                    {question.title || 'Untitled question'}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="qee-questions-empty">
              No questions yet. Open the Quiz Bank to add or build questions.
            </div>
          )}
          <div>
            <Link href="/admin/quiz-bank" className="qee-link-strong">
              Manage questions in Quiz Bank ↗
            </Link>
          </div>
        </section>

        {error ? (
          <div className="qee-error" role="alert" aria-live="assertive">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}
