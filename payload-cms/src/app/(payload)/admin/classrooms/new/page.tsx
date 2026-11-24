import React from 'react'
import { Gutter } from '@payloadcms/ui'
import { headers as nextHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import CreateClassroomGuide from '@/views/classrooms/CreateClassroomGuide'
import {
  buildUserDisplayName,
  type CourseOption,
  type EntityId,
  type ProfessorOption,
} from '@/views/classrooms/classrooms-api'

const STAFF_ROLES = new Set(['admin', 'staff', 'professor'])

export default async function CreateClassroomPage() {
  const payload = await getPayload({ config: configPromise })

  const [classes, professors, authResult] = await Promise.all([
    payload.find({
      collection: 'classes',
      depth: 0,
      limit: 200,
      sort: 'title',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'users',
      depth: 0,
      limit: 200,
      sort: 'name',
      where: { role: { in: ['admin', 'staff', 'professor'] } },
      overrideAccess: true,
    }),
    payload.auth({ headers: await nextHeaders() }).catch(() => null),
  ])

  const initialCourses: CourseOption[] = (classes.docs ?? []).map((doc) => {
    const courseDoc = doc as { id?: string | number; title?: string }
    return {
      id: String(courseDoc.id ?? ''),
      title: courseDoc.title ?? 'Untitled course',
    }
  })

  const initialProfessors: ProfessorOption[] = (professors.docs ?? []).map((doc) => {
    const userDoc = doc as {
      id?: string | number
      firstName?: string
      lastName?: string
      email?: string
      role?: string
    }
    return {
      id: String(userDoc.id ?? ''),
      name: buildUserDisplayName(userDoc.firstName, userDoc.lastName, userDoc.email),
      firstName: userDoc.firstName ?? '',
      lastName: userDoc.lastName ?? '',
      email: userDoc.email ?? '',
      role: userDoc.role ?? 'staff',
    }
  })

  // Pre-select the current user as professor if they're staff/professor/admin.
  // The classroom collection's beforeChange also defaults `professor` to the
  // requesting user, but selecting it up-front lets the form submit without
  // a forced picker step.
  const currentUser = authResult?.user
  let defaultProfessorId: EntityId | null = null
  if (
    currentUser &&
    currentUser.collection === 'users' &&
    STAFF_ROLES.has(currentUser.role ?? '')
  ) {
    defaultProfessorId = String(currentUser.id)
  }

  return (
    <Gutter>
      <div style={{ maxWidth: 880, margin: '24px auto 80px' }}>
        <CreateClassroomGuide
          initialCourses={initialCourses}
          initialProfessors={initialProfessors}
          defaultProfessorId={defaultProfessorId}
        />
      </div>
    </Gutter>
  )
}
