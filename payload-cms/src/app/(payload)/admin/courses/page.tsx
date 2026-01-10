import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import CourseCardList from '@/views/CourseCardList'

type CourseTree = {
  id: string | number
  title: string
  chapters: {
    id: string | number
    title: string
    chapterNumber?: number | null
    lessons: {
      id: string | number
      title: string
      order?: number | null
    }[]
  }[]
}

type CourseDoc = {
  id?: string | number
  title?: string
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
}

const buildCourseTree = async () => {
  const payload = await getPayload({ config: configPromise })
  const classes = await payload.find({
    collection: 'classes',
    depth: 2,
    limit: 200,
    sort: 'order',
    overrideAccess: true,
  })

  return classes.docs.map((course) => {
    const courseDoc = course as CourseDoc
    const chapterDocs = Array.isArray(courseDoc.chapters) ? courseDoc.chapters : []
    const chapters = chapterDocs
      .map((chapter) => {
        const chapterDoc = chapter as ChapterDoc
        const lessonDocs = Array.isArray(chapterDoc.lessons) ? chapterDoc.lessons : []
        const lessons = lessonDocs
          .map((lesson) => {
            const lessonDoc = lesson as LessonDoc
            return {
              id: lessonDoc.id ?? lesson,
              title: lessonDoc.title ?? 'Untitled lesson',
              order: lessonDoc.order ?? null,
            }
          })
          .sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
            const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
            if (orderA !== orderB) return orderA - orderB
            return String(a.title).localeCompare(String(b.title))
          })

        return {
          id: chapterDoc.id ?? chapter,
          title: chapterDoc.title ?? 'Untitled chapter',
          chapterNumber:
            typeof chapterDoc.chapterNumber === 'number' ? chapterDoc.chapterNumber : null,
          lessons,
        }
      })
      .sort((a, b) => {
        const numberA = typeof a.chapterNumber === 'number' ? a.chapterNumber : Number.MAX_SAFE_INTEGER
        const numberB = typeof b.chapterNumber === 'number' ? b.chapterNumber : Number.MAX_SAFE_INTEGER
        if (numberA !== numberB) return numberA - numberB
        return String(a.title).localeCompare(String(b.title))
      })

    return {
      id: courseDoc.id ?? course,
      title: courseDoc.title ?? 'Untitled class',
      chapters,
    }
  }) as CourseTree[]
}

export default async function AdminCoursesPage() {
  const courseTree = await buildCourseTree()

  return (
    <Gutter>
      <div style={{ maxWidth: 1040, margin: '24px auto 80px' }}>
        <div style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--cpp-muted)', fontWeight: 700 }}>
          Courses
        </div>
        <h1 style={{ fontSize: 28, margin: '8px 0 10px', color: 'var(--cpp-ink)' }}>
          Manage Courses
        </h1>
        <p style={{ color: 'var(--cpp-muted)', lineHeight: 1.6, maxWidth: 680 }}>
          Edit course structure, reorder chapters, and manage lessons from one place.
        </p>
        <div style={{ marginTop: 18 }}>
          <CourseCardList initialCourses={courseTree} />
        </div>
      </div>
    </Gutter>
  )
}
