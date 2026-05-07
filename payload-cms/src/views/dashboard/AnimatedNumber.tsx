'use client'

import React, { useEffect, useRef, useState } from 'react'

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

type Props = {
  value: number
  durationMs?: number
  format?: (value: number) => string
  suffix?: string
}

// Counts up from 0 to `value` on mount (and on value change). Uses RAF +
// easeOutCubic so the motion feels organic without a chart library. Falls
// back gracefully when the user has reduced-motion enabled.
export default function AnimatedNumber({
  value,
  durationMs = 700,
  format,
  suffix = '',
}: Props) {
  const [display, setDisplay] = useState(value)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDisplay(value)
      return
    }
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setDisplay(value)
      return
    }
    fromRef.current = display
    startRef.current = null
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)

    const tick = (ts: number) => {
      if (startRef.current == null) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(1, elapsed / durationMs)
      const eased = easeOutCubic(progress)
      const next = fromRef.current + (value - fromRef.current) * eased
      setDisplay(next)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs])

  const rendered =
    typeof format === 'function' ? format(display) : Math.round(display).toString()
  return (
    <span>
      {rendered}
      {suffix}
    </span>
  )
}
