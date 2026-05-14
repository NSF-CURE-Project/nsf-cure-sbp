import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import DraftLessonsList, {
  type DraftLessonEntry,
} from '@/views/courses/DraftLessonsList'

type LessonDoc = {
  id?: string | number
  title?: string | null
  layout?: unknown[]
  updatedAt?: string | null
  _status?: 'draft' | 'published' | null
  chapter?:
    | string
    | number
    | {
        id?: string | number
        title?: string | null
        class?:
          | string
          | number
          | { id?: string | number; title?: string | null }
          | null
      }
    | null
}

const loadDrafts = async (): Promise<DraftLessonEntry[]> => {
  const payload = await getPayload({ config: configPromise })

  // depth: 2 hydrates lesson.chapter.class so the row knows what course it
  // belongs to (needed for the editor URL /admin/courses/[courseId]/...).
  // draft: true ensures Payload's drafts plugin includes lessons that exist
  // only as a working draft, not just rows with a stale _status field.
  const result = await payload.find({
    collection: 'lessons',
    where: { _status: { equals: 'draft' } },
    depth: 2,
    limit: 500,
    sort: '-updatedAt',
    overrideAccess: true,
    draft: true,
  })

  return (result.docs ?? []).map((doc) => {
    const lesson = doc as LessonDoc
    const lessonId = lesson.id != null ? String(lesson.id) : ''

    let chapterId: string | null = null
    let chapterTitle: string | null = null
    let courseId: string | null = null
    let courseTitle: string | null = null

    if (lesson.chapter && typeof lesson.chapter === 'object') {
      const chapterDoc = lesson.chapter
      chapterId = chapterDoc.id != null ? String(chapterDoc.id) : null
      chapterTitle = chapterDoc.title ?? null

      const klass = chapterDoc.class
      if (klass && typeof klass === 'object') {
        courseId = klass.id != null ? String(klass.id) : null
        courseTitle = klass.title ?? null
      } else if (typeof klass === 'string' || typeof klass === 'number') {
        courseId = String(klass)
      }
    } else if (typeof lesson.chapter === 'string' || typeof lesson.chapter === 'number') {
      chapterId = String(lesson.chapter)
    }

    return {
      lessonId,
      lessonTitle: lesson.title ?? 'Untitled lesson',
      chapterId,
      chapterTitle,
      courseId,
      courseTitle,
      updatedAt: lesson.updatedAt ?? null,
      blockCount: Array.isArray(lesson.layout) ? lesson.layout.length : 0,
    }
  })
}

export default async function DraftLessonsPage() {
  const drafts = await loadDrafts()
  return (
    <Gutter>
      <div style={{ maxWidth: 1040, margin: '24px auto 80px' }}>
        <DraftLessonsList initialDrafts={drafts} />
      </div>
    </Gutter>
  )
}
