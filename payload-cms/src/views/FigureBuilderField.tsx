'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'

type FigureType = 'fbd' | 'truss' | 'beam' | 'moment-diagram'

export type Force = {
  id: string
  label: string
  origin: [number, number]
  angle: number
  magnitude: number
  color?: string
}

export type FBDData = {
  type: 'fbd'
  body: {
    shape: 'rect' | 'circle' | 'polygon'
    label?: string
    x: number
    y: number
    width?: number
    height?: number
    radius?: number
    points?: [number, number][]
  }
  forces: Force[]
}

export type TrussData = {
  type: 'truss'
  nodes: { id: string; x: number; y: number; support?: 'pin' | 'roller' | 'fixed' | null }[]
  members: { from: string; to: string; id?: string }[]
  loads: { node: string; angle: number; magnitude: number; label?: string }[]
}

export type BeamData = {
  type: 'beam'
  length: number
  scale: number
  supports: { x: number; type: 'pin' | 'roller' | 'fixed' }[]
  distributedLoads?: { xStart: number; xEnd: number; wStart: number; wEnd: number; label?: string }[]
  pointLoads?: { x: number; magnitude: number; angle: number; label?: string }[]
  moments?: { x: number; value: number; label?: string }[]
  dimensions?: boolean
}

export type MomentDiagramData = {
  type: 'moment-diagram'
  length: number
  scale: number
  yScale: number
  points: { x: number; M: number }[]
  labels?: { x: number; label: string }[]
}

export type FigureData = FBDData | TrussData | BeamData | MomentDiagramData
type TemplateDoc = {
  id: string | number
  title?: string
  type?: FigureType
  figureData?: FigureData
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
export const arrowEnd = (x: number, y: number, angleDeg: number, magnitude = 1) => {
  const length = 60 * magnitude
  const radians = toRadians(angleDeg)
  return {
    x: x + Math.cos(radians) * length,
    y: y - Math.sin(radians) * length,
  }
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = '#ef4444',
  label,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  label?: string
}) {
  const theta = Math.atan2(y2 - y1, x2 - x1)
  const size = 7
  const ax = x2 - size * Math.cos(theta - Math.PI / 6)
  const ay = y2 - size * Math.sin(theta - Math.PI / 6)
  const bx = x2 - size * Math.cos(theta + Math.PI / 6)
  const by = y2 - size * Math.sin(theta + Math.PI / 6)

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} fill={color} />
      {label ? (
        <text x={x2 + 5} y={y2 - 6} fill={color} fontSize={11}>
          {label}
        </text>
      ) : null}
    </g>
  )
}

