'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type CourseOption = {
  id: string
  title: string
}

type ChapterOption = {
  id: string
  title: string
  courseId?: string
  courseTitle?: string
}

type QuizSummary = {
  id: string
  title: string
  questionsCount: number
  updatedAt?: string
  status?: string
  courseId?: string
  chapterId?: string
  tags?: string[]
  difficulty?: string
}

type LessonSummary = {
  id: string
  title: string
  chapterTitle?: string
}

type QuizBankViewProps = {
  initialQuizzes: QuizSummary[]
  courses: CourseOption[]
  chapters: ChapterOption[]
}

type ImportSummary = {
  total: number
  success: number
  failed: number
  errors: { row: number; message: string }[]
}

type OptionDraft = {
  label: string
  isCorrect: boolean
}

const difficultyOptions = [
  { label: 'Intro', value: 'intro' },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
]

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(2, 6, 23, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 24,
}

const modalStyle: React.CSSProperties = {
  width: 'min(980px, 92vw)',
  maxHeight: '90vh',
  overflow: 'auto',
  background: 'var(--admin-surface)',
  border: '1px solid var(--admin-surface-border)',
  borderRadius: 12,
  boxShadow: 'var(--admin-shadow)',
}

const modalHeaderStyle: React.CSSProperties = {
  padding: '16px 20px',
  borderBottom: '1px solid var(--admin-surface-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
}

const modalBodyStyle: React.CSSProperties = {
  padding: 20,
  display: 'grid',
  gap: 16,
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--cpp-muted)',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
}

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id?: string | number }).id ?? '')
  }
  return null
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const createLexicalText = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: text
          ? [
              {
                type: 'text',
                version: 1,
                text,
              },
            ]
          : [],
        direction: null,
        format: '',
        indent: 0,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
})

const normalizeHeader = (header: string) => {
  const trimmed = header.trim().toLowerCase().replace(/\s+/g, '_')
  const optionMatch = trimmed.match(/^option_?(\d+)$/)
  if (optionMatch) return `option_${optionMatch[1]}`
  const optionCorrectMatch = trimmed.match(/^option_?(\d+)_correct$/)
  if (optionCorrectMatch) return `option_${optionCorrectMatch[1]}_correct`
  return trimmed
}

const parseCsv = (input: string) => {
  const text = input.replace(/\uFEFF/g, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        i += 1
      }
      row.push(field)
      const hasContent = row.some((cell) => cell.trim().length > 0)
      if (hasContent) {
        rows.push(row)
      }
      row = []
      field = ''
      continue
    }

    if (!inQuotes && char === ',') {
      row.push(field)
      field = ''
      continue
    }

    field += char
  }

  row.push(field)
  if (row.some((cell) => cell.trim().length > 0)) {
    rows.push(row)
  }

  if (!rows.length) {
    return { headers: [] as string[], data: [] as Record<string, string>[] }
  }

  const headers = rows[0].map(normalizeHeader)
  const data = rows.slice(1).map((values) => {
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = (values[index] ?? '').trim()
    })
    return record
  })

  return { headers, data }
}

const parseBoolean = (value?: string) => {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return ['true', '1', 'yes', 'y', 'correct'].includes(normalized)
}

