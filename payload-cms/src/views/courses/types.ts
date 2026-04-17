export type EntityId = string

export type LessonNode = {
  id: EntityId
  title: string
  order: number
  chapterId: EntityId
  quizTitle?: string | null
}

export type ChapterNode = {
  id: EntityId
  title: string
  order: number
  courseId: EntityId
  lessons: LessonNode[]
}

export type CourseNode = {
  id: EntityId
  title: string
  order: number
  classroomCount?: number
  chapters: ChapterNode[]
}

export type CourseCounts = {
  chapterCount: number
  lessonCount: number
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type DragEntityType = 'course' | 'chapter' | 'lesson' | 'chapter-lessons'

export type DragMeta =
  | { type: 'course'; courseId: EntityId; index: number }
  | { type: 'chapter'; courseId: EntityId; chapterId: EntityId; index: number }
  | {
      type: 'lesson'
      lessonId: EntityId
      chapterId: EntityId
      courseId: EntityId
      index: number
    }
  | { type: 'chapter-lessons'; chapterId: EntityId; courseId: EntityId }
