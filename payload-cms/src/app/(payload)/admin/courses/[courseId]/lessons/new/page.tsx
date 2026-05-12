import React from 'react'
import { notFound } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import LessonScaffoldEditor from '@/views/courses/LessonScaffoldEditor'

// Scaffold (Stage 0) for creating a new lesson without committing a row until
// the staff member explicitly saves. The actual editor is a client component;
// this server entry just resolves the chapter for context and the course title
// for the back-link.
export default async function NewLessonScaffoldPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { courseId } = await params
  const search = await searchParams

  const chapterId = typeof search.chapterId === 'string' ? search.chapterId : null
  const initialTitle = typeof search.title === 'string' ? search.title : ''
  const stagedId = typeof search.stagedId === 'string' ? search.stagedId : null
  const orderParam = typeof search.order === 'string' ? Number(search.order) : NaN
  const initialOrder = Number.isFinite(orderParam) && orderParam > 0 ? orderParam : 1

  if (!chapterId) {
    notFound()
  }

  const payload = await getPayload({ config: configPromise })

  const [chapter, course] = await Promise.all([
    payload
      .findByID({
        collection: 'chapters',
        id: chapterId,
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null),
    payload
      .findByID({
        collection: 'classes',
        id: courseId,
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null),
  ])

  if (!chapter || !course) {
    notFound()
  }

  const chapterDoc = chapter as { id?: string | number; title?: string }
  const courseDoc = course as { id?: string | number; title?: string }

  return (
    <Gutter>
      <div style={{ maxWidth: 1500, margin: '0 auto 80px' }}>
        <LessonScaffoldEditor
          mode="create"
          courseId={courseId}
          courseTitle={courseDoc.title ?? 'Course'}
          chapterId={String(chapterDoc.id ?? chapterId)}
          chapterTitle={chapterDoc.title ?? 'Chapter'}
          initialTitle={initialTitle}
          initialOrder={initialOrder}
          stagedId={stagedId}
        />
      </div>
    </Gutter>
  )
}
