import React from 'react'
import { notFound } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import ClassroomStudentsView, {
  type ClassroomStudentRow,
} from '@/views/classrooms/ClassroomStudentsView'
import { buildUserDisplayName } from '@/views/classrooms/classrooms-api'

type ClassroomDoc = {
  id?: string | number
  title?: string
  class?: { id?: string | number; title?: string } | string | number | null
  professor?:
    | { id?: string | number; firstName?: string; lastName?: string; email?: string }
    | string
    | number
    | null
  active?: boolean | null
}

type MembershipDoc = {
  id?: string | number
  student?:
    | {
        id?: string | number
        fullName?: string
        firstName?: string
        lastName?: string
        email?: string
      }
    | string
    | number
    | null
  joinedAt?: string | null
  completedLessons?: number | null
  totalLessons?: number | null
  completionRate?: number | null
  lastActivityAt?: string | null
}

const studentDisplay = (
  value: MembershipDoc['student'],
): { id: string | null; name: string; email: string | null } => {
  if (value && typeof value === 'object') {
    const id =
      (value as { id?: string | number }).id != null
        ? String((value as { id?: string | number }).id)
        : null
    const firstName = (value as { firstName?: string }).firstName ?? ''
    const lastName = (value as { lastName?: string }).lastName ?? ''
    const fullName = (value as { fullName?: string }).fullName?.trim() ?? ''
    const email = (value as { email?: string }).email ?? ''
    const name =
      fullName ||
      buildUserDisplayName(firstName, lastName, email) ||
      email ||
      'Student'
    return { id, name, email: email || null }
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return { id: String(value), name: 'Student', email: null }
  }
  return { id: null, name: 'Student', email: null }
}

export default async function ClassroomStudentsPage({
  params,
}: {
  params: Promise<{ classroomId: string }>
}) {
  const { classroomId } = await params
  const payload = await getPayload({ config: configPromise })

  const classroom = (await payload
    .findByID({
      collection: 'classrooms',
      id: classroomId,
      depth: 1,
      overrideAccess: true,
    })
    .catch(() => null)) as ClassroomDoc | null

  if (!classroom) notFound()

  const memberships = await payload
    .find({
      collection: 'classroom-memberships',
      depth: 1,
      limit: 1000,
      sort: '-joinedAt',
      where: { classroom: { equals: classroomId } },
      overrideAccess: true,
    })
    .catch(() => ({ docs: [] as MembershipDoc[], totalDocs: 0 }))

  const rows: ClassroomStudentRow[] = (memberships.docs ?? []).map((entry) => {
    const membership = entry as MembershipDoc
    const student = studentDisplay(membership.student)
    return {
      membershipId: String(membership.id ?? ''),
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      joinedAt: membership.joinedAt ?? null,
      completedLessons:
        typeof membership.completedLessons === 'number' ? membership.completedLessons : 0,
      totalLessons:
        typeof membership.totalLessons === 'number' ? membership.totalLessons : 0,
      completionRate:
        typeof membership.completionRate === 'number' ? membership.completionRate : 0,
      lastActivityAt: membership.lastActivityAt ?? null,
    }
  })

  const courseValue = classroom.class
  const courseTitle =
    typeof courseValue === 'object' && courseValue !== null
      ? (courseValue.title ?? null)
      : null

  return (
    <Gutter>
      <div style={{ maxWidth: 1080, margin: '0 auto 64px' }}>
        <ClassroomStudentsView
          classroomId={String(classroom.id ?? classroomId)}
          classroomTitle={classroom.title ?? 'Classroom'}
          courseTitle={courseTitle}
          active={classroom.active !== false}
          rows={rows}
        />
      </div>
    </Gutter>
  )
}
