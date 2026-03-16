'use client'

import React from 'react'

type DropIndicatorProps = {
  visible: boolean
}

export default function DropIndicator({ visible }: DropIndicatorProps) {
  if (!visible) return null

  return (
    <div className="pointer-events-none absolute inset-x-2 -top-1 z-10 h-0.5 rounded-full bg-sky-500/90" aria-hidden="true" />
  )
}
