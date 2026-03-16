'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import { reduceFieldsToValues } from 'payload/shared'
import React, { useMemo } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

type Part = {
  label?: string
  prompt?: unknown
  unit?: string
  correctAnswer?: number
  explanation?: unknown
}

const toParts = (value: unknown): Part[] =>
  Array.isArray(value) ? (value as Part[]) : []

const scoreClass = (score: number) => {
  if (score === 1) return { label: 'Correct', color: '#16a34a' }
  if (score > 0) return { label: `Partial (${Math.round(score * 100)}%)`, color: '#d97706' }
  return { label: 'Incorrect', color: '#dc2626' }
}

export default function ProblemPreviewTab() {
  const [formState] = useAllFormFields()
  const values = useMemo(() => reduceFieldsToValues(formState, true), [formState])
  const title = (values as { title?: string }).title ?? 'Untitled problem'
  const prompt = (values as { prompt?: unknown }).prompt
  const parts = toParts((values as { parts?: unknown }).parts)

  return (
    <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>
        Live Student Preview
      </div>
      <section
        style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 10,
          padding: 12,
          background: 'var(--theme-elevation-0)',
          display: 'grid',
          gap: 10,
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        {prompt ? (
          <div>
            <RichText data={prompt} />
          </div>
        ) : null}
        <div style={{ display: 'grid', gap: 8 }}>
          {parts.map((part, index) => (
            <div key={index} style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontWeight: 600 }}>{part.label ?? `Part ${index + 1}`}</div>
              {part.prompt ? (
                <div style={{ marginTop: 6 }}>
                  <RichText data={part.prompt} />
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <input
                  disabled
                  placeholder="Student answer"
                  style={{ flex: 1 }}
                  value={index % 2 === 0 ? String(part.correctAnswer ?? '') : ''}
                  readOnly
                />
                {part.unit ? <span style={{ fontSize: 12, color: 'var(--theme-elevation-650)' }}>{part.unit}</span> : null}
              </div>
            </div>
          ))}
          {!parts.length ? (
            <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
              Add at least one part to preview responses.
            </div>
          ) : null}
        </div>
      </section>

      <section
        style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 10,
          padding: 12,
          background: 'var(--theme-elevation-0)',
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 700 }}>Post-submission Preview</div>
        {parts.map((part, index) => {
          const previewScore = index % 3 === 0 ? 1 : index % 3 === 1 ? 0.6 : 0
          const status = scoreClass(previewScore)
          return (
            <div key={`result-${index}`} style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontWeight: 600 }}>{part.label ?? `Part ${index + 1}`}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: status.color, fontWeight: 600 }}>{status.label}</div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                Correct answer: {part.correctAnswer ?? '—'} {part.unit ?? ''}
              </div>
              {part.explanation ? (
                <div style={{ marginTop: 8 }}>
                  <RichText data={part.explanation} />
                </div>
              ) : null}
            </div>
          )
        })}
      </section>
    </div>
  )
}

