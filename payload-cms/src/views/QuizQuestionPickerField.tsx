'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'
import type { QuizQuestion } from '@/payload-types'

type QuestionDoc = Pick<
  QuizQuestion,
  'id' | 'title' | 'options' | 'difficulty' | 'topic' | 'tags' | 'prompt'
>

type OptionDraft = {
  label: string
  isCorrect: boolean
}

type ImportSummary = {
  total: number
  success: number
  failed: number
  errors: { row: number; message: string }[]
}

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id?: string | number }).id ?? '')
  }
  return null
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

const getQuestionIssues = (question?: QuestionDoc | null) => {
  const options = Array.isArray(question?.options) ? question?.options ?? [] : []
  const optionCount = options.filter((option) => option?.label?.trim()).length
  const correctCount = options.filter((option) => option?.isCorrect).length
  const issues: string[] = []
  if (optionCount < 3) issues.push('needs 3+ options')
  if (correctCount < 1) issues.push('needs a correct answer')
  return issues
}

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

const metaTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--cpp-muted)',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--cpp-muted)',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
}

export default function QuizQuestionPickerField() {
  const { value, setValue } = useField<(string | number)[] | null>({
    path: 'questions',
  })
  const selectedIds = useMemo(() => {
    if (!Array.isArray(value)) return []
    return value
      .map((item) => toId(item))
      .filter((id): id is string => Boolean(id))
  }, [value])
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionDoc[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'bank' | 'create' | 'import'>('bank')
  const [bankQuestions, setBankQuestions] = useState<QuestionDoc[]>([])
  const [bankLoading, setBankLoading] = useState(false)
  const [bankError, setBankError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('')
  const [tag, setTag] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [createStatus, setCreateStatus] = useState<'idle' | 'saving' | 'success'>('idle')
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done'>('idle')
  const [importFilename, setImportFilename] = useState('')
  const [newQuestion, setNewQuestion] = useState<{
    title: string
    prompt: string
    explanation: string
    topic: string
    tags: string
    difficulty: string
    options: OptionDraft[]
  }>({
    title: '',
    prompt: '',
    explanation: '',
    topic: '',
    tags: '',
    difficulty: '',
    options: [
      { label: '', isCorrect: true },
      { label: '', isCorrect: false },
      { label: '', isCorrect: false },
      { label: '', isCorrect: false },
    ],
  })

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const loadQuestionsByIds = useCallback(async (ids: string[]) => {
    if (!ids.length) {
      setSelectedQuestions([])
      return
    }
    const params = new URLSearchParams()
    params.set('limit', String(ids.length))
    params.set('depth', '0')
    ids.forEach((id, index) => {
      params.set(`where[id][in][${index}]`, id)
    })
    const res = await fetch(`/api/quiz-questions?${params.toString()}`, {
      credentials: 'include',
    })
    if (!res.ok) {
      setSelectedQuestions([])
      return
    }
    const data = (await res.json()) as { docs?: QuestionDoc[] }
    const map = new Map<string, QuestionDoc>()
    data.docs?.forEach((doc) => map.set(String(doc.id), doc))
    setSelectedQuestions(ids.map((id) => map.get(id)).filter(Boolean) as QuestionDoc[])
  }, [])

  useEffect(() => {
    void loadQuestionsByIds(selectedIds)
  }, [selectedIds, loadQuestionsByIds])

  const loadBank = useCallback(async () => {
    setBankLoading(true)
    setBankError(null)
    try {
      const params = new URLSearchParams()
      params.set('limit', '50')
      params.set('depth', '0')
      if (query.trim()) params.set('where[title][contains]', query.trim())
      if (topic.trim()) params.set('where[topic][contains]', topic.trim())
      if (tag.trim()) params.set('where[tags][contains]', tag.trim())
      if (difficulty.trim()) params.set('where[difficulty][equals]', difficulty.trim())
      const res = await fetch(`/api/quiz-questions?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Unable to load questions.')
      }
      const data = (await res.json()) as { docs?: QuestionDoc[] }
      setBankQuestions(data.docs ?? [])
    } catch (error) {
      setBankError(error instanceof Error ? error.message : 'Unable to load questions.')
    } finally {
      setBankLoading(false)
    }
  }, [difficulty, query, tag, topic])

  useEffect(() => {
    if (!isOpen || activeTab !== 'bank') return
    const handle = window.setTimeout(() => {
      void loadBank()
    }, 250)
    return () => window.clearTimeout(handle)
  }, [activeTab, isOpen, loadBank, query, topic, tag, difficulty])

  const addQuestion = (id: string) => {
    if (selectedSet.has(id)) return
    setValue([...(selectedIds ?? []), id])
  }

  const removeQuestion = (id: string) => {
    setValue(selectedIds.filter((item) => item !== id))
  }

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const next = [...selectedIds]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    setValue(next)
  }

  const resetCreateForm = () => {
    setNewQuestion({
      title: '',
      prompt: '',
      explanation: '',
      topic: '',
      tags: '',
      difficulty: '',
      options: [
        { label: '', isCorrect: true },
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
      ],
    })
    setCreateStatus('idle')
    setCreateError(null)
  }

  const submitNewQuestion = async () => {
    setCreateError(null)
    const trimmedTitle = newQuestion.title.trim()
    const trimmedPrompt = newQuestion.prompt.trim()
    const validOptions = newQuestion.options.filter((opt) => opt.label.trim())
    const correctCount = validOptions.filter((opt) => opt.isCorrect).length
    if (!trimmedTitle) {
      setCreateError('Add a question title.')
      return
    }
    if (!trimmedPrompt) {
      setCreateError('Add a prompt for the question.')
      return
    }
    if (validOptions.length < 3) {
      setCreateError('Add at least 3 answer choices.')
      return
    }
    if (correctCount < 1) {
      setCreateError('Mark at least 1 correct answer.')
      return
    }
    setCreateStatus('saving')
    try {
      const res = await fetch('/api/quiz-questions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          prompt: createLexicalText(trimmedPrompt),
          explanation: newQuestion.explanation.trim()
            ? createLexicalText(newQuestion.explanation.trim())
            : undefined,
          options: validOptions.map((opt) => ({
            label: opt.label.trim(),
            isCorrect: opt.isCorrect,
          })),
          topic: newQuestion.topic.trim() || undefined,
          tags: newQuestion.tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          difficulty: newQuestion.difficulty || undefined,
          _status: 'draft',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message ?? 'Unable to create question.')
      }
      const created = (await res.json()) as QuestionDoc
      const createdId = toId(created?.id)
      if (createdId) {
        setValue([...(selectedIds ?? []), createdId])
      }
      setCreateStatus('success')
      resetCreateForm()
      setActiveTab('bank')
      setIsOpen(false)
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to create question.')
      setCreateStatus('idle')
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

      const createdIds: string[] = []
      const errors: { row: number; message: string }[] = []

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
          const created = (await res.json()) as QuestionDoc
          const createdId = toId(created?.id)
          if (createdId) createdIds.push(createdId)
        } catch (error) {
          errors.push({
            row: rowNumber,
            message: error instanceof Error ? error.message : 'Unable to create question.',
          })
        }
      }

      const mergedIds = Array.from(new Set([...selectedIds, ...createdIds]))
      if (mergedIds.length !== selectedIds.length) {
        setValue(mergedIds)
      }

      setImportSummary({
        total: data.length,
        success: createdIds.length,
        failed: errors.length,
        errors,
      })
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unable to import CSV.')
    } finally {
      setImportStatus('done')
    }
  }

  const closeModal = () => {
    setIsOpen(false)
    setActiveTab('bank')
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: 'var(--cpp-muted)', maxWidth: 420 }}>
          Build this quiz by selecting questions from your bank or creating new ones.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('bank')
              setIsOpen(true)
            }}
            className="btn btn--style-secondary"
          >
            Add from bank
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('create')
              setIsOpen(true)
            }}
            className="btn btn--style-primary"
          >
            New question
          </button>
        </div>
      </div>

      {selectedQuestions.length > 0 ? (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {selectedQuestions.map((question, index) => {
            const issues = getQuestionIssues(question)
            return (
              <div
                key={question.id}
                style={{
                  border: '1px solid var(--admin-surface-border)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  background: 'var(--admin-surface)',
                  display: 'grid',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600 }}>{question.title ?? 'Untitled question'}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn--style-secondary btn--size-small"
                      onClick={() => moveQuestion(index, -1)}
                      disabled={index === 0}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="btn btn--style-secondary btn--size-small"
                      onClick={() => moveQuestion(index, 1)}
                      disabled={index === selectedQuestions.length - 1}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="btn btn--style-secondary btn--size-small"
                      onClick={() => removeQuestion(String(question.id))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, ...metaTextStyle }}>
                  {question.topic ? <span>Topic: {question.topic}</span> : null}
                  {question.difficulty ? <span>Difficulty: {question.difficulty}</span> : null}
                  {question.options ? <span>Options: {question.options.length}</span> : null}
                </div>
                {issues.length > 0 ? (
                  <div style={{ fontSize: 12, color: '#dc2626' }}>
                    Fix: {issues.join(', ')}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--cpp-muted)' }}>
          No questions selected yet.
        </div>
      )}

      {isOpen ? (
        <div style={modalOverlayStyle} onClick={closeModal} role="dialog" aria-modal="true">
          <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={labelStyle}>Quiz questions</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Build your quiz</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className={`btn btn--size-small ${
                    activeTab === 'bank' ? 'btn--style-primary' : 'btn--style-secondary'
                  }`}
                  onClick={() => setActiveTab('bank')}
                >
                  Question bank
                </button>
                <button
                  type="button"
                  className={`btn btn--size-small ${
                    activeTab === 'create' ? 'btn--style-primary' : 'btn--style-secondary'
                  }`}
                  onClick={() => setActiveTab('create')}
                >
                  Create question
                </button>
                <button
                  type="button"
                  className={`btn btn--size-small ${
                    activeTab === 'import' ? 'btn--style-primary' : 'btn--style-secondary'
                  }`}
                  onClick={() => setActiveTab('import')}
                >
                  Import CSV
                </button>
                <button type="button" className="btn btn--style-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>

            {activeTab === 'bank' ? (
              <div style={modalBodyStyle}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={labelStyle}>Filters</div>
                  <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={metaTextStyle}>Search</span>
                      <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="input"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={metaTextStyle}>Topic</span>
                      <input
                        type="text"
                        value={topic}
                        onChange={(event) => setTopic(event.target.value)}
                        className="input"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={metaTextStyle}>Tag</span>
                      <input
                        type="text"
                        value={tag}
                        onChange={(event) => setTag(event.target.value)}
                        className="input"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={metaTextStyle}>Difficulty</span>
                      <select
                        value={difficulty}
                        onChange={(event) => setDifficulty(event.target.value)}
                        className="input"
                      >
                        <option value="">Any</option>
                        <option value="intro">Intro</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={labelStyle}>Question bank</div>
                  {bankLoading ? (
                    <div style={metaTextStyle}>Loading questions...</div>
                  ) : bankError ? (
                    <div style={{ fontSize: 12, color: '#dc2626' }}>{bankError}</div>
                  ) : bankQuestions.length === 0 ? (
                    <div style={metaTextStyle}>No questions match these filters.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {bankQuestions.map((question) => {
                        const id = toId(question.id)
                        const issues = getQuestionIssues(question)
                        return (
                          <div
                            key={question.id}
                            style={{
                              border: '1px solid var(--admin-surface-border)',
                              borderRadius: 10,
                              padding: '10px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12,
                            }}
                          >
                            <div style={{ display: 'grid', gap: 4 }}>
                              <div style={{ fontWeight: 600 }}>{question.title ?? 'Untitled question'}</div>
                              <div style={{ ...metaTextStyle, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {question.topic ? <span>Topic: {question.topic}</span> : null}
                                {question.difficulty ? <span>Difficulty: {question.difficulty}</span> : null}
                                {question.options ? <span>Options: {question.options.length}</span> : null}
                              </div>
                              {issues.length > 0 ? (
                                <div style={{ fontSize: 12, color: '#dc2626' }}>
                                  Fix: {issues.join(', ')}
                                </div>
                              ) : null}
                            </div>
                            {id ? (
                              <button
                                type="button"
                                className="btn btn--style-secondary btn--size-small"
                                onClick={() =>
                                  selectedSet.has(id) ? removeQuestion(id) : addQuestion(id)
                                }
                              >
                                {selectedSet.has(id) ? 'Remove' : 'Add'}
                              </button>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'create' ? (
              <div style={modalBodyStyle}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={labelStyle}>New question</div>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={metaTextStyle}>Title</span>
                    <input
                      type="text"
                      value={newQuestion.title}
                      onChange={(event) =>
                        setNewQuestion((prev) => ({ ...prev, title: event.target.value }))
                      }
                      className="input"
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={metaTextStyle}>Prompt</span>
                    <textarea
                      value={newQuestion.prompt}
                      onChange={(event) =>
                        setNewQuestion((prev) => ({ ...prev, prompt: event.target.value }))
                      }
                      rows={4}
                      className="input"
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={metaTextStyle}>Explanation (optional)</span>
                    <textarea
                      value={newQuestion.explanation}
                      onChange={(event) =>
                        setNewQuestion((prev) => ({ ...prev, explanation: event.target.value }))
                      }
                      rows={3}
                      className="input"
                    />
                  </label>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={labelStyle}>Answer choices</div>
                    {newQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'grid',
                          gap: 8,
                          gridTemplateColumns: 'auto 1fr auto',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(event) =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              options: prev.options.map((item, idx) =>
                                idx === index ? { ...item, isCorrect: event.target.checked } : item,
                              ),
                            }))
                          }
                        />
                        <input
                          type="text"
                          value={option.label}
                          onChange={(event) =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              options: prev.options.map((item, idx) =>
                                idx === index ? { ...item, label: event.target.value } : item,
                              ),
                            }))
                          }
                          className="input"
                        />
                        <button
                          type="button"
                          className="btn btn--style-secondary btn--size-small"
                          onClick={() =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              options: prev.options.filter((_, idx) => idx !== index),
                            }))
                          }
                          disabled={newQuestion.options.length <= 3}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn--style-secondary btn--size-small"
                      onClick={() =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          options: [...prev.options, { label: '', isCorrect: false }],
                        }))
                      }
                    >
                      Add option
                    </button>
                  </div>
                  <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={metaTextStyle}>Topic</span>
                      <input
                        type="text"
                        value={newQuestion.topic}
                        onChange={(event) =>
                          setNewQuestion((prev) => ({ ...prev, topic: event.target.value }))
                        }
                        className="input"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={metaTextStyle}>Tags (comma separated)</span>
                      <input
                        type="text"
                        value={newQuestion.tags}
                        onChange={(event) =>
                          setNewQuestion((prev) => ({ ...prev, tags: event.target.value }))
                        }
                        className="input"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={metaTextStyle}>Difficulty</span>
                      <select
                        value={newQuestion.difficulty}
                        onChange={(event) =>
                          setNewQuestion((prev) => ({ ...prev, difficulty: event.target.value }))
                        }
                        className="input"
                      >
                        <option value="">Select</option>
                        <option value="intro">Intro</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>
                  </div>
                  {createError ? (
                    <div style={{ fontSize: 12, color: '#dc2626' }}>{createError}</div>
                  ) : null}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn--style-secondary"
                      onClick={resetCreateForm}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn btn--style-primary"
                      onClick={submitNewQuestion}
                      disabled={createStatus === 'saving'}
                    >
                      {createStatus === 'saving' ? 'Creating...' : 'Create question'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={modalBodyStyle}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={labelStyle}>CSV import</div>
                  <div style={metaTextStyle}>
                    CSV headers supported: <strong>title</strong>, <strong>prompt</strong>,{' '}
                    <strong>explanation</strong>, <strong>topic</strong>, <strong>tags</strong>,{' '}
                    <strong>difficulty</strong>, <strong>option_1</strong>,{' '}
                    <strong>option_1_correct</strong> (repeat option_2, option_3...). You can also
                    include <strong>correct_options</strong> (comma-separated option numbers) to
                    mark correct answers.
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) {
                          void runImport(file)
                        }
                      }}
                    />
                    {importFilename ? (
                      <span style={metaTextStyle}>Selected: {importFilename}</span>
                    ) : null}
                  </div>
                  {importStatus === 'importing' ? (
                    <div style={metaTextStyle}>Importing questions...</div>
                  ) : null}
                  {importError ? (
                    <div style={{ fontSize: 12, color: '#dc2626' }}>{importError}</div>
                  ) : null}
                  {importSummary ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div style={metaTextStyle}>
                        Imported {importSummary.success} of {importSummary.total} rows.{' '}
                        {importSummary.failed} failed.
                      </div>
                      {importSummary.errors.length > 0 ? (
                        <div style={{ display: 'grid', gap: 4, fontSize: 12, color: '#dc2626' }}>
                          {importSummary.errors.slice(0, 8).map((error, errorIndex) => (
                            <div key={`${error.row}-${errorIndex}`}>
                              Row {error.row}: {error.message}
                            </div>
                          ))}
                          {importSummary.errors.length > 8 ? (
                            <div>...and {importSummary.errors.length - 8} more.</div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
