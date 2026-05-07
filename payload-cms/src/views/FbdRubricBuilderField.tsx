'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'

import { arrowEnd } from './FigureBuilderField'

type RequiredForce = {
  id: string
  label?: string
  correctAngle?: number
  angleTolerance?: number
  magnitudeRequired?: boolean
  correctMagnitude?: number
  magnitudeTolerance?: number
}

type FbdRubric = {
  requiredForces?: RequiredForce[]
  requiredMoments?: {
    id: string
    label?: string
    direction: 'cw' | 'ccw'
    magnitudeRequired?: boolean
    correctMagnitude?: number
    magnitudeTolerance?: number
  }[]
  forbiddenForces?: number
}

const CANVAS_SIZE = 400
const CENTER = CANVAS_SIZE / 2

const normalizeAngle = (value: number) => ((Math.round(value) % 360) + 360) % 360

const toForce = (force: RequiredForce, idx: number): RequiredForce => ({
  id: force.id || `force-${idx + 1}`,
  label: force.label ?? '',
  correctAngle: normalizeAngle(Number(force.correctAngle ?? 0)),
  angleTolerance: Math.max(0, Number(force.angleTolerance ?? 15)),
  magnitudeRequired: Boolean(force.magnitudeRequired),
  correctMagnitude: Number(force.correctMagnitude ?? 1),
  magnitudeTolerance: Math.max(0, Number(force.magnitudeTolerance ?? 0.1)),
})

const normalizeRubric = (value: FbdRubric | null | undefined): Required<FbdRubric> => ({
  requiredForces: Array.isArray(value?.requiredForces)
    ? value.requiredForces.map((force, idx) => toForce(force, idx))
    : [],
  requiredMoments: Array.isArray(value?.requiredMoments)
    ? value.requiredMoments.map((moment, idx) => ({
        id: moment.id || `moment-${idx + 1}`,
        label: moment.label ?? '',
        direction: moment.direction === 'ccw' ? 'ccw' : 'cw',
        magnitudeRequired: Boolean(moment.magnitudeRequired),
        correctMagnitude: Number(moment.correctMagnitude ?? 1),
        magnitudeTolerance: Math.max(0, Number(moment.magnitudeTolerance ?? 0.1)),
      }))
    : [],
  forbiddenForces: Math.max(0, Number(value?.forbiddenForces ?? 0)),
})

const pointFromAngle = (angle: number, radius: number) => {
  const radians = (angle * Math.PI) / 180
  return {
    x: CENTER + Math.cos(radians) * radius,
    y: CENTER - Math.sin(radians) * radius,
  }
}

const sectorPath = (angle: number, tolerance: number, radius: number) => {
  const start = angle - tolerance
  const end = angle + tolerance
  const startPt = pointFromAngle(start, radius)
  const endPt = pointFromAngle(end, radius)
  const largeArc = tolerance * 2 > 180 ? 1 : 0
  return `M ${CENTER} ${CENTER} L ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArc} 0 ${endPt.x} ${endPt.y} Z`
}

const forceLength = (force: RequiredForce) => {
  if (!force.magnitudeRequired) return 80
  const magnitude = Math.abs(Number(force.correctMagnitude ?? 1))
  return Math.min(140, Math.max(40, magnitude * 20))
}

