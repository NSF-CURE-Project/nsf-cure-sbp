import type { ChapterNode, CourseNode, EntityId, LessonNode } from './types'

type LessonPositionUpdate = {
  id: EntityId
  chapterId: EntityId
  order: number
}

// Payload's relationship validator rejects numeric strings when the target
// collection uses integer IDs (every collection here is Postgres `serial`).
// Internally we hold IDs as strings (EntityId = string) for React-key safety,
// but every value sent over the wire as a relationship needs to be a number.
const relId = (id: EntityId): number | string =>
  /^\d+$/.test(id) ? Number(id) : id

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

type PayloadFieldError = { message?: string; field?: string; label?: string; path?: string }
type PayloadErrorEntry = {
  message?: string
  field?: string
  data?: { errors?: PayloadFieldError[] } | PayloadFieldError[]
}

const extractErrorMessage = async (response: Response, path: string): Promise<string> => {
  try {
    const data = (await response.clone().json()) as {
      message?: string
      errors?: PayloadErrorEntry[]
    }
    // Payload's ValidationError nests per-field detail inside errors[].data.errors
    // (e.g. { field: 'class', message: 'This relationship field has invalid...' }).
    // Prefer those over the top-level "The following field is invalid: <Label>" wrapper.
    const detailed: string[] = []
    for (const entry of data.errors ?? []) {
      const inner = Array.isArray(entry.data)
        ? entry.data
        : (entry.data?.errors ?? [])
      for (const fe of inner) {
        const key = fe.field ?? fe.path ?? fe.label
        if (fe.message) detailed.push(key ? `${key}: ${fe.message}` : fe.message)
      }
    }
    if (detailed.length > 0) return detailed.join('; ')

    const topLevel = (data.errors ?? [])
      .map((err) => (err.field ? `${err.field}: ${err.message}` : err.message))
      .filter(Boolean)
      .join('; ')
    if (topLevel) return topLevel
    if (data.message) return data.message
  } catch {
    // body wasn't JSON; fall through
  }
  return `Request failed (${response.status}) for ${path}`
}

const post = async <T = unknown,>(path: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(await extractErrorMessage(response, path))
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
      chapter: relId(lesson.chapterId),
      order: lesson.order,
    }),
  )
  await Promise.all(updates)
}

export const updateCourseSettings = async (
  courseId: EntityId,
  data: { title?: string; slug?: string; description?: string },
) => {
  await patch(`/api/classes/${courseId}`, data)
}

type CreatedDoc<T = Record<string, unknown>> = { doc?: T & { id?: string | number } }

export const createCourse = async (data: {
  title: string
  slug?: string
}): Promise<{ id: EntityId; title: string; slug: string | null }> => {
  const result = await post<CreatedDoc<{ title?: string; slug?: string }>>('/api/classes', {
    title: data.title,
    ...(data.slug ? { slug: data.slug } : {}),
  })
  const doc = result.doc
  if (!doc?.id) throw new Error('Course create response missing id')
  return {
    id: String(doc.id),
    title: doc.title ?? data.title,
    slug: doc.slug ?? null,
  }
}

export const createChapterInCourse = async (
  courseId: EntityId,
  title: string,
  chapterNumber: number,
): Promise<{ id: EntityId; title: string; order: number }> => {
  const result = await post<
    CreatedDoc<{ title?: string; chapterNumber?: number }>
  >('/api/chapters', {
    title,
    class: relId(courseId),
    chapterNumber,
  })
  const doc = result.doc
  if (!doc?.id) throw new Error('Chapter create response missing id')
  return {
    id: String(doc.id),
    title: doc.title ?? title,
    order:
      typeof doc.chapterNumber === 'number' && Number.isFinite(doc.chapterNumber)
        ? doc.chapterNumber
        : chapterNumber,
  }
}

export const updateChapterTitle = async (chapterId: EntityId, title: string) => {
  await patch(`/api/chapters/${chapterId}`, { title })
}

export const updateLessonTitle = async (lessonId: EntityId, title: string) => {
  await patch(`/api/lessons/${lessonId}`, { title })
}

export type LessonVersionSummary = {
  id: EntityId
  status: 'draft' | 'published'
  autosave: boolean
  updatedAt: string | null
  // Author name/email when available (depth>=1 hydrates `version.author`).
  authorLabel: string | null
}

type LessonVersionDoc = {
  id: string | number
  updatedAt?: string
  autosave?: boolean
  parent?: string | number
  version?: {
    _status?: string
    title?: string
    layout?: unknown
    author?:
      | string
      | number
      | { id?: string | number; firstName?: string; lastName?: string; email?: string }
  }
}

type AuthorValue = NonNullable<NonNullable<LessonVersionDoc['version']>['author']>

const formatAuthor = (author: AuthorValue | undefined): string | null => {
  if (!author) return null
  if (typeof author === 'string' || typeof author === 'number') return null
  const { firstName, lastName, email } = author
  const parts = [firstName, lastName].filter(Boolean) as string[]
  if (parts.length > 0) return parts.join(' ')
  if (typeof email === 'string') return email
  return null
}

