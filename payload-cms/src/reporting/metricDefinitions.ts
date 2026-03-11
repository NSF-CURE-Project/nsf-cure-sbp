export type MetricDefinition = {
  key: string
  name: string
  description: string
  numerator: string
  denominator: string
  caveats: string[]
  reportSafe: boolean
  category: 'completion' | 'mastery' | 'engagement' | 'participation'
}

export const metricDefinitions: MetricDefinition[] = [
  {
    key: 'class_completion_rate',
    name: 'Class Completion Rate',
    description: 'Share of unique learners who completed class content after starting it.',
    numerator: 'Unique learners with at least one completed progress record in class.',
    denominator: 'Unique learners with any progress record in class during scope.',
    caveats: [
      'Reflects in-scope activity only; out-of-period completions are excluded in RPPR mode.',
      'Requires class linkage on lesson-progress records.',
    ],
    reportSafe: true,
    category: 'completion',
  },
  {
    key: 'chapter_completion_rate',
    name: 'Chapter Completion Rate',
    description: 'Share of unique learners completing chapter content after starting it.',
    numerator: 'Unique learners with completed progress records in chapter.',
    denominator: 'Unique learners with any chapter progress in scope.',
    caveats: ['Depends on chapter linkage integrity in lesson-progress data.'],
    reportSafe: true,
    category: 'completion',
  },
  {
    key: 'quiz_mastery_rate',
    name: 'Quiz Mastery Rate',
    description: 'Share of unique learners reaching mastery threshold on quizzes attempted.',
    numerator: 'Unique learners with score >= 80% on in-scope attempts.',
    denominator: 'Unique learners with at least one in-scope quiz attempt.',
    caveats: [
      'Mastery threshold is currently fixed at 80%.',
      'Multiple attempts from same learner count once in numerator/denominator.',
    ],
    reportSafe: true,
    category: 'mastery',
  },
  {
    key: 'weekly_active_learners',
    name: 'Weekly Active Learners',
    description: 'Unique learners with any lesson progress activity per UTC week.',
    numerator: 'Unique learners active in each week.',
    denominator: 'No fixed denominator; trend metric.',
    caveats: ['Based on lesson-progress updatedAt timestamps.'],
    reportSafe: true,
    category: 'engagement',
  },
  {
    key: 'unique_learners_active',
    name: 'Unique Learners Active',
    description: 'Unique learners active via progress or quiz attempts in scope.',
    numerator: 'Unique learners with progress or quiz attempts.',
    denominator: 'No fixed denominator; absolute participation count.',
    caveats: ['Depends on account linkage in source records.'],
    reportSafe: true,
    category: 'participation',
  },
  {
    key: 'wow_engagement_change',
    name: 'Week-over-Week Engagement Change',
    description: 'Relative week-over-week change in active learner counts.',
    numerator: 'Current week active learners - previous week active learners.',
    denominator: 'Previous week active learners.',
    caveats: ['High variance when previous week activity is low.'],
    reportSafe: false,
    category: 'engagement',
  },
]

export const metricDefinitionByKey = (key: string): MetricDefinition | undefined =>
  metricDefinitions.find((metric) => metric.key === key)
