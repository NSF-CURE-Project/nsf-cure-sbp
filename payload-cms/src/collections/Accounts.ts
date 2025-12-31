import type { CollectionConfig } from 'payload'

export const Accounts: CollectionConfig = {
  slug: 'accounts',
  auth: true,
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