export const listLessonVersions = async (
  lessonId: EntityId,
  limit = 20,
): Promise<LessonVersionSummary[]> => {
  const params = new URLSearchParams()
  params.set('where[parent][equals]', String(lessonId))
  params.set('sort', '-updatedAt')
  params.set('depth', '1')
  params.set('limit', String(limit))
  const json = await get<{ docs?: LessonVersionDoc[] }>(
    `/api/lessons/versions?${params.toString()}`,
  )
  return (json.docs ?? []).map((doc) => ({
    id: String(doc.id),
    status: doc.version?._status === 'published' ? 'published' : 'draft',
    autosave: Boolean(doc.autosave),
    updatedAt: doc.updatedAt ?? null,
    authorLabel: formatAuthor(doc.version?.author),
  }))
}

// Look up the most-recent published version for a lesson. Returns null if no
// version has ever been published. Used by the publish-review modal to show
// "Last published Xh ago — publishing version N+1".
//
// `publishedCount` is derived from `totalDocs` on the versions list filtered
// to published status. Payload doesn't expose a sequential int per version,
// so this is a best-effort approximation: it's exactly correct as long as
// no published versions get hard-deleted out of band. That matches what an
// author would expect to see in the modal — the count grows with each
// successful publish.
export const getLastPublishedLessonVersion = async (
  lessonId: EntityId,
): Promise<{
  versionId: EntityId
  updatedAt: string | null
  publishedCount: number
} | null> => {
  const params = new URLSearchParams()
  params.set('where[parent][equals]', String(lessonId))
  params.set('where[version._status][equals]', 'published')
  params.set('sort', '-updatedAt')
  params.set('depth', '0')
  params.set('limit', '1')
  const json = await get<{
    docs?: Array<{ id: string | number; updatedAt?: string }>
    totalDocs?: number
  }>(`/api/lessons/versions?${params.toString()}`)
  const doc = json.docs?.[0]
  if (!doc) return null
  return {
    versionId: String(doc.id),
    updatedAt: doc.updatedAt ?? null,
    publishedCount: typeof json.totalDocs === 'number' ? json.totalDocs : 1,
  }
}

// Fetch one version's full snapshot for restore — depth=1 so relationship ids
// inside the layout come back as objects (matches the create/edit hydrate
// path; `fromPersistedLayout` extracts ids either way).
export const getLessonVersion = async (
  versionId: EntityId,
): Promise<{ title: string; layout: unknown }> => {
  const json = await get<{ version?: { title?: string; layout?: unknown } }>(
    `/api/lessons/versions/${versionId}?depth=1`,
  )
  return {
    title: json.version?.title ?? '',
    layout: json.version?.layout ?? [],
  }
}

