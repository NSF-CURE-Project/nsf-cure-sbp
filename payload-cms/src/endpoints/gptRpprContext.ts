import type { PayloadHandler } from 'payload'

import { authenticateApiKey, hasApiScope } from '../middleware/apiKeyAuth'
import { resolvePeriodFromQuery } from '../reporting/data'
import { getNsfrpprSummary } from '../reporting/nsfRpprSummary'
import { isReportingStaff } from '../reporting/permissions'
import type { NsfrpprSummary } from '../reporting/types'

const toSectionStatus = (summary: NsfrpprSummary) => summary.completeness.sectionStatus

const weekLabel = (isoDate: string): string => {
  const date = new Date(isoDate)
  if (!Number.isFinite(date.getTime())) return isoDate
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const diffDays = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  const week = Math.max(1, Math.ceil((diffDays + start.getUTCDay() + 1) / 7))
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

const countByType = (participants: NsfrpprSummary['participantsOrganizations']['data']['participants']) =>
  participants.reduce<Record<string, number>>((acc, participant) => {
    const key = participant.participantType || 'unknown'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

const requireReportingAccess = async (req: Parameters<PayloadHandler>[0]) => {
  if (isReportingStaff(req)) return { ok: true as const, viaApiKey: false as const }

  const apiAuth = await authenticateApiKey(req, { requiredScope: 'reporting:read' })
  if (!apiAuth || !hasApiScope(apiAuth.scopes, 'reporting:read')) {
    return { ok: false as const, response: Response.json({ error: 'Not authorized.' }, { status: 403 }) }
  }

  return { ok: true as const, viaApiKey: true as const }
}

export const gptRpprContextHandler: PayloadHandler = async (req) => {
  const access = await requireReportingAccess(req)
  if (!access.ok) return access.response

  const query = (req.query ?? {}) as Record<string, unknown>
  const hasPeriodId = typeof query.periodId === 'string' && query.periodId.trim().length > 0
  const hasStart = typeof query.startDate === 'string' && query.startDate.trim().length > 0
  const hasEnd = typeof query.endDate === 'string' && query.endDate.trim().length > 0

  if (!hasPeriodId && (!hasStart || !hasEnd)) {
    return Response.json(
      { error: 'gpt-rppr-context requires periodId or both startDate and endDate.' },
      { status: 400 },
    )
  }

  const period = await resolvePeriodFromQuery(req.payload, query)
  if (!period) {
    return Response.json(
      { error: 'Unable to resolve reporting period.' },
      { status: 400 },
    )
  }

  const summary = await getNsfrpprSummary(req.payload, period, {})
  const participants = summary.participantsOrganizations.data.participants
  const firstGen = participants.filter((participant) => participant.firstGenCollegeStudent).length
  const transfer = participants.filter((participant) => participant.transferStudent).length
  const status = toSectionStatus(summary)

  const warnings = [
    ...summary.warnings.map((warning) => warning.code),
    ...(summary.changesProblems.data.narrative ? [] : ['NO_CHANGES_NARRATIVE']),
  ]

  return Response.json({
    meta: {
      projectTitle: 'NSF CURE SBP',
      awardNumber: process.env.NSF_AWARD_NUMBER ?? null,
      reportType: summary.reportMeta.reportType,
      periodStart: summary.reportMeta.periodStart,
      periodEnd: summary.reportMeta.periodEnd,
      generatedAt: summary.reportMeta.generatedAt,
    },
    readinessScore: summary.completeness.readinessScore,
    sectionStatus: {
      accomplishments: status.accomplishments,
      products: status.products,
      participantsOrganizations: status.participantsOrganizations,
      impact: status.impact,
      changesProblems: status.changesProblems,
      specialRequirements: status.specialRequirements,
    },
    accomplishments: {
      existingNarrative: summary.accomplishments.data.narrativeDraft ?? '',
      metrics: {
        uniqueLearnersActive: summary.accomplishments.data.quantitativeSummary.uniqueLearnersActive,
        classHighlights: summary.accomplishments.data.quantitativeSummary.classCompletionHighlights.map(
          (entry) => ({
            className: entry.title,
            completionRate: entry.completionRate,
          }),
        ),
        chapterHighlights: summary.accomplishments.data.quantitativeSummary.chapterCompletionHighlights.map(
          (entry) => ({
            chapterName: entry.title,
            completionRate: entry.completionRate,
          }),
        ),
        quizHighlights: summary.accomplishments.data.quantitativeSummary.quizMasteryHighlights.map(
          (entry) => ({
            quizTitle: entry.title,
            masteryRate: entry.masteryRate,
          }),
        ),
      },
    },
    products: {
      existingNarrative: summary.products.data.narrativeDraft ?? '',
      artifactCount: summary.products.data.productCount,
      artifacts: summary.products.data.artifacts.map((artifact) => ({
        type: artifact.collection.replace('-', '_'),
        title: artifact.title,
        createdAt: artifact.createdAt,
      })),
      supplementalProducts: summary.products.data.supplementalRecords.map((record) => ({
        productType: record.productType,
        title: record.title,
        citation: record.citation,
      })),
    },
    participants: {
      totalActive: participants.length,
      byType: countByType(participants),
      firstGen,
      transfer,
      partnerOrganizations: summary.participantsOrganizations.data.partnerOrganizations.map((partner) => ({
        name: partner.organizationName,
        type: partner.organizationType,
        role: partner.partnerRole,
      })),
    },
    impact: {
      existingNarrative: summary.impact.data.narrativeDraft ?? '',
      masteryRateOverall: summary.impact.data.derivedImpactMetrics.masteryRateOverall ?? 0,
      completionRateOverall: summary.impact.data.derivedImpactMetrics.completionRateOverall ?? 0,
      engagementTrend: summary.impact.data.derivedImpactMetrics.engagementTrend.map((entry) => ({
        week: weekLabel(entry.weekStart),
        activeStudents: entry.activeStudents,
      })),
    },
    changesProblems: {
      existingNarrative: summary.changesProblems.data.narrative ?? '',
    },
    specialRequirements: {
      existingNarrative: summary.specialRequirements.data.narrative ?? '',
      attachmentCount: summary.specialRequirements.data.attachmentCount,
    },
    evidence: {
      total: summary.evidence.totalEvidenceLinks,
      bySection: summary.evidence.bySection.map((entry) => ({
        section: entry.section,
        count: entry.count,
      })),
    },
    warnings: [...new Set(warnings)],
  })
}
