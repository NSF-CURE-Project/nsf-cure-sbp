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

const buildResetPasswordUrl = (token: string) => {
  const base =
    process.env.WEB_PUBLIC_URL ??
    process.env.FRONTEND_URL ??
    process.env.WEB_PREVIEW_URL ??
    'http://localhost:3001'
  const url = new URL('/reset-password', base)
  if (token) {
    url.searchParams.set('token', token)
  }
  return url.toString()
}

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
        return `
          <p>A password reset was requested for your account.</p>
          <p><a href="${resetUrl}">Reset password</a></p>
          <p>If you did not request a password reset, you can ignore this email.</p>
        `
      },
      generateEmailText: (args) => {
        const resetUrl = buildResetPasswordUrl(args?.token ?? '')
        return `A password reset was requested for your account. Reset password: ${resetUrl}. If you did not request a password reset, you can ignore this email.`
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

        await req.payload.sendEmail({
          to: doc.email,
          subject: 'Confirm your NSF CURE account email',
          text: `Confirm your email address by visiting ${confirmUrl}. This link expires in 24 hours.`,
          html: `
            <p>Confirm your email address by clicking the link below:</p>
            <p><a href="${confirmUrl}">Confirm email address</a></p>
            <p>This link expires in 24 hours.</p>
          `,
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
