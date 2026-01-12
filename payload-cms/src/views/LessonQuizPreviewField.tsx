'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Quiz, QuizQuestion } from '@/payload-types'

type QuizDoc = Pick<Quiz, 'id' | 'title' | 'questions'>
type QuestionDoc = Pick<QuizQuestion, 'id' | 'title' | 'prompt' | 'options' | 'explanation'>

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id?: string | number }).id ?? '')
  }
  return null
}

const normalizeQuestion = (item: unknown): QuestionDoc | null => {
  if (typeof item !== 'object' || item === null) return null
  if (!('id' in item)) return null
  return item as QuestionDoc
}

export default function LessonQuizPreviewField() {
  const { value } = useField<string | number | { id?: string | number } | null>({
    path: 'assessment.quiz',
  })
  const quizId = useMemo(() => toId(value), [value])
  const [quiz, setQuiz] = useState<QuizDoc | null>(null)
  const [questions, setQuestions] = useState<QuestionDoc[]>([])

  const loadQuiz = useCallback(async (id: string) => {
    const res = await fetch(`/api/quizzes/${id}?depth=2`, { credentials: 'include' })
    if (!res.ok) {
      setQuiz(null)
      setQuestions([])
      return
    }
    const data = (await res.json()) as { doc?: QuizDoc }
    const doc = data.doc ?? null
    setQuiz(doc)
    const rawQuestions = Array.isArray(doc?.questions) ? doc?.questions : []
    setQuestions(rawQuestions.map((item) => normalizeQuestion(item)).filter(Boolean) as QuestionDoc[])
  }, [])

  useEffect(() => {
    if (!quizId) {
      setQuiz(null)
      setQuestions([])
      return
    }
    void loadQuiz(quizId)
  }, [quizId, loadQuiz])

  if (!quizId) {
    return (
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--cpp-muted)' }}>
        Attach a quiz to preview it here.
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--cpp-muted)' }}>
        {quiz?.title ? `Quiz "${quiz.title}" has no questions yet.` : 'Quiz has no questions yet.'}
      </div>
    )
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          fontWeight: 700,
          color: 'var(--cpp-muted)',
          marginBottom: 12,
        }}
      >
        Quiz preview
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        {questions.map((question, index) => {
          const options = Array.isArray(question.options) ? question.options : []
          const correctCount = options.filter((option) => option?.isCorrect).length
          const inputType = correctCount > 1 ? 'checkbox' : 'radio'
          return (
            <section
              key={question.id}
              style={{
                border: '1px solid var(--admin-surface-border)',
                borderRadius: 12,
                padding: 16,
                background: 'var(--admin-surface)',
                display: 'grid',
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {index + 1}. {question.title ?? 'Untitled question'}
              </div>
              {question.prompt ? (
                <div style={{ color: 'var(--cpp-muted)' }}>
                  <RichText data={question.prompt} />
                </div>
              ) : null}
              <div style={{ display: 'grid', gap: 8 }}>
                {options.map((option, optionIndex) => (
                  <label
                    key={option.id ?? optionIndex}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      gap: 8,
                      alignItems: 'center',
                    }}
                  >
                    <input type={inputType} disabled />
                    <span>{option.label ?? 'Option'}</span>
                  </label>
                ))}
              </div>
              {question.explanation ? (
                <div style={{ color: 'var(--cpp-muted)' }}>
                  <strong>Explanation:</strong> <RichText data={question.explanation} />
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
      <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginTop: 10 }}>
        Preview uses saved order with shuffling disabled.
      </div>
    </div>
  )
}
