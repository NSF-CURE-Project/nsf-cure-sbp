import type { ReportingSummary } from './types'
import type { ReportingAnomaly } from './anomalies'
import type { DataQualityPanel } from './dataQuality'

export type NarrativeDrafts = {
  accomplishmentsDraft: string
  impactDraft: string
  changesProblemsDraft: string
}

const pct = (value: number): string => `${Math.round(value * 100)}%`

export const buildNarrativeDrafts = (
  summary: ReportingSummary,
  dataQuality: DataQualityPanel,
  anomalies: ReportingAnomaly[],
): NarrativeDrafts => {
  const topClass = summary.classCompletion[0]
  const topQuiz = summary.quizPerformance[0]

  const accomplishmentsDraft = [
    'DRAFT - STAFF EDIT REQUIRED.',
    `During this reporting scope, ${summary.participation.uniqueLearnersActive} unique learners were active across lessons and quizzes.`,
    topClass
      ? `The strongest class-level completion observed was ${pct(topClass.completionRate)} in ${topClass.title} (${topClass.uniqueLearnersCompleted}/${topClass.uniqueLearnersStarted} learners).`
      : 'No class completion data is currently available for this scope.',
    topQuiz
      ? `Quiz mastery reached ${pct(topQuiz.masteryRate)} for ${topQuiz.title} (${topQuiz.uniqueLearnersMastered}/${topQuiz.uniqueLearnersAttempted} learners mastered).`
      : 'No quiz mastery data is currently available for this scope.',
  ].join(' ')

  const avgCompletion = summary.classCompletion.length
    ? summary.classCompletion.reduce((sum, item) => sum + item.completionRate, 0) /
      summary.classCompletion.length
    : 0
  const avgMastery = summary.quizPerformance.length
    ? summary.quizPerformance.reduce((sum, item) => sum + item.masteryRate, 0) /
      summary.quizPerformance.length
    : 0

  const impactDraft = [
    'DRAFT - STAFF EDIT REQUIRED.',
    `Average class completion across scoped classes was ${pct(avgCompletion)}.`,
    `Average quiz mastery across scoped quizzes was ${pct(avgMastery)}.`,
    anomalies.length
      ? `Anomaly checks flagged ${anomalies.length} notable trend(s), requiring interpretation before submission.`
      : 'No large anomaly spikes/drops were detected in current trend checks.',
  ].join(' ')

  const criticalIssues = dataQuality.issues.filter((issue) => issue.severity === 'high').length
  const changesProblemsDraft = [
    'DRAFT - STAFF EDIT REQUIRED.',
    criticalIssues
      ? `Data quality validation surfaced ${criticalIssues} high-severity issue(s) that may affect confidence in official reporting outputs.`
      : 'No high-severity data quality blockers were detected for this scope.',
    'Document any operational blockers, staffing changes, or curriculum constraints that influenced outcomes this period.',
  ].join(' ')

  return {
    accomplishmentsDraft,
    impactDraft,
    changesProblemsDraft,
  }
}
