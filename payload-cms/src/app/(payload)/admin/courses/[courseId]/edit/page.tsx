import React from 'react'
import { notFound } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import CourseEditEditor from '@/views/courses/CourseEditEditor'

// Custom edit screen for a course (Class) record. Replaces Payload's
// default /admin/collections/classes/[id] form so the surface matches the
// rest of the Course Workspace chrome.
export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const payload = await getPayload({ config: configPromise })

  // depth: 2 hydrates chapter.lessons so we can show accurate counts in the
  // header chip without an extra round trip.
  const course = await payload
    .findByID({
      collection: 'classes',
      id: courseId,
      depth: 2,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!course) notFound()

  const courseDoc = course as {
    id?: string | number
    title?: string
    description?: string
    slug?: string
    chapters?: unknown[]
  }

  const chapterDocs = Array.isArray(courseDoc.chapters) ? courseDoc.chapters : []
  let lessonCount = 0
  let publishedCount = 0
  for (const chapter of chapterDocs) {
    if (!chapter || typeof chapter !== 'object') continue
    const lessons = (chapter as { lessons?: unknown[] }).lessons
    if (!Array.isArray(lessons)) continue
    for (const lesson of lessons) {
      lessonCount += 1
      const status = (lesson as { _status?: string })?._status
      if (status === 'published') publishedCount += 1
    }
  }

  return (
    <Gutter>
      <div style={{ maxWidth: 1500, margin: '0 auto 80px' }}>
        <CourseEditEditor
          courseId={courseId}
          initialTitle={courseDoc.title ?? ''}
          initialDescription={courseDoc.description ?? ''}
          initialSlug={courseDoc.slug ?? ''}
          lessonCount={lessonCount}
          publishedCount={publishedCount}
        />
      </div>
    </Gutter>
  )
}
