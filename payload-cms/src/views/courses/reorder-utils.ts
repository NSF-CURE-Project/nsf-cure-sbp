import type { CourseCounts, CourseNode, DragEntityType, EntityId } from './types'

export const reorderInArray = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
  if (fromIndex === toIndex) return [...items]
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return [...items]
  }

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export const moveBetweenArrays = <T,>(
  source: T[],
  target: T[],
  sourceIndex: number,
  targetIndex: number,
): { source: T[]; target: T[]; moved: T | null } => {
  if (sourceIndex < 0 || sourceIndex >= source.length) {
    return { source: [...source], target: [...target], moved: null }
  }

  const nextSource = [...source]
  const nextTarget = [...target]
  const [moved] = nextSource.splice(sourceIndex, 1)
  const safeTargetIndex = Math.max(0, Math.min(targetIndex, nextTarget.length))
  nextTarget.splice(safeTargetIndex, 0, moved)

  return { source: nextSource, target: nextTarget, moved }
}

export const reindexByOrder = <T extends Record<string, unknown>>(
  items: T[],
  field: keyof T,
): T[] => {
  return items.map((item, index) => ({ ...item, [field]: index + 1 }))
}

export const computeCourseCounts = (courses: CourseNode[]): Map<EntityId, CourseCounts> => {
  return new Map(
    courses.map((course) => {
      const lessonCount = course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)
      return [course.id, { chapterCount: course.chapters.length, lessonCount }]
    }),
  )
}

export const toDragId = (type: DragEntityType, id: EntityId): string => `${type}:${id}`

export const parseDragId = (
  value: string | null | undefined,
): { type: DragEntityType; id: EntityId } | null => {
  if (!value || !value.includes(':')) return null
  const [type, ...rest] = value.split(':')
  const id = rest.join(':').trim()
  if (!id) return null
  if (type !== 'course' && type !== 'chapter' && type !== 'lesson' && type !== 'chapter-lessons') {
    return null
  }
  return { type, id }
}

export const getCourseByChapterId = (
  courses: CourseNode[],
  chapterId: EntityId,
): { course: CourseNode; courseIndex: number; chapterIndex: number } | null => {
  for (let courseIndex = 0; courseIndex < courses.length; courseIndex += 1) {
    const chapterIndex = courses[courseIndex].chapters.findIndex((chapter) => chapter.id === chapterId)
    if (chapterIndex >= 0) {
      return { course: courses[courseIndex], courseIndex, chapterIndex }
    }
  }
  return null
}

export const cloneCourses = (courses: CourseNode[]): CourseNode[] => {
  return courses.map((course) => ({
    ...course,
    chapters: course.chapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson) => ({ ...lesson })),
    })),
  }))
}

export const normalizeCourseOrders = (courses: CourseNode[]): CourseNode[] => {
  return reindexByOrder(courses, 'order').map((course) => ({
    ...course,
    chapters: reindexByOrder(course.chapters, 'order').map((chapter) => ({
      ...chapter,
      lessons: reindexByOrder(chapter.lessons, 'order').map((lesson) => ({
        ...lesson,
        chapterId: chapter.id,
      })),
    })),
  }))
}
