'use client'

import { reduceFieldsToValues } from 'payload/shared'
import React, { useMemo } from 'react'
import { useAllFormFields, useField } from '@payloadcms/ui'

import type { FBDData, Force } from './FigureBuilderField'

type RubricForce = {
  label?: string
}

type RubricValue = {
  requiredForces?: RubricForce[]
}

const normalizeLabel = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

const toLabelSet = (labels: unknown[]) => new Set(labels.map(normalizeLabel).filter(Boolean))

export function FbdSyncValidatorField() {
  const [formState] = useAllFormFields()
  const values = useMemo(() => reduceFieldsToValues(formState, true), [formState])
  const { value: rubricValue } = useField<RubricValue>({ path: 'fbdRubric' })

  const rubricLabels = useMemo(
    () =>
      toLabelSet(
        Array.isArray(rubricValue?.requiredForces)
          ? rubricValue.requiredForces.map((force) => force?.label ?? '')
          : [],
      ),
    [rubricValue],
  )

  const figureLabels = useMemo(() => {
    const figure = (values as { figure?: { figureData?: FBDData | null } }).figure
    const fbd = figure?.figureData
    if (!fbd || fbd.type !== 'fbd' || !Array.isArray(fbd.forces)) return new Set<string>()
    return toLabelSet((fbd.forces as Force[]).map((force) => force?.label ?? ''))
  }, [values])

  const onlyInRubric = useMemo(
    () => [...rubricLabels].filter((label) => !figureLabels.has(label)),
    [figureLabels, rubricLabels],
  )
  const onlyInFigure = useMemo(
    () => [...figureLabels].filter((label) => !rubricLabels.has(label)),
    [figureLabels, rubricLabels],
  )

  if (!rubricLabels.size && !figureLabels.size) return null

  return (
    <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        FBD Figure ↔ Rubric Check
      </div>

      {!onlyInRubric.length && !onlyInFigure.length ? (
        <div className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          ✓ All figure forces have rubric entries.
        </div>
      ) : null}

      {onlyInRubric.map((label) => (
        <div
          key={`rubric-${label}`}
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          Force "{label}" is in the rubric but not drawn in the figure — students will not see it.
        </div>
      ))}

      {onlyInFigure.map((label) => (
        <div
          key={`figure-${label}`}
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          Force "{label}" is drawn in the figure but has no rubric entry — it will not be graded.
        </div>
      ))}
    </div>
  )
}

export default FbdSyncValidatorField
