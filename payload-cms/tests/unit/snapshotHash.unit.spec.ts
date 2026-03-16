import { describe, expect, it } from 'vitest'
import { computeSnapshotHash } from '@/reporting/snapshotHash'

describe('snapshot hash', () => {
  it('ignores volatile generated timestamps for reproducibility', () => {
    const base = {
      reportType: 'annual',
      periodStart: '2026-01-01T00:00:00.000Z',
      periodEnd: '2026-12-31T23:59:59.999Z',
      filterScope: { classId: 'class-1' },
      metricPayload: {
        reportMeta: { generatedAt: '2026-03-01T00:00:00.000Z' },
        participation: { uniqueLearnersActive: 10 },
      },
    }

    const withLaterTimestamp = {
      ...base,
      metricPayload: {
        reportMeta: { generatedAt: '2026-03-02T00:00:00.000Z' },
        participation: { uniqueLearnersActive: 10 },
      },
    }

    expect(computeSnapshotHash(base)).toBe(computeSnapshotHash(withLaterTimestamp))
  })
})
