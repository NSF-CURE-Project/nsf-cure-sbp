'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  buildUserDisplayName,
  buildUserInitials,
  createClassroom,
  regenerateJoinCode,
  searchCourses,
  searchProfessors,
  updateClassroom,
  type CourseOption,
  type EntityId,
  type ProfessorOption,
} from './classrooms-api'
import { useBreadcrumbChain } from '../admin/breadcrumbTitle'
import { useConfirm } from '../admin/useConfirm'

type ClassroomEditorProps = {
  classroomId: EntityId
  initialTitle: string
  initialCourseId: EntityId | ''
  initialCourseTitle: string | null
  initialProfessorId: EntityId | ''
  initialProfessorName: string | null
  initialProfessorFirstName: string
  initialProfessorLastName: string
  initialProfessorEmail: string
  initialActive: boolean
  initialJoinCode: string
  initialJoinCodeLength: number
  initialJoinCodeDurationHours: number
  initialJoinCodeExpiresAt: string | null
  initialJoinCodeLastRotatedAt: string | null
  memberCount: number
  lastJoinedAt: string | null
  createdAt: string | null
  webOrigin: string
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type CopyStatus = 'idle' | 'copied' | 'error'

const AUTOSAVE_DEBOUNCE_MS = 1500
const SEARCH_DEBOUNCE_MS = 200
const COPY_FEEDBACK_MS = 1800

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatRelative = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const now = Date.now()
  const diffMs = date.getTime() - now
  const past = diffMs < 0
  const absSec = Math.round(Math.abs(diffMs) / 1000)
  if (absSec < 60) return past ? 'just now' : 'in a moment'
  const absMin = Math.round(absSec / 60)
  if (absMin < 60) return past ? `${absMin}m ago` : `in ${absMin}m`
  const absHr = Math.round(absMin / 60)
  if (absHr < 24) return past ? `${absHr}h ago` : `in ${absHr}h`
  const absDay = Math.round(absHr / 24)
  if (absDay < 30) return past ? `${absDay}d ago` : `in ${absDay}d`
  return formatDate(iso)
}

// Copy with a fallback for non-secure origins. navigator.clipboard.writeText
// only works on HTTPS or strict localhost; the admin frequently runs on a
// custom hostname over HTTP (e.g. admin.sbp.local), where the async API
// rejects. Fall back to a hidden textarea + execCommand('copy').
const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to textarea fallback
    }
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '0'
    textarea.style.left = '0'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'
    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

const Avatar: React.FC<{ initials: string; size?: number }> = ({ initials, size = 28 }) => (
  <span
    aria-hidden
    className="ce-avatar"
    style={{ width: size, height: size, fontSize: size <= 28 ? 11 : 13 }}
  >
    {initials}
  </span>
)

