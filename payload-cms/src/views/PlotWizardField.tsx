'use client'

import { reduceFieldsToValues } from 'payload/shared'
import React, { useCallback, useMemo, useState } from 'react'
import { useAllFormFields, useField } from '@payloadcms/ui'
import {
  buildPlotLabelOptions,
  coercePlotWizardReference,
  validateResultPlotSegments,
} from '@/lib/problemSet/resultPlotValidation'

type PlotType = 'shear' | 'moment' | 'deflection' | 'custom'

type Segment = {
  xStart: string
  xEnd: string
  formula: string
}

type PatternKey =
  | 'simply-supported-mid-point-load'
  | 'simply-supported-udl-full-span'
  | 'simply-supported-udl-partial-span'
  | 'cantilever-tip-load'
  | 'cantilever-udl'
  | 'custom'

type PatternDefinition = {
  label: string
  params: string[]
  generate: (plotType: PlotType, params: Record<string, string>) => Segment[]
}

const PATTERNS: Record<Exclude<PatternKey, 'custom'>, PatternDefinition> = {
  'simply-supported-mid-point-load': {
    label: 'Simply-supported beam, mid-span point load',
    params: ['Ra', 'P', 'a', 'L'],
    generate: (plotType, params) => {
      if (plotType === 'moment') {
        return [
          { xStart: '0', xEnd: params.a, formula: `${params.Ra} * x` },
          { xStart: params.a, xEnd: params.L, formula: `${params.Ra} * x - ${params.P} * (x - ${params.a})` },
        ]
      }
      if (plotType === 'deflection') {
        return [
          { xStart: '0', xEnd: params.L, formula: '0' },
        ]
      }
      return [
        { xStart: '0', xEnd: params.a, formula: `${params.Ra}` },
        { xStart: params.a, xEnd: params.L, formula: `${params.Ra} - ${params.P}` },
      ]
    },
  },
  'simply-supported-udl-full-span': {
    label: 'Simply-supported beam, UDL (full span)',
    params: ['Ra', 'w', 'L'],
    generate: (plotType, params) => {
      if (plotType === 'moment') {
        return [{ xStart: '0', xEnd: params.L, formula: `${params.Ra} * x - (${params.w} * x^2) / 2` }]
      }
      if (plotType === 'deflection') {
        return [{ xStart: '0', xEnd: params.L, formula: '0' }]
      }
      return [{ xStart: '0', xEnd: params.L, formula: `${params.Ra} - ${params.w} * x` }]
    },
  },
  'simply-supported-udl-partial-span': {
    label: 'Simply-supported beam, UDL (partial span)',
    params: ['Ra', 'w', 'a', 'b', 'L'],
    generate: (plotType, params) => {
      if (plotType === 'moment') {
        return [
          { xStart: '0', xEnd: params.a, formula: `${params.Ra} * x` },
          { xStart: params.a, xEnd: params.b, formula: `${params.Ra} * x - (${params.w} * (x - ${params.a})^2) / 2` },
          {
            xStart: params.b,
            xEnd: params.L,
            formula: `${params.Ra} * x - ${params.w} * (${params.b} - ${params.a}) * (x - (${params.a} + ${params.b}) / 2)`,
          },
        ]
      }
      if (plotType === 'deflection') {
        return [{ xStart: '0', xEnd: params.L, formula: '0' }]
      }
      return [
        { xStart: '0', xEnd: params.a, formula: `${params.Ra}` },
        { xStart: params.a, xEnd: params.b, formula: `${params.Ra} - ${params.w} * (x - ${params.a})` },
        { xStart: params.b, xEnd: params.L, formula: `${params.Ra} - ${params.w} * (${params.b} - ${params.a})` },
      ]
    },
  },
  'cantilever-tip-load': {
    label: 'Cantilever beam, tip load',
    params: ['P', 'L'],
    generate: (plotType, params) => {
      if (plotType === 'moment') {
        return [{ xStart: '0', xEnd: params.L, formula: `-${params.P} * (${params.L} - x)` }]
      }
      if (plotType === 'deflection') {
        return [{ xStart: '0', xEnd: params.L, formula: '0' }]
      }
      return [{ xStart: '0', xEnd: params.L, formula: `-${params.P}` }]
    },
  },
  'cantilever-udl': {
    label: 'Cantilever beam, UDL',
    params: ['w', 'L'],
    generate: (plotType, params) => {
      if (plotType === 'moment') {
        return [{ xStart: '0', xEnd: params.L, formula: `-(${params.w} * (${params.L} - x)^2) / 2` }]
      }
      if (plotType === 'deflection') {
        return [{ xStart: '0', xEnd: params.L, formula: '0' }]
      }
      return [{ xStart: '0', xEnd: params.L, formula: `-${params.w} * (${params.L} - x)` }]
    },
  },
}

