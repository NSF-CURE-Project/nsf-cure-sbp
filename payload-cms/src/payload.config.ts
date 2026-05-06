import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type CustomComponent, type PayloadComponent } from 'payload'
import nodemailer from 'nodemailer'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Classes } from './collections/Classes'
import { Chapters } from './collections/Chapters'
import { Lessons } from './collections/Lessons'
import { Pages } from './collections/Pages'
import { Accounts } from './collections/Accounts'
import { QuizQuestions } from './collections/QuizQuestions'
import { Quizzes } from './collections/Quizzes'
import { QuizAttempts } from './collections/QuizAttempts'
import { EngineeringFigures } from './collections/EngineeringFigures'
import { Problems } from './collections/Problems'
import { ProblemSets } from './collections/ProblemSets'
import { ProblemAttempts } from './collections/ProblemAttempts'
import { MathFeature } from './lexical/math/MathFeature'
import { Questions } from './collections/Questions'
import { Notifications } from './collections/Notifications'
import { LessonProgress } from './collections/LessonProgress'
import { LessonBookmarks } from './collections/LessonBookmarks'
import { Feedback } from './collections/Feedback'
import { LessonFeedback } from './collections/LessonFeedback'
import { Classrooms } from './collections/Classrooms'
import { ClassroomMemberships } from './collections/ClassroomMemberships'
import { Organizations } from './collections/Organizations'
import { ReportingPeriods } from './collections/ReportingPeriods'
import { RpprReports } from './collections/RpprReports'
import { ReportingSnapshots } from './collections/ReportingSnapshots'
import { ReportingAuditEvents } from './collections/ReportingAuditEvents'
import { ReportingSavedViews } from './collections/ReportingSavedViews'
import { ReportingEvidenceLinks } from './collections/ReportingEvidenceLinks'
import { ReportingProductRecords } from './collections/ReportingProductRecords'
import { ApiKeys } from './collections/ApiKeys'
import { AdminHelp } from './globals/AdminHelp'
import { Footer } from './globals/Footer'
import { SiteBranding } from './globals/SiteBranding'
import {
  joinClassroomHandler,
  leaveClassroomHandler,
  regenerateClassroomCodeHandler,
} from './endpoints/classroomEndpoints'
import { previewUrlHandler } from './endpoints/previewUrl'
import { confirmEmailHandler, requestEmailConfirmationHandler } from './endpoints/emailConfirmation'
import { logoutAllSessionsHandler } from './endpoints/logoutAll'
import { accountsMeHandler } from './endpoints/accountsMe'
import { accountsHeartbeatHandler } from './endpoints/accountsHeartbeat'
import {
  accountDataSummaryHandler,
  updateMyDemographicsHandler,
  updateNotificationPreferencesHandler,
} from './endpoints/accountEndpoints'
import { reportingSummaryHandler } from './endpoints/reportingSummary'
import { nsfRpprSummaryHandler } from './endpoints/nsfRpprSummary'
import { reportingCenterHandler } from './endpoints/reportingCenter'
import { metricDefinitionsHandler } from './endpoints/metricDefinitions'
import { emailPreviewHandler } from './endpoints/emailPreview'
import { certificateHandler } from './endpoints/certificate'
import { quizAttemptReviewHandler } from './endpoints/quizAttemptReview'
import { problemAttemptReviewHandler } from './endpoints/problemAttemptReview'
import { publicProblemSetByIdHandler, publicProblemSetListHandler } from './endpoints/publicProblemSets'
import { lessonQuestionsHandler, questionDetailHandler } from './endpoints/questionsEndpoints'
import { studentAnalyticsHandler } from './endpoints/studentAnalytics'
import { studentPerformanceHandler } from './endpoints/studentPerformance'
import { demoQuizFormatsHandler } from './endpoints/demoQuizFormats'
import {
  userAnalyticsListHandler,
  userAnalyticsDetailHandler,
} from './endpoints/userAnalytics'
import { quizStatsHandler } from './endpoints/quizStats'
import { classroomListHandler, classroomRosterHandler } from './endpoints/instructorEndpoints'
import { apiKeyValidateHandler } from './endpoints/apiKeyValidate'
import { gptRpprContextHandler } from './endpoints/gptRpprContext'
import { generateRpprPdfHandler } from './endpoints/generateRpprPdf'
import { adminCreateUserHandler } from './endpoints/adminCreateUser'
// Uses the generated import map entry for the dashboard view component
const StaffDashboardView: PayloadComponent = {
  path: '@/views/StaffDashboardView#default',
}
const StaffProvider: PayloadComponent = {
  path: '@/views/StaffProvider#default',
}
const AdminLogo: CustomComponent = {
  path: '@/views/AdminLogo#default',
}
const AdminIcon: CustomComponent = {
  path: '@/views/AdminIcon#default',
}
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const parseFrom = (value?: string) => {
  if (!value) return { fromName: undefined, fromAddress: undefined }
  const match = value.match(/^(.*)<([^>]+)>$/)
  if (match) {
    return {
      fromName: match[1].trim().replace(/^"|"$/g, ''),
      fromAddress: match[2].trim(),
    }
  }
  return { fromName: undefined, fromAddress: value.trim() }
}

