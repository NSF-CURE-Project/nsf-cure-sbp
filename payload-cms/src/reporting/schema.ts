type ErrorWithCode = {
  code?: unknown
  message?: unknown
  cause?: unknown
}

const extractMessage = (error: unknown): string => {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as ErrorWithCode).message
    return typeof message === 'string' ? message : ''
  }
  return ''
}

const extractSqlState = (error: unknown): string | null => {
  if (!error || typeof error !== 'object') return null
  const directCode = 'code' in error ? (error as ErrorWithCode).code : null
  if (typeof directCode === 'string' && directCode.trim()) return directCode
  const cause = 'cause' in error ? (error as ErrorWithCode).cause : null
  if (cause && typeof cause === 'object' && 'code' in cause) {
    const code = (cause as ErrorWithCode).code
    if (typeof code === 'string' && code.trim()) return code
  }
  return null
}

export const isMissingRelationError = (error: unknown): boolean => {
  const code = extractSqlState(error)
  if (code === '42P01') return true
  return /relation .* does not exist/i.test(extractMessage(error))
}

export const isMissingColumnError = (error: unknown): boolean => {
  const code = extractSqlState(error)
  if (code === '42703') return true
  return /column .* does not exist/i.test(extractMessage(error))
}

export const isSchemaMismatchError = (error: unknown): boolean => {
  const code = extractSqlState(error)
  if (code && ['42P01', '42703', '42704', '3F000'].includes(code)) return true
  const message = extractMessage(error)
  return (
    /does not exist/i.test(message) ||
    /undefined_table/i.test(message) ||
    /undefined_column/i.test(message) ||
    /undefined_object/i.test(message)
  )
}

export const schemaRepairHint =
  'Reporting schema is incomplete in this database. Run `pnpm payload migrate` with Node 20.6+ and refresh.'
