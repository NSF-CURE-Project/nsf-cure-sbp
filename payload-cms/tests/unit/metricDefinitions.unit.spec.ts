import { describe, expect, it } from 'vitest'
import { metricDefinitions, metricDefinitionByKey } from '@/reporting/metricDefinitions'

describe('metricDefinitions', () => {
  it('contains required keys and metadata', () => {
    const keys = metricDefinitions.map((metric) => metric.key)
    expect(keys).toContain('class_completion_rate')
    expect(keys).toContain('quiz_mastery_rate')
    expect(keys).toContain('weekly_active_learners')

    const completionMetric = metricDefinitionByKey('class_completion_rate')
    expect(completionMetric?.reportSafe).toBe(true)
    expect(completionMetric?.numerator.length).toBeGreaterThan(0)
    expect(completionMetric?.denominator.length).toBeGreaterThan(0)
  })
})
