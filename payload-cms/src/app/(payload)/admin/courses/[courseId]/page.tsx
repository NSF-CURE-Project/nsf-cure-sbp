import React from 'react'
import { notFound } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import CourseWorkspace from '@/views/courses/CourseWorkspace'
import type { CourseNode } from '@/views/courses/types'

type CourseDoc = {
  id?: string | number
  title?: string
  slug?: string | null
  order?: number | null
  chapters?: unknown[]
}

type ChapterDoc = {
  id?: string | number
  title?: string
  chapterNumber?: number | null
  lessons?: unknown[]
}

type LessonDoc = {
  id?: string | number
  title?: string
  order?: number | null
  layout?: Array<{
    blockType?: string
    quiz?: { id?: string | number; title?: string } | string | number | null
  }>
}

const buildCourseNode = async (rawCourseId: string): Promise<CourseNode | null> => {
  const payload = await getPayload({ config: configPromise })
  const courseId = decodeURIComponent(rawCourseId)
  const course = await payload
    .findByID({
      collection: 'classes',
      id: courseId,
      depth: 3,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!course) return null

  const courseDoc = course as CourseDoc
  const chapterDocs = Array.isArray(courseDoc.chapters) ? courseDoc.chapters : []
  const chapters = chapterDocs
    .map((chapter, chapterIndex) => {
      const chapterDoc = chapter as ChapterDoc
      const lessonDocs = Array.isArray(chapterDoc.lessons) ? chapterDoc.lessons : []
      const lessons = lessonDocs
        .map((lesson, lessonIndex) => {
          const lessonDoc = lesson as LessonDoc
          const quizValue =
            lessonDoc.layout?.find((block) => block.blockType === 'quizBlock')?.quiz ?? null
          const quizTitle =
            typeof quizValue === 'object' && quizValue !== null ? (quizValue.title ?? null) : null
          return {
            id: String(lessonDoc.id ?? lesson),
            title: lessonDoc.title ?? 'Untitled lesson',
            order:
              typeof lessonDoc.order === 'number' && Number.isFinite(lessonDoc.order)
                ? lessonDoc.order
                : lessonIndex + 1,
            chapterId: String(chapterDoc.id ?? chapter),
            quizTitle,
          }
        })
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order
          return String(a.title).localeCompare(String(b.title))
        })

      return {
        id: String(chapterDoc.id ?? chapter),
        title: chapterDoc.title ?? 'Untitled chapter',
        order:
          typeof chapterDoc.chapterNumber === 'number' && Number.isFinite(chapterDoc.chapterNumber)
            ? chapterDoc.chapterNumber
            : chapterIndex + 1,
        courseId: String(courseDoc.id ?? rawCourseId),
        lessons,
      }
    })
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return String(a.title).localeCompare(String(b.title))
    })

  return {
    id: String(courseDoc.id ?? rawCourseId),
    title: courseDoc.title ?? 'Untitled course',
    slug: courseDoc.slug ?? null,
    order:
      typeof courseDoc.order === 'number' && Number.isFinite(courseDoc.order) ? courseDoc.order : 1,
    chapters,
  }
}

export default async function CourseWorkspacePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const courseNode = await buildCourseNode(courseId)

  if (!courseNode) {
    notFound()
  }

  return (
    <Gutter>
      <div style={{ maxWidth: 1200, margin: '24px auto 80px' }}>
        <CourseWorkspace initialCourse={courseNode} />
      </div>
    </Gutter>
  )
}
