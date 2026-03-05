'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useField, useForm } from '@payloadcms/ui'
import LessonOrderList from './LessonOrderList'

type IdValue = string | number | null | undefined
type LessonRelationshipValue = Array<string | number | { id?: string | number } | null> | null | undefined
type LessonRelationshipItem = string | number | { id?: string | number } | null

const toId = (item: LessonRelationshipItem): string => {
  if (item == null) return ''
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  if (typeof item === 'object' && 'id' in item && item.id != null) return String(item.id)
  return ''
}

const toIdList = (value: LessonRelationshipValue): string[] => {
  if (!Array.isArray(value)) return []
  return value.map((item) => toId(item)).filter(Boolean)
}

const reorderRelationshipValue = (
  value: LessonRelationshipValue,
  orderedLessonIds: string[],
): LessonRelationshipItem[] => {
  if (!Array.isArray(value) || !value.length) return orderedLessonIds

  const entriesById = new Map<string, LessonRelationshipItem>()
  value.forEach((item) => {
    const id = toId(item)
    if (!id) return
    entriesById.set(id, item)
  })

  return orderedLessonIds.map((id) => entriesById.get(id) ?? id)
}

export default function ChapterLessonOrderField() {
  const { setModified } = useForm()
  const { value: idValue } = useField<IdValue>({ path: 'id' })
  const { value: legacyIdValue } = useField<IdValue>({ path: '_id' })
  const { value: lessonsValue, setValue: setLessonsValue } = useField<LessonRelationshipValue>({
    path: 'lessons',
  })
  const [pathId, setPathId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const pathname = window.location.pathname
    const match = pathname.match(/chapters\/([^/]+)/)
    if (match?.[1]) {
      setPathId(match[1])
    }
  }, [])

  const chapterId = useMemo(() => {
    if (typeof idValue === 'string') return idValue
    if (typeof idValue === 'number') return String(idValue)
    if (typeof legacyIdValue === 'string') return legacyIdValue
    if (typeof legacyIdValue === 'number') return String(legacyIdValue)
    return pathId
  }, [idValue, legacyIdValue, pathId])

  return (
    <div style={{ margin: '6px 0 20px' }}>
      <LessonOrderList
        title="Reorder lessons for this chapter"
        showEditLinks
        chapterId={chapterId ?? undefined}
        onOrderChange={(orderedLessonIds) => {
          const currentIds = toIdList(lessonsValue)
          if (
            currentIds.length === orderedLessonIds.length &&
            currentIds.every((id, index) => id === orderedLessonIds[index])
          ) {
            return
          }
          setLessonsValue(reorderRelationshipValue(lessonsValue, orderedLessonIds))
          setModified(true)
        }}
      />
    </div>
  )
}
