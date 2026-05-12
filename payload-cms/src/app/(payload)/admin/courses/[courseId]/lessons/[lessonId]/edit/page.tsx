import React from 'react'
import { notFound } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import LessonScaffoldEditor from '@/views/courses/LessonScaffoldEditor'
import { fromPersistedLayout } from '@/views/courses/scaffold/types'

// Stage 3: custom editor for existing lessons. Hydrates the persisted lesson
// row (title + layout + status + chapter) and hands it to the same client
// editor used for new lessons. Save commits via PATCH /api/lessons/[id].
export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params

  const payload = await getPayload({ config: configPromise })

  const lesson = await payload
    .findByID({
      collection: 'lessons',
      id: lessonId,
      // depth 1 hydrates the chapter relationship enough to read its title
      // and parent class; deeper would also populate quizzes/problem-sets,
      // which is fine — `fromPersistedLayout` extracts ids either way.
      depth: 1,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!lesson) {
    notFound()
  }

  const lessonDoc = lesson as {
    id?: string | number
    title?: string
    slug?: string
    layout?: unknown
    _status?: string
    chapter?:
      | string
      | number
      | {
          id?: string | number
          title?: string
          slug?: string
          class?:
            | string
            | number
            | { id?: string | number; title?: string; slug?: string }
        }
  }

  const chapter = lessonDoc.chapter
  const chapterIsObject = typeof chapter === 'object' && chapter !== null
  const chapterId = chapterIsObject
    ? String(chapter.id ?? '')
    : chapter != null
      ? String(chapter)
      : ''
  const chapterTitle = chapterIsObject ? (chapter.title ?? 'Chapter') : 'Chapter'

  // Verify the lesson actually belongs to this course (defense in depth
  // against URL tampering pointing the wrong courseId at a valid lessonId).
  const courseFromChapter =
    chapterIsObject && typeof chapter.class === 'object' && chapter.class !== null
      ? String((chapter.class as { id?: string | number }).id ?? '')
      : null
  if (courseFromChapter && courseFromChapter !== courseId) {
    notFound()
  }

  const course = await payload
    .findByID({
      collection: 'classes',
      id: courseId,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!course) {
    notFound()
  }

  const courseDoc = course as { id?: string | number; title?: string; slug?: string }

  const initialStatus =
    lessonDoc._status === 'published' ? 'published' : ('draft' as const)
  const initialBlocks = fromPersistedLayout(lessonDoc.layout)

  // Build the live-preview URL using the same shape as the `admin.preview`
  // hook on the Lessons collection. Slugs may be missing on legacy rows; if
  // either is, we drop the iframe and the modal falls back to a summary.
  const lessonSlug =
    typeof lessonDoc.slug === 'string' && lessonDoc.slug ? lessonDoc.slug : null
  const courseSlugFromChapter =
    chapterIsObject && typeof chapter.class === 'object' && chapter.class !== null
      ? (chapter.class as { slug?: string }).slug
      : undefined
  const courseSlug =
    typeof courseSlugFromChapter === 'string' && courseSlugFromChapter
      ? courseSlugFromChapter
      : typeof courseDoc.slug === 'string' && courseDoc.slug
        ? courseDoc.slug
        : null
  const previewBase = (
    process.env.WEB_PREVIEW_URL ??
    process.env.FRONTEND_URL ??
    'http://localhost:3001'
  )
    .trim()
    .replace(/\/+$/, '')
  const previewSecret = process.env.PREVIEW_SECRET ?? ''
  let previewUrl: string | null = null
  if (lessonSlug && previewSecret) {
    const search = new URLSearchParams({
      secret: previewSecret,
      type: 'lesson',
      slug: lessonSlug,
    })
    if (courseSlug) search.set('classSlug', courseSlug)
    previewUrl = `${previewBase}/api/preview?${search.toString()}`
  }

  return (
    <Gutter>
      <div style={{ maxWidth: 880, margin: '24px auto 80px' }}>
        <LessonScaffoldEditor
          mode="edit"
          courseId={courseId}
          courseTitle={courseDoc.title ?? 'Course'}
          chapterId={chapterId}
          chapterTitle={chapterTitle}
          lessonId={String(lessonDoc.id ?? lessonId)}
          initialTitle={lessonDoc.title ?? ''}
          initialBlocks={initialBlocks}
          initialStatus={initialStatus}
          previewUrl={previewUrl}
        />
      </div>
    </Gutter>
  )
}
