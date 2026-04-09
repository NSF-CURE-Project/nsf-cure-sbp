'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import { reduceFieldsToValues } from 'payload/shared'
import React, { useEffect, useMemo, useState } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

import { buildProblemTemplateVariant } from '@/lib/problemSet/problemTemplate'
import {
  buildPreviewCanonicalParts,
  buildPreviewSubmittedParts,
  normalizePreviewPartType,
  type PreviewFbdInput,
  type PreviewPartInput,
} from '@/lib/problemSet/problemPreviewGrading'
import { gradeProblemAttemptAnswers } from '@/utils/problemGrading'
import { SVGCanvas, type FigureData } from '@/views/FigureBuilderField'

type Part = PreviewPartInput & {
  label?: string
  prompt?: unknown
  unit?: string
  explanation?: unknown
}

type LexicalRichText = {
  root: {
    type: string
    version: number
    children: unknown[]
  }
}

type EvaluatedPart = {
  partIndex: number
  score: number
  isCorrect: boolean
}

type PreviewGradeResult = {
  score: number
  maxScore: number
  correctCount: number
  parts: EvaluatedPart[]
}

const isLexicalRichText = (value: unknown): value is LexicalRichText => {
  if (!value || typeof value !== 'object') return false
  const root = (value as { root?: unknown }).root
  if (!root || typeof root !== 'object') return false
  const rootNode = root as { type?: unknown; version?: unknown; children?: unknown }
  return (
    typeof rootNode.type === 'string' &&
    typeof rootNode.version === 'number' &&
    Array.isArray(rootNode.children)
  )
}

const toParts = (value: unknown): Part[] => (Array.isArray(value) ? (value as Part[]) : [])

