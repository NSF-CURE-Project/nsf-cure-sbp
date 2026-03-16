import type { ChapterNode, CourseNode, EntityId, LessonNode } from './types'

type LessonPositionUpdate = {
  id: EntityId
  chapterId: EntityId
  order: number
}

const patch = async (path: string, body: Record<string, unknown>) => {
  // Integration boundary: replace fetch calls here with Payload local API/actions
  // if you want server-side batching or transactional persistence.
  const response = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`)
  }
}

export const saveCourseOrder = async (courses: CourseNode[]) => {
  const updates = courses.map((course) =>
    patch(`/api/classes/${course.id}`, {
      order: course.order,
    }),
  )
  await Promise.all(updates)
}

export const saveChapterOrder = async (chapters: ChapterNode[]) => {
  const updates = chapters.map((chapter) =>
    patch(`/api/chapters/${chapter.id}`, {
      chapterNumber: chapter.order,
    }),
  )
  await Promise.all(updates)
}

export const saveLessonPositions = async (lessons: LessonPositionUpdate[]) => {
  const updates = lessons.map((lesson) =>
    patch(`/api/lessons/${lesson.id}`, {
      chapter: lesson.chapterId,
      order: lesson.order,
    }),
  )
  await Promise.all(updates)
}

export const getChangedCourses = (previous: CourseNode[], next: CourseNode[]): CourseNode[] => {
  const prevMap = new Map(previous.map((course) => [course.id, course.order]))
  return next.filter((course) => prevMap.get(course.id) !== course.order)
}

export const getChangedChapters = (previous: ChapterNode[], next: ChapterNode[]): ChapterNode[] => {
  const prevMap = new Map(previous.map((chapter) => [chapter.id, chapter.order]))
  return next.filter((chapter) => prevMap.get(chapter.id) !== chapter.order)
}

export const getChangedLessons = (previous: LessonNode[], next: LessonNode[]): LessonPositionUpdate[] => {
  const prevMap = new Map(previous.map((lesson) => [lesson.id, lesson]))
  return next
    .filter((lesson) => {
      const prev = prevMap.get(lesson.id)
      if (!prev) return true
      return prev.order !== lesson.order || prev.chapterId !== lesson.chapterId
    })
    .map((lesson) => ({
      id: lesson.id,
      chapterId: lesson.chapterId,
      order: lesson.order,
    }))
}
