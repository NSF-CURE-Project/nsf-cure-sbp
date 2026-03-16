'use client'

import React from 'react'
import CourseBuilderPage from '@/views/courses/CourseBuilderPage'
import type { CourseNode } from '@/views/courses/types'

type CourseTree = {
  id: string | number
  title: string
  order?: number | null
  chapters: {
    id: string | number
    title: string
    chapterNumber?: number | null
    courseId?: string | number
    lessons: {
      id: string | number
      title: string
      order?: number | null
      chapterId?: string | number
      quizTitle?: string | null
    }[]
  }[]
}

type CourseCardListProps = {
  initialCourses: CourseTree[]
}

const toCourseNodes = (courses: CourseTree[]): CourseNode[] => {
  return courses.map((course, courseIndex) => {
    const courseId = String(course.id)

    return {
      id: courseId,
      title: course.title,
      order:
        typeof course.order === 'number' && Number.isFinite(course.order)
          ? course.order
          : courseIndex + 1,
      chapters: course.chapters.map((chapter, chapterIndex) => {
        const chapterId = String(chapter.id)
        return {
          id: chapterId,
          title: chapter.title,
          order:
            typeof chapter.chapterNumber === 'number' && Number.isFinite(chapter.chapterNumber)
              ? chapter.chapterNumber
              : chapterIndex + 1,
          courseId,
          lessons: chapter.lessons.map((lesson, lessonIndex) => ({
            id: String(lesson.id),
            title: lesson.title,
            order:
              typeof lesson.order === 'number' && Number.isFinite(lesson.order)
                ? lesson.order
                : lessonIndex + 1,
            chapterId,
            quizTitle: lesson.quizTitle ?? null,
          })),
        }
      }),
    }
  })
}

export default function CourseCardList({ initialCourses }: CourseCardListProps) {
  return <CourseBuilderPage initialCourses={toCourseNodes(initialCourses)} />
}
