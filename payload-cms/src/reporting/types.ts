import type { ReportingPeriod, ReportType } from './period'

export type ReportMode = 'internal' | 'rppr'

export type ReportingCohortFilters = {
  classId?: string | null
  professorId?: string | null
  classroomId?: string | null
  firstGen?: boolean | null
  transfer?: boolean | null
}

export type CompletionMetrics = {
  id: string
  title: string
  uniqueLearnersStarted: number
  uniqueLearnersCompleted: number
  completionRate: number
}

export type QuizPerformanceMetrics = {
  quizId: string
  title: string
  uniqueLearnersAttempted: number
  uniqueLearnersMastered: number
  masteryRate: number
  attempts: number
}

export type WeeklyEngagement = {
  weekStart: string
  activeStudents: number
  weekOverWeekChange: number | null
}

export type ProductArtifact = {
  collection: 'lessons' | 'quizzes' | 'pages' | 'quiz-questions'
  id: string
  title: string
  createdAt: string
}

export type AnalyticsWarning = {
  code: string
  message: string
}

export type ReportingSummary = {
  reportMeta: {
    mode: ReportMode
    reportType: ReportType
    period: ReportingPeriod | null
    filters: ReportingCohortFilters
    generatedAt: string
  }
  participation: {
    uniqueLearnersActive: number
    uniqueLearnersWithProgress: number
    uniqueLearnersWithQuizAttempts: number
  }
  classCompletion: CompletionMetrics[]
  chapterCompletion: CompletionMetrics[]
  quizPerformance: QuizPerformanceMetrics[]
  quizMasteryDistribution: Array<{ label: string; count: number; percentage: number }>
  weeklyEngagement: WeeklyEngagement[]
  productsInPeriod: {
    total: number
    byCollection: Record<string, number>
    artifacts: ProductArtifact[]
  }
  warnings: AnalyticsWarning[]
}

export type RpprSectionStatus = 'ready' | 'partial' | 'missing'

export type RpprFieldState = {
  key: string
  source: 'auto' | 'manual' | 'unsupported'
  status: 'present' | 'missing' | 'not_supported'
  note?: string
}

export type RpprSection<TData> = {
  status: RpprSectionStatus
  fields: RpprFieldState[]
  missingFields: string[]
  data: TData
}

export type NsfrpprSummary = {
  reportMeta: {
    reportType: ReportType
    periodStart: string
    periodEnd: string
    periodLabel: string | null
    budgetPeriodName: string | null
    generatedAt: string
  }
  accomplishments: RpprSection<{
    quantitativeSummary: {
      uniqueLearnersActive: number
      classCompletionHighlights: CompletionMetrics[]
      chapterCompletionHighlights: CompletionMetrics[]
      quizMasteryHighlights: QuizPerformanceMetrics[]
    }
    narrativeDraft: string | null
  }>
  products: RpprSection<{
    artifacts: ProductArtifact[]
    productCount: number
    supplementalRecords: Array<{
      id: string
      title: string
      productType: string
      citation: string | null
      identifier: string | null
      url: string | null
      reportedAt: string | null
      linkedArtifactsCount: number
    }>
    narrativeDraft: string | null
  }>
  participantsOrganizations: RpprSection<{
    participants: Array<{
      id: string
      fullName: string
      email: string
      participantType: string | null
      projectRole: string | null
      organization: string | null
      contributionSummary: string | null
      firstGenCollegeStudent: boolean | null
      transferStudent: boolean | null
      activeDuringReportingPeriod: boolean
    }>
    partnerOrganizations: Array<{
      id: string
      organizationName: string
      organizationType: string | null
      partnerRole: string | null
      contributionSummary: string | null
    }>
  }>
  impact: RpprSection<{
    derivedImpactMetrics: {
      masteryRateOverall: number | null
      completionRateOverall: number | null
      engagementTrend: WeeklyEngagement[]
    }
    narrativeDraft: string | null
  }>
  changesProblems: RpprSection<{
    narrative: string | null
  }>
  specialRequirements: RpprSection<{
    narrative: string | null
    notes: string | null
    attachmentCount: number
  }>
  evidence: {
    totalEvidenceLinks: number
    bySection: Array<{
      section:
        | 'accomplishments'
        | 'products'
        | 'participantsOrganizations'
        | 'impact'
        | 'changesProblems'
        | 'specialRequirements'
      count: number
    }>
    links: Array<{
      id: string
      title: string
      evidenceType: string | null
      rpprSection:
        | 'accomplishments'
        | 'products'
        | 'participantsOrganizations'
        | 'impact'
        | 'changesProblems'
        | 'specialRequirements'
      occurredAt: string | null
      summary: string | null
      impactNote: string | null
      linkedArtifactsCount: number
    }>
  }
  completeness: {
    overallStatus: RpprSectionStatus
    readinessScore: number
    sectionStatus: Record<
      'accomplishments' | 'products' | 'participantsOrganizations' | 'impact' | 'changesProblems' | 'specialRequirements',
      RpprSectionStatus
    >
  }
  warnings: AnalyticsWarning[]
}
