import type { PayloadRequest } from 'payload'

import { generateUniqueJoinCode } from '../utils/joinCode'

const isProfessorOrStaff = (req: PayloadRequest) =>
  req.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const joinClassroomHandler = async (req: PayloadRequest) => {
  if (req.user?.collection !== 'accounts') {
    return jsonResponse({ message: 'Student login required.' }, 401)
  }

  const body =
    req.body && typeof req.body === 'object'
      ? (req.body as unknown as { code?: unknown })
      : null
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
      student: { equals: req.user.id },
    },
  })

  const membership =
    existing.docs?.[0] ??
    (await req.payload.create({
      collection: 'classroom-memberships',
      overrideAccess: true,
      data: {
        classroom: classroom.id,
        student: req.user.id,
        joinedAt: new Date().toISOString(),
      },
    }))

  return jsonResponse({ classroom, membership })
}

export const regenerateClassroomCodeHandler = async (req: PayloadRequest) => {
  if (!isProfessorOrStaff(req)) {
    return jsonResponse({ message: 'Not authorized.' }, 403)
  }

  const body =
    req.body && typeof req.body === 'object'
      ? (req.body as unknown as Record<string, unknown>)
      : null
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
  })

  if (req.user?.role === 'professor' && classroom?.professor !== req.user.id) {
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
