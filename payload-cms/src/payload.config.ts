import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type PayloadComponent } from 'payload'
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
import { MathFeature } from './lexical/math/MathFeature'
import { Questions } from './collections/Questions'
import { Notifications } from './collections/Notifications'
import { LessonProgress } from './collections/LessonProgress'
import { Feedback } from './collections/Feedback'
import { LessonFeedback } from './collections/LessonFeedback'
import { Classrooms } from './collections/Classrooms'
import { ClassroomMemberships } from './collections/ClassroomMemberships'
import { AdminHelp } from './globals/AdminHelp'
import { Footer } from './globals/Footer'
import {
  joinClassroomHandler,
  regenerateClassroomCodeHandler,
} from './endpoints/classroomEndpoints'
import { previewUrlHandler } from './endpoints/previewUrl'
import { confirmEmailHandler, requestEmailConfirmationHandler } from './endpoints/emailConfirmation'
import { logoutAllSessionsHandler } from './endpoints/logoutAll'
// Uses the generated import map entry for the dashboard view component
const StaffDashboardView: PayloadComponent = {
  path: '@/views/StaffDashboardView#default',
}
const StaffProvider: PayloadComponent = {
  path: '@/views/StaffProvider#default',
}
const AdminLogo: PayloadComponent = {
  path: '@/views/AdminLogo#default',
}
const AdminIcon: PayloadComponent = {
  path: '@/views/AdminIcon#default',
}
const StaffNav: PayloadComponent = {
  path: '@/views/StaffNav#default',
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

const { fromName, fromAddress } = parseFrom(process.env.SMTP_FROM)
const frontendURL = process.env.FRONTEND_URL ?? 'http://localhost:3001'
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
const defaultFromAddress = fromAddress ?? process.env.SMTP_USER ?? 'info@payloadcms.com'
const defaultFromName = fromName ?? 'NSF CURE SBP'
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})
const buildEmailAdapter = () => ({
  name: 'nodemailer',
  defaultFromAddress,
  defaultFromName,
  sendEmail: async (message: { [key: string]: unknown }) =>
    transport.sendMail({
      from: `"${defaultFromName}" <${defaultFromAddress}>`,
      ...message,
    }),
})

export default buildConfig({
  serverURL,
  cors: [frontendURL],
  csrf: [frontendURL],
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
      baseDir: path.resolve(dirname),
    },

    components: {
      providers: [StaffProvider],
      graphics: {
        Logo: AdminLogo,
        Icon: AdminIcon,
      },
      Nav: StaffNav,
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
    Accounts,
    Users,
    Media,
    Questions,
    Notifications,
    LessonProgress,
    Feedback,
    LessonFeedback,
  ],
  globals: [AdminHelp, Footer],
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
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [],
  endpoints: [
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
  ],
})
