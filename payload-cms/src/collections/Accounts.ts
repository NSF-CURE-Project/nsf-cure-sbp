import { buildAuthEmail, buildResetPasswordUrl } from '../utils/authEmails'
import type { CollectionConfig, PayloadRequest } from 'payload'

const cookieSecure = (() => {
  const envValue = process.env.PAYLOAD_COOKIE_SECURE
  if (envValue === 'true') return true
  if (envValue === 'false') return false
  return (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? '').startsWith('https://')
})()

const cookieSameSite = (() => {
  const envValue = process.env.PAYLOAD_COOKIE_SAMESITE?.toLowerCase()
  if (envValue === 'none') return 'None'
  if (envValue === 'strict') return 'Strict'
  return 'Lax'
})()

const cookieDomain = (() => {
  if (process.env.NODE_ENV !== 'production') return undefined
  return process.env.PAYLOAD_APP_COOKIE_DOMAIN || undefined
})()

const isStaffUser = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const Accounts: CollectionConfig = {
  slug: 'accounts',
  auth: {
    cookies: {
      secure: cookieSecure,
      sameSite: cookieSameSite,
      domain: cookieDomain,
    },
    forgotPassword: {
      generateEmailSubject: () => 'Reset your NSF CURE account password',
      generateEmailHTML: (args) => {
        const resetUrl = buildResetPasswordUrl(args?.token ?? '')
        return buildAuthEmail({
          heading: 'Reset your NSF CURE account password',
          intro: 'A password reset was requested for your account.',
          actionLabel: 'Reset password',
          actionUrl: resetUrl,
          securityNote: 'If you did not request a password reset, you can safely ignore this email.',
        }).html
      },
    },
  },
  admin: {
    useAsTitle: 'email',
    group: 'Students',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== 'object') return data
        return {
          ...(data as Record<string, unknown>),
          role: 'student',
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        if (!req?.payload?.sendEmail || !doc?.email) return doc

        const { buildEmailConfirmation } = await import('../utils/emailConfirmation')
        const { confirmUrl, expiresAt, tokenHash } = buildEmailConfirmation()

        await req.payload.update({
          collection: 'accounts',
          id: doc.id,
          data: {
            emailVerificationTokenHash: tokenHash,
            emailVerificationExpiresAt: expiresAt,
            emailVerified: false,
            emailVerifiedAt: null,
          },
          overrideAccess: true,
        })

        const message = buildAuthEmail({
          heading: 'Confirm your NSF CURE account email',
          intro: 'Please confirm your email address to activate your account.',
          actionLabel: 'Confirm email address',
          actionUrl: confirmUrl,
          securityNote: 'If you did not create this account, no further action is needed.',
        })

        await req.payload.sendEmail({
          to: doc.email,
          subject: 'Confirm your NSF CURE account email',
          ...message,
        })

        return doc
      },
    ],
    beforeOperation: [
      async ({ args, operation, req }) => {
        if (operation === 'forgotPassword' && req?.payload?.config?.email) {
          const emailConfig = req.payload.config.email
          if (!req.payload.email || typeof req.payload.email.sendEmail !== 'function') {
            if (emailConfig instanceof Promise) {
              const adapter = await emailConfig
              req.payload.email = adapter({ payload: req.payload })
            } else if (typeof emailConfig === 'function') {
              req.payload.email = emailConfig({ payload: req.payload })
            }
            if (req.payload.email?.sendEmail) {
              req.payload.sendEmail = req.payload.email.sendEmail
            }
          }
        }
        return args
      },
    ],
  },
  access: {
    read: ({ req, id }) =>
      isStaffUser(req) || (req.user?.collection === 'accounts' && req.user?.id === id),
    create: () => true,
    update: ({ req, id }) =>
      (req.user?.collection === 'users' && ['admin', 'staff'].includes(req.user?.role ?? '')) ||
      (req.user?.collection === 'accounts' && req.user?.id === id),
    delete: ({ req }) => req.user?.collection === 'users' && req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'emailVerified',
      label: 'Email verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'emailVerifiedAt',
      label: 'Email verified at',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'emailVerificationTokenHash',
      label: 'Email verification token hash',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'emailVerificationExpiresAt',
      label: 'Email verification expires at',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      options: [{ label: 'Student', value: 'student' }],
      admin: {
        description: 'Student role for learner accounts.',
      },
    },
    {
      name: 'fullName',
      label: 'Full name',
      type: 'text',
    },
    {
      name: 'currentStreak',
      label: 'Current streak',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'longestStreak',
      label: 'Longest streak',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'lastStreakDate',
      label: 'Last streak date',
      type: 'date',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'participantType',
      label: 'Participant type',
      type: 'select',
      options: [
        { label: 'Undergraduate student', value: 'undergraduate_student' },
        { label: 'Graduate student', value: 'graduate_student' },
        { label: 'K-12 student', value: 'k12_student' },
        { label: 'Teacher', value: 'teacher' },
        { label: 'Staff', value: 'staff' },
        { label: 'Faculty', value: 'faculty' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Used for NSF participant reporting exports.',
      },
    },
    {
      name: 'projectRole',
      label: 'Project role',
      type: 'text',
      admin: {
        description: 'RPPR participant role in this project.',
      },
    },
    {
      name: 'organization',
      label: 'Organization',
      type: 'relationship',
      relationTo: 'organizations',
    },
    {
      name: 'organizationName',
      label: 'Organization name (snapshot)',
      type: 'text',
      admin: {
        description:
          'Optional reporting snapshot for exports when the organization relationship is empty.',
      },
    },
    {
      name: 'contributionSummary',
      label: 'Contribution summary',
      type: 'textarea',
      admin: {
        description: 'Summary of participant contributions used in RPPR narratives.',
      },
    },
    {
      name: 'participationStartDate',
      label: 'Participation start date',
      type: 'date',
    },
    {
      name: 'participationEndDate',
      label: 'Participation end date',
      type: 'date',
    },
    {
      name: 'firstGenCollegeStudent',
      label: 'First-generation college student',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Supports cohort filtering in reporting center.',
      },
    },
    {
      name: 'transferStudent',
      label: 'Transfer student',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Supports cohort filtering in reporting center.',
      },
    },
    {
      name: 'includeInRppr',
      label: 'Include in RPPR exports',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notificationPreferences',
      type: 'group',
      fields: [
        {
          name: 'questionAnswered',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'newContent',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'announcement',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'quizDeadline',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'ssoProvider',
      label: 'SSO Provider',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Reserved for CPP SSO integration (e.g., Okta, Azure AD).',
      },
    },
    {
      name: 'ssoSubject',
      label: 'SSO Subject ID',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Reserved for CPP SSO integration (unique external user id).',
      },
    },
  ],
}