const toNumeric = (value: unknown, fallback: number) => {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

const scoreClass = (score: number) => {
  if (score === 1) return { label: 'Correct', color: '#16a34a' }
  if (score > 0) return { label: `Partial (${Math.round(score * 100)}%)`, color: '#d97706' }
  return { label: 'Incorrect', color: '#dc2626' }
}

const toFigureData = (value: unknown): FigureData | null => {
  if (!value || typeof value !== 'object') return null
  const record = value as { figureData?: unknown }
  if (!record.figureData || typeof record.figureData !== 'object') return null
  if (!('type' in (record.figureData as Record<string, unknown>))) return null
  return record.figureData as FigureData
}

export default function ProblemPreviewTab() {
  const [formState] = useAllFormFields()
  const values = useMemo(() => reduceFieldsToValues(formState, true), [formState])
  const title = (values as { title?: string }).title ?? 'Untitled problem'
  const prompt = (values as { prompt?: unknown }).prompt
  const parts = toParts((values as { parts?: unknown }).parts)
  const figureData = toFigureData((values as { figure?: unknown }).figure)

  const seedFromForm =
    typeof (values as { parameterSeed?: unknown }).parameterSeed === 'string'
      ? ((values as { parameterSeed?: string }).parameterSeed ?? '').trim()
      : ''
  const templateSeed = seedFromForm || 'template-preview'
  const templateVariant = useMemo(
    () =>
      buildProblemTemplateVariant({
        enabled: Boolean((values as { parameterizationEnabled?: boolean }).parameterizationEnabled),
        parameterDefinitions: (values as { parameterDefinitions?: unknown }).parameterDefinitions,
        derivedValues: (values as { derivedValues?: unknown }).derivedValues,
        seed: templateSeed,
      }),
    [templateSeed, values],
  )
  const templateScope = templateVariant.scope

  const [studentInputs, setStudentInputs] = useState<Record<number, string>>({})
  const [fbdInputs, setFbdInputs] = useState<Record<number, PreviewFbdInput>>({})
  const [gradeResult, setGradeResult] = useState<PreviewGradeResult | null>(null)
  const [isGrading, setIsGrading] = useState(false)

  const partShapeKey = useMemo(
    () => parts.map((part, index) => `${index}:${normalizePreviewPartType(part.partType)}`).join('|'),
    [parts],
  )
  const partTypes = useMemo(
    () =>
      partShapeKey
        .split('|')
        .filter(Boolean)
        .map((token) => {
          const delimiterIndex = token.indexOf(':')
          const rawPartType = delimiterIndex >= 0 ? token.slice(delimiterIndex + 1) : token
          return normalizePreviewPartType(rawPartType)
        }),
    [partShapeKey],
  )

  useEffect(() => {
    setStudentInputs((current) => {
      const next: Record<number, string> = {}
      partTypes.forEach((partType, index) => {
        if (partType === 'fbd-draw') return
        next[index] = current[index] ?? ''
      })
      return next
    })
    setFbdInputs((current) => {
      const next: Record<number, PreviewFbdInput> = {}
      partTypes.forEach((partType, index) => {
        if (partType !== 'fbd-draw') return
        next[index] = current[index] ?? { forces: [], moments: [] }
      })
      return next
    })
    setGradeResult(null)
  }, [partTypes])

  const canonicalParts = useMemo(
    () => buildPreviewCanonicalParts({ parts, templateScope }),
    [parts, templateScope],
  )

  const evaluationByPart = useMemo(
    () => new Map((gradeResult?.parts ?? []).map((part) => [part.partIndex, part])),
    [gradeResult],
  )

  const setPartInput = (partIndex: number, next: string) =>
    setStudentInputs((current) => ({
      ...current,
      [partIndex]: next,
    }))

  const patchFbd = (partIndex: number, updater: (current: PreviewFbdInput) => PreviewFbdInput) =>
    setFbdInputs((current) => {
      const existing = current[partIndex] ?? { forces: [], moments: [] }
      return {
        ...current,
        [partIndex]: updater(existing),
      }
    })

  const addFbdForce = (partIndex: number) =>
    patchFbd(partIndex, (current) => {
      const nextIndex = current.forces.length + 1
      return {
        ...current,
        forces: [
          ...current.forces,
          {
            id: `F-${Date.now()}-${nextIndex}`,
            label: `F${nextIndex}`,
            angle: 0,
            magnitude: 1,
          },
        ],
      }
    })

  const addFbdMoment = (partIndex: number) =>
    patchFbd(partIndex, (current) => {
      const nextIndex = current.moments.length + 1
      return {
        ...current,
        moments: [
          ...current.moments,
          {
            id: `M-${Date.now()}-${nextIndex}`,
            label: `M${nextIndex}`,
            direction: 'cw',
            magnitude: 1,
          },
        ],
      }
    })

  const runPreviewGrade = async () => {
    setIsGrading(true)
    try {
      const submittedParts = buildPreviewSubmittedParts({ parts, studentInputs, fbdInputs })

      const graded = await gradeProblemAttemptAnswers(
        [{ problem: 'preview-problem', parts: submittedParts }],
        [{ id: 'preview-problem', templateScope, parts: canonicalParts }],
      )
      const gradedParts = graded.answers[0]?.parts ?? []
      setGradeResult({
        score: graded.score,
        maxScore: graded.maxScore,
        correctCount: graded.correctCount,
        parts: gradedParts.map((part) => ({
          partIndex: part.partIndex,
          score: part.score ?? 0,
          isCorrect: Boolean(part.isCorrect),
        })),
      })
    } finally {
      setIsGrading(false)
    }
  }

  return (
    <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>
        Interactive Author Preview
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
        {isLexicalRichText(prompt) ? (
          <div>
            <RichText data={prompt as never} />
          </div>
        ) : null}
        {figureData ? (
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Figure Preview</div>
            <SVGCanvas value={figureData} />
          </div>
        ) : null}
        {templateVariant.errors.length ? (
          <div
            style={{
              border: '1px solid rgba(220,38,38,0.22)',
              background: 'rgba(220,38,38,0.08)',
              borderRadius: 8,
              padding: 10,
              display: 'grid',
              gap: 6,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>
              Template validation issues affect preview grading
            </div>
            {templateVariant.errors.slice(0, 3).map((error, index) => (
              <div key={index} style={{ fontSize: 12, color: '#991b1b' }}>
                {error}
              </div>
            ))}
          </div>
        ) : null}
        {(templateVariant.parameters.length || templateVariant.derived.length) ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...templateVariant.parameters, ...templateVariant.derived].map((entry) => (
              <code
                key={entry.key}
                style={{
                  fontSize: 11,
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: 999,
                  padding: '2px 8px',
                  background: 'var(--theme-elevation-50)',
                }}
              >
                {entry.key}={Number(entry.value.toFixed(6))}
              </code>
            ))}
          </div>
        ) : null}
        <div style={{ display: 'grid', gap: 8 }}>
          {parts.map((part, index) => {
            const partType = normalizePreviewPartType(part.partType)
            const fbdValue = fbdInputs[index] ?? { forces: [], moments: [] }
            return (
              <div
                key={index}
                style={{
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: 8,
                  padding: 10,
                  display: 'grid',
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {part.label ?? `Part ${index + 1}`} · {partType}
                </div>
                {isLexicalRichText(part.prompt) ? (
                  <div style={{ marginTop: 2 }}>
                    <RichText data={part.prompt as never} />
                  </div>
                ) : null}
                {partType === 'symbolic' ? (
                  <input
                    placeholder="Student symbolic expression"
                    value={studentInputs[index] ?? ''}
                    onChange={(event) => setPartInput(index, event.target.value)}
                  />
                ) : partType === 'fbd-draw' ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => addFbdForce(index)}>
                        Add force
                      </button>
                      <button type="button" onClick={() => addFbdMoment(index)}>
                        Add moment
                      </button>
                    </div>
                    {(fbdValue.forces.length || fbdValue.moments.length) ? (
                      <>
                        {fbdValue.forces.map((force, forceIndex) => (
                          <div
                            key={force.id}
                            style={{ display: 'grid', gap: 6, gridTemplateColumns: '2fr 1fr 1fr auto' }}
                          >
                            <input
                              value={force.label}
                              onChange={(event) =>
                                patchFbd(index, (current) => ({
                                  ...current,
                                  forces: current.forces.map((entry, idx) =>
                                    idx === forceIndex ? { ...entry, label: event.target.value } : entry,
                                  ),
                                }))
                              }
                            />
                            <input
                              type="number"
                              value={force.angle}
                              onChange={(event) =>
                                patchFbd(index, (current) => ({
                                  ...current,
                                  forces: current.forces.map((entry, idx) =>
                                    idx === forceIndex
                                      ? { ...entry, angle: toNumeric(event.target.value, 0) }
                                      : entry,
                                  ),
                                }))
                              }
                            />
                            <input
                              type="number"
                              value={force.magnitude}
                              onChange={(event) =>
                                patchFbd(index, (current) => ({
                                  ...current,
                                  forces: current.forces.map((entry, idx) =>
                                    idx === forceIndex
                                      ? { ...entry, magnitude: Math.max(0, toNumeric(event.target.value, 0)) }
                                      : entry,
                                  ),
                                }))
                              }
                            />
                            <button
                              type="button"
                              onClick={() =>
                                patchFbd(index, (current) => ({
                                  ...current,
                                  forces: current.forces.filter((_, idx) => idx !== forceIndex),
                                }))
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        {fbdValue.moments.map((moment, momentIndex) => (
                          <div
                            key={moment.id}
                            style={{ display: 'grid', gap: 6, gridTemplateColumns: '2fr 1fr 1fr auto' }}
                          >
                            <input
                              value={moment.label}
                              onChange={(event) =>
                                patchFbd(index, (current) => ({
                                  ...current,
                                  moments: current.moments.map((entry, idx) =>
                                    idx === momentIndex ? { ...entry, label: event.target.value } : entry,
                                  ),
                                }))
                              }
                            />
                            <select
                              value={moment.direction}
                              onChange={(event) =>
                                patchFbd(index, (current) => ({
                                  ...current,
                                  moments: current.moments.map((entry, idx) =>
                                    idx === momentIndex
                                      ? { ...entry, direction: event.target.value === 'ccw' ? 'ccw' : 'cw' }
                                      : entry,
                                  ),
                                }))
                              }
                            >
                              <option value="cw">cw</option>
                              <option value="ccw">ccw</option>
                            </select>
                            <input
                              type="number"
                              value={moment.magnitude}
                              onChange={(event) =>
                                patchFbd(index, (current) => ({
                                  ...current,
                                  moments: current.moments.map((entry, idx) =>
                                    idx === momentIndex
                                      ? { ...entry, magnitude: Math.max(0, toNumeric(event.target.value, 0)) }
                                      : entry,
                                  ),
                                }))
                              }
                            />
                            <button
                              type="button"
                              onClick={() =>
                                patchFbd(index, (current) => ({
                                  ...current,
                                  moments: current.moments.filter((_, idx) => idx !== momentIndex),
                                }))
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
                        Add forces/moments to run rubric grading in preview.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      placeholder="Student numeric answer"
                      style={{ flex: 1 }}
                      value={studentInputs[index] ?? ''}
                      onChange={(event) => setPartInput(index, event.target.value)}
                    />
                    {part.unit ? (
                      <span style={{ fontSize: 12, color: 'var(--theme-elevation-650)' }}>{part.unit}</span>
                    ) : null}
                  </div>
                )}
              </div>
            )
          })}
          {!parts.length ? (
            <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
              Add at least one part to run preview grading.
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => void runPreviewGrade()} disabled={!parts.length || isGrading}>
            {isGrading ? 'Grading...' : 'Grade Preview Submission'}
          </button>
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
        {gradeResult ? (
          <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
            Score: {gradeResult.score.toFixed(2)} / {gradeResult.maxScore.toFixed(2)} · Correct parts:{' '}
            {gradeResult.correctCount}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
            Run a preview submission to see real grading outcomes.
          </div>
        )}
        {parts.map((part, index) => {
          const evaluated = evaluationByPart.get(index)
          const score = evaluated?.score ?? 0
          const status = scoreClass(score)
          const partType = normalizePreviewPartType(part.partType)
          const numericCorrect = canonicalParts[index]?.correctAnswer
          const fbdValue = fbdInputs[index] ?? { forces: [], moments: [] }
          return (
            <div
              key={`result-${index}`}
              style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: 10 }}
            >
              <div style={{ fontWeight: 600 }}>{part.label ?? `Part ${index + 1}`}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: status.color, fontWeight: 600 }}>
                {status.label}
              </div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                {partType === 'symbolic'
                  ? `Correct expression: ${part.symbolicAnswer ?? '—'}`
                  : partType === 'fbd-draw'
                    ? `Submitted forces: ${fbdValue.forces.length}, moments: ${fbdValue.moments.length}`
                    : `Correct answer: ${numericCorrect ?? '—'} ${part.unit ?? ''}`}
              </div>
              {isLexicalRichText(part.explanation) ? (
                <div style={{ marginTop: 8 }}>
                  <RichText data={part.explanation as never} />
                </div>
              ) : null}
            </div>
          )
        })}
      </section>
    </div>
  )
}
