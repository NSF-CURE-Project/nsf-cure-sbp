import { describe, expect, it, vi } from 'vitest'
import {
  getNsfrpprSummary,
  rpprEvidenceToCsv,
  rpprOrganizationsToCsv,
  rpprParticipantsToCsv,
} from '@/reporting/nsfRpprSummary'
import { resolveReportingPeriod } from '@/reporting/period'

describe('getNsfrpprSummary', () => {
  it('builds section completeness and participant/org exports', async () => {
    const find = vi.fn(async ({ collection, where }: { collection: string; where?: Record<string, unknown> }) => {
      if (collection === 'classes') return { docs: [{ id: 'c1', title: 'Class A' }], hasNextPage: false }
      if (collection === 'chapters') return { docs: [{ id: 'ch1', title: 'Chapter A' }], hasNextPage: false }
      if (collection === 'quizzes') return { docs: [{ id: 'q1', title: 'Quiz A' }], hasNextPage: false }
      if (collection === 'lesson-progress') {
        if (where?.updatedAt) {
          return {
            docs: [
              {
                class: 'c1',
                chapter: 'ch1',
                user: 'u1',
                completed: true,
                updatedAt: '2026-02-10T00:00:00.000Z',
              },
            ],
            hasNextPage: false,
          }
        }
        return { docs: [], hasNextPage: false }
      }
      if (collection === 'quiz-attempts') {
        return {
          docs: [
            {
              quiz: 'q1',
              user: 'u1',
              score: 9,
              maxScore: 10,
              completedAt: '2026-02-10T00:00:00.000Z',
              createdAt: '2026-02-10T00:00:00.000Z',
            },
          ],
          hasNextPage: false,
        }
      }
      if (collection === 'lessons') {
        if (where?.createdAt) {
          return {
            docs: [{ id: 'lesson-1', title: 'Lesson 1', createdAt: '2026-02-11T00:00:00.000Z' }],
            hasNextPage: false,
          }
        }
        return { docs: [], hasNextPage: false }
      }
      if (collection === 'pages' || collection === 'quiz-questions') return { docs: [], hasNextPage: false }
      if (collection === 'accounts') {
        return {
          docs: [
            {
              id: 'u1',
              fullName: 'Student One',
              email: 'student@example.edu',
              participantType: 'undergraduate_student',
              projectRole: 'Learner',
              organizationName: 'CPP',
              contributionSummary: 'Completed modules',
              updatedAt: '2026-02-12T00:00:00.000Z',
            },
          ],
          hasNextPage: false,
        }
      }
      if (collection === 'organizations') {
        return {
          docs: [
            {
              id: 'org-1',
              organizationName: 'CPP',
              organizationType: 'academic',
              partnerRole: 'Host',
              contributionSummary: 'Provided labs',
            },
          ],
          hasNextPage: false,
        }
      }
      if (collection === 'rppr-reports') {
        return {
          docs: [
            {
              accomplishmentsNarrative: 'Students completed core outcomes.',
              productsNarrative: 'Released curriculum package.',
              impactNarrative: 'Improved readiness.',
              changesProblemsNarrative: 'No major blockers.',
              specialRequirementsNarrative: 'None.',
              reportNotes: 'Internal draft',
            },
          ],
          hasNextPage: false,
        }
      }
      if (
        collection === 'classrooms' ||
        collection === 'classroom-memberships'
      ) {
        return {
          docs: [],
          hasNextPage: false,
        }
      }
      if (collection === 'reporting-evidence-links') {
        return {
          docs: [
            {
              id: 'ev-1',
              title: 'Product release notes',
              rpprSection: 'products',
              evidenceType: 'product_resource',
              occurredAt: '2026-02-15T00:00:00.000Z',
            },
            {
              id: 'ev-2',
              title: 'Impact intervention summary',
              rpprSection: 'impact',
              evidenceType: 'intervention',
              occurredAt: '2026-02-16T00:00:00.000Z',
            },
            {
              id: 'ev-3',
              title: 'Special requirement attachment note',
              rpprSection: 'specialRequirements',
              evidenceType: 'other',
              occurredAt: '2026-02-17T00:00:00.000Z',
            },
          ],
          hasNextPage: false,
        }
      }

      throw new Error(`Unexpected collection: ${collection}`)
    })

    const summary = await getNsfrpprSummary(
      { find } as never,
      resolveReportingPeriod({
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        reportType: 'annual',
      }),
    )

    expect(summary.completeness.overallStatus).toBe('ready')
    expect(summary.completeness.readinessScore).toBe(100)
    expect(summary.participantsOrganizations.data.participants).toHaveLength(1)
    expect(summary.participantsOrganizations.data.partnerOrganizations).toHaveLength(1)

    const participantsCsv = rpprParticipantsToCsv(summary)
    const orgCsv = rpprOrganizationsToCsv(summary)
    const evidenceCsv = rpprEvidenceToCsv(summary)

    expect(participantsCsv).toContain('Student One')
    expect(orgCsv).toContain('CPP')
    expect(evidenceCsv).toContain('Product release notes')
  })
})
