'use client'

import React, { useEffect, useRef } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null
    confirmRef.current?.focus()

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        event.stopPropagation()
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKey, true)
    return () => {
      document.removeEventListener('keydown', handleKey, true)
      previouslyFocused?.focus?.()
    }
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
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
        animation: 'confirm-dialog-fade 120ms ease-out',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onCancel()
        }
      }}
    >
      <style>{`
        @keyframes confirm-dialog-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes confirm-dialog-pop { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow:
            '0 24px 60px rgba(15, 23, 42, 0.18), 0 8px 16px rgba(15, 23, 42, 0.12)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          padding: '22px 24px 20px',
          display: 'grid',
          gap: 14,
          animation: 'confirm-dialog-pop 140ms ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: destructive ? 'rgba(220, 38, 38, 0.12)' : 'rgba(31, 69, 120, 0.10)',
              color: destructive ? '#b91c1c' : '#1f4578',
            }}
            aria-hidden="true"
          >
            {destructive ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 7v4M10 14v.01M3.4 16.5h13.2c1.2 0 2-1.3 1.4-2.4l-6.6-11a1.7 1.7 0 0 0-2.8 0L2 14.1c-.6 1.1.2 2.4 1.4 2.4Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="7.25"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M10 6.5v4.5M10 13.5v.01"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
          <div style={{ minWidth: 0, display: 'grid', gap: 6 }}>
            <h2
              id="confirm-dialog-title"
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 800,
                color: 'var(--cpp-ink, #0b3d27)',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-message"
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.55,
                color: 'var(--cpp-muted, #5b6f66)',
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            paddingTop: 4,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              padding: '9px 16px',
              borderRadius: 10,
              border: '1px solid rgba(15, 23, 42, 0.12)',
              background: '#ffffff',
              color: 'var(--cpp-ink, #0b3d27)',
              fontWeight: 700,
              fontSize: 13,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
              transition: 'background-color 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={(event) => {
              if (busy) return
              event.currentTarget.style.background = 'rgba(248, 250, 252, 1)'
              event.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.22)'
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = '#ffffff'
              event.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.12)'
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              border: destructive
                ? '1px solid rgba(185, 28, 28, 0.55)'
                : '1px solid rgba(31, 69, 120, 0.45)',
              background: destructive ? '#dc2626' : '#1f4578',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.7 : 1,
              boxShadow: destructive
                ? '0 6px 16px rgba(220, 38, 38, 0.28)'
                : '0 6px 16px rgba(31, 69, 120, 0.28)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
            }}
            onMouseEnter={(event) => {
              if (busy) return
              event.currentTarget.style.transform = 'translateY(-1px)'
              event.currentTarget.style.background = destructive ? '#b91c1c' : '#18365d'
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'translateY(0)'
              event.currentTarget.style.background = destructive ? '#dc2626' : '#1f4578'
            }}
          >
            {busy ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
                Working…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
