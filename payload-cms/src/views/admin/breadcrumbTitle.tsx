'use client'

import React, { createContext, useContext, useEffect, useMemo } from 'react'

export type BreadcrumbItem = { label: string; href: string | null }

// A page can override the URL-derived breadcrumbs in one of two ways:
//   * `title`  — replace just the trailing crumb (typical: show the entity's
//     human title in place of "Details" or "Edit").
//   * `chain`  — replace the entire crumb chain (typical: a deep route where
//     the middle segments are record ids the URL parser can't humanize, e.g.
//     /admin/courses/[id]/lessons/[id]/edit needs the course name slotted in).
export type BreadcrumbOverride =
  | { kind: 'title'; title: string }
  | { kind: 'chain'; items: BreadcrumbItem[] }
  | null

const BreadcrumbContext = createContext<((override: BreadcrumbOverride) => void) | null>(null)

export const BreadcrumbProvider = ({
  setOverride,
  children,
}: {
  setOverride: (override: BreadcrumbOverride) => void
  children: React.ReactNode
}) => (
  <BreadcrumbContext.Provider value={setOverride}>{children}</BreadcrumbContext.Provider>
)

// Backward-compatible alias for the older single-context provider name. Some
// callers (CourseWorkspace via StaffProvider) still import the older name.
export const BreadcrumbTitleProvider = BreadcrumbProvider

export const useBreadcrumbTitle = (title: string | null | undefined) => {
  const setter = useContext(BreadcrumbContext)
  useEffect(() => {
    if (!setter) return
    const trimmed = title?.trim()
    setter(trimmed ? { kind: 'title', title: trimmed } : null)
    return () => setter(null)
  }, [setter, title])
}

export const useBreadcrumbChain = (items: BreadcrumbItem[] | null) => {
  const setter = useContext(BreadcrumbContext)
  // Stable string key so we only re-fire the effect when the chain content
  // actually changes (parent re-renders rebuild the array literal each pass).
  const itemsKey = useMemo(() => JSON.stringify(items), [items])
  useEffect(() => {
    if (!setter) return
    if (items && items.length > 0) {
      setter({ kind: 'chain', items })
    } else {
      setter(null)
    }
    return () => setter(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setter, itemsKey])
}
