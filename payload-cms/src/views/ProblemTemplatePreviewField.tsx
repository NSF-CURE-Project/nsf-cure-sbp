'use client'

import React, { useMemo, useState } from 'react'
import { reduceFieldsToValues } from 'payload/shared'
import { useAllFormFields } from '@payloadcms/ui'
import { buildProblemTemplateVariant } from '@/lib/problemSet/problemTemplate'

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return 'NaN'
  if (Math.abs(value) >= 1000 || Math.abs(value) < 0.001) return value.toExponential(4)
  return Number(value.toFixed(6)).toString()
}

export default function ProblemTemplatePreviewField() {
  const [formState] = useAllFormFields()
  const values = useMemo(() => reduceFieldsToValues(formState, true), [formState])
  const storedSeed =
    typeof (values as { parameterSeed?: unknown }).parameterSeed === 'string'
      ? ((values as { parameterSeed?: string }).parameterSeed ?? '')
      : ''
  const [seed, setSeed] = useState(storedSeed || 'template-default')

  const preview = useMemo(
    () =>
      buildProblemTemplateVariant({
        enabled: Boolean((values as { parameterizationEnabled?: boolean }).parameterizationEnabled),
        parameterDefinitions: (values as { parameterDefinitions?: unknown }).parameterDefinitions,
        derivedValues: (values as { derivedValues?: unknown }).derivedValues,
        seed,
      }),
    [seed, values],
  )

  const hasValues = preview.parameters.length > 0 || preview.derived.length > 0

  return (
    <div
      style={{
        marginTop: 8,
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: 10,
        padding: 12,
        display: 'grid',
        gap: 12,
        background: 'var(--theme-elevation-0)',
      }}
    >
      <div>
        <div
          style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}
        >
          Variant Preview
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--theme-elevation-700)' }}>
          Use a deterministic seed to generate authoring variants before publishing. This is the
          first step toward a full template-based engineering problem workflow.
        </div>
      </div>

      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Preview seed</span>
        <input
          value={seed}
          onChange={(event) => setSeed(event.target.value)}
          placeholder="template-default"
          style={{
            border: '1px solid var(--theme-elevation-250)',
            borderRadius: 8,
            padding: '10px 12px',
            background: 'var(--theme-elevation-50)',
          }}
        />
      </label>

      {preview.errors.length ? (
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
            Template validation issues
          </div>
          {preview.errors.map((error, index) => (
            <div key={index} style={{ fontSize: 12, color: '#991b1b' }}>
              {error}
            </div>
          ))}
        </div>
      ) : null}

      {hasValues ? (
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}
        >
          <section
            style={{
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 8,
              padding: 10,
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 700 }}>Sample Parameters</div>
            {preview.parameters.map((entry) => (
              <div
                key={entry.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 12,
                  borderBottom: '1px solid var(--theme-elevation-100)',
                  paddingBottom: 6,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{entry.label}</div>
                  <div style={{ color: 'var(--theme-elevation-650)' }}>{entry.key}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>{formatNumber(entry.value)}</div>
                  {entry.unit ? (
                    <div style={{ color: 'var(--theme-elevation-650)' }}>{entry.unit}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </section>

          <section
            style={{
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 8,
              padding: 10,
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 700 }}>Derived Values</div>
            {preview.derived.length ? (
              preview.derived.map((entry) => (
                <div
                  key={entry.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    fontSize: 12,
                    borderBottom: '1px solid var(--theme-elevation-100)',
                    paddingBottom: 6,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{entry.label}</div>
                    <div style={{ color: 'var(--theme-elevation-650)' }}>{entry.key}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{formatNumber(entry.value)}</div>
                    {entry.unit ? (
                      <div style={{ color: 'var(--theme-elevation-650)' }}>{entry.unit}</div>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
                Add derived expressions to preview solved quantities and author-time formulas.
              </div>
            )}
          </section>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
          Add parameter definitions to start previewing deterministic variants.
        </div>
      )}
    </div>
  )
}
