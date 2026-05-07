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

const remove = async (path: string) => {
  const response = await fetch(path, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`)
  }
}

const post = async <T = unknown,>(path: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`Request failed (${response.status}) for ${path}`)
  return response.json() as Promise<T>
}

const get = async <T = unknown,>(path: string): Promise<T> => {
  const response = await fetch(path, { method: 'GET', credentials: 'include' })
  if (!response.ok) throw new Error(`Request failed (${response.status}) for ${path}`)
  return response.json() as Promise<T>
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

export const updateChapterTitle = async (chapterId: EntityId, title: string) => {
  await patch(`/api/chapters/${chapterId}`, { title })
}

export const updateLessonTitle = async (lessonId: EntityId, title: string) => {
  await patch(`/api/lessons/${lessonId}`, { title })
}

export const deleteLesson = async (lessonId: EntityId) => {
  await remove(`/api/lessons/${lessonId}`)
}

type LessonCreatedDoc = {
  doc?: {
    id?: string | number
    title?: string
    order?: number | null
    chapter?: string | number | { id?: string | number }
  }
}

export const createLesson = async (
  chapterId: EntityId,
  title: string,
  order: number,
): Promise<{ id: EntityId; title: string; order: number }> => {
  const result = await post<LessonCreatedDoc>('/api/lessons', {
    title,
    chapter: chapterId,
    order,
  })
  const doc = result.doc
  if (!doc?.id) throw new Error('Lesson create response missing id')
  return {
    id: String(doc.id),
    title: doc.title ?? title,
    order: typeof doc.order === 'number' ? doc.order : order,
  }
}

export const attachLessonToChapter = async (
  lessonId: EntityId,
  chapterId: EntityId,
  order: number,
) => {
  await patch(`/api/lessons/${lessonId}`, { chapter: chapterId, order })
}

type LessonSearchDoc = {
  id: string | number
  title?: string
  chapter?:
    | string
    | number
    | {
        id?: string | number
        title?: string
        class?:
          | string
          | number
          | {
              id?: string | number
              title?: string
            }
      }
}

export type LessonSearchResult = {
  id: EntityId
  title: string
  currentChapterId: EntityId | null
  currentChapterTitle: string | null
  currentCourseTitle: string | null
}

const extractChapter = (chapter: LessonSearchDoc['chapter']) => {
  if (!chapter) return { id: null, title: null, course: null as string | null }
  if (typeof chapter === 'string' || typeof chapter === 'number') {
    return { id: String(chapter), title: null, course: null as string | null }
  }
  const classValue = chapter.class
  const courseTitle =
    typeof classValue === 'object' && classValue !== null
      ? (classValue.title ?? null)
      : null
  return {
    id: chapter.id != null ? String(chapter.id) : null,
    title: chapter.title ?? null,
    course: courseTitle,
  }
}

export const searchUnassignedLessons = async (
  query: string,
  limit = 25,
): Promise<LessonSearchResult[]> => {
  const params = new URLSearchParams()
  params.set('depth', '2')
  params.set('limit', String(limit))
  params.set('sort', '-updatedAt')
  if (query.trim()) {
    params.set('where[title][like]', query.trim())
  }
  const json = await get<{ docs?: LessonSearchDoc[] }>(`/api/lessons?${params.toString()}`)
  return (json.docs ?? []).map((doc) => {
    const chapterInfo = extractChapter(doc.chapter)
    return {
      id: String(doc.id),
      title: doc.title ?? 'Untitled lesson',
      currentChapterId: chapterInfo.id,
      currentChapterTitle: chapterInfo.title,
      currentCourseTitle: chapterInfo.course,
    }
  })
}

export const deleteChapter = async (chapterId: EntityId) => {
  await remove(`/api/chapters/${chapterId}`)
}

export const deleteCourse = async (courseId: EntityId) => {
  await remove(`/api/classes/${courseId}`)
}

export const getChangedCourses = (previous: CourseNode[], next: CourseNode[]): CourseNode[] => {
  const prevMap = new Map(previous.map((course) => [course.id, course.order]))
  return next.filter((course) => prevMap.get(course.id) !== course.order)
}

export const getChangedChapters = (previous: ChapterNode[], next: ChapterNode[]): ChapterNode[] => {
  const prevMap = new Map(previous.map((chapter) => [chapter.id, chapter.order]))
  return next.filter((chapter) => prevMap.get(chapter.id) !== chapter.order)
}

export const getChangedLessons = (
  previous: LessonNode[],
  next: LessonNode[],
): LessonPositionUpdate[] => {
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