export function SVGCanvas({ value }: { value: FigureData | null }) {
  const figure = value as FigureData | null
  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 10,
        background: 'var(--theme-elevation-0)',
        padding: 8,
      }}
    >
      <svg viewBox="0 0 680 420" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {!figure || typeof figure !== 'object' || !('type' in figure) ? null : figure.type === 'fbd' ? (
          <>
            {figure.body?.shape === 'circle' ? (
              <circle cx={figure.body.x} cy={figure.body.y} r={figure.body.radius ?? 30} fill="#f8fafc" stroke="#334155" />
            ) : (
              <rect
                x={figure.body.x}
                y={figure.body.y}
                width={figure.body.width ?? 100}
                height={figure.body.height ?? 60}
                fill="#f8fafc"
                stroke="#334155"
              />
            )}
            {(figure.forces ?? []).map((force, idx) => {
              const end = arrowEnd(force.origin[0], force.origin[1], force.angle, force.magnitude)
              return (
                <Arrow
                  key={`${force.id}-${idx}`}
                  x1={force.origin[0]}
                  y1={force.origin[1]}
                  x2={end.x}
                  y2={end.y}
                  color={force.color}
                  label={force.label}
                />
              )
            })}
          </>
        ) : figure.type === 'truss' ? (
          <>
            {figure.members?.map((member, idx) => {
              const from = figure.nodes.find((node) => node.id === member.from)
              const to = figure.nodes.find((node) => node.id === member.to)
              if (!from || !to) return null
              return (
                <line
                  key={`m-${idx}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#334155"
                  strokeWidth={2}
                />
              )
            })}
            {figure.nodes?.map((node) => (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r={4} fill="#2563eb" />
                <text x={node.x + 5} y={node.y - 5} fontSize={11}>
                  {node.id}
                </text>
              </g>
            ))}
            {figure.loads?.map((load, idx) => {
              const node = figure.nodes.find((item) => item.id === load.node)
              if (!node) return null
              const end = arrowEnd(node.x, node.y, load.angle, Math.max(0.3, load.magnitude / 10))
              return (
                <Arrow
                  key={`l-${idx}`}
                  x1={node.x}
                  y1={node.y}
                  x2={end.x}
                  y2={end.y}
                  label={load.label}
                />
              )
            })}
          </>
        ) : figure.type === 'beam' ? (
          <>
            <line x1={60} y1={200} x2={60 + figure.length * figure.scale} y2={200} stroke="#334155" strokeWidth={4} />
            {(figure.supports ?? []).map((support, idx) => {
              const x = 60 + support.x * figure.scale
              return (
                <polygon
                  key={`s-${idx}`}
                  points={`${x - 10},224 ${x + 10},224 ${x},204`}
                  fill="#94a3b8"
                  stroke="#334155"
                />
              )
            })}
            {(figure.pointLoads ?? []).map((load, idx) => {
              const x = 60 + load.x * figure.scale
              const end = arrowEnd(x, 130, load.angle, Math.max(0.35, load.magnitude / 20))
              return <Arrow key={`p-${idx}`} x1={x} y1={130} x2={end.x} y2={end.y} label={load.label} />
            })}
            {(figure.distributedLoads ?? []).map((load, idx) => {
              const xStart = 60 + load.xStart * figure.scale
              const xEnd = 60 + load.xEnd * figure.scale
              const arrowCount = Math.max(2, Math.round((xEnd - xStart) / 20))
              const arrowY = 150
              return (
                <g key={`d-${idx}`}>
                  <line x1={xStart} y1={arrowY - 20} x2={xEnd} y2={arrowY - 20} stroke="#ef4444" strokeWidth={1.5} />
                  {Array.from({ length: arrowCount }, (_, i) => {
                    const x = xStart + (i / (arrowCount - 1)) * (xEnd - xStart)
                    return <Arrow key={`da-${idx}-${i}`} x1={x} y1={arrowY - 20} x2={x} y2={arrowY} />
                  })}
                  {load.label ? (
                    <text x={(xStart + xEnd) / 2} y={arrowY - 28} textAnchor="middle" fill="#ef4444" fontSize={11}>
                      {load.label}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </>
        ) : figure.type === 'moment-diagram' ? (
          <>
            {(() => {
              const left = 60
              const baseY = 300
              const pts = (figure.points ?? []).map((point) => ({
                x: left + point.x * figure.scale,
                y: baseY - point.M * figure.yScale,
              }))
              const polygon = [
                `${left},${baseY}`,
                ...pts.map((point) => `${point.x},${point.y}`),
                `${left + figure.length * figure.scale},${baseY}`,
              ].join(' ')

              return (
                <>
                  <line x1={left} y1={baseY} x2={left + figure.length * figure.scale} y2={baseY} stroke="#334155" />
                  <polyline points={pts.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#1d4ed8" strokeWidth={2} />
                  <polygon points={polygon} fill="rgba(59,130,246,0.15)" />
                  {(figure.labels ?? []).map((label, idx) => (
                    <text key={`ml-${idx}`} x={left + label.x * figure.scale + 6} y={baseY - 8} fill="#0f172a" fontSize={11}>
                      {label.label}
                    </text>
                  ))}
                </>
              )
            })()}
          </>
        ) : null}
      </svg>
    </div>
  )
}

function ToolPalette({
  type,
  onAdd,
}: {
  type: FigureType | null
  onAdd: (tool: 'force' | 'node' | 'member' | 'point-load' | 'support') => void
}) {
  if (!type) return null

  const buttons =
    type === 'fbd'
      ? [{ id: 'force' as const, label: 'Add Force' }]
      : type === 'truss'
        ? [
            { id: 'node' as const, label: 'Add Node' },
            { id: 'member' as const, label: 'Add Member' },
          ]
        : [
            { id: 'support' as const, label: 'Add Support' },
            { id: 'point-load' as const, label: 'Add Point Load' },
          ]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          onClick={() => onAdd(button.id)}
          style={{
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: 8,
            padding: '6px 10px',
            background: 'var(--theme-elevation-0)',
            cursor: 'pointer',
          }}
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}

function PropertiesPanel({
  width,
  height,
  setWidth,
  setHeight,
}: {
  width: number
  height: number
  setWidth: (value: number) => void
  setHeight: (value: number) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Properties
      </div>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Width</span>
        <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 600)} />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Height</span>
        <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 400)} />
      </label>
    </div>
  )
}

function FBDBuilder({
  value,
  onChange,
}: {
  value: FBDData
  onChange: (next: FBDData) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Body label</span>
        <input
          value={value.body.label ?? ''}
          onChange={(e) => onChange({ ...value, body: { ...value.body, label: e.target.value } })}
        />
      </label>
    </div>
  )
}

function TrussBuilder({
  value,
  onChange,
}: {
  value: TrussData
  onChange: (next: TrussData) => void
}) {
  return (
    <div style={{ fontSize: 12, color: 'var(--theme-text)' }}>
      Nodes: {value.nodes.length} • Members: {value.members.length} • Loads: {value.loads.length}
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              loads: [...value.loads, { node: value.nodes[0]?.id ?? 'A', angle: 270, magnitude: 10, label: 'P' }],
            })
          }
        >
          Add Load
        </button>
      </div>
    </div>
  )
}

function BeamBuilder({
  value,
  onChange,
}: {
  value: BeamData
  onChange: (next: BeamData) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Beam length</span>
        <input
          type="number"
          value={value.length}
          onChange={(e) => onChange({ ...value, length: Number(e.target.value) || 1 })}
        />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Scale</span>
        <input
          type="number"
          value={value.scale}
          onChange={(e) => onChange({ ...value, scale: Number(e.target.value) || 40 })}
        />
      </label>
      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Distributed Loads</div>
        {(value.distributedLoads ?? []).map((load, index) => (
          <div
            key={`dl-${index}`}
            style={{
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 8,
              padding: 8,
              display: 'grid',
              gap: 6,
            }}
          >
            <div style={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 11 }}>xStart</span>
                <input
                  type="number"
                  value={load.xStart}
                  onChange={(e) => {
                    const next = [...(value.distributedLoads ?? [])]
                    next[index] = { ...load, xStart: Number(e.target.value) || 0 }
                    onChange({ ...value, distributedLoads: next })
                  }}
                />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 11 }}>xEnd</span>
                <input
                  type="number"
                  value={load.xEnd}
                  onChange={(e) => {
                    const next = [...(value.distributedLoads ?? [])]
                    next[index] = { ...load, xEnd: Number(e.target.value) || 0 }
                    onChange({ ...value, distributedLoads: next })
                  }}
                />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 11 }}>wStart</span>
                <input
                  type="number"
                  value={load.wStart}
                  onChange={(e) => {
                    const next = [...(value.distributedLoads ?? [])]
                    next[index] = { ...load, wStart: Number(e.target.value) || 0 }
                    onChange({ ...value, distributedLoads: next })
                  }}
                />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 11 }}>wEnd</span>
                <input
                  type="number"
                  value={load.wEnd}
                  onChange={(e) => {
                    const next = [...(value.distributedLoads ?? [])]
                    next[index] = { ...load, wEnd: Number(e.target.value) || 0 }
                    onChange({ ...value, distributedLoads: next })
                  }}
                />
              </label>
            </div>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 11 }}>Label</span>
              <input
                value={load.label ?? ''}
                onChange={(e) => {
                  const next = [...(value.distributedLoads ?? [])]
                  next[index] = { ...load, label: e.target.value }
                  onChange({ ...value, distributedLoads: next })
                }}
              />
            </label>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  distributedLoads: (value.distributedLoads ?? []).filter((_, idx) => idx !== index),
                })
              }
            >
              Remove distributed load
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              distributedLoads: [
                ...(value.distributedLoads ?? []),
                { xStart: 0, xEnd: value.length, wStart: 1, wEnd: 1, label: 'w' },
              ],
            })
          }
        >
          Add distributed load
        </button>
      </div>
    </div>
  )
}

function MomentDiagramBuilder({
  value,
  onChange,
}: {
  value: MomentDiagramData
  onChange: (next: MomentDiagramData) => void
}) {
  const ensurePoints = (points: { x: number; M: number }[], length: number) => {
    const next = [...points]
    if (!next.length) {
      return [{ x: 0, M: 0 }, { x: length, M: 0 }]
    }
    if (next.length === 1) {
      return [next[0], { x: length, M: 0 }]
    }
    return next
  }

  const points = ensurePoints(value.points ?? [], value.length)
  const labels = value.labels ?? []
  const left = 40
  const baseY = 170
  const plotPts = points.map((point) => ({
    x: left + point.x * value.scale,
    y: baseY - point.M * value.yScale,
  }))
  const polyline = plotPts.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Span length (m)</span>
        <input
          type="number"
          value={value.length}
          onChange={(e) => onChange({ ...value, length: Number(e.target.value) || 1 })}
        />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Scale (px / m)</span>
        <input
          type="number"
          value={value.scale}
          onChange={(e) => onChange({ ...value, scale: Number(e.target.value) || 70 })}
        />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 12 }}>Y Scale (px / kN·m)</span>
        <input
          type="number"
          value={value.yScale}
          onChange={(e) => onChange({ ...value, yScale: Number(e.target.value) || 20 })}
        />
      </label>

      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Points</div>
        {points.map((point, index) => (
          <div key={`point-${index}`} style={{ display: 'grid', gap: 6, gridTemplateColumns: '1fr 1fr auto' }}>
            <input
              type="number"
              value={point.x}
              onChange={(e) => {
                const next = [...points]
                next[index] = { ...point, x: Number(e.target.value) || 0 }
                onChange({ ...value, points: next })
              }}
            />
            <input
              type="number"
              value={point.M}
              onChange={(e) => {
                const next = [...points]
                next[index] = { ...point, M: Number(e.target.value) || 0 }
                onChange({ ...value, points: next })
              }}
            />
            <button
              type="button"
              disabled={points.length <= 2}
              onClick={() => {
                if (points.length <= 2) return
                onChange({ ...value, points: points.filter((_, idx) => idx !== index) })
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              points: [...points, { x: Number((value.length / 2).toFixed(2)), M: 0 }],
            })
          }
        >
          Add point
        </button>
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Labels</div>
        {labels.map((label, index) => (
          <div key={`label-${index}`} style={{ display: 'grid', gap: 6, gridTemplateColumns: '1fr 2fr auto' }}>
            <input
              type="number"
              value={label.x}
              onChange={(e) => {
                const next = [...labels]
                next[index] = { ...label, x: Number(e.target.value) || 0 }
                onChange({ ...value, labels: next })
              }}
            />
            <input
              value={label.label}
              onChange={(e) => {
                const next = [...labels]
                next[index] = { ...label, label: e.target.value }
                onChange({ ...value, labels: next })
              }}
            />
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  labels: labels.filter((_, idx) => idx !== index),
                })
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              labels: [...labels, { x: Number((value.length / 2).toFixed(2)), label: 'Peak' }],
            })
          }
        >
          Add label
        </button>
      </div>

      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 8,
          padding: 8,
          background: 'var(--theme-elevation-0)',
        }}
      >
        <svg viewBox="0 0 520 220" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <line x1={left} y1={baseY} x2={left + value.length * value.scale} y2={baseY} stroke="#334155" />
          <polyline points={polyline} fill="none" stroke="#1d4ed8" strokeWidth={2} />
          {labels.map((label, idx) => (
            <text key={`preview-label-${idx}`} x={left + label.x * value.scale + 5} y={baseY - 8} fill="#0f172a" fontSize={11}>
              {label.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

const defaultFigureData = (type: FigureType | null): FigureData | null => {
  if (type === 'fbd') {
    return {
      type: 'fbd',
      body: { shape: 'rect', x: 220, y: 160, width: 110, height: 64, label: 'Body' },
      forces: [],
    }
  }
  if (type === 'truss') {
    return {
      type: 'truss',
      nodes: [
        { id: 'A', x: 180, y: 280, support: 'pin' },
        { id: 'B', x: 440, y: 280, support: 'roller' },
        { id: 'C', x: 310, y: 150 },
      ],
      members: [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'C' },
      ],
      loads: [],
    }
  }
  if (type === 'beam') {
    return {
      type: 'beam',
      length: 6,
      scale: 70,
      supports: [
        { x: 0, type: 'pin' },
        { x: 6, type: 'roller' },
      ],
      pointLoads: [],
      distributedLoads: [],
      moments: [],
      dimensions: true,
    }
  }
  if (type === 'moment-diagram') {
    return { type: 'moment-diagram', length: 6, scale: 70, yScale: 20, points: [{ x: 0, M: 0 }, { x: 6, M: 0 }] }
  }
  return null
}

export default function FigureBuilderField() {
  const { value: typeValue } = useField<FigureType | null>({ path: 'type' })
  const { value, setValue } = useField<FigureData | null>({ path: 'figureData' })
  const { value: widthValue, setValue: setWidthValue } = useField<number>({ path: 'width' })
  const { value: heightValue, setValue: setHeightValue } = useField<number>({ path: 'height' })
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [templates, setTemplates] = useState<TemplateDoc[]>([])

  const type = typeValue ?? null
  const figureData = useMemo(() => {
    if (value && typeof value === 'object' && 'type' in value) return value
    return defaultFigureData(type)
  }, [type, value])

  const setFigureData = (next: FigureData | null) => {
    if (!next) return
    setValue(next)
  }

  useEffect(() => {
    if (!type) return
    const missingFigureData = !value || typeof value !== 'object' || !('type' in value)
    if (missingFigureData) {
      setShowTemplateGallery(true)
    }
  }, [type, value])

  useEffect(() => {
    if (!showTemplateGallery || !type) return
    const controller = new AbortController()
    const loadTemplates = async () => {
      setLoadingTemplates(true)
      try {
        const params = new URLSearchParams()
        params.set('limit', '50')
        params.set('depth', '0')
        params.set('where[isTemplate][equals]', 'true')
        params.set('where[type][equals]', type)
        const res = await fetch(`/api/engineering-figures?${params.toString()}`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!res.ok) {
          setTemplates([])
          return
        }
        const data = (await res.json()) as { docs?: TemplateDoc[] }
        setTemplates(Array.isArray(data.docs) ? data.docs : [])
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTemplates(false)
        }
      }
    }

    void loadTemplates()
    return () => controller.abort()
  }, [showTemplateGallery, type])

  const onAdd = (tool: 'force' | 'node' | 'member' | 'point-load' | 'support') => {
    if (!figureData || !type) return
    if (tool === 'force' && figureData.type === 'fbd') {
      const idx = figureData.forces.length + 1
      setFigureData({
        ...figureData,
        forces: [
          ...figureData.forces,
          {
            id: `F${idx}`,
            label: `F_${idx}`,
            origin: [280, 200],
            angle: 0,
            magnitude: 1,
          },
        ],
      })
      return
    }
    if (tool === 'node' && figureData.type === 'truss') {
      const idx = figureData.nodes.length + 1
      setFigureData({
        ...figureData,
        nodes: [...figureData.nodes, { id: `N${idx}`, x: 260 + idx * 20, y: 230 }],
      })
      return
    }
    if (tool === 'member' && figureData.type === 'truss' && figureData.nodes.length >= 2) {
      const a = figureData.nodes[figureData.nodes.length - 2]
      const b = figureData.nodes[figureData.nodes.length - 1]
      setFigureData({
        ...figureData,
        members: [...figureData.members, { from: a.id, to: b.id }],
      })
      return
    }
    if (tool === 'support' && figureData.type === 'beam') {
      setFigureData({
        ...figureData,
        supports: [...figureData.supports, { x: Math.max(0, figureData.length / 2), type: 'roller' }],
      })
      return
    }
    if (tool === 'point-load' && figureData.type === 'beam') {
      setFigureData({
        ...figureData,
        pointLoads: [
          ...(figureData.pointLoads ?? []),
          { x: Math.max(0, figureData.length / 2), magnitude: 10, angle: 270, label: 'P' },
        ],
      })
    }
  }

  return (
    <div style={{ marginTop: 14, display: 'grid', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          fontWeight: 700,
        }}
      >
        <span>Figure Builder</span>
        {type ? (
          <button type="button" onClick={() => setShowTemplateGallery(true)}>
            Change template
          </button>
        ) : null}
      </div>
      {!type ? (
        <div style={{ fontSize: 13, color: 'var(--theme-elevation-700)' }}>
          Select a figure type before editing figure data.
        </div>
      ) : (
        <>
          {showTemplateGallery ? (
            <div
              style={{
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: 10,
                background: 'var(--theme-elevation-0)',
                padding: 12,
                display: 'grid',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>Template Gallery ({type})</div>
              {loadingTemplates ? <div style={{ fontSize: 12 }}>Loading templates...</div> : null}
              {!loadingTemplates ? (
                <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {templates.map((template) => (
                    <button
                      key={String(template.id)}
                      type="button"
                      onClick={() => {
                        if (template.figureData) {
                          setFigureData(JSON.parse(JSON.stringify(template.figureData)) as FigureData)
                        }
                        setShowTemplateGallery(false)
                      }}
                      style={{
                        border: '1px solid var(--theme-elevation-200)',
                        borderRadius: 8,
                        background: 'var(--theme-elevation-50)',
                        padding: 8,
                        textAlign: 'left',
                        display: 'grid',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{template.title ?? 'Template'}</div>
                      <div style={{ maxHeight: 100, overflow: 'hidden' }}>
                        <SVGCanvas value={template.figureData ?? null} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setFigureData(defaultFigureData(type))
                    setShowTemplateGallery(false)
                  }}
                >
                  Start from scratch
                </button>
                <button type="button" onClick={() => setShowTemplateGallery(false)}>
                  Close
                </button>
              </div>
            </div>
          ) : null}
          <ToolPalette type={type} onAdd={onAdd} />
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '2fr 1fr' }}>
            <SVGCanvas value={figureData} />
            <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <PropertiesPanel
                width={typeof widthValue === 'number' ? widthValue : 600}
                height={typeof heightValue === 'number' ? heightValue : 400}
                setWidth={setWidthValue}
                setHeight={setHeightValue}
              />
              {figureData?.type === 'fbd' ? (
                <FBDBuilder value={figureData} onChange={setFigureData} />
              ) : figureData?.type === 'truss' ? (
                <TrussBuilder value={figureData} onChange={setFigureData} />
              ) : figureData?.type === 'beam' ? (
                <BeamBuilder value={figureData} onChange={setFigureData} />
              ) : figureData?.type === 'moment-diagram' ? (
                <MomentDiagramBuilder value={figureData} onChange={setFigureData} />
              ) : null}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--theme-elevation-650)' }}>
            Figure data is updated from the visual controls above.
          </div>
        </>
      )}
    </div>
  )
}