const PATTERN_OPTIONS: { value: PatternKey; label: string }[] = [
  {
    value: 'simply-supported-mid-point-load',
    label: PATTERNS['simply-supported-mid-point-load'].label,
  },
  {
    value: 'simply-supported-udl-full-span',
    label: PATTERNS['simply-supported-udl-full-span'].label,
  },
  {
    value: 'simply-supported-udl-partial-span',
    label: PATTERNS['simply-supported-udl-partial-span'].label,
  },
  {
    value: 'cantilever-tip-load',
    label: PATTERNS['cantilever-tip-load'].label,
  },
  {
    value: 'cantilever-udl',
    label: PATTERNS['cantilever-udl'].label,
  },
  { value: 'custom', label: 'Custom (raw segments)' },
]

const svgPath = (pattern: Exclude<PatternKey, 'custom'>, plotType: PlotType) => {
  if (plotType === 'moment') {
    if (pattern === 'simply-supported-mid-point-load') return 'M 10 70 Q 70 20 130 70'
    if (pattern === 'simply-supported-udl-full-span') return 'M 10 70 Q 70 10 130 70'
    if (pattern === 'simply-supported-udl-partial-span') return 'M 10 70 Q 55 65 90 30 Q 110 15 130 45'
    if (pattern === 'cantilever-tip-load') return 'M 10 20 L 130 70'
    return 'M 10 20 Q 70 35 130 70'
  }
  if (plotType === 'deflection') {
    return 'M 10 35 Q 70 40 130 65'
  }
  if (pattern === 'simply-supported-mid-point-load') return 'M 10 25 L 70 25 L 70 60 L 130 60'
  if (pattern === 'simply-supported-udl-full-span') return 'M 10 20 L 130 65'
  if (pattern === 'simply-supported-udl-partial-span') return 'M 10 25 L 50 25 L 90 55 L 130 55'
  if (pattern === 'cantilever-tip-load') return 'M 10 60 L 130 60'
  return 'M 10 65 L 130 25'
}

