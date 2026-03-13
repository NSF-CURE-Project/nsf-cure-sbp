import type { Payload } from 'payload'
import { getReportingSummary, reportRowsToCsv } from '../utils/analyticsSummary'
import type { NsfrpprSummary, RpprSectionStatus } from './types'
import type { ReportingPeriod } from './period'
import { findAllDocs } from './data'
import { resolveReportingScope } from './cohorts'

type EvidenceSection = NsfrpprSummary['evidence']['bySection'][number]['section']
const evidenceSections: EvidenceSection[] = [
  'accomplishments',
  'products',
  'participantsOrganizations',
  'impact',
  'changesProblems',
  'specialRequirements',
]

const toId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

const toPct = (value: number | null): string => {
  if (value == null || Number.isNaN(value)) return 'N/A'
  return `${Math.round(value * 1000) / 10}%`
}

const sectionStatusFromMissing = (missingFields: string[]): RpprSectionStatus => {
  if (!missingFields.length) return 'ready'
  if (missingFields.length < 3) return 'partial'
  return 'missing'
}

export const getNsfrpprSummary = async (
  payload: Payload,
  period: ReportingPeriod,
  options?: {
    filters?: {
      classId?: string | null
      professorId?: string | null
      classroomId?: string | null
      firstGen?: boolean | null
      transfer?: boolean | null
    } | null
  },
): Promise<NsfrpprSummary> => {
  const scope = await resolveReportingScope(payload, options?.filters)
  const analytics = await getReportingSummary(payload, {
    mode: 'rppr',
    period,
    filters: scope.filters,
  })

  const [participantPool, organizations, narratives, evidenceLinks, productRecords] = await Promise.all([
    findAllDocs(payload, 'accounts', {
      where: {
        includeInRppr: {
          equals: true,
        },
      },
      retryWithoutWhereOnMissingColumn: true,
    }),
    findAllDocs(payload, 'organizations'),
    findAllDocs(payload, 'rppr-reports', {
      where: {
        and: [
          {
            startDate: {
              less_than_equal: period.endDate,
            },
          },
          {
            endDate: {
              greater_than_equal: period.startDate,
            },
          },
        ],
      },
      sort: '-updatedAt',
    }),
    findAllDocs(payload, 'reporting-evidence-links', {
      where: {
        occurredAt: {
          greater_than_equal: period.startDate,
          less_than_equal: period.endDate,
        },
      },
    }),
    findAllDocs(payload, 'reporting-product-records', {
      where: {
        reportedAt: {
          greater_than_equal: period.startDate,
          less_than_equal: period.endDate,
        },
      },
      sort: '-reportedAt',
    }),
  ])

  const latestNarrative = narratives[0] as Record<string, unknown> | undefined
  const evidenceSummary: NsfrpprSummary['evidence'] = (() => {
    const sectionCounts = new Map<EvidenceSection, number>()
    evidenceSections.forEach((section) => sectionCounts.set(section, 0))

    const links = evidenceLinks
      .map((entry) => {
        const sectionCandidate = entry.rpprSection
        if (typeof sectionCandidate !== 'string') return null
        if (!evidenceSections.includes(sectionCandidate as EvidenceSection)) return null
        const section = sectionCandidate as EvidenceSection
        sectionCounts.set(section, (sectionCounts.get(section) ?? 0) + 1)
        return {
          id: toId(entry.id) ?? '',
          title:
            typeof entry.title === 'string' && entry.title.trim() ? entry.title.trim() : 'Untitled evidence',
          evidenceType: typeof entry.evidenceType === 'string' ? entry.evidenceType : null,
          rpprSection: section,
          occurredAt: typeof entry.occurredAt === 'string' ? entry.occurredAt : null,
          summary: typeof entry.summary === 'string' ? entry.summary : null,
          impactNote: typeof entry.impactNote === 'string' ? entry.impactNote : null,
          linkedArtifactsCount: Array.isArray(entry.linkedArtifacts) ? entry.linkedArtifacts.length : 0,
        }
      })
      .filter((entry): entry is NsfrpprSummary['evidence']['links'][number] => Boolean(entry))

    return {
      totalEvidenceLinks: links.length,
      bySection: evidenceSections.map((section) => ({
        section,
        count: sectionCounts.get(section) ?? 0,
      })),
      links,
    }
  })()

  const organizationNameById = new Map<string, string>()
  organizations.forEach((entry) => {
    const id = toId(entry.id)
    if (!id) return
    const name =
      typeof entry.organizationName === 'string' && entry.organizationName.trim()
        ? entry.organizationName.trim()
        : `Organization ${id}`
    organizationNameById.set(id, name)
  })

  const isInRange = (value: unknown) => {
    if (typeof value !== 'string') return false
    const time = new Date(value).getTime()
    if (Number.isNaN(time)) return false
    return time >= new Date(period.startDate).getTime() && time <= new Date(period.endDate).getTime()
  }

  const isActiveDuringPeriod = (entry: Record<string, unknown>) => {
    const participationStart = typeof entry.participationStartDate === 'string' ? entry.participationStartDate : null
    const participationEnd = typeof entry.participationEndDate === 'string' ? entry.participationEndDate : null
    if (participationStart || participationEnd) {
      const startTs = participationStart ? new Date(participationStart).getTime() : Number.NEGATIVE_INFINITY
      const endTs = participationEnd ? new Date(participationEnd).getTime() : Number.POSITIVE_INFINITY
      const periodStartTs = new Date(period.startDate).getTime()
      const periodEndTs = new Date(period.endDate).getTime()
      return startTs <= periodEndTs && endTs >= periodStartTs
    }
    return isInRange(entry.updatedAt)
  }

  const participants = participantPool
    .filter((entry) => isActiveDuringPeriod(entry))
    .filter((entry) => {
      if (!scope.userIds) return true
      const id = toId(entry.id)
      return Boolean(id && scope.userIds.has(id))
    })
    .map((entry) => {
    const fullName =
      typeof entry.fullName === 'string' && entry.fullName.trim()
        ? entry.fullName.trim()
        : typeof entry.email === 'string'
          ? entry.email
          : 'Unnamed participant'
    const orgRelationshipId = toId(entry.organization)
    const orgNameFromRelation = orgRelationshipId ? organizationNameById.get(orgRelationshipId) ?? null : null
    return {
      id: toId(entry.id) ?? '',
      fullName,
      email: typeof entry.email === 'string' ? entry.email : '',
      participantType:
        typeof entry.participantType === 'string' ? entry.participantType : null,
      projectRole: typeof entry.projectRole === 'string' ? entry.projectRole : null,
      organization:
        orgNameFromRelation ??
        (typeof entry.organizationName === 'string' && entry.organizationName.trim()
          ? entry.organizationName.trim()
          : null),
      contributionSummary:
        typeof entry.contributionSummary === 'string' ? entry.contributionSummary : null,
      firstGenCollegeStudent:
        typeof entry.firstGenCollegeStudent === 'boolean' ? entry.firstGenCollegeStudent : null,
      transferStudent: typeof entry.transferStudent === 'boolean' ? entry.transferStudent : null,
      activeDuringReportingPeriod: isActiveDuringPeriod(entry),
    }
  })

  const partnerOrganizations = organizations.map((entry) => ({
    id: toId(entry.id) ?? '',
    organizationName: typeof entry.organizationName === 'string' ? entry.organizationName : 'Unknown',
    organizationType:
      typeof entry.organizationType === 'string' ? entry.organizationType : null,
    partnerRole: typeof entry.partnerRole === 'string' ? entry.partnerRole : null,
    contributionSummary:
      typeof entry.contributionSummary === 'string' ? entry.contributionSummary : null,
  }))

  const productSupplementalRecords = productRecords.map((entry) => ({
    id: toId(entry.id) ?? '',
    title:
      typeof entry.title === 'string' && entry.title.trim()
        ? entry.title.trim()
        : 'Untitled product record',
    productType: typeof entry.productType === 'string' ? entry.productType : 'other',
    citation: typeof entry.citation === 'string' ? entry.citation : null,
    identifier: typeof entry.identifier === 'string' ? entry.identifier : null,
    url: typeof entry.url === 'string' ? entry.url : null,
    reportedAt: typeof entry.reportedAt === 'string' ? entry.reportedAt : null,
    linkedArtifactsCount: Array.isArray(entry.linkedArtifacts) ? entry.linkedArtifacts.length : 0,
  }))
  const rpprAttachmentCount =
    latestNarrative && Array.isArray(latestNarrative.attachments)
      ? latestNarrative.attachments.length
      : 0

  const completionRateOverall = analytics.classCompletion.length
    ? analytics.classCompletion.reduce((sum, item) => sum + item.completionRate, 0) /
      analytics.classCompletion.length
    : null

  const masteryRateOverall = analytics.quizPerformance.length
    ? analytics.quizPerformance.reduce((sum, item) => sum + item.masteryRate, 0) /
      analytics.quizPerformance.length
    : null

  const accomplishmentsMissing = [
    analytics.classCompletion.length ? null : 'classCompletionHighlights',
    analytics.quizPerformance.length ? null : 'quizMasteryHighlights',
    latestNarrative?.accomplishmentsNarrative ? null : 'accomplishmentsNarrative',
  ].filter((item): item is string => Boolean(item))

  const productsMissing = [
    analytics.productsInPeriod.total ? null : 'productsInPeriod',
    latestNarrative?.productsNarrative ? null : 'productsNarrative',
    productSupplementalRecords.length ? null : 'publicationsPatentsDatasetRecords',
    evidenceSummary.bySection.find((entry) => entry.section === 'products')?.count
      ? null
      : 'productsEvidenceLinks',
  ].filter((item): item is string => Boolean(item))

  const participantsMissing = [
    participants.length ? null : 'participants',
    partnerOrganizations.length ? null : 'partnerOrganizations',
    participants.some((participant) => participant.projectRole) ? null : 'participantProjectRole',
  ].filter((item): item is string => Boolean(item))

  const impactMissing = [
    masteryRateOverall != null ? null : 'masteryRateOverall',
    completionRateOverall != null ? null : 'completionRateOverall',
    latestNarrative?.impactNarrative ? null : 'impactNarrative',
    evidenceSummary.bySection.find((entry) => entry.section === 'impact')?.count
      ? null
      : 'impactEvidenceLinks',
  ].filter((item): item is string => Boolean(item))

  const changesProblemsMissing = [
    latestNarrative?.changesProblemsNarrative ? null : 'changesProblemsNarrative',
  ].filter((item): item is string => Boolean(item))

  const specialRequirementsMissing = [
    latestNarrative?.specialRequirementsNarrative ? null : 'specialRequirementsNarrative',
    rpprAttachmentCount ? null : 'programSpecificAttachments',
    evidenceSummary.bySection.find((entry) => entry.section === 'specialRequirements')?.count
      ? null
      : 'specialRequirementsEvidenceLinks',
  ].filter((item): item is string => Boolean(item))

  const sectionStatus = {
    accomplishments: sectionStatusFromMissing(accomplishmentsMissing),
    products: sectionStatusFromMissing(productsMissing),
    participantsOrganizations: sectionStatusFromMissing(participantsMissing),
    impact: sectionStatusFromMissing(impactMissing),
    changesProblems: sectionStatusFromMissing(changesProblemsMissing),
    specialRequirements: sectionStatusFromMissing(specialRequirementsMissing),
  }

  const statuses = Object.values(sectionStatus)
  const readyCount = statuses.filter((item) => item === 'ready').length
  const partialCount = statuses.filter((item) => item === 'partial').length
  const readinessScore = Math.round(((readyCount + partialCount * 0.5) / statuses.length) * 100)

  const overallStatus: RpprSectionStatus =
    statuses.every((item) => item === 'ready')
      ? 'ready'
      : statuses.some((item) => item === 'ready' || item === 'partial')
        ? 'partial'
        : 'missing'

  return {
    reportMeta: {
      reportType: period.reportType,
      periodStart: period.startDate,
      periodEnd: period.endDate,
      periodLabel: period.label,
      budgetPeriodName: period.budgetPeriodName,
      generatedAt: analytics.reportMeta.generatedAt,
    },
    accomplishments: {
      status: sectionStatus.accomplishments,
      fields: [
        {
          key: 'quantitativeSummary',
          source: 'auto',
          status: analytics.classCompletion.length || analytics.quizPerformance.length ? 'present' : 'missing',
        },
        {
          key: 'accomplishmentsNarrative',
          source: 'manual',
          status: latestNarrative?.accomplishmentsNarrative ? 'present' : 'missing',
        },
      ],
      missingFields: accomplishmentsMissing,
      data: {
        quantitativeSummary: {
          uniqueLearnersActive: analytics.participation.uniqueLearnersActive,
          classCompletionHighlights: analytics.classCompletion.slice(0, 5),
          chapterCompletionHighlights: analytics.chapterCompletion.slice(0, 5),
          quizMasteryHighlights: analytics.quizPerformance.slice(0, 5),
        },
        narrativeDraft:
          typeof latestNarrative?.accomplishmentsNarrative === 'string'
            ? latestNarrative.accomplishmentsNarrative
            : null,
      },
    },
    products: {
      status: sectionStatus.products,
      fields: [
        {
          key: 'productsInPeriod',
          source: 'auto',
          status: analytics.productsInPeriod.total ? 'present' : 'missing',
        },
        {
          key: 'productsNarrative',
          source: 'manual',
          status: latestNarrative?.productsNarrative ? 'present' : 'missing',
        },
        {
          key: 'publicationsPatentsDatasetRecords',
          source: 'auto',
          status: productSupplementalRecords.length ? 'present' : 'missing',
          note:
            'Managed via Reporting > Product records for publication/patent/dataset traceability.',
        },
      ],
      missingFields: productsMissing,
      data: {
        artifacts: analytics.productsInPeriod.artifacts,
        productCount: analytics.productsInPeriod.total,
        supplementalRecords: productSupplementalRecords,
        narrativeDraft:
          typeof latestNarrative?.productsNarrative === 'string'
            ? latestNarrative.productsNarrative
            : null,
      },
    },
    participantsOrganizations: {
      status: sectionStatus.participantsOrganizations,
      fields: [
        {
          key: 'participants',
          source: 'auto',
          status: participants.length ? 'present' : 'missing',
        },
        {
          key: 'partnerOrganizations',
          source: 'auto',
          status: partnerOrganizations.length ? 'present' : 'missing',
        },
      ],
      missingFields: participantsMissing,
      data: {
        participants,
        partnerOrganizations,
      },
    },
    impact: {
      status: sectionStatus.impact,
      fields: [
        {
          key: 'derivedImpactMetrics',
          source: 'auto',
          status: masteryRateOverall != null || completionRateOverall != null ? 'present' : 'missing',
        },
        {
          key: 'impactNarrative',
          source: 'manual',
          status: latestNarrative?.impactNarrative ? 'present' : 'missing',
        },
      ],
      missingFields: impactMissing,
      data: {
        derivedImpactMetrics: {
          masteryRateOverall,
          completionRateOverall,
          engagementTrend: analytics.weeklyEngagement,
        },
        narrativeDraft:
          typeof latestNarrative?.impactNarrative === 'string' ? latestNarrative.impactNarrative : null,
      },
    },
    changesProblems: {
      status: sectionStatus.changesProblems,
      fields: [
        {
          key: 'changesProblemsNarrative',
          source: 'manual',
          status: latestNarrative?.changesProblemsNarrative ? 'present' : 'missing',
        },
      ],
      missingFields: changesProblemsMissing,
      data: {
        narrative:
          typeof latestNarrative?.changesProblemsNarrative === 'string'
            ? latestNarrative.changesProblemsNarrative
            : null,
      },
    },
    specialRequirements: {
      status: sectionStatus.specialRequirements,
      fields: [
        {
          key: 'specialRequirementsNarrative',
          source: 'manual',
          status: latestNarrative?.specialRequirementsNarrative ? 'present' : 'missing',
        },
        {
          key: 'programSpecificAttachments',
          source: 'manual',
          status: rpprAttachmentCount ? 'present' : 'missing',
          note:
            'Attach supporting files on the RPPR report record when the program solicitation requires them.',
        },
      ],
      missingFields: specialRequirementsMissing,
      data: {
        narrative:
          typeof latestNarrative?.specialRequirementsNarrative === 'string'
            ? latestNarrative.specialRequirementsNarrative
            : null,
        notes: typeof latestNarrative?.reportNotes === 'string' ? latestNarrative.reportNotes : null,
        attachmentCount: rpprAttachmentCount,
      },
    },
    evidence: evidenceSummary,
    completeness: {
      overallStatus,
      readinessScore,
      sectionStatus,
    },
    warnings: [
      ...analytics.warnings,
      ...(participants.length
        ? []
        : [
            {
              code: 'NO_PARTICIPANTS_IN_PERIOD',
              message: 'No participants matched the selected reporting period activity criteria.',
            },
          ]),
      ...(partnerOrganizations.length
        ? []
        : [
            {
              code: 'NO_PARTNER_ORGS',
              message: 'No partner organizations were configured for reporting.',
            },
          ]),
      ...(productSupplementalRecords.length
        ? []
        : [
            {
              code: 'NO_PRODUCT_RECORDS',
              message:
                'No dedicated product records (publication/patent/dataset/software) were found for this period.',
            },
          ]),
      ...(evidenceLinks.length
        ? []
        : [
            {
              code: 'NO_EVIDENCE_LINKS',
              message:
                'No evidence links were attached for this period. Add reporting evidence to strengthen provenance.',
            },
          ]),
    ],
  }
}

