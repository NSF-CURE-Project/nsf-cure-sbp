import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import ClassroomsHome from '@/views/classrooms/ClassroomsHome'
import type { ClassroomCatalogItem } from '@/views/classrooms/ClassroomsHomeCard'
import { buildUserDisplayName } from '@/views/classrooms/classrooms-api'

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
  joinCodeExpiresAt?: string | null
  active?: boolean | null
  updatedAt?: string | null
}

const buildCatalog = async (): Promise<ClassroomCatalogItem[]> => {
  const payload = await getPayload({ config: configPromise })

  // depth: 1 hydrates `class` and `professor` so we can show titles/names
  // without an extra round trip. overrideAccess is fine: the custom route
  // sits behind Payload's admin middleware already.
  const classrooms = await payload.find({
    collection: 'classrooms',
    depth: 1,
    limit: 500,
    sort: '-updatedAt',
    overrideAccess: true,
  })

  const memberships = await payload.find({
    collection: 'classroom-memberships',
    depth: 0,
    limit: 5000,
    overrideAccess: true,
  })

  const memberCountByClassroomId = new Map<string, number>()
  for (const membership of memberships.docs ?? []) {
    const classroomValue = (membership as { classroom?: unknown }).classroom
    const classroomId =
      typeof classroomValue === 'object' && classroomValue !== null && 'id' in classroomValue
        ? String((classroomValue as { id?: string | number }).id ?? '')
        : classroomValue != null
          ? String(classroomValue)
          : ''
    if (!classroomId) continue
    memberCountByClassroomId.set(
      classroomId,
      (memberCountByClassroomId.get(classroomId) ?? 0) + 1,
    )
  }

  return (classrooms.docs ?? []).map((doc) => {
    const classroom = doc as ClassroomDoc
    const id = String(classroom.id ?? '')

    const courseValue = classroom.class
    const courseTitle =
      typeof courseValue === 'object' && courseValue !== null
        ? (courseValue.title ?? null)
        : null

    const professorValue = classroom.professor
    const professorName =
      typeof professorValue === 'object' && professorValue !== null
        ? buildUserDisplayName(
            professorValue.firstName,
            professorValue.lastName,
            professorValue.email,
          )
        : null

    return {
      id,
      title: classroom.title ?? 'Untitled classroom',
      courseTitle,
      professorName,
      joinCode: classroom.joinCode ?? null,
      joinCodeExpiresAt: classroom.joinCodeExpiresAt ?? null,
      active: classroom.active !== false,
      memberCount: memberCountByClassroomId.get(id) ?? 0,
      updatedAt: classroom.updatedAt ?? null,
    }
  })
}

export default async function AdminClassroomsPage() {
  const catalog = await buildCatalog()
  return (
    <Gutter>
      <div style={{ maxWidth: 1040, margin: '24px auto 80px' }}>
        <ClassroomsHome initialClassrooms={catalog} />
      </div>
    </Gutter>
  )
}
