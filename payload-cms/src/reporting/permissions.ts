import type { PayloadRequest } from 'payload'

export const isReportingStaff = (req?: PayloadRequest | null): boolean =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const canAccessLearnerLevelReporting = (req?: PayloadRequest | null): boolean =>
  req?.user?.collection === 'users' && ['admin', 'staff'].includes(req.user?.role ?? '')