export const rpprParticipantsToCsv = (summary: NsfrpprSummary): string =>
  reportRowsToCsv(
    summary.participantsOrganizations.data.participants.map((participant) => ({
      id: participant.id,
      fullName: participant.fullName,
      email: participant.email,
      participantType: participant.participantType ?? '',
      projectRole: participant.projectRole ?? '',
      organization: participant.organization ?? '',
      firstGenCollegeStudent:
        participant.firstGenCollegeStudent == null
          ? ''
          : participant.firstGenCollegeStudent
            ? 'yes'
            : 'no',
      transferStudent:
        participant.transferStudent == null ? '' : participant.transferStudent ? 'yes' : 'no',
      activeDuringReportingPeriod: participant.activeDuringReportingPeriod ? 'yes' : 'no',
      contributionSummary: participant.contributionSummary ?? '',
    })),
    [
      'id',
      'fullName',
      'email',
      'participantType',
      'projectRole',
      'organization',
      'firstGenCollegeStudent',
      'transferStudent',
      'activeDuringReportingPeriod',
      'contributionSummary',
    ],
  )

export const rpprOrganizationsToCsv = (summary: NsfrpprSummary): string =>
  reportRowsToCsv(
    summary.participantsOrganizations.data.partnerOrganizations.map((org) => ({
      id: org.id,
      organizationName: org.organizationName,
      organizationType: org.organizationType ?? '',
      partnerRole: org.partnerRole ?? '',
      contributionSummary: org.contributionSummary ?? '',
    })),
    ['id', 'organizationName', 'organizationType', 'partnerRole', 'contributionSummary'],
  )

