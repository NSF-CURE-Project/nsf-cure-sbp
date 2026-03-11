import { createHash } from 'node:crypto'

const VOLATILE_KEYS = new Set(['generatedAt', 'createdAt', 'updatedAt'])

const normalizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item))
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !VOLATILE_KEYS.has(key))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, normalizeValue(child)] as const)
    return Object.fromEntries(entries)
  }

  return value
}

export const normalizeSnapshotPayload = (input: {
  reportType?: unknown
  periodStart?: unknown
  periodEnd?: unknown
  filterScope?: unknown
  metricPayload?: unknown
  rpprPayload?: unknown
}) =>
  normalizeValue({
    reportType: input.reportType ?? null,
    periodStart: input.periodStart ?? null,
    periodEnd: input.periodEnd ?? null,
    filterScope: input.filterScope ?? null,
    metricPayload: input.metricPayload ?? null,
    rpprPayload: input.rpprPayload ?? null,
  })

export const computeSnapshotHash = (input: {
  reportType?: unknown
  periodStart?: unknown
  periodEnd?: unknown
  filterScope?: unknown
  metricPayload?: unknown
  rpprPayload?: unknown
}) => createHash('sha256').update(JSON.stringify(normalizeSnapshotPayload(input))).digest('hex')
