import type { DataQualityPanel } from './dataQuality'
import type { NsfrpprSummary } from './types'

export type ComplianceStatus = 'met' | 'partial' | 'missing'

export type ComplianceCheck = {
  key: string
  label: string
  status: ComplianceStatus
  detail: string
  action: string
}

export type RpprComplianceChecklist = {
  overallStatus: ComplianceStatus
  metCount: number
  partialCount: number
  missingCount: number
  checks: ComplianceCheck[]
}

const fromSectionStatus = (
  status: NsfrpprSummary['completeness']['sectionStatus'][keyof NsfrpprSummary['completeness']['sectionStatus']],
): ComplianceStatus => {
  if (status === 'ready') return 'met'
  if (status === 'partial') return 'partial'
  return 'missing'
}

const severityToStatus = (severity: 'low' | 'medium' | 'high'): ComplianceStatus =>
  severity === 'high' ? 'missing' : 'partial'

export const buildRpprComplianceChecklist = (
  summary: NsfrpprSummary,
  dataQuality: DataQualityPanel,
): RpprComplianceChecklist => {
  const participantMetadataIssue = dataQuality.issues.find(
    (issue) => issue.key === 'missing_participant_fields',
  )
  const organizationMetadataIssue = dataQuality.issues.find(
    (issue) => issue.key === 'missing_organization_fields',
  )
  const evidenceIssue = dataQuality.issues.find((issue) => issue.key === 'missing_evidence_links')

  const productRecordsField = summary.products.fields.find(
    (field) => field.key === 'publicationsPatentsDatasetRecords',
  )
  const specialAttachmentsField = summary.specialRequirements.fields.find(
    (field) => field.key === 'programSpecificAttachments',
  )

  const checks: ComplianceCheck[] = [
    {
      key: 'accomplishments_section',
      label: 'RPPR accomplishments section',
      status: fromSectionStatus(summary.completeness.sectionStatus.accomplishments),
      detail: `Status: ${summary.completeness.sectionStatus.accomplishments}.`,
      action: 'Fill missing accomplishments narrative and quantitative highlights.',
    },
    {
      key: 'products_section',
      label: 'RPPR products section',
      status: fromSectionStatus(summary.completeness.sectionStatus.products),
      detail: `Status: ${summary.completeness.sectionStatus.products}.`,
      action: 'Complete product narrative and ensure products are captured in-period.',
    },
    {
      key: 'participants_orgs_section',
      label: 'RPPR participants and organizations section',
      status: fromSectionStatus(summary.completeness.sectionStatus.participantsOrganizations),
      detail: `Status: ${summary.completeness.sectionStatus.participantsOrganizations}.`,
      action: 'Complete participant role metadata and partner organization records.',
    },
    {
      key: 'impact_section',
      label: 'RPPR impact section',
      status: fromSectionStatus(summary.completeness.sectionStatus.impact),
      detail: `Status: ${summary.completeness.sectionStatus.impact}.`,
      action: 'Finalize impact narrative and verify derived outcome metrics.',
    },
    {
      key: 'changes_problems_section',
      label: 'RPPR changes/problems section',
      status: fromSectionStatus(summary.completeness.sectionStatus.changesProblems),
      detail: `Status: ${summary.completeness.sectionStatus.changesProblems}.`,
      action: 'Document key changes, delays, and mitigation plans.',
    },
    {
      key: 'special_requirements_section',
      label: 'RPPR special requirements section',
      status: fromSectionStatus(summary.completeness.sectionStatus.specialRequirements),
      detail: `Status: ${summary.completeness.sectionStatus.specialRequirements}.`,
      action: 'Add any solicitation-specific requirements and required attachments.',
    },
    {
      key: 'participant_metadata_quality',
      label: 'Participant metadata completeness',
      status: participantMetadataIssue ? severityToStatus(participantMetadataIssue.severity) : 'met',
      detail: participantMetadataIssue
        ? participantMetadataIssue.message
        : 'Participant metadata required for RPPR export appears complete.',
      action: 'Update Accounts records with participant type, role, and organization.',
    },
    {
      key: 'organization_metadata_quality',
      label: 'Partner organization metadata completeness',
      status: organizationMetadataIssue ? severityToStatus(organizationMetadataIssue.severity) : 'met',
      detail: organizationMetadataIssue
        ? organizationMetadataIssue.message
        : 'Partner organization name/type/role fields appear complete.',
      action: 'Complete organization profile fields before export.',
    },
    {
      key: 'product_records',
      label: 'Product records (publication/patent/dataset/software)',
      status: productRecordsField?.status === 'present' ? 'met' : 'missing',
      detail:
        productRecordsField?.status === 'present'
          ? `${summary.products.data.supplementalRecords.length} dedicated product record(s) found.`
          : 'No dedicated product records found for this reporting period.',
      action: 'Create entries under Reporting > Product records for reportable products.',
    },
    {
      key: 'special_requirement_attachments',
      label: 'Special requirement attachments',
      status: specialAttachmentsField?.status === 'present' ? 'met' : 'partial',
      detail:
        specialAttachmentsField?.status === 'present'
          ? `${summary.specialRequirements.data.attachmentCount} attachment(s) linked to latest RPPR report.`
          : 'No program-specific attachments found on RPPR report record.',
      action: 'Attach solicitation-required files to the RPPR report when applicable.',
    },
    {
      key: 'evidence_links',
      label: 'Evidence link coverage',
      status: evidenceIssue ? 'partial' : 'met',
      detail: evidenceIssue
        ? evidenceIssue.message
        : `${summary.evidence.totalEvidenceLinks} evidence link(s) are connected to this period.`,
      action: 'Capture evidence links for auditability and RPPR substantiation.',
    },
  ]

  const metCount = checks.filter((check) => check.status === 'met').length
  const partialCount = checks.filter((check) => check.status === 'partial').length
  const missingCount = checks.filter((check) => check.status === 'missing').length

  const overallStatus: ComplianceStatus =
    missingCount > 0 ? 'missing' : partialCount > 0 ? 'partial' : 'met'

  return {
    overallStatus,
    metCount,
    partialCount,
    missingCount,
    checks,
  }
}
