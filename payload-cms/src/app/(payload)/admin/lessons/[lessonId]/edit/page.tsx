import { notFound, redirect } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Course-agnostic shortcut for lesson edit. Resolves the lesson → chapter →
// course, then redirects to the canonical custom-editor route. Used by surfaces
// that don't have the parent course id handy (staff dashboard, help docs,
// anywhere we might link to a lesson without knowing which course owns it).
export default async function LessonRedirectPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const payload = await getPayload({ config: configPromise })

  const lesson = await payload
    .findByID({
      collection: 'lessons',
      id: lessonId,
      depth: 1,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!lesson) notFound()

  const chapter = (lesson as { chapter?: unknown }).chapter
  const courseRef =
    typeof chapter === 'object' && chapter !== null
      ? (chapter as { class?: unknown }).class
      : null
  const courseId =
    typeof courseRef === 'object' && courseRef !== null
      ? String((courseRef as { id?: string | number }).id ?? '')
      : courseRef != null
        ? String(courseRef)
        : ''

  if (!courseId) notFound()

  redirect(`/admin/courses/${courseId}/lessons/${lessonId}/edit`)
}