export const rpprProductsToCsv = (summary: NsfrpprSummary): string =>
  reportRowsToCsv(
    [
      ...summary.products.data.artifacts.map((artifact) => ({
        source: 'artifact',
        id: artifact.id,
        productType: artifact.collection,
        title: artifact.title,
        citation: '',
        identifier: '',
        url: '',
        timestamp: artifact.createdAt,
      })),
      ...summary.products.data.supplementalRecords.map((record) => ({
        source: 'rppr_product_record',
        id: record.id,
        productType: record.productType,
        title: record.title,
        citation: record.citation ?? '',
        identifier: record.identifier ?? '',
        url: record.url ?? '',
        timestamp: record.reportedAt ?? '',
      })),
    ],
    ['source', 'id', 'productType', 'title', 'citation', 'identifier', 'url', 'timestamp'],
  )

export const rpprEvidenceToCsv = (summary: NsfrpprSummary): string =>
  reportRowsToCsv(
    summary.evidence.links.map((link) => ({
      id: link.id,
      title: link.title,
      evidenceType: link.evidenceType ?? '',
      rpprSection: link.rpprSection,
      occurredAt: link.occurredAt ?? '',
      linkedArtifactsCount: link.linkedArtifactsCount,
      summary: link.summary ?? '',
      impactNote: link.impactNote ?? '',
    })),
    [
      'id',
      'title',
      'evidenceType',
      'rpprSection',
      'occurredAt',
      'linkedArtifactsCount',
      'summary',
      'impactNote',
    ],
  )

