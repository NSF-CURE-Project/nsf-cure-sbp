'use client'

import React, { useEffect, useState } from 'react'

type ToastTone = 'success' | 'info' | 'error'

type ToastProps = {
  open: boolean
  title: string
  description?: string
  tone?: ToastTone
  // Auto-dismiss after this many ms. Default 4500. Pass 0 to disable.
  autoCloseMs?: number
  onClose: () => void
}

// Lightweight in-app toast — pairs with useFlashToast for one-shot success
// messages after navigation (e.g. "Lesson published" after returning from
// the lesson editor). Animates in/out via CSS, lives in a fixed overlay,
// honors prefers-reduced-motion.
export default function Toast({
  open,
  title,
  description,
  tone = 'success',
  autoCloseMs = 4500,
  onClose,
}: ToastProps) {
  // Track a separate "rendered" flag so we can play the exit animation
  // before unmounting. `open` flips first; we delay the unmount.
  const [rendered, setRendered] = useState(open)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (open) {
      setRendered(true)
      setLeaving(false)
      return
    }
    if (!rendered) return
    setLeaving(true)
    const handle = window.setTimeout(() => setRendered(false), 180)
    return () => window.clearTimeout(handle)
  }, [open, rendered])

  useEffect(() => {
    if (!open || autoCloseMs <= 0) return
    const handle = window.setTimeout(onClose, autoCloseMs)
    return () => window.clearTimeout(handle)
  }, [open, autoCloseMs, onClose])

  if (!rendered) return null

  const palette =
    tone === 'success'
      ? {
          bg: '#ecfdf5',
          border: 'rgba(16, 185, 129, 0.45)',
          iconBg: 'rgba(16, 185, 129, 0.18)',
          iconColor: '#047857',
          ink: '#064e3b',
        }
      : tone === 'error'
        ? {
            bg: '#fef2f2',
            border: 'rgba(239, 68, 68, 0.45)',
            iconBg: 'rgba(239, 68, 68, 0.18)',
            iconColor: '#b91c1c',
            ink: '#7f1d1d',
          }
        : {
            bg: '#eff6ff',
            border: 'rgba(59, 130, 246, 0.45)',
            iconBg: 'rgba(59, 130, 246, 0.18)',
            iconColor: '#1d4ed8',
            ink: '#1e3a8a',
          }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 18,
        right: 18,
        zIndex: 9998,
        animation: leaving
          ? 'admin-toast-out 180ms ease-in forwards'
          : 'admin-toast-in 220ms ease-out',
        maxWidth: 380,
      }}
    >
      <style>{`
        @keyframes admin-toast-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes admin-toast-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-6px) scale(0.98); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-admin-toast] { animation: none !important; }
        }
      `}</style>
      <div
        data-admin-toast
        style={{
          display: 'grid',
          gridTemplateColumns: '32px minmax(0, 1fr) auto',
          gap: 10,
          alignItems: 'flex-start',
          padding: '11px 12px 11px 12px',
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          borderRadius: 12,
          boxShadow:
            '0 12px 30px rgba(15, 23, 42, 0.14), 0 4px 8px rgba(15, 23, 42, 0.06)',
          color: palette.ink,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 8,
            background: palette.iconBg,
            color: palette.iconColor,
          }}
        >
          {tone === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10.5l3.5 3.5L16 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : tone === 'error' ? (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M6 6l8 8M14 6l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 6.5v4.5M10 13.5v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <div style={{ minWidth: 0, display: 'grid', gap: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
          {description ? (
            <div style={{ fontSize: 12.5, lineHeight: 1.45, opacity: 0.85 }}>
              {description}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            background: 'transparent',
            border: 0,
            padding: 4,
            cursor: 'pointer',
            color: palette.ink,
            opacity: 0.6,
            borderRadius: 6,
          }}
          onMouseEnter={(event) => (event.currentTarget.style.opacity = '1')}
          onMouseLeave={(event) => (event.currentTarget.style.opacity = '0.6')}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
