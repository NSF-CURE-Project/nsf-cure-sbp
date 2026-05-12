'use client'

import React, { useEffect, useState } from 'react'
import { Link } from '@payloadcms/ui'

type ClassLink = {
  id: string
  title: string
  slug?: string | null
  order?: number | null
}

type ClassOrderListProps = {
  title?: string
  showEditLinks?: boolean
  compact?: boolean
  showHint?: boolean
  pendingTitle?: string | null
  pendingOrder?: number | null
  onPendingOrderChange?: (order: number) => void
}

const GripIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="6" cy="3" r="1.25" fill="currentColor" />
    <circle cx="10" cy="3" r="1.25" fill="currentColor" />
    <circle cx="6" cy="8" r="1.25" fill="currentColor" />
    <circle cx="10" cy="8" r="1.25" fill="currentColor" />
    <circle cx="6" cy="13" r="1.25" fill="currentColor" />
    <circle cx="10" cy="13" r="1.25" fill="currentColor" />
  </svg>
)

const baseItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 10,
  background: 'rgba(0, 80, 48, 0.05)',
  border: '1px solid rgba(0, 80, 48, 0.08)',
  color: 'var(--cpp-ink, #0b3d27)',
  transition: 'background-color 150ms ease, border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease',
}

const baseHandleStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid rgba(0, 80, 48, 0.18)',
  background: 'rgba(255, 255, 255, 0.85)',
  cursor: 'grab',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(11, 61, 39, 0.7)',
  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
  flexShrink: 0,
}