export default function ClassroomEditor({
  classroomId,
  initialTitle,
  initialCourseId,
  initialCourseTitle,
  initialProfessorId,
  initialProfessorName,
  initialProfessorFirstName,
  initialProfessorLastName,
  initialProfessorEmail,
  initialActive,
  initialJoinCode,
  initialJoinCodeLength,
  initialJoinCodeDurationHours,
  initialJoinCodeExpiresAt,
  initialJoinCodeLastRotatedAt,
  memberCount,
  lastJoinedAt,
  createdAt,
  webOrigin,
}: ClassroomEditorProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialTitle)
  const [courseId, setCourseId] = useState<EntityId | ''>(initialCourseId)
  const [professorId, setProfessorId] = useState<EntityId | ''>(initialProfessorId)
  const [active, setActive] = useState(initialActive)
  const [joinCodeLength, setJoinCodeLength] = useState(initialJoinCodeLength)
  const [joinCodeDurationHours, setJoinCodeDurationHours] = useState(initialJoinCodeDurationHours)

  const [joinCode, setJoinCode] = useState(initialJoinCode)
  const [joinCodeExpiresAt, setJoinCodeExpiresAt] = useState(initialJoinCodeExpiresAt)
  const [joinCodeLastRotatedAt, setJoinCodeLastRotatedAt] = useState(
    initialJoinCodeLastRotatedAt,
  )

  const [status, setStatus] = useState<SaveStatus>('idle')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [rotateStatus, setRotateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [rotateMessage, setRotateMessage] = useState<string | null>(null)

  const [copyCodeStatus, setCopyCodeStatus] = useState<CopyStatus>('idle')
  const [copyInviteStatus, setCopyInviteStatus] = useState<CopyStatus>('idle')
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Course / professor pickers seed from server-rendered relationship data so
  // the currently-saved option always renders even before the first search.
  const [courseQuery, setCourseQuery] = useState('')
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>(() =>
    initialCourseId && initialCourseTitle
      ? [{ id: initialCourseId, title: initialCourseTitle }]
      : [],
  )
  const [professorQuery, setProfessorQuery] = useState('')
  const [professorOptions, setProfessorOptions] = useState<ProfessorOption[]>(() =>
    initialProfessorId
      ? [
          {
            id: initialProfessorId,
            name: initialProfessorName ?? 'Unnamed user',
            firstName: initialProfessorFirstName,
            lastName: initialProfessorLastName,
            email: initialProfessorEmail,
            role: '',
          },
        ]
      : [],
  )

  const lastSavedRef = useRef(
    JSON.stringify({
      title: initialTitle,
      courseId: initialCourseId,
      professorId: initialProfessorId,
      active: initialActive,
      joinCodeLength: initialJoinCodeLength,
      joinCodeDurationHours: initialJoinCodeDurationHours,
    }),
  )

  const { confirm, dialog: confirmDialog } = useConfirm()

  useBreadcrumbChain([
    { label: 'Dashboard', href: '/admin' },
    { label: 'Classrooms', href: '/admin/classrooms' },
    { label: initialTitle || 'Classroom', href: null },
  ])

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        title,
        courseId,
        professorId,
        active,
        joinCodeLength,
        joinCodeDurationHours,
      }),
    [title, courseId, professorId, active, joinCodeLength, joinCodeDurationHours],
  )

  const isDirty = currentSnapshot !== lastSavedRef.current

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      try {
        const results = await searchCourses(courseQuery)
        const merged = [...results]
        if (
          courseId &&
          !merged.some((option) => option.id === courseId) &&
          initialCourseTitle
        ) {
          merged.unshift({ id: courseId, title: initialCourseTitle })
        }
        setCourseOptions(merged)
      } catch {
        // keep prior options
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [courseQuery, courseId, initialCourseTitle])

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      try {
        const results = await searchProfessors(professorQuery)
        const merged = [...results]
        if (professorId && !merged.some((option) => option.id === professorId)) {
          merged.unshift({
            id: professorId,
            name: initialProfessorName ?? 'Unnamed user',
            firstName: initialProfessorFirstName,
            lastName: initialProfessorLastName,
            email: initialProfessorEmail,
            role: '',
          })
        }
        setProfessorOptions(merged)
      } catch {
        // keep prior options
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [
    professorQuery,
    professorId,
    initialProfessorName,
    initialProfessorFirstName,
    initialProfessorLastName,
    initialProfessorEmail,
  ])

  // Debounced auto-save: mirrors CourseEditEditor — skip while a manual save
  // is in flight, skip no-ops, require title + both relations.
  useEffect(() => {
    if (busy) return
    if (!title.trim()) return
    if (!courseId || !professorId) return
    if (currentSnapshot === lastSavedRef.current) return
    const handle = window.setTimeout(async () => {
      // Re-check at fire time so we don't race a faster typist.
      if (currentSnapshot !== JSON.stringify({
        title,
        courseId,
        professorId,
        active,
        joinCodeLength,
        joinCodeDurationHours,
      })) return
      setStatus('saving')
      try {
        await updateClassroom(classroomId, {
          title: title.trim(),
          classId: courseId,
          professorId,
          active,
          joinCodeLength,
          joinCodeDurationHours,
        })
        lastSavedRef.current = currentSnapshot
        setStatus('saved')
        setSavedAt(Date.now())
        setError(null)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Auto-save failed')
      }
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [
    classroomId,
    title,
    courseId,
    professorId,
    active,
    joinCodeLength,
    joinCodeDurationHours,
    busy,
    currentSnapshot,
  ])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!courseId || !professorId) {
      setError('Course and professor are required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await updateClassroom(classroomId, {
        title: title.trim(),
        classId: courseId,
        professorId,
        active,
        joinCodeLength,
        joinCodeDurationHours,
      })
      lastSavedRef.current = currentSnapshot
      setStatus('saved')
      setSavedAt(Date.now())
      router.push('/admin/classrooms')
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Save failed')
      setBusy(false)
    }
  }

  const handleRegenerate = async () => {
    setRotateStatus('loading')
    setRotateMessage(null)
    try {
      const result = await regenerateJoinCode(classroomId, {
        length: joinCodeLength,
        durationHours: joinCodeDurationHours,
      })
      setJoinCode(result.joinCode)
      setJoinCodeExpiresAt(result.joinCodeExpiresAt)
      setJoinCodeLastRotatedAt(result.joinCodeLastRotatedAt)
      setRotateStatus('success')
      setRotateMessage('Join code regenerated. The old code no longer works.')
    } catch (err) {
      setRotateStatus('error')
      setRotateMessage(err instanceof Error ? err.message : 'Unable to regenerate join code.')
    }
  }

  const flashCopyFeedback = useCallback(
    (setter: React.Dispatch<React.SetStateAction<CopyStatus>>, success: boolean) => {
      setter(success ? 'copied' : 'error')
      window.setTimeout(() => setter('idle'), COPY_FEEDBACK_MS)
    },
    [],
  )

  const handleCopyCode = async () => {
    if (!joinCode) return
    const ok = await copyToClipboard(joinCode)
    flashCopyFeedback(setCopyCodeStatus, ok)
  }

  // Build a one-click join URL. The /join-classroom page reads ?code= and
  // prefills the input; LoginLink preserves the query string through login,
  // so unauthenticated students return to the same prefilled state.
  const inviteUrl = useMemo(() => {
    const base = webOrigin || ''
    const path = '/join-classroom'
    const search = joinCode ? `?code=${encodeURIComponent(joinCode)}` : ''
    return `${base}${path}${search}`
  }, [webOrigin, joinCode])

  const inviteMessage = useMemo(() => {
    const parts = [`Join "${title || 'this classroom'}":`, inviteUrl]
    if (joinCode) parts.push(`Code: ${joinCode}`)
    return parts.join('\n')
  }, [title, inviteUrl, joinCode])

  const handleCopyInvite = async () => {
    const ok = await copyToClipboard(inviteMessage)
    flashCopyFeedback(setCopyInviteStatus, ok)
  }

  const handleToggleArchive = async () => {
    const nextActive = !active
    const verb = nextActive ? 'reactivate' : 'archive'
    const confirmed = await confirm({
      title: nextActive ? `Reactivate "${title}"?` : `Archive "${title}"?`,
      message: nextActive
        ? 'Students will be able to join with the code again.'
        : 'The join code stops working immediately. You can reactivate later.',
      confirmLabel: nextActive ? 'Reactivate' : 'Archive',
      destructive: !nextActive,
    })
    if (!confirmed) return
    setBusy(true)
    setActionMessage(null)
    try {
      await updateClassroom(classroomId, { active: nextActive })
      setActive(nextActive)
      lastSavedRef.current = JSON.stringify({
        title,
        courseId,
        professorId,
        active: nextActive,
        joinCodeLength,
        joinCodeDurationHours,
      })
      setStatus('saved')
      setSavedAt(Date.now())
      setActionMessage(nextActive ? 'Classroom reactivated.' : 'Classroom archived.')
      router.refresh()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : `Unable to ${verb}.`)
    } finally {
      setBusy(false)
    }
  }

  const handleDuplicate = async () => {
    if (!courseId || !professorId) {
      setActionMessage('Add a course and professor before duplicating.')
      return
    }
    const confirmed = await confirm({
      title: `Duplicate "${title}"?`,
      message:
        'A new classroom is created with the same course and professor; a fresh join code is generated.',
      confirmLabel: 'Duplicate',
    })
    if (!confirmed) return
    setBusy(true)
    setActionMessage(null)
    try {
      const created = await createClassroom({
        title: `${title.trim() || 'Classroom'} (copy)`,
        classId: courseId,
        professorId,
      })
      router.push(`/admin/classrooms/${created.id}`)
    } catch (err) {
      setBusy(false)
      setActionMessage(err instanceof Error ? err.message : 'Unable to duplicate classroom.')
    }
  }

  // Tick the "Saved Xs ago" label without aggressive polling.
  const [, forceTick] = useState(0)
  useEffect(() => {
    if (status !== 'saved' || savedAt == null) return
    const handle = window.setInterval(() => forceTick((n) => n + 1), 30_000)
    return () => window.clearInterval(handle)
  }, [status, savedAt])

  const saveLabel = useMemo(() => {
    if (status === 'saving') return 'Saving…'
    if (status === 'error') return 'Auto-save failed'
    if (isDirty) return 'Unsaved changes'
    if (status === 'saved' && savedAt != null) {
      const seconds = Math.max(1, Math.round((Date.now() - savedAt) / 1000))
      return `Saved ${seconds < 60 ? `${seconds}s ago` : `${Math.round(seconds / 60)}m ago`}`
    }
    return 'All changes saved'
  }, [status, savedAt, isDirty])

  const saveTone: 'neutral' | 'pending' | 'ok' | 'error' = useMemo(() => {
    if (status === 'error') return 'error'
    if (status === 'saving') return 'pending'
    if (isDirty) return 'pending'
    return 'ok'
  }, [status, isDirty])

  const selectedProfessor = useMemo(
    () => professorOptions.find((option) => option.id === professorId) ?? null,
    [professorOptions, professorId],
  )
  const selectedCourse = useMemo(
    () => courseOptions.find((option) => option.id === courseId) ?? null,
    [courseOptions, courseId],
  )

  const expiresLabel = formatDateTime(joinCodeExpiresAt)
  const expiresRel = formatRelative(joinCodeExpiresAt)
  const rotatedRel = formatRelative(joinCodeLastRotatedAt)
  const createdLabel = formatDate(createdAt)
  const lastJoinedRel = formatRelative(lastJoinedAt)

  const membershipsHref = `/admin/classrooms/${encodeURIComponent(classroomId)}/students`

  return (
    <>
      {confirmDialog}
    <div className="ce-shell">
      <style>{styles}</style>

      <div className="ce-topbar">
        <div className="ce-topbar__left">
          <div className="ce-breadcrumb">
            <Link href="/admin/classrooms">Classrooms</Link>
            <span aria-hidden>›</span>
            <span className="ce-breadcrumb__current">{initialTitle || 'Classroom'}</span>
          </div>
          <div className={`ce-status ce-status--${saveTone}`} aria-live="polite">
            <span className="ce-status__dot" aria-hidden />
            <span>{saveLabel}</span>
          </div>
        </div>
        <div className="ce-topbar__right">
          <Link href="/admin/classrooms" className="ce-btn ce-btn--ghost">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || !title.trim() || !courseId || !professorId}
            className="ce-btn ce-btn--primary"
          >
            {busy ? 'Saving…' : 'Save & close'}
          </button>
        </div>
      </div>

      <div className="ce-layout">
        <main className="ce-main">
          <header className="ce-header">
            <div className="ce-eyebrow">Classroom</div>
            <h1 className="ce-title">{title || 'Untitled classroom'}</h1>
            <p className="ce-subtitle">
              Manage roster, join code, and enrollment status. Edits auto-save shortly after you
              stop typing.
            </p>
          </header>

          <section className="ce-card" aria-labelledby="basics-title">
            <header className="ce-card__head">
              <h2 className="ce-card__title" id="basics-title">
                Basics
              </h2>
              <p className="ce-card__hint">Visible only to staff.</p>
            </header>

            <div className="ce-field">
              <label htmlFor="ce-title" className="ce-field__label">
                Title <span className="ce-field__required">*</span>
              </label>
              <input
                id="ce-title"
                autoFocus
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. ME 214 — Fall 2026"
                className="ce-input"
              />
            </div>

            <div className="ce-field-row">
              <div className="ce-field">
                <label htmlFor="ce-course" className="ce-field__label">
                  Course <span className="ce-field__required">*</span>
                </label>
                <input
                  type="search"
                  value={courseQuery}
                  onChange={(event) => setCourseQuery(event.target.value)}
                  placeholder="Search courses…"
                  className="ce-input ce-input--sm"
                  aria-label="Search courses"
                />
                <select
                  id="ce-course"
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value as EntityId | '')}
                  className="ce-select"
                >
                  <option value="">Select a course…</option>
                  {courseOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
                {selectedCourse ? (
                  <p className="ce-field__hint">Selected: {selectedCourse.title}</p>
                ) : null}
              </div>

              <div className="ce-field">
                <label htmlFor="ce-prof" className="ce-field__label">
                  Professor <span className="ce-field__required">*</span>
                </label>
                <input
                  type="search"
                  value={professorQuery}
                  onChange={(event) => setProfessorQuery(event.target.value)}
                  placeholder="Search by name or email…"
                  className="ce-input ce-input--sm"
                  aria-label="Search professors"
                />
                <select
                  id="ce-prof"
                  value={professorId}
                  onChange={(event) => setProfessorId(event.target.value as EntityId | '')}
                  className="ce-select"
                >
                  <option value="">Select a professor…</option>
                  {professorOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {selectedProfessor ? (
                  <div className="ce-prof-card">
                    <Avatar
                      initials={buildUserInitials(
                        selectedProfessor.firstName,
                        selectedProfessor.lastName,
                        selectedProfessor.email,
                      )}
                    />
                    <div className="ce-prof-card__text">
                      <div className="ce-prof-card__name">
                        {buildUserDisplayName(
                          selectedProfessor.firstName,
                          selectedProfessor.lastName,
                          selectedProfessor.email,
                        )}
                      </div>
                      {selectedProfessor.email ? (
                        <div className="ce-prof-card__meta">{selectedProfessor.email}</div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

          </section>

          <section
            className={`ce-card ce-card--accent ${active ? '' : 'ce-card--archived'}`}
            aria-labelledby="code-title"
          >
            <header className="ce-card__head">
              <h2 className="ce-card__title" id="code-title">
                Join code
              </h2>
              <p className="ce-card__hint">
                Share with students to enroll. Rotating issues a new code immediately and
                invalidates the old one.
              </p>
            </header>

            {active ? null : (
              <div
                role="status"
                className="ce-inline-msg ce-inline-msg--warn"
              >
                <strong>Code disabled.</strong> Classroom is archived — students can&rsquo;t join
                with this code until you reactivate it from Quick actions.
              </div>
            )}

            <div className={`ce-code-hero ${active ? '' : 'ce-code-hero--disabled'}`}>
              <div
                className="ce-code-hero__code"
                aria-label={active ? 'Current join code' : 'Join code (disabled while archived)'}
              >
                {joinCode || '— — —'}
              </div>
              <div className="ce-code-hero__meta">
                {!active ? (
                  <span>Reactivate to accept new enrollments</span>
                ) : expiresLabel ? (
                  <>
                    <span>
                      Expires <strong>{expiresRel ?? expiresLabel}</strong>
                    </span>
                    <span className="ce-code-hero__meta-secondary">{expiresLabel}</span>
                  </>
                ) : (
                  <span>No expiration set</span>
                )}
              </div>
              <div className="ce-code-hero__actions">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  disabled={!joinCode || !active}
                  className="ce-btn ce-btn--secondary"
                >
                  {copyCodeStatus === 'copied'
                    ? 'Copied'
                    : copyCodeStatus === 'error'
                      ? 'Copy failed'
                      : 'Copy code'}
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={rotateStatus === 'loading' || !active}
                  className="ce-btn ce-btn--ghost"
                  title={active ? undefined : 'Reactivate the classroom to regenerate'}
                >
                  {rotateStatus === 'loading' ? 'Regenerating…' : 'Regenerate'}
                </button>
              </div>
            </div>

            {rotateMessage ? (
              <div
                className={`ce-inline-msg ce-inline-msg--${
                  rotateStatus === 'error' ? 'error' : 'ok'
                }`}
              >
                {rotateMessage}
              </div>
            ) : null}

            <div className="ce-field-row">
              <div className="ce-field">
                <label htmlFor="ce-code-length" className="ce-field__label">
                  Code length
                </label>
                <input
                  id="ce-code-length"
                  type="number"
                  min={4}
                  max={10}
                  value={joinCodeLength}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    if (Number.isFinite(next)) setJoinCodeLength(next)
                  }}
                  className="ce-input"
                />
                <p className="ce-field__hint">
                  Applied next time the code is regenerated (4–10).
                </p>
              </div>
              <div className="ce-field">
                <label htmlFor="ce-code-duration" className="ce-field__label">
                  Code duration
                </label>
                <input
                  id="ce-code-duration"
                  type="number"
                  min={1}
                  max={720}
                  value={joinCodeDurationHours}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    if (Number.isFinite(next)) setJoinCodeDurationHours(next)
                  }}
                  className="ce-input"
                />
                <p className="ce-field__hint">How long a new code stays valid (1–720 hours).</p>
              </div>
            </div>
          </section>

          {error ? (
            <div className="ce-error" role="alert" aria-live="assertive">
              {error}
            </div>
          ) : null}
        </main>

        <aside className="ce-sidebar" aria-label="Classroom context">
          <section className="ce-side-card">
            <div className="ce-side-card__title">Overview</div>
            <div className="ce-stat-grid">
              <div className="ce-stat">
                <div className="ce-stat__value">{memberCount}</div>
                <div className="ce-stat__label">Member{memberCount === 1 ? '' : 's'}</div>
              </div>
              <div className="ce-stat">
                <div
                  className={`ce-stat__value ce-stat__value--${active ? 'ok' : 'muted'}`}
                  aria-label={active ? 'Active' : 'Archived'}
                >
                  {active ? 'Active' : 'Archived'}
                </div>
                <div className="ce-stat__label">Status</div>
              </div>
            </div>
            <dl className="ce-meta-list">
              <div>
                <dt>Created</dt>
                <dd>{createdLabel ?? '—'}</dd>
              </div>
              <div>
                <dt>Last joined</dt>
                <dd>{lastJoinedRel ?? '—'}</dd>
              </div>
              <div>
                <dt>Code rotated</dt>
                <dd>{rotatedRel ?? '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="ce-side-card">
            <div className="ce-side-card__title">Quick actions</div>
            <div className="ce-action-stack">
              <button
                type="button"
                onClick={handleCopyInvite}
                disabled={!joinCode || !active}
                className="ce-action"
                title={active ? undefined : 'Reactivate the classroom to share the invite'}
              >
                <span className="ce-action__label">
                  {copyInviteStatus === 'copied'
                    ? 'Invite copied'
                    : copyInviteStatus === 'error'
                      ? 'Copy failed'
                      : 'Copy invite message'}
                </span>
                <span className="ce-action__hint">
                  {active ? 'URL + code formatted for paste' : 'Disabled while archived'}
                </span>
              </button>
              <Link href={membershipsHref} className="ce-action">
                <span className="ce-action__label">Manage students</span>
                <span className="ce-action__hint">
                  {memberCount} enrollment{memberCount === 1 ? '' : 's'} →
                </span>
              </Link>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={busy || !courseId || !professorId}
                className="ce-action"
              >
                <span className="ce-action__label">Duplicate classroom</span>
                <span className="ce-action__hint">New cohort, fresh join code</span>
              </button>
              <button
                type="button"
                onClick={handleToggleArchive}
                disabled={busy}
                className={`ce-action ${active ? 'ce-action--danger' : ''}`}
              >
                <span className="ce-action__label">
                  {active ? 'Archive classroom' : 'Reactivate classroom'}
                </span>
                <span className="ce-action__hint">
                  {active ? 'Pauses the join code' : 'Re-enables enrollments'}
                </span>
              </button>
            </div>
            {actionMessage ? <div className="ce-inline-msg ce-inline-msg--ok">{actionMessage}</div> : null}
          </section>

          <section className="ce-side-card">
            <div className="ce-side-card__title">Reference</div>
            <dl className="ce-meta-list">
              <div>
                <dt>Classroom ID</dt>
                <dd>
                  <code>{classroomId}</code>
                </dd>
              </div>
              <div>
                <dt>Join URL</dt>
                <dd>
                  <code>{inviteUrl.replace(/^https?:\/\//, '') || '/join-classroom'}</code>
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
    </>
  )
}

const styles = `
  .ce-shell {
    display: grid;
    gap: 18px;
    --ce-radius: 10px;
    --ce-border: var(--admin-surface-border, #e2e8f0);
    --ce-surface: var(--admin-surface, #ffffff);
    --ce-surface-muted: var(--admin-surface-muted, #f6f8fb);
    --ce-ink: var(--cpp-ink, #0f172a);
    --ce-muted: var(--cpp-muted, #5d6b80);
    --ce-accent: #0ea5e9;
  }
  :root[data-theme='dark'] .ce-shell {
    --ce-border: var(--admin-surface-border, #2a3140);
    --ce-surface: var(--admin-surface, #1a1f2b);
    --ce-surface-muted: var(--admin-surface-muted, #222a39);
    --ce-ink: var(--cpp-ink, #e6e8eb);
    --ce-muted: var(--cpp-muted, #9aa6b8);
  }

  .ce-topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 10px 18px;
    margin: 0 -18px;
    background: var(--ce-surface);
    border-bottom: 1px solid var(--ce-border);
  }
  .ce-topbar__left { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; min-width: 0; }
  .ce-topbar__right { display: flex; align-items: center; gap: 8px; }

  .ce-breadcrumb {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--ce-muted);
    min-width: 0;
  }
  .ce-breadcrumb a { color: var(--ce-ink); text-decoration: none; font-weight: 600; }
  .ce-breadcrumb a:hover { text-decoration: underline; }
  .ce-breadcrumb__current { color: var(--ce-ink); font-weight: 600; max-width: 36ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .ce-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid transparent;
    line-height: 1.2;
    white-space: nowrap;
  }
  .ce-status__dot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; }
  .ce-status--ok { color: #047857; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.25); }
  .ce-status--pending { color: #b45309; background: rgba(217, 119, 6, 0.1); border-color: rgba(217, 119, 6, 0.22); }
  .ce-status--error { color: #b91c1c; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.25); }
  .ce-status--neutral { color: var(--ce-muted); background: var(--ce-surface-muted); border-color: var(--ce-border); }
  :root[data-theme='dark'] .ce-status--ok { color: #6ee7b7; }
  :root[data-theme='dark'] .ce-status--pending { color: #fcd34d; }

  .ce-btn {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 7px;
    border: 1px solid var(--ce-border);
    background: var(--ce-surface);
    color: var(--ce-ink);
    cursor: pointer;
    transition: background 80ms ease, border-color 80ms ease, color 80ms ease;
    text-decoration: none;
  }
  .ce-btn:hover { background: var(--ce-surface-muted); }
  .ce-btn:disabled { cursor: not-allowed; opacity: 0.55; }
  .ce-btn--primary { background: #0f172a; color: #fff; border-color: #0f172a; }
  .ce-btn--primary:hover { background: #1e293b; border-color: #1e293b; }
  .ce-btn--secondary { background: var(--ce-surface-muted); border-color: var(--ce-border); }
  .ce-btn--ghost { background: transparent; }
  :root[data-theme='dark'] .ce-btn--primary { background: #e2e8f0; color: #0f172a; border-color: #e2e8f0; }
  :root[data-theme='dark'] .ce-btn--primary:hover { background: #cbd5e1; border-color: #cbd5e1; }

  .ce-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 304px;
    gap: 28px;
    align-items: start;
  }
  @media (max-width: 960px) {
    .ce-layout { grid-template-columns: 1fr; }
  }

  .ce-main { display: grid; gap: 20px; min-width: 0; }

  .ce-header { display: grid; gap: 4px; }
  .ce-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ce-muted);
  }
  .ce-title { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; color: var(--ce-ink); line-height: 1.2; }
  .ce-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--ce-muted); line-height: 1.5; max-width: 60ch; }

  .ce-card {
    display: grid;
    gap: 14px;
    padding: 18px 20px;
    border-radius: var(--ce-radius);
    background: var(--ce-surface);
    border: 1px solid var(--ce-border);
    box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
  }
  :root[data-theme='dark'] .ce-card { box-shadow: 0 1px 0 rgba(0, 0, 0, 0.15); }
  .ce-card--accent {
    background: linear-gradient(180deg, rgba(14, 165, 233, 0.04), transparent 40%), var(--ce-surface);
    border-color: rgba(14, 165, 233, 0.2);
  }
  .ce-card--archived {
    background: var(--ce-surface);
    border-color: rgba(217, 119, 6, 0.35);
  }

  .ce-card__head { display: grid; gap: 2px; }
  .ce-card__title { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; color: var(--ce-ink); }
  .ce-card__hint { margin: 0; font-size: 12px; color: var(--ce-muted); line-height: 1.45; }

  .ce-field { display: grid; gap: 5px; min-width: 0; }
  .ce-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }
  @media (max-width: 640px) { .ce-field-row { grid-template-columns: 1fr; } }
  .ce-field__label { font-size: 12px; font-weight: 600; color: var(--ce-ink); }
  .ce-field__required { color: #b91c1c; font-weight: 700; }
  .ce-field__hint { margin: 0; font-size: 11px; color: var(--ce-muted); line-height: 1.4; }

  .ce-input, .ce-select {
    height: 36px;
    padding: 0 11px;
    width: 100%;
    font-size: 13.5px;
    color: var(--ce-ink);
    background: var(--ce-surface);
    border: 1px solid var(--ce-border);
    border-radius: 7px;
    font-family: inherit;
    transition: border-color 80ms ease, box-shadow 80ms ease;
  }
  .ce-input--sm { height: 32px; font-size: 12.5px; padding: 0 9px; }
  .ce-input:focus, .ce-select:focus {
    outline: none;
    border-color: rgba(14, 165, 233, 0.55);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
  }
  :root[data-theme='dark'] .ce-input,
  :root[data-theme='dark'] .ce-select {
    background: var(--ce-surface-muted);
  }

  .ce-prof-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid var(--ce-border);
    border-radius: 7px;
    background: var(--ce-surface-muted);
  }
  .ce-prof-card__text { min-width: 0; }
  .ce-prof-card__name { font-size: 13px; font-weight: 600; color: var(--ce-ink); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ce-prof-card__meta { font-size: 11px; color: var(--ce-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .ce-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(99, 102, 241, 0.22));
    color: var(--ce-ink);
    font-weight: 700;
    letter-spacing: 0.04em;
    border: 1px solid rgba(14, 165, 233, 0.25);
    flex-shrink: 0;
  }
  :root[data-theme='dark'] .ce-avatar { color: #e6e8eb; }

  .ce-toggle {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    padding: 10px 12px;
    background: var(--ce-surface-muted);
    border: 1px solid var(--ce-border);
    border-radius: 7px;
    cursor: pointer;
  }
  .ce-toggle input { width: 16px; height: 16px; margin-top: 2px; cursor: pointer; }
  .ce-toggle__text { display: grid; gap: 2px; line-height: 1.35; }
  .ce-toggle__text strong { font-size: 13px; color: var(--ce-ink); }

  .ce-code-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    gap: 8px 18px;
    align-items: center;
    padding: 18px 20px;
    background: var(--ce-surface-muted);
    border: 1px solid var(--ce-border);
    border-radius: 8px;
  }
  @media (max-width: 540px) {
    .ce-code-hero { grid-template-columns: 1fr; }
    .ce-code-hero__actions { justify-content: flex-start; }
  }
  .ce-code-hero--disabled .ce-code-hero__code {
    color: var(--ce-muted);
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }
  .ce-code-hero__code {
    grid-row: 1;
    grid-column: 1;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: 0.18em;
    color: var(--ce-ink);
    line-height: 1.1;
  }
  .ce-code-hero__meta {
    grid-row: 2;
    grid-column: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 10px;
    font-size: 12px;
    color: var(--ce-muted);
    align-items: baseline;
  }
  .ce-code-hero__meta strong { color: var(--ce-ink); font-weight: 600; }
  .ce-code-hero__meta-secondary { font-size: 11px; color: var(--ce-muted); }
  .ce-code-hero__actions {
    grid-row: 1 / span 2;
    grid-column: 2;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .ce-inline-msg {
    padding: 7px 10px;
    border-radius: 7px;
    font-size: 12px;
    line-height: 1.45;
    border: 1px solid transparent;
  }
  .ce-inline-msg--ok { color: #047857; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.2); }
  .ce-inline-msg--error { color: #b91c1c; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.22); }
  .ce-inline-msg--warn { color: #92400e; background: rgba(217, 119, 6, 0.08); border-color: rgba(217, 119, 6, 0.25); }
  :root[data-theme='dark'] .ce-inline-msg--ok { color: #6ee7b7; }
  :root[data-theme='dark'] .ce-inline-msg--warn { color: #fcd34d; }

  .ce-error {
    font-size: 12px;
    color: #b91c1c;
    padding: 8px 12px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 8px;
  }

  .ce-sidebar { display: grid; gap: 14px; position: sticky; top: 72px; align-self: start; }
  @media (max-width: 960px) { .ce-sidebar { position: static; } }

  .ce-side-card {
    display: grid;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid var(--ce-border);
    background: var(--ce-surface);
    border-radius: var(--ce-radius);
  }
  .ce-side-card__title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ce-muted);
  }

  .ce-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ce-stat {
    display: grid;
    gap: 2px;
    padding: 10px 12px;
    background: var(--ce-surface-muted);
    border: 1px solid var(--ce-border);
    border-radius: 8px;
  }
  .ce-stat__value { font-size: 18px; font-weight: 700; color: var(--ce-ink); line-height: 1.1; }
  .ce-stat__value--ok { color: #047857; }
  .ce-stat__value--muted { color: var(--ce-muted); }
  :root[data-theme='dark'] .ce-stat__value--ok { color: #6ee7b7; }
  .ce-stat__label { font-size: 11px; color: var(--ce-muted); font-weight: 600; letter-spacing: 0.02em; }

  .ce-meta-list { margin: 0; display: grid; gap: 7px; }
  .ce-meta-list > div { display: grid; grid-template-columns: minmax(0, 110px) minmax(0, 1fr); gap: 8px; align-items: baseline; font-size: 12px; }
  .ce-meta-list dt { color: var(--ce-muted); font-weight: 500; }
  .ce-meta-list dd { margin: 0; color: var(--ce-ink); font-weight: 500; word-break: break-word; }
  .ce-meta-list code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; padding: 1px 5px; border-radius: 4px; background: var(--ce-surface-muted); border: 1px solid var(--ce-border); }

  .ce-action-stack { display: grid; gap: 6px; }
  .ce-action {
    display: grid;
    gap: 1px;
    text-align: left;
    padding: 9px 11px;
    border-radius: 7px;
    border: 1px solid var(--ce-border);
    background: var(--ce-surface);
    color: var(--ce-ink);
    cursor: pointer;
    font: inherit;
    text-decoration: none;
    transition: background 80ms ease, border-color 80ms ease;
  }
  .ce-action:hover:not(:disabled) { background: var(--ce-surface-muted); border-color: rgba(14, 165, 233, 0.35); }
  .ce-action:disabled { cursor: not-allowed; opacity: 0.55; }
  .ce-action__label { font-size: 12.5px; font-weight: 600; color: var(--ce-ink); }
  .ce-action__hint { font-size: 11px; color: var(--ce-muted); line-height: 1.35; }
  .ce-action--danger .ce-action__label { color: #b91c1c; }
  :root[data-theme='dark'] .ce-action--danger .ce-action__label { color: #fca5a5; }
`
