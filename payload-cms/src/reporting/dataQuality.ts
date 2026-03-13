import type { Payload } from 'payload'
import type { ReportingSummary } from './types'
import { findAllDocs } from './data'

export type DataQualityIssue = {
  key: string
  severity: 'low' | 'medium' | 'high'
  category:
    | 'participants'
    | 'organizations'
    | 'memberships'
    | 'metrics'
    | 'freshness'
    | 'cohort_scope'
    | 'evidence'
  message: string
  count?: number
  recommendation?: string
}

export type DataQualityPanel = {
  issues: DataQualityIssue[]
  confidence: 'high' | 'medium' | 'low'
}

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

export const getDataQualityPanel = async (
  payload: Payload,
  summary: ReportingSummary,
): Promise<DataQualityPanel> => {
  const [accounts, memberships, organizations, evidenceLinks] = await Promise.all([
    findAllDocs(payload, 'accounts', {
      where: {
        includeInRppr: {
          equals: true,
        },
      },
      retryWithoutWhereOnMissingColumn: true,
    }),
    findAllDocs(payload, 'classroom-memberships'),
    findAllDocs(payload, 'organizations'),
    summary.reportMeta.period
      ? findAllDocs(payload, 'reporting-evidence-links', {
          where: {
            occurredAt: {
              greater_than_equal: summary.reportMeta.period.startDate,
              less_than_equal: summary.reportMeta.period.endDate,
            },
          },
        })
      : Promise.resolve([] as Record<string, unknown>[]),
  ])

  const issues: DataQualityIssue[] = []

  const missingParticipantFields = accounts.filter((account) => {
    const participantType = typeof account.participantType === 'string' ? account.participantType.trim() : ''
    const projectRole = typeof account.projectRole === 'string' ? account.projectRole.trim() : ''
    const orgId = toId(account.organization)
    const orgName = typeof account.organizationName === 'string' ? account.organizationName.trim() : ''
    return !participantType || !projectRole || (!orgId && !orgName)
  }).length

  if (missingParticipantFields > 0) {
    issues.push({
      key: 'missing_participant_fields',
      severity: missingParticipantFields > 25 ? 'high' : 'medium',
      category: 'participants',
      message: `${missingParticipantFields} participants are missing RPPR fields (type/role/organization).`,
      count: missingParticipantFields,
      recommendation: 'Complete participant metadata in Accounts before official exports.',
    })
  }

  const staleThresholdMs = 1000 * 60 * 60 * 24 * 180
  const staleParticipants = accounts.filter((account) => {
    if (typeof account.updatedAt !== 'string') return true
    const updatedAt = new Date(account.updatedAt).getTime()
    return Number.isNaN(updatedAt) || Date.now() - updatedAt > staleThresholdMs
  }).length

  if (staleParticipants > 0) {
    issues.push({
      key: 'stale_participant_records',
      severity: staleParticipants > 25 ? 'medium' : 'low',
      category: 'freshness',
      message: `${staleParticipants} participant records appear stale (>180 days).`,
      count: staleParticipants,
      recommendation: 'Review participant status and contribution summaries.',
    })
  }

  const organizationsMissingMetadata = organizations.filter((organization) => {
    const name =
      typeof organization.organizationName === 'string' ? organization.organizationName.trim() : ''
    const orgType =
      typeof organization.organizationType === 'string' ? organization.organizationType.trim() : ''
    const partnerRole =
      typeof organization.partnerRole === 'string' ? organization.partnerRole.trim() : ''
    return !name || !orgType || !partnerRole
  }).length

  if (organizationsMissingMetadata > 0) {
    issues.push({
      key: 'missing_organization_fields',
      severity: organizationsMissingMetadata > 10 ? 'high' : 'medium',
      category: 'organizations',
      message: `${organizationsMissingMetadata} partner organizations are missing required metadata fields.`,
      count: organizationsMissingMetadata,
      recommendation: 'Complete organization name/type/partner role before official exports.',
    })
  }

  const membershipKeyCount = new Map<string, number>()
  memberships.forEach((membership) => {
    const studentId = toId(membership.student)
    const classroomId = toId(membership.classroom)
    if (!studentId || !classroomId) return
    const key = `${classroomId}::${studentId}`
    membershipKeyCount.set(key, (membershipKeyCount.get(key) ?? 0) + 1)
  })
  const duplicateMemberships = [...membershipKeyCount.values()].filter((count) => count > 1).length
  if (duplicateMemberships > 0) {
    issues.push({
      key: 'duplicate_memberships',
      severity: 'high',
      category: 'memberships',
      message: `${duplicateMemberships} duplicate classroom-student memberships were detected.`,
      count: duplicateMemberships,
      recommendation: 'Deduplicate memberships to stabilize denominator calculations.',
    })
  }

  if (summary.reportMeta.mode === 'rppr' && summary.reportMeta.period && evidenceLinks.length === 0) {
    issues.push({
      key: 'missing_evidence_links',
      severity: 'medium',
      category: 'evidence',
      message: 'No evidence links were found in the selected reporting period.',
      recommendation:
        'Add curriculum/intervention/product evidence records to improve auditability and RPPR substantiation.',
    })
  }

  summary.warnings.forEach((warning, index) => {
    issues.push({
      key: `summary_warning_${index}`,
      severity: warning.code === 'NO_PROGRESS_DATA' ? 'high' : 'medium',
      category: warning.code === 'COHORT_SCOPE_WARNING' ? 'cohort_scope' : 'metrics',
      message: warning.message,
    })
  })

  const highCount = issues.filter((issue) => issue.severity === 'high').length
  const mediumCount = issues.filter((issue) => issue.severity === 'medium').length

  const confidence: DataQualityPanel['confidence'] =
    highCount > 0 ? 'low' : mediumCount > 1 ? 'medium' : 'high'

  return {
    issues,
    confidence,
  }
}
