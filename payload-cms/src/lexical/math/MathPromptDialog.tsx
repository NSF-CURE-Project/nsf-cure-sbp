'use client'

import React, { useEffect, useRef, useState } from 'react'

type MathPromptDialogProps = {
  open: boolean
  defaultValue: string
  onSubmit: (latex: string) => void
  onCancel: () => void
}

// Inline LaTeX prompt — replaces `window.prompt(...)` so the editor's math
// insertion uses the same dialog surface as the rest of the admin instead
// of a raw browser prompt.
//
// Pattern matches ConfirmDialog: imperative-feeling API at the call site
// (via openMathPrompt), but rendered through React state in MathFeatureClient.
export default function MathPromptDialog({
  open,
  defaultValue,
  onSubmit,
  onCancel,
}: MathPromptDialogProps) {
  const [value, setValue] = useState(defaultValue)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Reset content whenever the dialog opens against a new selection.
  useEffect(() => {
    if (!open) return
    setValue(defaultValue)
    const previous =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null
    // Defer focus so the textarea renders before we focus + select.
    const handle = window.setTimeout(() => {
      const node = textareaRef.current
      if (!node) return
      node.focus()
      node.select()
    }, 0)
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKey, true)
    return () => {
      window.clearTimeout(handle)
      document.removeEventListener('keydown', handleKey, true)
      previous?.focus?.()
    }
  }, [open, defaultValue, onCancel])

  if (!open) return null

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="math-prompt-title"
      aria-describedby="math-prompt-hint"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        padding: 24,
        animation: 'math-prompt-fade 120ms ease-out',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <style>{`
        @keyframes math-prompt-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes math-prompt-pop { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow:
            '0 24px 60px rgba(15, 23, 42, 0.18), 0 8px 16px rgba(15, 23, 42, 0.12)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          padding: '20px 22px 18px',
          display: 'grid',
          gap: 12,
          animation: 'math-prompt-pop 140ms ease-out',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: 'rgba(31, 69, 120, 0.10)',
              color: '#1f4578',
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: '0.04em',
            }}
          >
            TeX
          </span>
          <div style={{ minWidth: 0, display: 'grid', gap: 4 }}>
            <h2
              id="math-prompt-title"
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 800,
                color: 'var(--cpp-ink, #0b3d27)',
                letterSpacing: '-0.01em',
              }}
            >
              Insert math
            </h2>
            <p
              id="math-prompt-hint"
              style={{
                margin: 0,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: 'var(--cpp-muted, #5b6f66)',
              }}
            >
              Wrap with <code>$…$</code> for inline math or <code>$$…$$</code> for a
              display block. Backslash-escaped TeX is fine.
            </p>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // Cmd/Ctrl + Enter inserts; plain Enter is allowed for line breaks.
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="e.g. $E = mc^2$  or  $$\\int_0^1 x^2 \\, dx$$"
          rows={4}
          spellCheck={false}
          style={{
            width: '100%',
            resize: 'vertical',
            minHeight: 96,
            padding: '10px 12px',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Roboto Mono", Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--cpp-ink, #0b3d27)',
            background: '#fbfdfc',
            border: '1px solid rgba(15, 23, 42, 0.12)',
            borderRadius: 10,
            outline: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            paddingTop: 2,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--cpp-muted, #5b6f66)' }}>
            ⌘/Ctrl + Enter to insert
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '9px 16px',
                borderRadius: 10,
                border: '1px solid rgba(15, 23, 42, 0.12)',
                background: '#ffffff',
                color: 'var(--cpp-ink, #0b3d27)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim()}
              style={{
                padding: '9px 18px',
                borderRadius: 10,
                border: '1px solid rgba(31, 69, 120, 0.45)',
                background: '#1f4578',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                cursor: value.trim() ? 'pointer' : 'not-allowed',
                opacity: value.trim() ? 1 : 0.6,
                boxShadow: '0 6px 16px rgba(31, 69, 120, 0.28)',
              }}
            >
              Insert math
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