const stripEnvQuotes = (value?: string) => {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.replace(/^['"]+|['"]+$/g, '')
}

const formatAddress = (value: unknown): null | string => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  }

  if (typeof value === 'object' && value !== null) {
    const entry = value as { address?: unknown; email?: unknown; name?: unknown }
    const email = typeof entry.email === 'string' ? entry.email.trim() : ''
    const address = typeof entry.address === 'string' ? entry.address.trim() : ''
    const resolved = email || address
    if (!resolved) return null

    if (typeof entry.name === 'string' && entry.name.trim()) {
      const escapedName = entry.name.trim().replace(/"/g, '\\"')
      return `"${escapedName}" <${resolved}>`
    }

    return resolved
  }

  return null
}

const formatAddressList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => formatAddress(item))
      .filter((item): item is string => Boolean(item))
  }

  if (typeof value === 'string' && value.includes(',')) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const single = formatAddress(value)
  return single ? [single] : []
}

const resendApiKey = stripEnvQuotes(process.env.RESEND_API_KEY)
const resendApiBaseUrl = stripEnvQuotes(process.env.RESEND_API_BASE_URL) ?? 'https://api.resend.com'
const resendFrom = stripEnvQuotes(process.env.RESEND_FROM)
const resendStarterBaseUrl = stripEnvQuotes(process.env.RESEND_STARTER_URL)
const resendStarterSendUrl =
  stripEnvQuotes(process.env.RESEND_STARTER_SEND_URL) ??
  (resendStarterBaseUrl ? `${resendStarterBaseUrl.replace(/\/+$/, '')}/api/send` : undefined)
const resendStarterAuthToken = stripEnvQuotes(process.env.RESEND_STARTER_AUTH_TOKEN)
const resendStarterTimeoutMs = (() => {
  const value = stripEnvQuotes(process.env.RESEND_STARTER_TIMEOUT_MS)
  const parsed = value ? Number(value) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15000
})()

const smtpFrom = stripEnvQuotes(process.env.SMTP_FROM)
const smtpHost = stripEnvQuotes(process.env.SMTP_HOST)
const smtpPort = stripEnvQuotes(process.env.SMTP_PORT)
const smtpSecure = (stripEnvQuotes(process.env.SMTP_SECURE) ?? '').toLowerCase() === 'true'
const smtpUser = stripEnvQuotes(process.env.SMTP_USER)
const smtpPass = stripEnvQuotes(process.env.SMTP_PASS)
const smtpConnectionTimeout = stripEnvQuotes(process.env.SMTP_CONNECTION_TIMEOUT_MS)
const smtpGreetingTimeout = stripEnvQuotes(process.env.SMTP_GREETING_TIMEOUT_MS)
const smtpSocketTimeout = stripEnvQuotes(process.env.SMTP_SOCKET_TIMEOUT_MS)