export function FbdRubricBuilderField() {
  const { value, setValue } = useField<FbdRubric>({ path: 'fbdRubric' })
  const [rubric, setRubric] = useState(() => normalizeRubric(value))
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setValue(rubric)
  }, [rubric, setValue])

  const selectedForce = useMemo(
    () => rubric.requiredForces.find((force) => force.id === selectedId) ?? null,
    [rubric.requiredForces, selectedId],
  )

  const updateForce = (id: string, patch: Partial<RequiredForce>) => {
    setRubric((prev) => ({
      ...prev,
      requiredForces: prev.requiredForces.map((force) => (force.id === id ? { ...force, ...patch } : force)),
    }))
  }

  const deleteSelectedForce = () => {
    if (!selectedId) return
    setRubric((prev) => ({
      ...prev,
      requiredForces: prev.requiredForces.filter((force) => force.id !== selectedId),
    }))
    setSelectedId(null)
  }

  const onCanvasClick: React.MouseEventHandler<SVGSVGElement> = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * CANVAS_SIZE
    const y = ((event.clientY - bounds.top) / bounds.height) * CANVAS_SIZE
    const angle = normalizeAngle((Math.atan2(CENTER - y, x - CENTER) * 180) / Math.PI + 360)
    const nextIndex = rubric.requiredForces.length + 1
    const nextForce: RequiredForce = {
      id: `force-${Date.now()}-${nextIndex}`,
      label: `F${nextIndex}`,
      correctAngle: angle,
      angleTolerance: 15,
      magnitudeRequired: false,
      correctMagnitude: 1,
      magnitudeTolerance: 0.1,
    }
    setRubric((prev) => ({
      ...prev,
      requiredForces: [...prev.requiredForces, nextForce],
    }))
    setSelectedId(nextForce.id)
  }

  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        FBD Rubric Builder
      </div>
      <div style={{ fontSize: 12, color: 'var(--theme-elevation-700)' }}>
        Click on the canvas to place an expected force direction.
      </div>
      <div
        style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 10,
          overflow: 'hidden',
          width: CANVAS_SIZE,
          maxWidth: '100%',
        }}
      >
        <svg
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
          onClick={onCanvasClick}
          style={{ display: 'block', width: '100%', height: 'auto', background: 'var(--theme-elevation-0)' }}
        >
          <rect x={0} y={0} width={CANVAS_SIZE} height={CANVAS_SIZE} fill="var(--theme-elevation-0)" />
          <circle cx={CENTER} cy={CENTER} r={10} fill="#64748b" />
          {rubric.requiredForces.map((force, idx) => {
            const angle = normalizeAngle(Number(force.correctAngle ?? 0))
            const tolerance = Math.max(0, Number(force.angleTolerance ?? 15))
            const length = forceLength(force)
            const end = arrowEnd(CENTER, CENTER, angle, length / 60)
            const isSelected = force.id === selectedId
            const color = isSelected ? '#ef4444' : '#2563eb'
            const arcPath = sectorPath(angle, tolerance, length)
            const theta = Math.atan2(end.y - CENTER, end.x - CENTER)
            const size = 8
            const ax = end.x - size * Math.cos(theta - Math.PI / 6)
            const ay = end.y - size * Math.sin(theta - Math.PI / 6)
            const bx = end.x - size * Math.cos(theta + Math.PI / 6)
            const by = end.y - size * Math.sin(theta + Math.PI / 6)
            return (
              <g
                key={force.id}
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedId(force.id)
                }}
                style={{ cursor: 'pointer' }}
              >
                <path d={arcPath} fill={isSelected ? 'rgba(239,68,68,0.16)' : 'rgba(37,99,235,0.14)'} />
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={end.x}
                  y2={end.y}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <polygon points={`${end.x},${end.y} ${ax},${ay} ${bx},${by}`} fill={color} />
                <circle cx={end.x} cy={end.y} r={5} fill={color} />
                <text x={end.x + 8} y={end.y - 8} fill={color} fontSize={12} fontWeight={600}>
                  {force.label || `F${idx + 1}`}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {selectedForce ? (
        <div
          style={{
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: 8,
            padding: 10,
            display: 'grid',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Selected force</div>
            <button type="button" onClick={deleteSelectedForce} aria-label="Delete selected force">
              ×
            </button>
          </div>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12 }}>Label</span>
            <input
              value={selectedForce.label ?? ''}
              onChange={(event) => updateForce(selectedForce.id, { label: event.target.value })}
            />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12 }}>Correct angle (0-360)</span>
            <input
              type="number"
              min={0}
              max={360}
              value={selectedForce.correctAngle ?? 0}
              onChange={(event) =>
                updateForce(selectedForce.id, { correctAngle: normalizeAngle(Number(event.target.value || 0)) })
              }
            />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 12 }}>Angle tolerance (degrees)</span>
            <input
              type="number"
              min={0}
              value={selectedForce.angleTolerance ?? 15}
              onChange={(event) =>
                updateForce(selectedForce.id, { angleTolerance: Math.max(0, Number(event.target.value || 0)) })
              }
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(selectedForce.magnitudeRequired)}
              onChange={(event) =>
                updateForce(selectedForce.id, {
                  magnitudeRequired: event.target.checked,
                })
              }
            />
            <span style={{ fontSize: 12 }}>Magnitude required</span>
          </label>
          {selectedForce.magnitudeRequired ? (
            <>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12 }}>Correct magnitude</span>
                <input
                  type="number"
                  value={selectedForce.correctMagnitude ?? 1}
                  onChange={(event) =>
                    updateForce(selectedForce.id, { correctMagnitude: Number(event.target.value || 0) })
                  }
                />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12 }}>Magnitude tolerance</span>
                <input
                  type="number"
                  min={0}
                  value={selectedForce.magnitudeTolerance ?? 0.1}
                  onChange={(event) =>
                    updateForce(selectedForce.id, {
                      magnitudeTolerance: Math.max(0, Number(event.target.value || 0)),
                    })
                  }
                />
              </label>
            </>
          ) : null}
        </div>
      ) : null}

      <label style={{ display: 'grid', gap: 4, maxWidth: 180 }}>
        <span style={{ fontSize: 12 }}>Forbidden forces count</span>
        <input
          type="number"
          min={0}
          value={rubric.forbiddenForces}
          onChange={(event) =>
            setRubric((prev) => ({
              ...prev,
              forbiddenForces: Math.max(0, Number(event.target.value || 0)),
            }))
          }
        />
      </label>

      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Required Moments
        </div>
        {(rubric.requiredMoments ?? []).map((moment, index) => (
          <div
            key={moment.id}
            style={{
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: 8,
              padding: 10,
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12 }}>Label</span>
              <input
                value={moment.label ?? ''}
                onChange={(event) =>
                  setRubric((prev) => ({
                    ...prev,
                    requiredMoments: (prev.requiredMoments ?? []).map((entry, idx) =>
                      idx === index ? { ...entry, label: event.target.value } : entry,
                    ),
                  }))
                }
              />
            </div>
            <div style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12 }}>Direction</span>
              <select
                value={moment.direction}
                onChange={(event) =>
                  setRubric((prev) => ({
                    ...prev,
                    requiredMoments: (prev.requiredMoments ?? []).map((entry, idx) =>
                      idx === index
                        ? { ...entry, direction: event.target.value === 'ccw' ? 'ccw' : 'cw' }
                        : entry,
                    ),
                  }))
                }
              >
                <option value="cw">Clockwise</option>
                <option value="ccw">Counter-clockwise</option>
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={Boolean(moment.magnitudeRequired)}
                onChange={(event) =>
                  setRubric((prev) => ({
                    ...prev,
                    requiredMoments: (prev.requiredMoments ?? []).map((entry, idx) =>
                      idx === index ? { ...entry, magnitudeRequired: event.target.checked } : entry,
                    ),
                  }))
                }
              />
              <span style={{ fontSize: 12 }}>Magnitude required</span>
            </label>
            {moment.magnitudeRequired ? (
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12 }}>Correct magnitude</span>
                  <input
                    type="number"
                    value={moment.correctMagnitude ?? 1}
                    onChange={(event) =>
                      setRubric((prev) => ({
                        ...prev,
                        requiredMoments: (prev.requiredMoments ?? []).map((entry, idx) =>
                          idx === index ? { ...entry, correctMagnitude: Number(event.target.value || 0) } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12 }}>Magnitude tolerance</span>
                  <input
                    type="number"
                    min={0}
                    value={moment.magnitudeTolerance ?? 0.1}
                    onChange={(event) =>
                      setRubric((prev) => ({
                        ...prev,
                        requiredMoments: (prev.requiredMoments ?? []).map((entry, idx) =>
                          idx === index
                            ? { ...entry, magnitudeTolerance: Math.max(0, Number(event.target.value || 0)) }
                            : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() =>
                setRubric((prev) => ({
                  ...prev,
                  requiredMoments: (prev.requiredMoments ?? []).filter((_, idx) => idx !== index),
                }))
              }
            >
              Remove moment rubric row
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setRubric((prev) => ({
              ...prev,
              requiredMoments: [
                ...(prev.requiredMoments ?? []),
                {
                  id: `moment-${Date.now()}-${(prev.requiredMoments ?? []).length + 1}`,
                  label: `M${(prev.requiredMoments ?? []).length + 1}`,
                  direction: 'cw',
                  magnitudeRequired: false,
                  correctMagnitude: 1,
                  magnitudeTolerance: 0.1,
                },
              ],
            }))
          }
        >
          Add required moment
        </button>
      </div>
    </div>
  )
}

export default FbdRubricBuilderField
