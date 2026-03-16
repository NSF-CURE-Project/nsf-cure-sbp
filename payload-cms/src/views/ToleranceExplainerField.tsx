'use client'

import React, { useMemo } from 'react'
import { useField } from '@payloadcms/ui'

const toNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return value
}

export default function ToleranceExplainerField() {
  const { value: correctValue } = useField<number | null>({ path: 'correctAnswer' })
  const { value: toleranceValue } = useField<number | null>({ path: 'tolerance' })
  const { value: toleranceTypeValue } = useField<'absolute' | 'relative' | null>({
    path: 'toleranceType',
  })
  const { value: sigFigsValue } = useField<number | null>({ path: 'significantFigures' })

  const correct = toNumber(correctValue)
  const tolerance = Math.abs(toNumber(toleranceValue) ?? 0)
  const toleranceType = toleranceTypeValue ?? 'absolute'
  const sigFigs = toNumber(sigFigsValue)

  const explanation = useMemo(() => {
    if (correct == null) {
      return 'Enter a correct answer to see tolerance behavior.'
    }
    if (tolerance <= 0) {
      return 'Tolerance is zero, so only the exact value is fully correct.'
    }
    if (toleranceType === 'relative') {
      const percent = tolerance * 100
      return `Relative tolerance: answers within ±${percent.toFixed(2)}% of ${correct} are fully correct.`
    }
    return `Absolute tolerance: answers within ±${tolerance} of ${correct} are fully correct.`
  }, [correct, tolerance, toleranceType])

  const displayWindow = useMemo(() => {
    if (correct == null) return { min: -1, max: 1, passMin: -0.5, passMax: 0.5 }
    if (toleranceType === 'relative') {
      const delta = Math.abs(correct) * tolerance
      const span = Math.max(delta * 2, Math.abs(correct) * 0.4, 1)
      return {
        min: correct - span,
        max: correct + span,
        passMin: correct - delta,
        passMax: correct + delta,
      }
    }
    const span = Math.max(tolerance * 2, Math.abs(correct) * 0.25, 1)
    return {
      min: correct - span,
      max: correct + span,
      passMin: correct - tolerance,
      passMax: correct + tolerance,
    }
  }, [correct, tolerance, toleranceType])

  const toX = (value: number) => {
    const width = 420
    const { min, max } = displayWindow
    if (max === min) return 0
    return ((value - min) / (max - min)) * width
  }

  return (
    <div
      style={{
        marginTop: 6,
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: 8,
        padding: 10,
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Tolerance Explainer
      </div>
      <div style={{ fontSize: 12 }}>{explanation}</div>
      {sigFigs && sigFigs > 0 ? (
        <div style={{ fontSize: 12 }}>
          Student answers are rounded to <strong>{sigFigs}</strong> significant figures before comparison.
        </div>
      ) : null}
      <svg width={420} height={52} role="img" aria-label="Tolerance number line">
        <line x1={0} y1={28} x2={420} y2={28} stroke="#64748b" />
        <rect
          x={toX(displayWindow.passMin)}
          y={20}
          width={Math.max(2, toX(displayWindow.passMax) - toX(displayWindow.passMin))}
          height={16}
          fill="rgba(34,197,94,0.22)"
          stroke="#16a34a"
        />
        {correct != null ? (
          <>
            <line x1={toX(correct)} y1={12} x2={toX(correct)} y2={44} stroke="#0f172a" />
            <text x={toX(correct) + 5} y={12} fontSize={11} fill="#0f172a">
              {correct}
            </text>
          </>
        ) : null}
      </svg>
    </div>
  )
}

