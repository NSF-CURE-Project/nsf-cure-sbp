import type { Payload } from 'payload'
import { findAllDocs } from './data'
import type { ReportingCohortFilters } from './types'

export type ReportingScope = {
  filters: ReportingCohortFilters
  userIds: Set<string> | null
  classIds: Set<string> | null
  classroomIds: Set<string> | null
  warnings: string[]
}

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

const intersect = (a: Set<string>, b: Set<string>) => new Set([...a].filter((item) => b.has(item)))

export const normalizeCohortFilters = (
  input?: Partial<ReportingCohortFilters> | null,
): ReportingCohortFilters => ({
  classId: typeof input?.classId === 'string' && input.classId.trim() ? input.classId.trim() : null,
  professorId:
    typeof input?.professorId === 'string' && input.professorId.trim() ? input.professorId.trim() : null,
  classroomId:
    typeof input?.classroomId === 'string' && input.classroomId.trim() ? input.classroomId.trim() : null,
  firstGen: typeof input?.firstGen === 'boolean' ? input.firstGen : null,
  transfer: typeof input?.transfer === 'boolean' ? input.transfer : null,
})

export const resolveReportingScope = async (
  payload: Payload,
  input?: Partial<ReportingCohortFilters> | null,
): Promise<ReportingScope> => {
  const filters = normalizeCohortFilters(input)
  const warnings: string[] = []

  let userIds: Set<string> | null = null
  let classroomIds: Set<string> | null = null
  let classIds: Set<string> | null = null

  const hasClassroomLikeFilters = Boolean(filters.classId || filters.professorId || filters.classroomId)
  if (hasClassroomLikeFilters) {
    const classroomWhere: Record<string, unknown> = {}
    if (filters.classId) {
      classroomWhere.class = { equals: filters.classId }
    }
    if (filters.professorId) {
      classroomWhere.professor = { equals: filters.professorId }
    }
    if (filters.classroomId) {
      classroomWhere.id = { equals: filters.classroomId }
    }

    const classrooms = await findAllDocs(payload, 'classrooms', {
      where: classroomWhere,
    })

    classroomIds = new Set(
      classrooms
        .map((doc) => toId(doc.id))
        .filter((id): id is string => Boolean(id)),
    )

    classIds = new Set(
      classrooms
        .map((doc) => toId(doc.class))
        .filter((id): id is string => Boolean(id)),
    )

    if (!classroomIds.size) {
      warnings.push('No classrooms matched selected class/professor/classroom filters.')
      userIds = new Set<string>()
    } else {
      const memberships = await findAllDocs(payload, 'classroom-memberships', {
        where: {
          classroom: {
            in: [...classroomIds],
          },
        },
      })

      userIds = new Set(
        memberships
          .map((doc) => toId(doc.student))
          .filter((id): id is string => Boolean(id)),
      )
    }
  }

  const needsParticipantFlags = filters.firstGen != null || filters.transfer != null
  if (needsParticipantFlags) {
    const accountWhere: Record<string, unknown> = {}
    if (filters.firstGen != null) {
      accountWhere.firstGenCollegeStudent = { equals: filters.firstGen }
    }
    if (filters.transfer != null) {
      accountWhere.transferStudent = { equals: filters.transfer }
    }

    const flaggedAccounts = await findAllDocs(payload, 'accounts', {
      where: accountWhere,
    })

    const flaggedUserIds = new Set(
      flaggedAccounts
        .map((doc) => toId(doc.id))
        .filter((id): id is string => Boolean(id)),
    )

    if (userIds == null) {
      userIds = flaggedUserIds
    } else {
      userIds = intersect(userIds, flaggedUserIds)
    }

    if (!flaggedUserIds.size) {
      warnings.push('No participants matched first-gen/transfer cohort filters.')
    }
  }

  return {
    filters,
    userIds,
    classIds,
    classroomIds,
    warnings,
  }
}
