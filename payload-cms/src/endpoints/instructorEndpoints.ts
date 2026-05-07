import type { PayloadHandler, PayloadRequest } from 'payload'

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const isInstructorOrAdmin = (req: PayloadRequest) =>
  req.user?.collection === 'users' && ['professor', 'admin'].includes(req.user.role ?? '')

const parseRouteId = (req: Parameters<PayloadHandler>[0], key: string, pattern: RegExp): string => {
  const routeParams = (req as { routeParams?: Record<string, unknown> }).routeParams
  const routeValue = routeParams?.[key]
  if (typeof routeValue === 'string' || typeof routeValue === 'number') return String(routeValue)

  const rawUrl = typeof req.url === 'string' ? req.url : ''
  if (!rawUrl) return ''

  try {
    const pathname = new URL(rawUrl, 'http://localhost').pathname
    const match = pathname.match(pattern)
    return match?.[1] ? decodeURIComponent(match[1]) : ''
  } catch {
    return ''
  }
}

const getId = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id != null ? String(id) : ''
  }
  return ''
}

const getDisplayName = (value: unknown) => {
  if (typeof value !== 'object' || value === null) return 'Student'
  const entry = value as { fullName?: unknown; email?: unknown }
  if (typeof entry.fullName === 'string' && entry.fullName.trim()) return entry.fullName
  if (typeof entry.email === 'string' && entry.email.trim()) return entry.email
  return 'Student'
}

export const classroomRosterHandler: PayloadHandler = async (req) => {
  if (!isInstructorOrAdmin(req)) {
    return jsonResponse({ message: 'Not authorized.' }, 403)
  }

  const classroomId = parseRouteId(req, 'classroomId', /\/instructor\/classrooms\/([^/]+)\/roster$/)
  if (!classroomId) {
    return jsonResponse({ message: 'classroomId is required.' }, 400)
  }

  const classroom = await req.payload.findByID({
    collection: 'classrooms',
    id: classroomId,
    depth: 1,
    overrideAccess: true,
  })

  const professorId = getId((classroom as { professor?: unknown }).professor)
  if (req.user?.role === 'professor' && professorId !== String(req.user.id)) {
    return jsonResponse({ message: 'Not authorized for this classroom.' }, 403)
  }

  const memberships = await req.payload.find({
    collection: 'classroom-memberships',
    where: {
      classroom: { equals: classroomId },
    },
    depth: 2,
    limit: 200,
    overrideAccess: true,
  })

  const students = (memberships.docs ?? []).map((membership) => {
    const student = (membership as { student?: unknown }).student
    return {
      accountId: getId(student),
      name: getDisplayName(student),
      email:
        typeof student === 'object' && student !== null && 'email' in student
          ? ((student as { email?: string }).email ?? null)
          : null,
      completedLessons: (membership as { completedLessons?: number }).completedLessons ?? 0,
      totalLessons: (membership as { totalLessons?: number }).totalLessons ?? 0,
      completionRate: (membership as { completionRate?: number }).completionRate ?? 0,
      lastActivityAt: (membership as { lastActivityAt?: string | null }).lastActivityAt ?? null,
      joinedAt: (membership as { joinedAt?: string | null }).joinedAt ?? null,
    }
  })

  return jsonResponse({
    classroom: {
      id: getId(classroom),
      title: (classroom as { title?: string }).title ?? 'Classroom',
    },
    students,
  })
}

export const classroomListHandler: PayloadHandler = async (req) => {
  if (!isInstructorOrAdmin(req)) {
    return jsonResponse({ message: 'Not authorized.' }, 403)
  }

  const where =
    req.user?.role === 'professor'
      ? {
          professor: { equals: req.user.id },
        }
      : undefined

  const classrooms = await req.payload.find({
    collection: 'classrooms',
    depth: 2,
    limit: 100,
    overrideAccess: true,
    ...(where ? { where: where as never } : {}),
  })

  const docs = await Promise.all(
    (classrooms.docs ?? []).map(async (classroom) => {
      const classroomId = getId(classroom)
      const memberships = await req.payload.find({
        collection: 'classroom-memberships',
        where: {
          classroom: { equals: classroomId },
        },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      })

      return {
        id: classroomId,
        title: (classroom as { title?: string }).title ?? 'Classroom',
        classTitle:
          typeof (classroom as { class?: { title?: string } | string }).class === 'object'
            ? ((classroom as { class?: { title?: string } }).class?.title ?? 'Class')
            : 'Class',
        classSlug:
          typeof (classroom as { class?: { slug?: string } | string }).class === 'object'
            ? ((classroom as { class?: { slug?: string } }).class?.slug ?? null)
            : null,
        studentCount: memberships.totalDocs ?? memberships.docs?.length ?? 0,
      }
    }),
  )

  return jsonResponse({ classrooms: docs })
}
