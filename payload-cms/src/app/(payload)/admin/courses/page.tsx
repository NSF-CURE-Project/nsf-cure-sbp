import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import CoursesHome from '@/views/courses/CoursesHome'
import type { CourseCatalogItem } from '@/views/courses/CoursesHomeCard'

type CourseDoc = {
  id?: string | number
  title?: string
  order?: number | null
  updatedAt?: string | null
  chapters?: unknown[]
}

type ChapterDoc = {
  lessons?: unknown[]
}

type LessonDoc = {
  layout?: Array<{
    blockType?: string
    quiz?: { id?: string | number; title?: string } | string | number | null
  }>
}

const buildCatalog = async (): Promise<CourseCatalogItem[]> => {
  const payload = await getPayload({ config: configPromise })
  const classes = await payload.find({
    collection: 'classes',
    depth: 3,
    limit: 200,
    sort: 'order',
    overrideAccess: true,
  })

  const classrooms = await payload.find({
    collection: 'classrooms',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
  })

  const classroomCountByCourseId = new Map<string, number>()
  for (const classroom of classrooms.docs ?? []) {
    const classValue = (classroom as { class?: unknown }).class
    const classId =
      typeof classValue === 'object' && classValue !== null && 'id' in classValue
        ? String((classValue as { id?: string | number }).id ?? '')
        : classValue != null
          ? String(classValue)
          : ''
    if (!classId) continue
    classroomCountByCourseId.set(classId, (classroomCountByCourseId.get(classId) ?? 0) + 1)
  }

  return classes.docs.map((course, courseIndex) => {
    const courseDoc = course as CourseDoc
    const chapterDocs = Array.isArray(courseDoc.chapters) ? courseDoc.chapters : []

    let chapterCount = 0
    let lessonCount = 0
    let quizCount = 0

    for (const chapter of chapterDocs) {
      const chapterDoc = chapter as ChapterDoc
      chapterCount += 1
      const lessonDocs = Array.isArray(chapterDoc.lessons) ? chapterDoc.lessons : []
      for (const lesson of lessonDocs) {
        const lessonDoc = lesson as LessonDoc
        lessonCount += 1
        const quizValue =
          lessonDoc.layout?.find((block) => block.blockType === 'quizBlock')?.quiz ?? null
        if (quizValue) quizCount += 1
      }
    }

    const id = String(courseDoc.id ?? courseIndex)
    return {
      id,
      title: courseDoc.title ?? 'Untitled course',
      order:
        typeof courseDoc.order === 'number' && Number.isFinite(courseDoc.order)
          ? courseDoc.order
          : courseIndex + 1,
      chapterCount,
      lessonCount,
      quizCount,
      classroomCount: classroomCountByCourseId.get(id) ?? 0,
      updatedAt: courseDoc.updatedAt ?? null,
    }
  })
}

export default async function AdminCoursesPage() {
  const catalog = await buildCatalog()

  return (
    <Gutter>
      <div style={{ maxWidth: 1040, margin: '24px auto 80px' }}>
        <CoursesHome initialCourses={catalog} />
      </div>
    </Gutter>
  )
}
