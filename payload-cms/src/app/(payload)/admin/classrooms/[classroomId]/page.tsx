import React from 'react'
import { notFound } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import ClassroomEditor from '@/views/classrooms/ClassroomEditor'
import { buildUserDisplayName, type EntityId } from '@/views/classrooms/classrooms-api'

type ClassroomDoc = {
  id?: string | number
  title?: string
  class?: { id?: string | number; title?: string } | string | number | null
  professor?:
    | {
        id?: string | number
        firstName?: string
        lastName?: string
        email?: string
      }
    | string
    | number
    | null
  joinCode?: string | null
  joinCodeLength?: number | null
  joinCodeDurationHours?: number | null
  joinCodeExpiresAt?: string | null
  joinCodeLastRotatedAt?: string | null
  active?: boolean | null
  createdAt?: string | null
}

const courseRef = (
  value: ClassroomDoc['class'],
): { id: EntityId | ''; label: string | null } => {
  if (value && typeof value === 'object') {
    const id = (value as { id?: string | number }).id
    return {
      id: id != null ? String(id) : '',
      label: (value as { title?: string }).title ?? null,
    }
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return { id: String(value), label: null }
  }
  return { id: '', label: null }
}

const professorRef = (
  value: ClassroomDoc['professor'],
): {
  id: EntityId | ''
  name: string | null
  firstName: string
  lastName: string
  email: string
} => {
  if (value && typeof value === 'object') {
    const id = (value as { id?: string | number }).id
    const firstName = (value as { firstName?: string }).firstName ?? ''
    const lastName = (value as { lastName?: string }).lastName ?? ''
    const email = (value as { email?: string }).email ?? ''
    return {
      id: id != null ? String(id) : '',
      name: buildUserDisplayName(firstName, lastName, email),
      firstName,
      lastName,
      email,
    }
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return { id: String(value), name: null, firstName: '', lastName: '', email: '' }
  }
  return { id: '', name: null, firstName: '', lastName: '', email: '' }
}

const resolveWebOrigin = (): string =>
  (
    process.env.WEB_PREVIEW_URL ??
    process.env.FRONTEND_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ''
  )
    .trim()
    .replace(/\/+$/, '')

export default async function EditClassroomPage({
  params,
}: {
  params: Promise<{ classroomId: string }>
}) {
  const { classroomId } = await params
  const payload = await getPayload({ config: configPromise })

  const classroom = await payload
    .findByID({
      collection: 'classrooms',
      id: classroomId,
      depth: 1,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!classroom) notFound()

  const doc = classroom as ClassroomDoc
  const course = courseRef(doc.class)
  const professor = professorRef(doc.professor)

  // Fetch totalDocs + most-recent membership in a single query (limit: 1).
  // The most-recent joinedAt powers the "Last joined" stat in the sidebar.
  const memberships = await payload
    .find({
      collection: 'classroom-memberships',
      depth: 0,
      limit: 1,
      sort: '-joinedAt',
      where: { classroom: { equals: classroomId } },
      overrideAccess: true,
    })
    .catch(() => ({ totalDocs: 0, docs: [] as Array<{ joinedAt?: string | null }> }))

  const lastJoinedAt = memberships.docs?.[0]?.joinedAt ?? null

  return (
    <Gutter>
      <div style={{ maxWidth: 1080, margin: '0 auto 64px' }}>
        <ClassroomEditor
          classroomId={String(doc.id ?? classroomId)}
          initialTitle={doc.title ?? ''}
          initialCourseId={course.id}
          initialCourseTitle={course.label}
          initialProfessorId={professor.id}
          initialProfessorName={professor.name}
          initialProfessorFirstName={professor.firstName}
          initialProfessorLastName={professor.lastName}
          initialProfessorEmail={professor.email}
          initialActive={doc.active !== false}
          initialJoinCode={doc.joinCode ?? ''}
          initialJoinCodeLength={
            typeof doc.joinCodeLength === 'number' ? doc.joinCodeLength : 6
          }
          initialJoinCodeDurationHours={
            typeof doc.joinCodeDurationHours === 'number' ? doc.joinCodeDurationHours : 168
          }
          initialJoinCodeExpiresAt={doc.joinCodeExpiresAt ?? null}
          initialJoinCodeLastRotatedAt={doc.joinCodeLastRotatedAt ?? null}
          memberCount={memberships.totalDocs ?? 0}
          lastJoinedAt={lastJoinedAt}
          createdAt={doc.createdAt ?? null}
          webOrigin={resolveWebOrigin()}
        />
      </div>
    </Gutter>
  )
}