export default function QuizBankView({ initialQuizzes, courses, chapters }: QuizBankViewProps) {
  const [filters, setFilters] = useState({
    search: '',
    courseId: '',
    chapterId: '',
    tag: '',
    difficulty: '',
  })
  const [quizzes, setQuizzes] = useState<QuizSummary[]>(initialQuizzes)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicateId, setDuplicateId] = useState<string | null>(null)

  const [assignQuiz, setAssignQuiz] = useState<QuizSummary | null>(null)
  const [assignFilters, setAssignFilters] = useState({
    courseId: '',
    chapterId: '',
    search: '',
  })
  const [assignLessons, setAssignLessons] = useState<LessonSummary[]>([])
  const [assignSelection, setAssignSelection] = useState<Set<string>>(new Set())
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignSaving, setAssignSaving] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done'>('idle')
  const [importError, setImportError] = useState<string | null>(null)
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)
  const [importFilename, setImportFilename] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('import') === '1') {
      setImportOpen(true)
    }
  }, [])

  const courseMap = useMemo(() => {
    return new Map(courses.map((course) => [course.id, course.title]))
  }, [courses])

  const chapterMap = useMemo(() => {
    return new Map(chapters.map((chapter) => [chapter.id, chapter.title]))
  }, [chapters])

  const filteredChapters = useMemo(() => {
    if (!assignFilters.courseId) return chapters
    return chapters.filter((chapter) => chapter.courseId === assignFilters.courseId)
  }, [assignFilters.courseId, chapters])

  const loadQuizzes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: '200',
        depth: '0',
        sort: '-updatedAt',
        draft: 'true',
      })
      if (filters.search) {
        params.set('where[title][like]', `%${filters.search}%`)
      }
      if (filters.courseId) {
        params.set('where[course][equals]', filters.courseId)
      }
      if (filters.chapterId) {
        params.set('where[chapter][equals]', filters.chapterId)
      }
      if (filters.tag) {
        params.set('where[tags][contains]', filters.tag)
      }
      if (filters.difficulty) {
        params.set('where[difficulty][equals]', filters.difficulty)
      }
      const res = await fetch(`/api/quizzes?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) {
        throw new Error('Unable to load quizzes.')
      }
      const data = (await res.json()) as { docs?: Record<string, unknown>[] }
      const docs = Array.isArray(data.docs) ? data.docs : []
      const next = docs.map((doc) => {
        const questions = Array.isArray(doc.questions) ? doc.questions : []
        return {
          id: String(doc.id ?? ''),
          title: (doc.title as string) ?? 'Untitled quiz',
          questionsCount: questions.length,
          updatedAt: doc.updatedAt as string | undefined,
          status: (doc._status as string) ?? 'draft',
          courseId: toId(doc.course) ?? undefined,
          chapterId: toId(doc.chapter) ?? undefined,
          tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : undefined,
          difficulty: (doc.difficulty as string) ?? undefined,
        }
      })
      setQuizzes(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load quizzes.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void loadQuizzes()
  }, [loadQuizzes])

  const resetFilters = () => {
    setFilters({
      search: '',
      courseId: '',
      chapterId: '',
      tag: '',
      difficulty: '',
    })
  }

  const duplicateQuiz = async (quizId: string) => {
    setDuplicateId(quizId)
    try {
      const res = await fetch(`/api/quizzes/${quizId}?depth=1`, { credentials: 'include' })
      if (!res.ok) throw new Error('Unable to load quiz.')
      const data = (await res.json()) as { doc?: Record<string, unknown> }
      const doc = data.doc ?? {}
      const questionIds = Array.isArray(doc.questions)
        ? doc.questions.map((item) => toId(item)).filter(Boolean)
        : []
      const payload = {
        title: `${(doc.title as string) ?? 'Untitled quiz'} (Copy)`,
        description: doc.description,
        questions: questionIds,
        shuffleQuestions: doc.shuffleQuestions ?? true,
        shuffleOptions: doc.shuffleOptions ?? true,
        scoring: doc.scoring ?? 'per-question',
        timeLimitSec: doc.timeLimitSec ?? undefined,
        course: doc.course,
        chapter: doc.chapter,
        tags: doc.tags,
        difficulty: doc.difficulty,
        _status: 'draft',
      }
      const createRes = await fetch('/api/quizzes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => null)
        throw new Error(errorData?.message ?? 'Unable to duplicate quiz.')
      }
      await loadQuizzes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to duplicate quiz.')
    } finally {
      setDuplicateId(null)
    }
  }

  const loadLessons = useCallback(async () => {
    if (!assignQuiz) return
    setAssignLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '200',
        depth: '1',
        sort: 'order',
        draft: 'true',
      })
      if (assignFilters.search) {
        params.set('where[title][like]', `%${assignFilters.search}%`)
      }
      if (assignFilters.chapterId) {
        params.set('where[chapter][equals]', assignFilters.chapterId)
      } else if (assignFilters.courseId) {
        const chapterIds = chapters
          .filter((chapter) => chapter.courseId === assignFilters.courseId)
          .map((chapter) => chapter.id)
        if (!chapterIds.length) {
          setAssignLessons([])
          setAssignLoading(false)
          return
        }
        chapterIds.forEach((id, index) => {
          params.set(`where[chapter][in][${index}]`, id)
        })
      }
      const res = await fetch(`/api/lessons?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Unable to load lessons.')
      const data = (await res.json()) as { docs?: Record<string, unknown>[] }
      const docs = Array.isArray(data.docs) ? data.docs : []
      const next = docs.map((lesson) => ({
        id: String(lesson.id ?? ''),
        title: (lesson.title as string) ?? 'Untitled lesson',
        chapterTitle: chapterMap.get(toId(lesson.chapter) ?? '') ?? undefined,
      }))
      setAssignLessons(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load lessons.')
    } finally {
      setAssignLoading(false)
    }
  }, [assignQuiz, assignFilters, chapters, chapterMap])

  useEffect(() => {
    if (!assignQuiz) return
    void loadLessons()
  }, [assignQuiz, loadLessons])

  const toggleLesson = (lessonId: string) => {
    setAssignSelection((prev) => {
      const next = new Set(prev)
      if (next.has(lessonId)) {
        next.delete(lessonId)
      } else {
        next.add(lessonId)
      }
      return next
    })
  }

  const applyAssignments = async () => {
    if (!assignQuiz || assignSelection.size === 0) return
    setAssignSaving(true)
    try {
      await Promise.all(
        Array.from(assignSelection).map((lessonId) =>
          fetch(`/api/lessons/${lessonId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assessment: {
                quiz: assignQuiz.id,
              },
            }),
          }),
        ),
      )
      setAssignSelection(new Set())
      setAssignQuiz(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to assign quiz.')
    } finally {
      setAssignSaving(false)
    }
  }

  const runImport = async (file: File) => {
    setImportError(null)
    setImportSummary(null)
    setImportStatus('importing')
    setImportFilename(file.name)

    try {
      const text = await file.text()
      const { headers, data } = parseCsv(text)
      if (!headers.length) {
        setImportError('The CSV file is empty.')
        setImportStatus('done')
        return
      }

      if (!headers.includes('title') || (!headers.includes('prompt') && !headers.includes('question'))) {
        setImportError('CSV must include "title" and "prompt" columns.')
        setImportStatus('done')
        return
      }

      const optionHeaders = headers
        .filter((header) => header.startsWith('option_') && !header.endsWith('_correct'))
        .map((header) => Number(header.replace('option_', '')))
        .filter((value) => Number.isFinite(value))
        .sort((a, b) => a - b)

      if (optionHeaders.length < 3) {
        setImportError('CSV must include at least option_1, option_2, option_3 columns.')
        setImportStatus('done')
        return
      }

      const errors: { row: number; message: string }[] = []
      let successCount = 0

      for (let index = 0; index < data.length; index += 1) {
        const row = data[index]
        const rowNumber = index + 2
        const title = row.title?.trim()
        const prompt = (row.prompt ?? row.question ?? '').trim()
        if (!title || !prompt) {
          errors.push({ row: rowNumber, message: 'Missing title or prompt.' })
          continue
        }

        const correctIndices = (row.correct_options ?? '')
          .split(/[,;|]/)
          .map((item) => Number(item.trim()))
          .filter((value) => Number.isFinite(value))

        const options = optionHeaders
          .map((optionIndex) => {
            const label = row[`option_${optionIndex}`]?.trim()
            if (!label) return null
            const flag = row[`option_${optionIndex}_correct`]
            const isCorrect = correctIndices.length
              ? correctIndices.includes(optionIndex)
              : parseBoolean(flag)
            return { label, isCorrect }
          })
          .filter(Boolean) as OptionDraft[]

        if (options.length < 3) {
          errors.push({ row: rowNumber, message: 'Needs at least 3 options.' })
          continue
        }
        if (!options.some((opt) => opt.isCorrect)) {
          errors.push({ row: rowNumber, message: 'No correct option marked.' })
          continue
        }

        const tags = row.tags
          ? row.tags
              .split(/[,;|]/)
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined

        const difficultyValue = row.difficulty?.trim().toLowerCase()
        const difficulty =
          difficultyValue && ['intro', 'easy', 'medium', 'hard'].includes(difficultyValue)
            ? difficultyValue
            : undefined

        try {
          const res = await fetch('/api/quiz-questions', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              prompt: createLexicalText(prompt),
              explanation: row.explanation?.trim()
                ? createLexicalText(row.explanation.trim())
                : undefined,
              options,
              topic: row.topic?.trim() || undefined,
              tags,
              difficulty,
              _status: 'draft',
            }),
          })
          if (!res.ok) {
            const errorData = await res.json().catch(() => null)
            throw new Error(errorData?.message ?? 'Unable to create question.')
          }
          successCount += 1
        } catch (err) {
          errors.push({
            row: rowNumber,
            message: err instanceof Error ? err.message : 'Unable to create question.',
          })
        }
      }

      setImportSummary({
        total: data.length,
        success: successCount,
        failed: errors.length,
        errors,
      })
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Unable to import CSV.')
    } finally {
      setImportStatus('done')
    }
  }

  const statusPill = (status?: string) => {
    const isPublished = status === 'published'
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          border: '1px solid var(--admin-surface-border)',
          background: isPublished ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
          color: isPublished ? 'rgb(16, 185, 129)' : 'var(--cpp-muted)',
        }}
      >
        {isPublished ? 'Published' : 'Draft'}
      </span>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--cpp-ink)' }}>Quiz Bank</div>
          <p style={{ color: 'var(--cpp-muted)', maxWidth: 640 }}>
            Browse, duplicate, and assign quizzes to lessons. Use filters to focus on a course or
            chapter.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--admin-surface-border)',
              background: 'var(--admin-chip-bg)',
              color: 'var(--cpp-ink)',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Import Questions
          </button>
          <Link href="/admin/collections/quizzes/create" style={{ textDecoration: 'none' }}>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--admin-surface-border)',
                background: 'var(--admin-chip-primary-bg)',
                color: 'var(--admin-chip-primary-text)',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              New Quiz
            </div>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <div>
          <div style={labelStyle}>Search</div>
          <input
            value={filters.search}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, search: event.target.value }))
            }
            placeholder="Quiz title"
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--admin-surface-border)' }}
          />
        </div>
        <div>
          <div style={labelStyle}>Course</div>
          <select
            value={filters.courseId}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                courseId: event.target.value,
                chapterId: '',
              }))
            }
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--admin-surface-border)' }}
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Chapter</div>
          <select
            value={filters.chapterId}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, chapterId: event.target.value }))
            }
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--admin-surface-border)' }}
          >
            <option value="">All chapters</option>
            {chapters
              .filter((chapter) =>
                filters.courseId ? chapter.courseId === filters.courseId : true,
              )
              .map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Difficulty</div>
          <select
            value={filters.difficulty}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, difficulty: event.target.value }))
            }
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--admin-surface-border)' }}
          >
            <option value="">All levels</option>
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Tag</div>
          <input
            value={filters.tag}
            onChange={(event) => setFilters((prev) => ({ ...prev, tag: event.target.value }))}
            placeholder="e.g. statics"
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--admin-surface-border)' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            onClick={resetFilters}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--admin-surface-border)',
              background: 'var(--admin-chip-bg)',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      <div
        style={{
          borderRadius: 8,
          border: '1px solid var(--admin-surface-border)',
          background: 'var(--admin-surface)',
          boxShadow: 'var(--admin-shadow)',
          padding: '12px 0',
        }}
      >
        {loading ? (
          <div style={{ padding: '12px 18px', color: 'var(--cpp-muted)' }}>Loading quizzes…</div>
        ) : null}
        {error ? (
          <div style={{ padding: '12px 18px', color: 'var(--theme-error-500)' }}>{error}</div>
        ) : null}
        {!loading && quizzes.length === 0 ? (
          <div style={{ padding: '12px 18px', color: 'var(--cpp-muted)' }}>
            No quizzes match these filters.
          </div>
        ) : null}
        {quizzes.length ? (
          <div style={{ display: 'grid', gap: 0 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 0.7fr 1fr 1fr 1fr 1fr',
                gap: 12,
                padding: '8px 18px',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.08,
                color: 'var(--cpp-muted)',
              }}
            >
              <div>Title</div>
              <div>Questions</div>
              <div>Course</div>
              <div>Chapter</div>
              <div>Status</div>
              <div>Updated</div>
            </div>
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 0.7fr 1fr 1fr 1fr 1fr',
                  gap: 12,
                  padding: '12px 18px',
                  borderTop: '1px solid var(--admin-surface-border)',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--cpp-ink)' }}>{quiz.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                    {quiz.tags?.length ? quiz.tags.join(', ') : 'No tags'}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--cpp-ink)' }}>
                  {quiz.questionsCount}
                </div>
                <div style={{ color: 'var(--cpp-muted)', fontSize: 12 }}>
                  {quiz.courseId ? courseMap.get(quiz.courseId) ?? '—' : '—'}
                </div>
                <div style={{ color: 'var(--cpp-muted)', fontSize: 12 }}>
                  {quiz.chapterId ? chapterMap.get(quiz.chapterId) ?? '—' : '—'}
                </div>
                <div>{statusPill(quiz.status)}</div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                  {formatDate(quiz.updatedAt)}
                </div>
                <div
                  style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <Link href={`/admin/collections/quizzes/${quiz.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-surface-border)',
                        background: 'var(--admin-chip-bg)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--cpp-ink)',
                      }}
                    >
                      Edit quiz
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => duplicateQuiz(quiz.id)}
                    disabled={duplicateId === quiz.id}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--admin-surface-border)',
                      background: 'var(--admin-chip-bg)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--cpp-ink)',
                      opacity: duplicateId === quiz.id ? 0.6 : 1,
                    }}
                  >
                    {duplicateId === quiz.id ? 'Duplicating…' : 'Duplicate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignQuiz(quiz)
                      setAssignFilters({ courseId: '', chapterId: '', search: '' })
                      setAssignSelection(new Set())
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--admin-surface-border)',
                      background: 'var(--admin-chip-primary-bg)',
                      color: 'var(--admin-chip-primary-text)',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Assign to lessons
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {assignQuiz ? (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                  Assign &quot;{assignQuiz.title}&quot;
                </div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                  Select lessons to attach this quiz. Existing lesson quiz settings will be replaced.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignQuiz(null)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--admin-surface-border)',
                  background: 'var(--admin-chip-bg)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
            <div style={modalBodyStyle}>
              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                }}
              >
                <div>
                  <div style={labelStyle}>Course</div>
                  <select
                    value={assignFilters.courseId}
                    onChange={(event) =>
                      setAssignFilters((prev) => ({
                        ...prev,
                        courseId: event.target.value,
                        chapterId: '',
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 8,
                      border: '1px solid var(--admin-surface-border)',
                    }}
                  >
                    <option value="">All courses</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={labelStyle}>Chapter</div>
                  <select
                    value={assignFilters.chapterId}
                    onChange={(event) =>
                      setAssignFilters((prev) => ({ ...prev, chapterId: event.target.value }))
                    }
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 8,
                      border: '1px solid var(--admin-surface-border)',
                    }}
                  >
                    <option value="">All chapters</option>
                    {filteredChapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={labelStyle}>Search lessons</div>
                  <input
                    value={assignFilters.search}
                    onChange={(event) =>
                      setAssignFilters((prev) => ({ ...prev, search: event.target.value }))
                    }
                    placeholder="Lesson title"
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 8,
                      border: '1px solid var(--admin-surface-border)',
                    }}
                  />
                </div>
              </div>

              {assignLoading ? (
                <div style={{ color: 'var(--cpp-muted)' }}>Loading lessons…</div>
              ) : null}
              {!assignLoading && assignLessons.length === 0 ? (
                <div style={{ color: 'var(--cpp-muted)' }}>No lessons match this filter.</div>
              ) : null}
              {assignLessons.length ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {assignLessons.map((lesson) => {
                    const checked = assignSelection.has(lesson.id)
                    return (
                      <label
                        key={lesson.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid var(--admin-surface-border)',
                          background: checked ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLesson(lesson.id)}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--cpp-ink)' }}>
                            {lesson.title}
                          </div>
                          {lesson.chapterTitle ? (
                            <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                              {lesson.chapterTitle}
                            </div>
                          ) : null}
                        </div>
                      </label>
                    )
                  })}
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setAssignQuiz(null)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--admin-surface-border)',
                    background: 'var(--admin-chip-bg)',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyAssignments}
                  disabled={assignSelection.size === 0 || assignSaving}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--admin-surface-border)',
                    background: 'var(--admin-chip-primary-bg)',
                    color: 'var(--admin-chip-primary-text)',
                    fontWeight: 700,
                    opacity: assignSelection.size === 0 || assignSaving ? 0.7 : 1,
                  }}
                >
                  {assignSaving ? 'Assigning…' : `Assign (${assignSelection.size})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {importOpen ? (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cpp-ink)' }}>
                  Import quiz questions
                </div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                  Upload a CSV to add questions to the bank.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--admin-surface-border)',
                  background: 'var(--admin-chip-bg)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
            <div style={modalBodyStyle}>
              <div>
                <div style={labelStyle}>CSV import</div>
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 4 }}>
                  CSV headers supported: <strong>title</strong>, <strong>prompt</strong>,{' '}
                  <strong>explanation</strong>, <strong>topic</strong>, <strong>tags</strong>,{' '}
                  <strong>difficulty</strong>, <strong>option_1</strong>…<strong>option_n</strong>{' '}
                  and <strong>option_1_correct</strong>. Optionally include{' '}
                  <strong>correct_options</strong> with comma-separated indices.
                </div>
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  void runImport(file)
                }}
              />
              {importFilename ? (
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                  File: {importFilename}
                </div>
              ) : null}
              {importStatus === 'importing' ? (
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>Importing…</div>
              ) : null}
              {importError ? (
                <div style={{ fontSize: 12, color: 'var(--theme-error-500)' }}>{importError}</div>
              ) : null}
              {importSummary ? (
                <div style={{ fontSize: 12, color: 'var(--cpp-muted)' }}>
                  Imported {importSummary.success} / {importSummary.total} rows.{' '}
                  {importSummary.failed ? `${importSummary.failed} failed.` : 'All good.'}
                </div>
              ) : null}
              {importSummary?.errors?.length ? (
                <div style={{ fontSize: 12, color: 'var(--theme-error-500)' }}>
                  {importSummary.errors.map((err) => (
                    <div key={`${err.row}-${err.message}`}>
                      Row {err.row}: {err.message}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
