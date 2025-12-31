import type { PayloadRequest } from 'payload'

import { generateUniqueJoinCode } from '../utils/joinCode'

type ResponseLike = {
  status: (code: number) => ResponseLike
  json: (data: unknown) => void
}

const isProfessorOrStaff = (req: PayloadRequest) =>
  req.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const joinClassroomHandler = async (req: PayloadRequest, res: ResponseLike) => {
  if (req.user?.collection !== 'accounts') {
    res.status(401).json({ message: 'Student login required.' })
    return
  }

  const rawCode = typeof req.body?.code === 'string' ? req.body.code : ''
  const code = rawCode.trim().toUpperCase()
  if (!code) {
    res.status(400).json({ message: 'Join code is required.' })
    return
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
    res.status(404).json({ message: 'Classroom not found or inactive.' })
    return
  }
  if (classroom.joinCodeExpiresAt) {
    const expiresAt = new Date(classroom.joinCodeExpiresAt)
    if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
      res.status(410).json({ message: 'Join code has expired.' })
      return
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

  res.status(200).json({ classroom, membership })
}

export const regenerateClassroomCodeHandler = async (req: PayloadRequest, res: ResponseLike) => {
  if (!isProfessorOrStaff(req)) {
    res.status(403).json({ message: 'Not authorized.' })
    return
  }

  const classroomId = req.body?.classroomId
  if (!classroomId) {
    res.status(400).json({ message: 'classroomId is required.' })
    return
  }

  const classroom = await req.payload.findByID({
    collection: 'classrooms',
    id: classroomId,
    depth: 0,
  })

  if (req.user?.role === 'professor' && classroom?.professor !== req.user.id) {
    res.status(403).json({ message: 'Not authorized for this classroom.' })
    return
  }

  const length =
    typeof req.body?.length === 'number' && Number.isFinite(req.body.length)
      ? req.body.length
      : 6
  const durationHours =
    typeof req.body?.durationHours === 'number' && Number.isFinite(req.body.durationHours)
      ? req.body.durationHours
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

  res.status(200).json({ joinCode, classroom: updated })
}
