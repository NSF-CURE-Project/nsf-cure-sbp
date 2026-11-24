import type { PayloadRequest, TypedUser } from 'payload'

import { generateUniqueJoinCode } from '../utils/joinCode'

// Custom endpoints registered on a non-auth-enabled collection (Classrooms
// has no `auth` config) don't get `req.user` auto-resolved by Payload's
// pipeline. We re-resolve from the request cookies ourselves so the handler
// sees the actual logged-in account (or anonymous, if no session).
const resolveUser = async (req: PayloadRequest): Promise<TypedUser | null> => {
  if (req.user) return req.user
  try {
    const result = await req.payload.auth({ headers: req.headers })
    return result.user ?? null
  } catch {
    return null
  }
}

const isProfessorOrStaff = (user: TypedUser | null | undefined) =>
  user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes((user as { role?: string }).role ?? '')

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

// Payload 3 doesn't guarantee `req.body` is the parsed JSON for custom
// collection endpoints — it can arrive as a ReadableStream or be absent.
// Fall back to req.json() / req.text() in that order (matches the canonical
// pattern in previewUrl.ts).
const readJsonBody = async (req: PayloadRequest): Promise<Record<string, unknown> | null> => {
  if (req.body && typeof req.body === 'object' && !('getReader' in (req.body as object))) {
    return req.body as unknown as Record<string, unknown>
  }
  const requestMeta = req as unknown as {
    json?: () => Promise<unknown>
    text?: () => Promise<string>
  }
  if (typeof requestMeta.json === 'function') {
    try {
      const parsed = await requestMeta.json()
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
    } catch {
      // fall through
    }
  }
  if (typeof requestMeta.text === 'function') {
    try {
      const raw = await requestMeta.text()
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
      }
    } catch {
      // fall through
    }
  }
  return null
}

export const joinClassroomHandler = async (req: PayloadRequest) => {
  const user = await resolveUser(req)
  if (user?.collection !== 'accounts') {
    return jsonResponse({ message: 'Student login required.' }, 401)
  }

  const body = (await readJsonBody(req)) as { code?: unknown } | null
  const rawCode = typeof body?.code === 'string' ? body.code : ''
  const code = rawCode.trim().toUpperCase()
  if (!code) {
    return jsonResponse({ message: 'Join code is required.' }, 400)
  }

  const classrooms = await req.payload.find({
    collection: 'classrooms',
    depth: 1,
    limit: 1,
    where: {
      joinCode: { equals: code },
      active: { equals: true },
    },
    overrideAccess: true,
  })

  const classroom = classrooms.docs?.[0]
  if (!classroom) {
    return jsonResponse({ message: 'Classroom not found or inactive.' }, 404)
  }
  if (classroom.joinCodeExpiresAt) {
    const expiresAt = new Date(classroom.joinCodeExpiresAt)
    if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
      return jsonResponse({ message: 'Join code has expired.' }, 410)
    }
  }

  const existing = await req.payload.find({
    collection: 'classroom-memberships',
    depth: 0,
    limit: 1,
    where: {
      classroom: { equals: classroom.id },
      student: { equals: user.id },
    },
    overrideAccess: true,
  })

  const membership =
    existing.docs?.[0] ??
    (await req.payload.create({
      collection: 'classroom-memberships',
      overrideAccess: true,
      data: {
        classroom: classroom.id,
        student: user.id,
        joinedAt: new Date().toISOString(),
      },
    }))

  return jsonResponse({ classroom, membership })
}

export const regenerateClassroomCodeHandler = async (req: PayloadRequest) => {
  const user = await resolveUser(req)
  if (!isProfessorOrStaff(user)) {
    return jsonResponse({ message: 'Not authorized.' }, 403)
  }

  const body = await readJsonBody(req)
  const classroomId =
    typeof body?.classroomId === 'string' || typeof body?.classroomId === 'number'
      ? body.classroomId
      : null
  if (!classroomId) {
    return jsonResponse({ message: 'classroomId is required.' }, 400)
  }

  const classroom = await req.payload.findByID({
    collection: 'classrooms',
    id: classroomId,
    depth: 0,
    overrideAccess: true,
  })

  if (
    (user as { role?: string })?.role === 'professor' &&
    classroom?.professor !== user!.id
  ) {
    return jsonResponse({ message: 'Not authorized for this classroom.' }, 403)
  }

  const length =
    typeof body?.length === 'number' && Number.isFinite(body.length) ? body.length : 6
  const durationHours =
    typeof body?.durationHours === 'number' && Number.isFinite(body.durationHours)
      ? body.durationHours
      : 168

  const joinCode = await generateUniqueJoinCode(req.payload, length)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString()
  const updated = await req.payload.update({
    collection: 'classrooms',
    id: classroomId,
    overrideAccess: true,
    data: {
      joinCode,
      joinCodeLength: length,
      joinCodeDurationHours: durationHours,
      joinCodeExpiresAt: expiresAt,
      joinCodeLastRotatedAt: now.toISOString(),
    },
  })

  return jsonResponse({ joinCode, classroom: updated })
}

export const leaveClassroomHandler = async (req: PayloadRequest) => {
  const user = await resolveUser(req)
  if (user?.collection !== 'accounts') {
    return jsonResponse({ message: 'Student login required.' }, 401)
  }

  const routeParams = (req as { routeParams?: Record<string, unknown> }).routeParams
  const classroomId = routeParams?.classroomId
  const resolvedClassroomId =
    typeof classroomId === 'string' || typeof classroomId === 'number'
      ? String(classroomId)
      : ''

  if (!resolvedClassroomId) {
    return jsonResponse({ message: 'classroomId is required.' }, 400)
  }

  const membershipResult = await req.payload.find({
    collection: 'classroom-memberships',
    where: {
      classroom: { equals: resolvedClassroomId },
      student: { equals: user.id },
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })

  const membership = membershipResult.docs?.[0]
  if (!membership) {
    return jsonResponse({ message: 'Membership not found.' }, 404)
  }

  await req.payload.delete({
    collection: 'classroom-memberships',
    id: membership.id,
    overrideAccess: true,
  })

  return jsonResponse({ success: true })
}