export default function ClassOrderList({
  title = 'Reorder Courses',
  showEditLinks = false,
  compact = false,
  showHint = true,
  pendingTitle,
  pendingOrder,
  onPendingOrderChange,
}: ClassOrderListProps) {
  const [classes, setClasses] = useState<ClassLink[]>([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const loadClasses = async () => {
      try {
        const res = await fetch('/api/classes?limit=200&sort=order&sort=title', {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!res.ok) {
          setClasses([])
          return
        }
        const data = (await res.json()) as {
          docs?: ClassLink[]
        }
        setClasses(data.docs ?? [])
      } catch (_error) {
        if (!controller.signal.aborted) {
          setClasses([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setClassesLoading(false)
        }
      }
    }

    loadClasses()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!pendingTitle) {
      if (pendingIndex !== null) {
        setPendingIndex(null)
      }
      return
    }

    const nextIndex = (() => {
      if (!classes.length) return 0
      if (pendingOrder && pendingOrder > 0 && pendingOrder <= classes.length + 1) {
        return pendingOrder - 1
      }
      return classes.length
    })()

    if (pendingIndex !== nextIndex) {
      setPendingIndex(nextIndex)
    }

    const nextOrder = nextIndex + 1
    if (pendingOrder !== nextOrder) {
      onPendingOrderChange?.(nextOrder)
    }
  }, [classes.length, pendingOrder, pendingTitle, onPendingOrderChange, pendingIndex])

  const persistClassOrder = async (nextClasses: ClassLink[]) => {
    if (!nextClasses.length) return
    setIsSavingOrder(true)
    try {
      const updates = nextClasses.map((item, index) => {
        const nextOrder = index + 1
        if (item.order === nextOrder) return null
        return fetch(`/api/classes/${item.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order: nextOrder }),
        })
      })
      await Promise.all(updates.filter(Boolean) as Promise<Response>[])
      setClasses((prev) => prev.map((item, index) => ({ ...item, order: index + 1 })))
    } finally {
      setIsSavingOrder(false)
    }
  }

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return
    if (pendingTitle && draggingId === '__pending__') {
      const items = [...classes]
      const targetIndex = items.findIndex((item) => item.id === targetId)
      if (targetIndex < 0) return
      setPendingIndex(targetIndex)
      onPendingOrderChange?.(targetIndex + 1)
      return
    }
    const current = [...classes]
    const fromIndex = current.findIndex((item) => item.id === draggingId)
    const toIndex = current.findIndex((item) => item.id === targetId)
    if (fromIndex < 0 || toIndex < 0) return
    const [moved] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, moved)
    setClasses(current)
    await persistClassOrder(current)
  }

  const listItems = (() => {
    if (!pendingTitle) return classes
    const index = pendingIndex == null ? classes.length : Math.min(pendingIndex, classes.length)
    const withPending = [...classes]
    withPending.splice(index, 0, {
      id: '__pending__',
      title: pendingTitle,
      slug: null,
    })
    return withPending
  })()

  return (
    <div>
      <style>{`
        .class-order-row { background: rgba(0, 80, 48, 0.05); }
        .class-order-row:hover { background: rgba(0, 80, 48, 0.09); border-color: rgba(0, 80, 48, 0.18); }
        .class-order-row:hover .class-order-handle { color: rgba(11, 61, 39, 1); border-color: rgba(0, 80, 48, 0.32); background: #fff; }
        .class-order-row.is-dragging { opacity: 0.45; transform: scale(0.99); }
        .class-order-row.is-drop-target { box-shadow: inset 0 2px 0 0 rgba(0, 80, 48, 0.55); border-color: rgba(0, 80, 48, 0.35); }
        .class-order-edit { transition: background-color 150ms ease, color 150ms ease; }
        .class-order-edit:hover { background: rgba(0, 80, 48, 0.14); color: #003820; }
        .class-order-handle:active { cursor: grabbing; }
      `}</style>
      <div
        style={{
          fontSize: compact ? 12 : 13,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--cpp-muted, #5b6f66)',
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      {showHint ? (
        <div
          style={{
            fontSize: 12,
            color: 'var(--cpp-muted, #5b6f66)',
            marginTop: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Drag classes to reorder.
          {isSavingOrder ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'rgba(0, 80, 48, 0.12)',
                color: 'var(--cpp-ink, #0b3d27)',
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: '0.04em',
              }}
            >
              Saving…
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? 6 : 8,
          paddingTop: 10,
        }}
      >
        {classesLoading ? (
          <div
            style={{
              fontSize: 13,
              color: 'var(--cpp-muted, #5b6f66)',
              padding: '6px 8px',
            }}
          >
            Loading classes…
          </div>
        ) : listItems.length ? (
          listItems.map((item) => {
            const isPending = item.id === '__pending__'
            const isDragging = draggingId === item.id
            const isDropTarget =
              draggingId !== null && draggingId !== item.id && hoverTargetId === item.id
            const rowClass = [
              'class-order-row',
              isDragging ? 'is-dragging' : '',
              isDropTarget ? 'is-drop-target' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <div
                key={item.id}
                className={rowClass}
                style={{
                  ...baseItemStyle,
                  padding: compact ? '8px 10px' : baseItemStyle.padding,
                  fontSize: compact ? 13 : 14,
                  ...(isPending
                    ? {
                        border: '1px dashed rgba(180, 120, 0, 0.42)',
                        background: 'rgba(255, 184, 28, 0.07)',
                      }
                    : {}),
                }}
                draggable={!pendingTitle || isPending}
                onDragStart={() => setDraggingId(item.id)}
                onDragEnd={() => {
                  setDraggingId(null)
                  setHoverTargetId(null)
                }}
                onDragEnter={() => setHoverTargetId(item.id)}
                onDragLeave={(event) => {
                  if (event.currentTarget === event.target) {
                    setHoverTargetId((current) => (current === item.id ? null : current))
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  setHoverTargetId(null)
                  handleDrop(item.id)
                }}
              >
                <span
                  className="class-order-handle"
                  style={{
                    ...baseHandleStyle,
                    width: compact ? 26 : baseHandleStyle.width,
                    height: compact ? 26 : baseHandleStyle.height,
                    cursor: !pendingTitle || isPending ? baseHandleStyle.cursor : 'not-allowed',
                  }}
                  aria-label="Drag handle"
                >
                  <GripIcon size={compact ? 12 : 14} />
                </span>
                <span style={{ flex: 1, fontWeight: 600, minWidth: 0 }}>
                  {item.title || item.slug || 'Untitled Class'}
                </span>
                {isPending ? (
                  <span
                    style={{
                      fontSize: 11,
                      color: '#8a5a00',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      background: 'rgba(255, 184, 28, 0.18)',
                      border: '1px solid rgba(180, 120, 0, 0.32)',
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    Not saved
                  </span>
                ) : showEditLinks ? (
                  <Link
                    className="class-order-edit"
                    href={`/admin/collections/classes/${item.id}`}
                    style={{
                      display: 'block',
                      padding: compact ? '4px 10px' : '6px 12px',
                      borderRadius: 8,
                      background: 'rgba(0, 80, 48, 0.08)',
                      color: 'var(--cpp-ink, #0b3d27)',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: compact ? 12 : 13,
                    }}
                  >
                    Edit
                  </Link>
                ) : null}
              </div>
            )
          })
        ) : (
          <div
            style={{
              fontSize: 13,
              color: 'var(--cpp-muted, #5b6f66)',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px dashed rgba(0, 80, 48, 0.22)',
              background: 'rgba(0, 80, 48, 0.03)',
              textAlign: 'center',
            }}
          >
            No classes yet. Add the first course above.
          </div>
        )}
      </div>
    </div>
  )
}
