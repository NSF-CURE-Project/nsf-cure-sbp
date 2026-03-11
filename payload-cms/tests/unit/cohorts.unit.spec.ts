import { describe, expect, it, vi } from 'vitest'
import { resolveReportingScope } from '@/reporting/cohorts'

describe('resolveReportingScope', () => {
  it('builds user scope from classroom and participant flags', async () => {
    const find = vi.fn(async ({ collection, where }: { collection: string; where?: Record<string, unknown> }) => {
      if (collection === 'classrooms') {
        return {
          docs: [{ id: 'room-1', class: 'class-1' }],
          hasNextPage: false,
        }
      }
      if (collection === 'classroom-memberships') {
        return {
          docs: [{ student: 'u1', classroom: 'room-1' }, { student: 'u2', classroom: 'room-1' }],
          hasNextPage: false,
        }
      }
      if (collection === 'accounts') {
        if (where?.firstGenCollegeStudent) {
          return {
            docs: [{ id: 'u2' }],
            hasNextPage: false,
          }
        }
      }
      return { docs: [], hasNextPage: false }
    })

    const scope = await resolveReportingScope(
      { find } as never,
      { classId: 'class-1', firstGen: true },
    )

    expect(scope.classIds ? [...scope.classIds] : []).toEqual(['class-1'])
    expect(scope.userIds ? [...scope.userIds] : []).toEqual(['u2'])
    expect(scope.warnings).toEqual([])
  })
})