// Full lesson update from the custom editor: title + layout atomically.
// `intent` chooses how Payload routes the save:
//   * 'publish' → no query params, sets _status='published', overwrites live
//     doc and bumps the current version.
//   * 'draft'   → ?draft=true. Writes a new draft version; if the doc was
//     already published the live row keeps its content + 'published' status.
//   * 'autosave'→ ?draft=true&autosave=true. Same as 'draft' but tells Payload
//     this came from background autosave (used for i18n and analytics; doesn't
//     change persistence behavior).
// Picking the right intent matters: saving 'draft' on a published lesson with
// _status='draft' in the body would silently demote it, which is exactly the
// surprise we don't want from background saves.
export const updateLesson = async (
  lessonId: EntityId,
  data: {
    title: string
    layout: Record<string, unknown>[]
    intent: 'draft' | 'publish' | 'autosave'
  },
) => {
  const body: Record<string, unknown> = {
    title: data.title,
    layout: data.layout,
  }
  const params = new URLSearchParams()
  if (data.intent === 'publish') {
    body._status = 'published'
  } else {
    params.set('draft', 'true')
    if (data.intent === 'autosave') params.set('autosave', 'true')
  }

  const url = `/api/lessons/${lessonId}${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, url))
  }
}

export const deleteLesson = async (lessonId: EntityId) => {
  await remove(`/api/lessons/${lessonId}`)
}

// Clone a lesson into the same chapter as a fresh draft. Source layout is
// fetched at depth=0 so the persisted shape (with raw relationship ids) round
// -trips into the new lesson cleanly. Payload assigns new block ids on save.
export const duplicateLesson = async (
  lessonId: EntityId,
  chapterId: EntityId,
  order: number,
): Promise<{ id: EntityId; title: string; order: number }> => {
  const source = await get<{
    title?: string
    layout?: Record<string, unknown>[]
  }>(`/api/lessons/${lessonId}?depth=0&draft=true`)
  const baseTitle = source.title?.trim() || 'Untitled lesson'
  const newTitle = baseTitle.endsWith(' (copy)') ? baseTitle : `${baseTitle} (copy)`

  // Strip Payload's per-block `id` so the new lesson gets fresh ones rather
  // than collision-prone duplicates.
  const layout = (source.layout ?? []).map((block) => {
    const { id: _ignored, ...rest } = block as { id?: unknown }
    return rest
  })

  return createLesson(chapterId, newTitle, order, {
    layout,
    // Always create the duplicate as a draft regardless of the source's
    // status — duplicating a published lesson into a published row would
    // surprise students with an instantly-live, untitled-but-similar copy.
    status: 'draft',
  })
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
  options?: {
    layout?: Record<string, unknown>[]
    status?: 'draft' | 'published'
  },
): Promise<{ id: EntityId; title: string; order: number }> => {
  const body: Record<string, unknown> = {
    title,
    chapter: relId(chapterId),
    order,
  }
  if (options?.layout && options.layout.length > 0) body.layout = options.layout
  // Payload treats _status absence as draft; set explicitly only when the
  // caller asks for publish so we don't accidentally publish a stub.
  if (options?.status === 'published') body._status = 'published'

  const result = await post<LessonCreatedDoc>('/api/lessons', body)
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
  await patch(`/api/lessons/${lessonId}`, { chapter: relId(chapterId), order })
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

type QuizSearchDoc = {
  id: string | number
  title?: string
  _status?: string
  updatedAt?: string
}

export type QuizSearchResult = {
  id: EntityId
  title: string
  status: string | null
  updatedAt: string | null
}

export type MediaSearchResult = {
  id: EntityId
  filename: string | null
  alt: string | null
  mimeType: string | null
  url: string | null
}

const mediaResultFromDoc = (doc: {
  id: string | number
  filename?: string
  alt?: string
  mimeType?: string
  url?: string
}): MediaSearchResult => ({
  id: String(doc.id),
  filename: doc.filename ?? null,
  alt: doc.alt ?? null,
  mimeType: doc.mimeType ?? null,
  url: doc.url ?? null,
})

export const searchMedia = async (
  query: string,
  limit = 25,
): Promise<MediaSearchResult[]> => {
  const params = new URLSearchParams()
  params.set('depth', '0')
  params.set('limit', String(limit))
  params.set('sort', '-updatedAt')
  if (query.trim()) {
    params.set('where[filename][like]', query.trim())
  }
  const json = await get<{ docs?: Parameters<typeof mediaResultFromDoc>[0][] }>(
    `/api/media?${params.toString()}`,
  )
  return (json.docs ?? []).map(mediaResultFromDoc)
}

// Upload a file to the `media` collection. Returns the created doc summary so
// the picker can immediately show the upload as the selected value.
export const uploadMedia = async (file: File): Promise<MediaSearchResult> => {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch('/api/media', {
    method: 'POST',
    credentials: 'include',
    body: form,
  })
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, '/api/media'))
  }
  const json = (await response.json()) as { doc?: Parameters<typeof mediaResultFromDoc>[0] }
  if (!json.doc?.id) throw new Error('Media upload response missing id')
  return mediaResultFromDoc(json.doc)
}

export const searchQuizzes = async (
  query: string,
  limit = 25,
): Promise<QuizSearchResult[]> => {
  const params = new URLSearchParams()
  params.set('depth', '0')
  params.set('limit', String(limit))
  params.set('sort', '-updatedAt')
  if (query.trim()) {
    params.set('where[title][like]', query.trim())
  }
  const json = await get<{ docs?: QuizSearchDoc[] }>(`/api/quizzes?${params.toString()}`)
  return (json.docs ?? []).map((doc) => ({
    id: String(doc.id),
    title: doc.title ?? 'Untitled quiz',
    status: doc._status ?? null,
    updatedAt: doc.updatedAt ?? null,
  }))
}

type LessonLayoutBlock = Record<string, unknown> & { blockType?: string }

const fetchLessonLayout = async (lessonId: EntityId): Promise<LessonLayoutBlock[]> => {
  const json = await get<{ layout?: unknown }>(
    `/api/lessons/${lessonId}?depth=0`,
  )
  return Array.isArray(json.layout) ? (json.layout as LessonLayoutBlock[]) : []
}

export const assignQuizToLesson = async (lessonId: EntityId, quizId: EntityId) => {
  const layout = await fetchLessonLayout(lessonId)
  const existingIndex = layout.findIndex((block) => block.blockType === 'quizBlock')
  const quizRef = relId(quizId)
  const quizBlock: LessonLayoutBlock =
    existingIndex >= 0
      ? { ...layout[existingIndex], blockType: 'quizBlock', quiz: quizRef }
      : { blockType: 'quizBlock', quiz: quizRef, showTitle: true }
  const nextLayout =
    existingIndex >= 0
      ? layout.map((block, index) => (index === existingIndex ? quizBlock : block))
      : [...layout, quizBlock]
  await patch(`/api/lessons/${lessonId}`, { layout: nextLayout })
}

export const removeQuizFromLesson = async (lessonId: EntityId) => {
  const layout = await fetchLessonLayout(lessonId)
  const nextLayout = layout.filter((block) => block.blockType !== 'quizBlock')
  await patch(`/api/lessons/${lessonId}`, { layout: nextLayout })
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
