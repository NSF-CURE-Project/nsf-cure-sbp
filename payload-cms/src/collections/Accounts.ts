import { buildAuthEmail, buildResetPasswordUrl } from '../utils/authEmails'
import type { CollectionConfig } from 'payload'

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
      generateEmailText: (args) => {
        const resetUrl = buildResetPasswordUrl(args?.token ?? '')
        return buildAuthEmail({
          heading: 'Reset your NSF CURE account password',
          intro: 'A password reset was requested for your account.',
          actionLabel: 'Reset password',
          actionUrl: resetUrl,
          securityNote: 'If you did not request a password reset, you can safely ignore this email.',
        }).text
      },
    },
  },
  admin: {
    useAsTitle: 'email',
    group: 'Students',
  },
  hooks: {
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
      req.user?.role === 'admin' ||
      req.user?.role === 'staff' ||
      req.user?.role === 'professor' ||
      req.user?.id === id,
    create: () => true,
    update: ({ req, id }) =>
      req.user?.role === 'admin' || req.user?.role === 'staff' || req.user?.id === id,
    delete: ({ req }) => req.user?.role === 'admin',
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
      options: [
        { label: 'Student', value: 'student' },
        { label: 'Staff', value: 'staff' },
        { label: 'Admin', value: 'admin' },
      ],
      admin: {
        description: 'Default is student. Staff/admin can be used for special access.',
      },
    },
    {
      name: 'fullName',
      label: 'Full name',
      type: 'text',
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
