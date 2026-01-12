'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { QuizQuestion } from '@/payload-types'

type QuestionDoc = Pick<QuizQuestion, 'id' | 'title' | 'prompt' | 'options' | 'explanation'>

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id?: string | number }).id ?? '')
  }
  return null
}

export default function QuizPreviewField() {
  const { value } = useField<(string | number)[] | null>({
    path: 'questions',
  })
  const questionIds = useMemo(() => {
    if (!Array.isArray(value)) return []
    return value
      .map((item) => toId(item))
      .filter((id): id is string => Boolean(id))
  }, [value])
  const [questions, setQuestions] = useState<QuestionDoc[]>([])

  const loadQuestions = useCallback(async (ids: string[]) => {
    if (!ids.length) {
      setQuestions([])
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
      setQuestions([])
      return
    }
    const data = (await res.json()) as { docs?: QuestionDoc[] }
    const map = new Map<string, QuestionDoc>()
    data.docs?.forEach((doc) => map.set(String(doc.id), doc))
    setQuestions(ids.map((id) => map.get(id)).filter(Boolean) as QuestionDoc[])
  }, [])

  useEffect(() => {
    void loadQuestions(questionIds)
  }, [questionIds, loadQuestions])

  if (!questionIds.length) {
    return (
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--cpp-muted)' }}>
        Add questions to preview the quiz.
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
