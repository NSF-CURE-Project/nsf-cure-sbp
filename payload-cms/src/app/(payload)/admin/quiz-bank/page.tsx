import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import QuizBankView from '@/views/QuizBankView'

type QuizSummary = {
  id: string
  title: string
  questionsCount: number
  updatedAt?: string
  status?: string
  courseId?: string
  chapterId?: string
  tags?: string[]
  difficulty?: string
}

type CourseOption = {
  id: string
  title: string
}

type ChapterOption = {
  id: string
  title: string
  courseId?: string
  courseTitle?: string
}

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id?: string | number }).id ?? '')
  }
  return null
}

export default async function QuizBankPage() {
  const payload = await getPayload({ config: configPromise })
  const [quizRes, courseRes, chapterRes] = await Promise.all([
    payload.find({
      collection: 'quizzes',
      depth: 0,
      limit: 200,
      sort: '-updatedAt',
      draft: true,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'classes',
      depth: 0,
      limit: 200,
      sort: 'order',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'chapters',
      depth: 1,
      limit: 500,
      sort: 'chapterNumber',
      overrideAccess: true,
    }),
  ])

  const initialQuizzes: QuizSummary[] = quizRes.docs.map((doc) => ({
    id: String(doc.id),
    title: (doc.title as string) ?? 'Untitled quiz',
    questionsCount: Array.isArray(doc.questions) ? doc.questions.length : 0,
    updatedAt: doc.updatedAt as string | undefined,
    status: (doc._status as string) ?? 'draft',
    courseId: toId(doc.course) ?? undefined,
    chapterId: toId(doc.chapter) ?? undefined,
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : undefined,
    difficulty: (doc.difficulty as string) ?? undefined,
  }))

  const courses: CourseOption[] = courseRes.docs.map((course) => ({
    id: String(course.id),
    title: (course.title as string) ?? 'Untitled course',
  }))

  const chapters: ChapterOption[] = chapterRes.docs.map((chapter) => ({
    id: String(chapter.id),
    title: (chapter.title as string) ?? 'Untitled chapter',
    courseId: toId((chapter as { class?: unknown }).class) ?? undefined,
    courseTitle:
      typeof (chapter as { class?: { title?: string } }).class === 'object'
        ? ((chapter as { class?: { title?: string } }).class?.title ?? undefined)
        : undefined,
  }))

  return (
    <Gutter>
      <div style={{ maxWidth: 1100, margin: '24px auto 80px' }}>
        <QuizBankView initialQuizzes={initialQuizzes} courses={courses} chapters={chapters} />
      </div>
    </Gutter>
  )
}