export default function PlotWizardField() {
  const [formState] = useAllFormFields()
  const values = useMemo(() => reduceFieldsToValues(formState, true), [formState])
  const partLabelOptions = useMemo(() => {
    const parts = Array.isArray((values as { parts?: unknown[] }).parts)
      ? (((values as { parts?: unknown[] }).parts ?? []) as Array<{ label?: string }>)
      : []
    return buildPlotLabelOptions(parts.map((part) => (part.label ?? '').trim()).filter(Boolean))
  }, [values])

  const { value: plotTypeValue } = useField<PlotType>({ path: 'plotType' })
  const { setValue: setSegmentsValue } = useField<Segment[]>({ path: 'segments' })
  const { setValue: setCriticalPointsValue } = useField<{ x: string; label: string }[]>({
    path: 'criticalPoints',
  })
  const { value: xMaxValue, setValue: setXMaxValue } = useField<string>({ path: 'xMax' })

  const plotType = plotTypeValue ?? 'shear'
  const [pattern, setPattern] = useState<PatternKey>('simply-supported-udl-full-span')
  const [paramMap, setParamMap] = useState<Record<string, string>>({})

  const patternDef = pattern !== 'custom' ? PATTERNS[pattern] : null
  const params = patternDef?.params ?? []

  const buildNormalizedMap = useCallback(
    (keys: string[], nextMap: Record<string, string>) =>
      Object.fromEntries(
        keys.map((key) => {
          const rawValue = (nextMap[key] ?? key).trim()
          const mappedValue = coercePlotWizardReference(rawValue || key, partLabelOptions)
          return [key, mappedValue || key]
        }),
      ),
    [partLabelOptions],
  )

  const generatedPattern = useMemo(() => {
    if (pattern === 'custom' || !patternDef) {
      return {
        normalizedMap: {} as Record<string, string>,
        segments: [] as Segment[],
        error: '',
      }
    }
    if (plotType === 'deflection') {
      return {
        normalizedMap: buildNormalizedMap(patternDef.params, paramMap),
        segments: [] as Segment[],
        error:
          'Preset templates are unavailable for deflection plots. Switch to Custom and enter the real deflection equations manually.',
      }
    }

    const normalizedMap = buildNormalizedMap(patternDef.params, paramMap)
    const segments = patternDef.generate(plotType, normalizedMap)
    const validation = validateResultPlotSegments({ plotType, segments })
    return {
      normalizedMap,
      segments,
      error: validation === true ? '' : validation,
    }
  }, [buildNormalizedMap, paramMap, pattern, patternDef, plotType])

  const applyPattern = (nextPattern: Exclude<PatternKey, 'custom'>, nextMap: Record<string, string>) => {
    const definition = PATTERNS[nextPattern]
    if (plotType === 'deflection') return
    const normalizedMap = buildNormalizedMap(definition.params, nextMap)
    const segments = definition.generate(plotType, normalizedMap)
    const validation = validateResultPlotSegments({ plotType, segments })
    if (validation !== true) return
    setSegmentsValue(segments)

    if (!xMaxValue && normalizedMap.L) {
      setXMaxValue(normalizedMap.L)
    }
    setCriticalPointsValue(
      segments
        .map((segment) => segment.xEnd)
        .filter((value, index, arr) => index === arr.indexOf(value))
        .slice(0, 6)
        .map((x, index) => ({ x, label: `CP${index + 1}` })),
    )
  }

  return (
    <div
      style={{
        marginTop: 6,
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: 8,
        padding: 10,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Plot Wizard
      </div>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Pattern</span>
        <select
          value={pattern}
          onChange={(event) => {
            const nextPattern = event.target.value as PatternKey
            setPattern(nextPattern)
            if (nextPattern === 'custom') return
            const initialMap = Object.fromEntries(
              PATTERNS[nextPattern].params.map((param) => [param, paramMap[param] ?? param]),
            )
            setParamMap(initialMap)
            applyPattern(nextPattern, initialMap)
          }}
        >
          {PATTERN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {pattern !== 'custom' && patternDef ? (
        <>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Map Parameters to Part Labels or Constants</div>
            {params.map((param) => (
              <label key={param} style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12 }}>{param}</span>
                <input
                  list={`${param}-options`}
                  value={paramMap[param] ?? param}
                  onChange={(event) => {
                    const nextMap = {
                      ...paramMap,
                      [param]: event.target.value,
                    }
                    setParamMap(nextMap)
                    applyPattern(pattern as Exclude<PatternKey, 'custom'>, nextMap)
                  }}
                />
                <datalist id={`${param}-options`}>
                  {partLabelOptions.map((option) => (
                    <option key={`${param}-${option.rawLabel}`} value={option.rawLabel} />
                  ))}
                </datalist>
              </label>
            ))}
            {partLabelOptions.some((option) => option.sanitized) ? (
              <div style={{ fontSize: 11, color: 'var(--theme-elevation-700)' }}>
                Labels with spaces or symbols are converted to math identifiers when formulas are generated:
                {' '}
                {partLabelOptions
                  .filter((option) => option.sanitized)
                  .slice(0, 4)
                  .map((option) => `${option.rawLabel} → ${option.reference}`)
                  .join(', ')}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Generated formulas</div>
            <div
              style={{
                display: 'grid',
                gap: 6,
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 8,
                padding: 8,
              }}
            >
              {generatedPattern.error ? (
                <div style={{ fontSize: 12, color: '#b45309' }}>{generatedPattern.error}</div>
              ) : (
                generatedPattern.segments.map((segment, index) => (
                  <code key={`${segment.formula}-${index}`} style={{ fontSize: 12 }}>
                    {segment.xStart} to {segment.xEnd}: {segment.formula}
                  </code>
                ))
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 6,
              border: '1px dashed var(--theme-elevation-250)',
              borderRadius: 8,
              padding: 8,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600 }}>Shape preview</div>
            <svg width={150} height={80} role="img" aria-label="Plot sketch preview">
              <line x1={10} y1={70} x2={140} y2={70} stroke="#94a3b8" />
              <line x1={10} y1={10} x2={10} y2={70} stroke="#94a3b8" />
              <path d={svgPath(pattern, plotType)} fill="none" stroke="#2563eb" strokeWidth={2} />
            </svg>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
          Custom mode enabled. Edit raw segments directly below.
        </div>
      )}
    </div>
  )
}