export const rpprOverviewToCsv = (summary: NsfrpprSummary): string => {
  const lines = [
    'NSF RPPR Overview',
    `Report Type,${summary.reportMeta.reportType}`,
    `Period Start,${summary.reportMeta.periodStart}`,
    `Period End,${summary.reportMeta.periodEnd}`,
    `Readiness Score,${summary.completeness.readinessScore}%`,
    `Overall Status,${summary.completeness.overallStatus}`,
    '',
    'Section,Status',
    `Accomplishments,${summary.completeness.sectionStatus.accomplishments}`,
    `Products,${summary.completeness.sectionStatus.products}`,
    `Participants/Organizations,${summary.completeness.sectionStatus.participantsOrganizations}`,
    `Impact,${summary.completeness.sectionStatus.impact}`,
    `Changes/Problems,${summary.completeness.sectionStatus.changesProblems}`,
    `Special Requirements,${summary.completeness.sectionStatus.specialRequirements}`,
    '',
    'Derived Metrics,Value',
    `Unique learners active,${summary.accomplishments.data.quantitativeSummary.uniqueLearnersActive}`,
    `Average class completion rate,${toPct(summary.impact.data.derivedImpactMetrics.completionRateOverall)}`,
    `Average quiz mastery rate,${toPct(summary.impact.data.derivedImpactMetrics.masteryRateOverall)}`,
    `Products in period,${summary.products.data.productCount}`,
    `Dedicated product records,${summary.products.data.supplementalRecords.length}`,
    `Special requirement attachments,${summary.specialRequirements.data.attachmentCount}`,
    `Evidence links in period,${summary.evidence.totalEvidenceLinks}`,
  ]

  return lines.join('\n')
}
