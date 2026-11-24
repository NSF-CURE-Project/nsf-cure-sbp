'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Toast from './Toast'

// Known flash codes. Add new entries here and copy them in the redirector
// (e.g. router.push(`/admin/courses/${id}?flash=lesson-published&title=…`)).
const FLASH_MESSAGES: Record<
  string,
  { title: string; description?: string; tone?: 'success' | 'info' | 'error' }
> = {
  'lesson-published': { title: 'Lesson published', tone: 'success' },
  'lesson-saved': { title: 'Lesson draft saved', tone: 'success' },
  'page-published': { title: 'Page published', tone: 'success' },
  'classroom-created': { title: 'Classroom created', tone: 'success' },
  'classroom-archived': { title: 'Classroom archived', tone: 'success' },
}

// Reads `?flash=<code>&title=<optional>` on mount, surfaces a Toast, and
// strips the flash params from the URL so a refresh doesn't re-fire it.
// Mount once at the top of a landing page (e.g. CourseWorkspace) — the
// redirect that lands the user here is what triggers the toast.
export function useFlashToast() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState<
    | {
        code: string
        title: string
        description?: string
        tone: 'success' | 'info' | 'error'
      }
    | null
  >(null)

  useEffect(() => {
    const code = searchParams.get('flash')
    if (!code) return
    const preset = FLASH_MESSAGES[code]
    if (!preset) return

    const extraTitle = searchParams.get('title')
    setActive({
      code,
      title: preset.title,
      description: extraTitle ? `"${extraTitle}" is now live.` : preset.description,
      tone: preset.tone ?? 'success',
    })

    // Strip the flash + title params after rendering so reloads don't loop
    // and the URL stays clean.
    const next = new URLSearchParams(searchParams.toString())
    next.delete('flash')
    next.delete('title')
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    // searchParams + pathname + router are stable refs; effect should fire
    // once per real navigation that lands with a flash code.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const element = (
    <Toast
      open={active !== null}
      title={active?.title ?? ''}
      description={active?.description}
      tone={active?.tone ?? 'success'}
      onClose={() => setActive(null)}
    />
  )

  return { flashElement: element }
}