const { fromName, fromAddress } = parseFrom(resendFrom ?? smtpFrom)
const frontendURL = process.env.FRONTEND_URL ?? 'http://localhost:3001'
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
const allowedOrigins = [frontendURL, serverURL].filter(Boolean)
const defaultFromAddress = fromAddress ?? smtpUser ?? 'info@payloadcms.com'
const defaultFromName = fromName ?? 'NSF CURE SBP'
const smtpTransport = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort ? Number(smtpPort) : undefined,
  secure: smtpSecure,
  connectionTimeout: smtpConnectionTimeout ? Number(smtpConnectionTimeout) : 10000,
  greetingTimeout: smtpGreetingTimeout ? Number(smtpGreetingTimeout) : 10000,
  socketTimeout: smtpSocketTimeout ? Number(smtpSocketTimeout) : 15000,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
})
const buildNodemailerAdapter = () => ({
  name: 'nodemailer',
  defaultFromAddress,
  defaultFromName,
  sendEmail: async (message: { [key: string]: unknown }) =>
    smtpTransport.sendMail({
      from: `"${defaultFromName}" <${defaultFromAddress}>`,
      ...message,
    }),
})

const buildResendAdapter = () => ({
  name: 'resend',
  defaultFromAddress,
  defaultFromName,
  sendEmail: async (message: { [key: string]: unknown }) => {
    if (!resendApiKey) throw new Error('Missing RESEND_API_KEY')

    const from = formatAddress(message.from) ?? `"${defaultFromName}" <${defaultFromAddress}>`
    const to = formatAddressList(message.to)
    if (!to.length) throw new Error('Resend email requires at least one "to" address')

    const cc = formatAddressList(message.cc)
    const bcc = formatAddressList(message.bcc)
    const replyTo = formatAddressList(message.replyTo ?? message.reply_to)
    const subject =
      typeof message.subject === 'string' && message.subject.trim()
        ? message.subject.trim()
        : '(no subject)'
    const html = typeof message.html === 'string' ? message.html : undefined
    const text = typeof message.text === 'string' ? message.text : undefined

    const response = await fetch(`${resendApiBaseUrl.replace(/\/+$/, '')}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
        ...(cc.length ? { cc } : {}),
        ...(bcc.length ? { bcc } : {}),
        ...(replyTo.length ? { reply_to: replyTo } : {}),
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`Resend send failed (${response.status}): ${detail || response.statusText}`)
    }

    return response.json().catch(() => undefined)
  },
})

const buildResendStarterAdapter = () => ({
  name: 'resend-starter',
  defaultFromAddress,
  defaultFromName,
  sendEmail: async (message: { [key: string]: unknown }) => {
    if (!resendStarterSendUrl) throw new Error('Missing RESEND_STARTER_SEND_URL')

    const from = formatAddress(message.from) ?? `"${defaultFromName}" <${defaultFromAddress}>`
    const to = formatAddressList(message.to)
    if (!to.length) throw new Error('Resend starter email requires at least one "to" address')

    const cc = formatAddressList(message.cc)
    const bcc = formatAddressList(message.bcc)
    const replyTo = formatAddressList(message.replyTo ?? message.reply_to)
    const subject =
      typeof message.subject === 'string' && message.subject.trim()
        ? message.subject.trim()
        : '(no subject)'
    const html = typeof message.html === 'string' ? message.html : undefined
    const text = typeof message.text === 'string' ? message.text : undefined

    const response = await (async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), resendStarterTimeoutMs)
      try {
        return await fetch(resendStarterSendUrl, {
          method: 'POST',
          headers: {
            ...(resendStarterAuthToken
              ? { Authorization: `Bearer ${resendStarterAuthToken}` }
              : {}),
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            from,
            to,
            subject,
            ...(html ? { html } : {}),
            ...(text ? { text } : {}),
            ...(cc.length ? { cc } : {}),
            ...(bcc.length ? { bcc } : {}),
            ...(replyTo.length ? { replyTo, reply_to: replyTo } : {}),
          }),
        })
      } finally {
        clearTimeout(timeout)
      }
    })()

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(
        `Resend starter send failed (${response.status}): ${detail || response.statusText}`,
      )
    }

    return response.json().catch(() => undefined)
  },
})

const buildEmailAdapter = () => {
  if (resendStarterSendUrl) return buildResendStarterAdapter()
  if (resendApiKey) return buildResendAdapter()
  return buildNodemailerAdapter()
}

export default buildConfig({
  serverURL,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: 'Admin',
      description: 'Admin login for NSF CURE SBP',
      icons: '/assets/logos/sbp_logo_transparent.png',
    },
    livePreview: {
      collections: ['lessons', 'pages'],
      breakpoints: [
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1280,
          height: 720,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 834,
          height: 1112,
        },
        {
          label: 'Mobile',
          name: 'mobile',
          width: 390,
          height: 844,
        },
      ],
    },

    importMap: {
      autoGenerate: false,
      baseDir: path.resolve(dirname),
    },

    components: {
      providers: [StaffProvider],
      graphics: {
        Logo: AdminLogo,
        Icon: AdminIcon,
      },
      views: {
        dashboard: {
          Component: StaffDashboardView,
        },
      },
    },
  },

  collections: [
    Classes,
    Chapters,
    Lessons,
    Pages,
    Classrooms,
    ClassroomMemberships,
    Organizations,
    ReportingPeriods,
    RpprReports,
    ReportingSnapshots,
    ReportingAuditEvents,
    ReportingSavedViews,
    ReportingEvidenceLinks,
    ReportingProductRecords,
    ApiKeys,
    Accounts,
    Users,
    Media,
    Questions,
    QuizQuestions,
    Quizzes,
    QuizAttempts,
    EngineeringFigures,
    Problems,
    ProblemSets,
    ProblemAttempts,
    Notifications,
    LessonProgress,
    LessonBookmarks,
    Feedback,
    LessonFeedback,
  ],
  globals: [AdminHelp, Footer, SiteBranding],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      MathFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  email: buildEmailAdapter,
  onInit: async (payload) => {
    if (typeof payload.email?.sendEmail !== 'function') {
      const adapter = buildEmailAdapter()
      payload.email = adapter
      payload.sendEmail = adapter.sendEmail
      payload.logger.warn('Email adapter was missing; reattached.')
    }

    process.once('SIGTERM', async () => {
      payload.logger.info('[shutdown] SIGTERM received, draining...')
      const forceExitTimer = setTimeout(() => {
        payload.logger.error('[shutdown] Forced exit after timeout')
        process.exit(1)
      }, 10_000)

      try {
        await payload.db?.destroy?.()
        clearTimeout(forceExitTimer)
        process.exit(0)
      } catch (error) {
        clearTimeout(forceExitTimer)
        payload.logger.error({
          msg: '[shutdown] Failed to close database cleanly',
          err: error,
        })
        process.exit(1)
      }
    })
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
    // Prevent accidental schema drift against shared/production databases.
    push: false,
  }),
  sharp,
  plugins: process.env.S3_BUCKET
    ? [
        s3Storage({
          collections: {
            media: true,
          },
          bucket: process.env.S3_BUCKET,
          config: {
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
            },
            region: process.env.S3_REGION ?? 'us-east-1',
            endpoint: process.env.S3_ENDPOINT || undefined,
          },
        }),
      ]
    : [],
  endpoints: [
    {
      path: '/health',
      method: 'get',
      handler: async () =>
        new Response(JSON.stringify({ status: 'ok', ts: Date.now() }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    },
    {
      path: '/classrooms/join',
      method: 'post',
      handler: joinClassroomHandler,
    },
    {
      path: '/classrooms/regenerate-code',
      method: 'post',
      handler: regenerateClassroomCodeHandler,
    },
    {
      path: '/classrooms/:classroomId/leave',
      method: 'post',
      handler: leaveClassroomHandler,
    },
    {
      path: '/preview-url',
      method: 'post',
      handler: previewUrlHandler,
    },
    {
      path: '/preview-url',
      method: 'get',
      handler: previewUrlHandler,
    },
    {
      path: '/accounts/me',
      method: 'get',
      handler: accountsMeHandler,
    },
    {
      path: '/accounts/heartbeat',
      method: 'post',
      handler: accountsHeartbeatHandler,
    },
    {
      path: '/auth/api-key-info',
      method: 'get',
      handler: apiKeyValidateHandler,
    },
    {
      path: '/accounts/me/demographics',
      method: 'patch',
      handler: updateMyDemographicsHandler,
    },
    {
      path: '/accounts/me/notification-preferences',
      method: 'patch',
      handler: updateNotificationPreferencesHandler,
    },
    {
      path: '/accounts/me/data-summary',
      method: 'get',
      handler: accountDataSummaryHandler,
    },
    {
      path: '/staff/student-performance',
      method: 'get',
      handler: studentPerformanceHandler,
    },
    {
      path: '/staff/user-analytics/list',
      method: 'get',
      handler: userAnalyticsListHandler,
    },
    {
      path: '/staff/user-analytics',
      method: 'get',
      handler: userAnalyticsDetailHandler,
    },
    {
      path: '/staff/quiz-stats',
      method: 'get',
      handler: quizStatsHandler,
    },
    {
      path: '/demo/quiz-formats',
      method: 'get',
      handler: demoQuizFormatsHandler,
    },
    {
      path: '/accounts/request-email-confirmation',
      method: 'post',
      handler: requestEmailConfirmationHandler,
    },
    {
      path: '/accounts/confirm-email',
      method: 'post',
      handler: confirmEmailHandler,
    },
    {
      path: '/accounts/logout-all',
      method: 'post',
      handler: logoutAllSessionsHandler,
    },
    {
      path: '/admin/users/create',
      method: 'post',
      handler: adminCreateUserHandler,
    },
    {
      path: '/accounts/email-preview',
      method: 'post',
      handler: emailPreviewHandler,
    },
    {
      path: '/accounts/email-preview',
      method: 'get',
      handler: emailPreviewHandler,
    },
    {
      path: '/analytics/reporting-summary',
      method: 'get',
      handler: reportingSummaryHandler,
    },
    {
      path: '/analytics/nsf-rppr',
      method: 'get',
      handler: nsfRpprSummaryHandler,
    },
    {
      path: '/analytics/reporting-center',
      method: 'get',
      handler: reportingCenterHandler,
    },
    {
      path: '/analytics/metric-definitions',
      method: 'get',
      handler: metricDefinitionsHandler,
    },
    {
      path: '/analytics/student',
      method: 'get',
      handler: studentAnalyticsHandler,
    },
    {
      path: '/analytics/gpt-rppr-context',
      method: 'get',
      handler: gptRpprContextHandler,
    },
    {
      path: '/analytics/generate-rppr-pdf',
      method: 'post',
      handler: generateRpprPdfHandler,
    },
    {
      path: '/classrooms/:classroomId/certificate',
      method: 'get',
      handler: certificateHandler,
    },
    {
      path: '/quiz-attempts/:attemptId/review',
      method: 'get',
      handler: quizAttemptReviewHandler,
    },
    {
      path: '/problem-attempts/:attemptId/review',
      method: 'get',
      handler: problemAttemptReviewHandler,
    },
    {
      path: '/public/problem-sets',
      method: 'get',
      handler: publicProblemSetListHandler,
    },
    {
      path: '/public/problem-sets/:problemSetId',
      method: 'get',
      handler: publicProblemSetByIdHandler,
    },
    {
      path: '/questions/by-lesson/:lessonId',
      method: 'get',
      handler: lessonQuestionsHandler,
    },
    {
      path: '/questions/:questionId/detail',
      method: 'get',
      handler: questionDetailHandler,
    },
    {
      path: '/instructor/classrooms',
      method: 'get',
      handler: classroomListHandler,
    },
    {
      path: '/instructor/classrooms/:classroomId/roster',
      method: 'get',
      handler: classroomRosterHandler,
    },
  ],
})
