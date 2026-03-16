import type { Payload, PayloadHandler, PayloadRequest } from 'payload'

type DemographicsPayload = {
  participantType?: unknown
  organization?: unknown
  organizationName?: unknown
  firstGenCollegeStudent?: unknown
  transferStudent?: unknown
  participationStartDate?: unknown
  participationEndDate?: unknown
  contributionSummary?: unknown
  projectRole?: unknown
}

type NotificationPreferencesPayload = {
  questionAnswered?: unknown
  newContent?: unknown
  announcement?: unknown
  quizDeadline?: unknown
}

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const getRequestBody = <T extends Record<string, unknown>>(req: PayloadRequest): T => {
  const body = req.body as unknown
  if (body && typeof body === 'object') {
    return body as T
  }

  return {} as T
}

const requireStudentAccount = (req: PayloadRequest) => {
  if (req.user?.collection !== 'accounts') {
    return jsonResponse({ message: 'Unauthorized' }, 401)
  }

  return null
}

const sanitizeOptionalString = (value: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const sanitizeOptionalDate = (value: unknown) => {
  if (typeof value !== 'string') return undefined
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return null
  return parsed.toISOString()
}

const sanitizeDemographicsBody = (body: DemographicsPayload) => {
  const data: Record<string, unknown> = {}

  const participantTypes = new Set([
    'undergraduate_student',
    'graduate_student',
    'k12_student',
    'teacher',
    'staff',
    'faculty',
    'other',
  ])

  if (typeof body.participantType === 'string' && participantTypes.has(body.participantType)) {
    data.participantType = body.participantType
  }
  if (typeof body.organization === 'string' || typeof body.organization === 'number') {
    data.organization = body.organization
  }

  const organizationName = sanitizeOptionalString(body.organizationName)
  if (organizationName !== undefined) data.organizationName = organizationName

  if (typeof body.firstGenCollegeStudent === 'boolean') {
    data.firstGenCollegeStudent = body.firstGenCollegeStudent
  }
  if (typeof body.transferStudent === 'boolean') {
    data.transferStudent = body.transferStudent
  }

  const participationStartDate = sanitizeOptionalDate(body.participationStartDate)
  if (participationStartDate !== undefined) data.participationStartDate = participationStartDate

  const participationEndDate = sanitizeOptionalDate(body.participationEndDate)
  if (participationEndDate !== undefined) data.participationEndDate = participationEndDate

  const contributionSummary = sanitizeOptionalString(body.contributionSummary)
  if (contributionSummary !== undefined) data.contributionSummary = contributionSummary

  const projectRole = sanitizeOptionalString(body.projectRole)
  if (projectRole !== undefined) data.projectRole = projectRole

  return data
}

const sanitizeNotificationPreferencesBody = (body: NotificationPreferencesPayload) => {
  const preferences: Record<string, boolean> = {}

  if (typeof body.questionAnswered === 'boolean') {
    preferences.questionAnswered = body.questionAnswered
  }
  if (typeof body.newContent === 'boolean') {
    preferences.newContent = body.newContent
  }
  if (typeof body.announcement === 'boolean') {
    preferences.announcement = body.announcement
  }
  if (typeof body.quizDeadline === 'boolean') {
    preferences.quizDeadline = body.quizDeadline
  }

  return preferences
}

const countDocuments = async (
  payload: Payload,
  collection: 'lesson-progress' | 'quiz-attempts' | 'problem-attempts',
  where: Record<string, unknown>,
) => {
  const result = await payload.find({
    collection,
    where: where as never,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.totalDocs ?? result.docs?.length ?? 0
}

export const updateMyDemographicsHandler: PayloadHandler = async (req) => {
  const authError = requireStudentAccount(req)
  if (authError) return authError
  const user = req.user as NonNullable<typeof req.user>

  const body = getRequestBody<DemographicsPayload>(req)
  const data = sanitizeDemographicsBody(body)

  const updated = await req.payload.update({
    collection: 'accounts',
    id: user.id,
    data,
    overrideAccess: true,
  })

  return jsonResponse(updated)
}

export const updateNotificationPreferencesHandler: PayloadHandler = async (req) => {
  const authError = requireStudentAccount(req)
  if (authError) return authError
  const user = req.user as NonNullable<typeof req.user>

  const body = getRequestBody<NotificationPreferencesPayload>(req)
  const preferences = sanitizeNotificationPreferencesBody(body)

  const updated = await req.payload.update({
    collection: 'accounts',
    id: user.id,
    data: {
      notificationPreferences: preferences,
    } as never,
    overrideAccess: true,
  })

  return jsonResponse({
    notificationPreferences:
      (updated as { notificationPreferences?: Record<string, boolean> }).notificationPreferences ?? {},
  })
}

export const accountDataSummaryHandler: PayloadHandler = async (req) => {
  const authError = requireStudentAccount(req)
  if (authError) return authError
  const user = req.user as NonNullable<typeof req.user>

  const account = (await req.payload.findByID({
    collection: 'accounts',
    id: user.id,
    depth: 1,
    overrideAccess: true,
  })) as {
    fullName?: string
    email?: string
    participantType?: string | null
    organizationName?: string | null
    firstGenCollegeStudent?: boolean
    transferStudent?: boolean
    projectRole?: string | null
    participationStartDate?: string | null
    participationEndDate?: string | null
    contributionSummary?: string | null
    includeInRppr?: boolean
    currentStreak?: number
    longestStreak?: number
  }

  const [lessonsCompleted, quizAttempts, problemAttempts] = await Promise.all([
    countDocuments(req.payload, 'lesson-progress', {
      user: { equals: user.id },
      completed: { equals: true },
    }),
    countDocuments(req.payload, 'quiz-attempts', {
      user: { equals: user.id },
    }),
    countDocuments(req.payload, 'problem-attempts', {
      user: { equals: user.id },
    }),
  ])

  return jsonResponse({
    profile: {
      name: account.fullName ?? null,
      email: account.email ?? null,
      participantType: account.participantType ?? null,
      organizationName: account.organizationName ?? null,
      firstGenCollegeStudent: Boolean(account.firstGenCollegeStudent),
      transferStudent: Boolean(account.transferStudent),
      projectRole: account.projectRole ?? null,
    },
    participation: {
      participationStartDate: account.participationStartDate ?? null,
      participationEndDate: account.participationEndDate ?? null,
      contributionSummary: account.contributionSummary ?? null,
      includeInRppr: account.includeInRppr ?? true,
    },
    activity: {
      currentStreak: account.currentStreak ?? 0,
      longestStreak: account.longestStreak ?? 0,
    },
    counts: {
      lessonsCompleted,
      quizAttempts,
      problemAttempts,
    },
  })
}
