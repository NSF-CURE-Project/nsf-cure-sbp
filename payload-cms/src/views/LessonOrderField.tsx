'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'
import LessonOrderList from './LessonOrderList'

type ChapterValue = string | { id?: string } | null | undefined
type IdValue = string | number | null | undefined

function getChapterId(value: ChapterValue) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value.id) return value.id
  return null
}

export default function LessonOrderField() {
  const { value: idValue } = useField<IdValue>({ path: 'id' })
  const { value: legacyIdValue } = useField<IdValue>({ path: '_id' })
  const { value: titleValue } = useField<string>({ path: 'title' })
  const { setValue: setOrderValue, value: orderValue } = useField<number>({
    path: 'order',
  })
  const { value: chapterValue } = useField<ChapterValue>({ path: 'chapter' })
  const [pathId, setPathId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const pathname = window.location.pathname
    const match = pathname.match(/lessons\/([^/]+)/)
    if (match?.[1] && match[1] !== 'create') {
      setPathId(match[1])
    }
  }, [])

  const chapterId = useMemo(() => getChapterId(chapterValue), [chapterValue])
  const lessonId = useMemo(() => {
    const normalize = (value: IdValue): string | null => {
      if (typeof value === 'number') return String(value)
      if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed && trimmed !== 'create' ? trimmed : null
      }
      return null
    }

    return normalize(idValue) ?? normalize(legacyIdValue) ?? normalize(pathId)
  }, [idValue, legacyIdValue, pathId])

  const pendingTitle =
    typeof titleValue === 'string' && titleValue.trim().length > 0
      ? titleValue.trim()
      : 'Untitled lesson'

  if (!lessonId || !chapterId) return null

  return (
    <div style={{ margin: '6px 0 20px' }}>
      <LessonOrderList
        title="Reorder lessons"
        showEditLinks
        chapterId={chapterId ?? undefined}
        pendingTitle={pendingTitle}
        pendingOrder={typeof orderValue === 'number' ? orderValue : null}
        onPendingOrderChange={(order) => {
          if (orderValue !== order) {
            setOrderValue(order)
          }
        }}
      />
    </div>
  )
}
