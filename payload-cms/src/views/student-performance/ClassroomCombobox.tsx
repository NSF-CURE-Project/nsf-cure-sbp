'use client'

import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { StudentPerformanceClassroomOption } from '../../utils/studentPerformance'

const ALL_OPTION: StudentPerformanceClassroomOption = { id: 'all', title: 'All classrooms' }

type Props = {
  value: string
  options: StudentPerformanceClassroomOption[]
  onChange: (value: string) => void
  disabled?: boolean
}

export const ClassroomCombobox = ({ value, options, onChange, disabled = false }: Props) => {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const allOptions = useMemo(() => [ALL_OPTION, ...options], [options])

  const selected =
    allOptions.find((option) => option.id === value) ?? ALL_OPTION

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return allOptions
    return allOptions.filter((option) => option.title.toLowerCase().includes(trimmed))
  }, [query, allOptions])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open) {
      setActiveIndex(0)
      itemRefs.current = []
    } else {
      setQuery('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const node = itemRefs.current[activeIndex]
    node?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const commit = (option: StudentPerformanceClassroomOption) => {
    onChange(option.id)
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) setOpen(true)
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) setOpen(true)
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (event.key === 'Enter') {
      if (!open) return
      event.preventDefault()
      const option = filtered[activeIndex]
      if (option) commit(option)
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault()
        setOpen(false)
      }
    } else if (event.key === 'Home') {
      if (open) {
        event.preventDefault()
        setActiveIndex(0)
      }
    } else if (event.key === 'End') {
      if (open) {
        event.preventDefault()
        setActiveIndex(Math.max(0, filtered.length - 1))
      }
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', minWidth: 200 }}
      aria-disabled={disabled || undefined}
    >
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '4px 8px 4px 10px',
          borderRadius: 8,
          border: `1px solid ${open ? 'rgba(21,83,207,0.45)' : 'var(--admin-surface-border)'}`,
          background: disabled ? 'var(--admin-panel-bg-muted)' : 'var(--admin-panel-bg)',
          boxShadow: open ? '0 0 0 3px rgba(21,83,207,0.12)' : 'none',
          transition: 'box-shadow 120ms ease, border-color 120ms ease',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.65 : 1,
        }}
        onClick={() => {
          if (disabled) return
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[activeIndex] ? `${listboxId}-${filtered[activeIndex].id}` : undefined}
          value={open ? query : selected.title}
          placeholder={selected.title}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => {
            if (!disabled) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--cpp-ink)',
            padding: '2px 0',
          }}
        />
        {value !== 'all' && !disabled ? (
          <button
            type="button"
            aria-label="Clear cohort filter"
            onMouseDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onChange('all')
              setOpen(false)
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 900,
              color: 'var(--cpp-muted)',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        ) : null}
        <span aria-hidden style={{ fontSize: 10, color: 'var(--cpp-muted)', marginLeft: 2 }}>
          {open ? '▴' : '▾'}
        </span>
      </div>

      {open && !disabled ? (
        <ul
          id={listboxId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 30,
            margin: 0,
            padding: 4,
            listStyle: 'none',
            background: 'var(--admin-panel-bg)',
            border: '1px solid var(--admin-surface-border)',
            borderRadius: 10,
            boxShadow: '0 10px 28px rgba(18, 65, 147, 0.14)',
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {filtered.length === 0 ? (
            <li
              style={{
                padding: '8px 10px',
                fontSize: 12,
                color: 'var(--cpp-muted)',
                textAlign: 'center',
              }}
            >
              No classrooms match “{query.trim()}”
            </li>
          ) : (
            filtered.map((option, index) => {
              const isActive = index === activeIndex
              const isSelected = option.id === value
              return (
                <li
                  key={option.id}
                  id={`${listboxId}-${option.id}`}
                  role="option"
                  aria-selected={isSelected}
                  ref={(node) => {
                    itemRefs.current[index] = node
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    commit(option)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '7px 10px',
                    fontSize: 12.5,
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: isSelected ? '#1553cf' : 'var(--cpp-ink)',
                    fontWeight: isSelected ? 800 : 600,
                    background: isActive
                      ? 'rgba(21, 83, 207, 0.10)'
                      : isSelected
                        ? 'rgba(21, 83, 207, 0.04)'
                        : 'transparent',
                  }}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {option.title}
                  </span>
                  {isSelected ? <span aria-hidden style={{ fontSize: 11, color: '#1553cf' }}>✓</span> : null}
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}
