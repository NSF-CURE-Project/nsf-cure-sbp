export const DEFAULT_STUDENT_LOGIN_DISABLED_MESSAGE =
  'Student account access is temporarily unavailable. Please check back later.'

export type StudentAuthSettings = {
  studentLoginEnabled: boolean
  studentLoginDisabledMessage: string
}

type PayloadLike = {
  findGlobal: unknown
}

const readString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const getStudentAuthSettings = async (
  payload: PayloadLike,
): Promise<StudentAuthSettings> => {
  try {
    const findGlobal = payload.findGlobal as (args: Record<string, unknown>) => Promise<unknown>
    const response = await findGlobal({
      slug: 'auth-settings',
      depth: 0,
      draft: false,
      overrideAccess: true,
    })

    const data =
      response && typeof response === 'object' && 'global' in response
        ? (response as { global?: unknown }).global
        : response
    const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
    const disabledMessage =
      readString(record.studentLoginDisabledMessage) || DEFAULT_STUDENT_LOGIN_DISABLED_MESSAGE

    return {
      studentLoginEnabled: record.studentLoginEnabled !== false,
      studentLoginDisabledMessage: disabledMessage,
    }
  } catch {
    return {
      studentLoginEnabled: true,
      studentLoginDisabledMessage: DEFAULT_STUDENT_LOGIN_DISABLED_MESSAGE,
    }
  }
}
