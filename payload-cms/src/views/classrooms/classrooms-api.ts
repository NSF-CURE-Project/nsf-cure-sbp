export type EntityId = string

type CreatedDoc<T = Record<string, unknown>> = { doc?: T & { id?: string | number } }

type PayloadFieldError = { message?: string; field?: string; label?: string; path?: string }
type PayloadErrorEntry = {
  message?: string
  field?: string
  data?: { errors?: PayloadFieldError[] } | PayloadFieldError[]
}

// Match courses-order-api: Payload's serial-int IDs need to land on the wire
// as numbers when used in relationship fields, but we hold them as strings
// in React state for key safety.
const relId = (id: EntityId): number | string => (/^\d+$/.test(id) ? Number(id) : id)

const extractErrorMessage = async (response: Response, path: string): Promise<string> => {
  try {
    const data = (await response.clone().json()) as {
      message?: string
      errors?: PayloadErrorEntry[]
    }
    const detailed: string[] = []
    for (const entry of data.errors ?? []) {
      const inner = Array.isArray(entry.data) ? entry.data : (entry.data?.errors ?? [])
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
    // body wasn't JSON
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

const patch = async (path: string, body: Record<string, unknown>): Promise<void> => {
  const response = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(await extractErrorMessage(response, path))
}

const remove = async (path: string): Promise<void> => {
  const response = await fetch(path, { method: 'DELETE', credentials: 'include' })
  if (!response.ok) throw new Error(await extractErrorMessage(response, path))
}

export type CreateClassroomInput = {
  title: string
  classId: EntityId
  professorId: EntityId
}

export const createClassroom = async (
  input: CreateClassroomInput,
): Promise<{ id: EntityId; title: string }> => {
  const result = await post<CreatedDoc<{ title?: string }>>('/api/classrooms', {
    title: input.title,
    class: relId(input.classId),
    professor: relId(input.professorId),
  })
  const doc = result.doc
  if (!doc?.id) throw new Error('Classroom create response missing id')
  return { id: String(doc.id), title: doc.title ?? input.title }
}

export type UpdateClassroomInput = {
  title?: string
  classId?: EntityId
  professorId?: EntityId
  active?: boolean
  joinCodeLength?: number
  joinCodeDurationHours?: number
}

export const updateClassroom = async (
  classroomId: EntityId,
  input: UpdateClassroomInput,
): Promise<void> => {
  const body: Record<string, unknown> = {}
  if (input.title !== undefined) body.title = input.title
  if (input.classId !== undefined) body.class = relId(input.classId)
  if (input.professorId !== undefined) body.professor = relId(input.professorId)
  if (input.active !== undefined) body.active = input.active
  if (input.joinCodeLength !== undefined) body.joinCodeLength = input.joinCodeLength
  if (input.joinCodeDurationHours !== undefined)
    body.joinCodeDurationHours = input.joinCodeDurationHours
  await patch(`/api/classrooms/${classroomId}`, body)
}

export const deleteClassroom = async (classroomId: EntityId): Promise<void> => {
  await remove(`/api/classrooms/${classroomId}`)
}

export type RegenerateJoinCodeResponse = {
  joinCode: string
  joinCodeExpiresAt: string | null
  joinCodeLastRotatedAt: string | null
}

export const regenerateJoinCode = async (
  classroomId: EntityId,
  options: { length?: number; durationHours?: number } = {},
): Promise<RegenerateJoinCodeResponse> => {
  const response = await fetch('/api/classrooms/regenerate-code', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      classroomId,
      ...(options.length !== undefined ? { length: options.length } : {}),
      ...(options.durationHours !== undefined ? { durationHours: options.durationHours } : {}),
    }),
  })
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, '/api/classrooms/regenerate-code'))
  }
  const data = (await response.json()) as {
    joinCode?: string
    classroom?: { joinCodeExpiresAt?: string; joinCodeLastRotatedAt?: string }
  }
  return {
    joinCode: data.joinCode ?? '',
    joinCodeExpiresAt: data.classroom?.joinCodeExpiresAt ?? null,
    joinCodeLastRotatedAt: data.classroom?.joinCodeLastRotatedAt ?? null,
  }
}

export type CourseOption = { id: EntityId; title: string }

export const searchCourses = async (query: string, limit = 25): Promise<CourseOption[]> => {
  const params = new URLSearchParams({
    limit: String(limit),
    sort: 'title',
    depth: '0',
  })
  const trimmed = query.trim()
  if (trimmed) params.set('where[title][like]', trimmed)
  const response = await fetch(`/api/classes?${params.toString()}`, { credentials: 'include' })
  if (!response.ok) throw new Error(`Request failed (${response.status}) for course search`)
  const data = (await response.json()) as { docs?: Array<{ id?: string | number; title?: string }> }
  return (data.docs ?? [])
    .filter((doc) => doc.id != null)
    .map((doc) => ({ id: String(doc.id), title: doc.title ?? 'Untitled course' }))
}

export type ProfessorOption = {
  id: EntityId
  name: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export const buildUserDisplayName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
): string => {
  const first = (firstName ?? '').trim()
  const last = (lastName ?? '').trim()
  const composed = [first, last].filter(Boolean).join(' ')
  if (composed) return composed
  return (email ?? '').trim() || 'Unnamed user'
}

export const buildUserInitials = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
): string => {
  const first = (firstName ?? '').trim()
  const last = (lastName ?? '').trim()
  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?'
  }
  const handle = (email ?? '').trim().split('@')[0] ?? ''
  return handle.slice(0, 2).toUpperCase() || '?'
}

export const searchProfessors = async (query: string, limit = 25): Promise<ProfessorOption[]> => {
  const params = new URLSearchParams({
    limit: String(limit),
    sort: 'lastName',
    depth: '0',
  })
  const trimmed = query.trim()
  if (trimmed) {
    // Filter to staff-eligible roles AND (name OR email match) — Payload's
    // top-level `where` is implicit AND, so we combine the role filter with
    // a nested `or` for the text match.
    params.set('where[role][in]', 'admin,staff,professor')
    params.set('where[or][0][firstName][like]', trimmed)
    params.set('where[or][1][lastName][like]', trimmed)
    params.set('where[or][2][email][like]', trimmed)
  } else {
    params.set('where[role][in]', 'admin,staff,professor')
  }
  const response = await fetch(`/api/users?${params.toString()}`, { credentials: 'include' })
  if (!response.ok) throw new Error(`Request failed (${response.status}) for professor search`)
  const data = (await response.json()) as {
    docs?: Array<{
      id?: string | number
      firstName?: string
      lastName?: string
      email?: string
      role?: string
    }>
  }
  return (data.docs ?? [])
    .filter((doc) => doc.id != null)
    .map((doc) => ({
      id: String(doc.id),
      name: buildUserDisplayName(doc.firstName, doc.lastName, doc.email),
      firstName: doc.firstName ?? '',
      lastName: doc.lastName ?? '',
      email: doc.email ?? '',
      role: doc.role ?? 'staff',
    }))
}
