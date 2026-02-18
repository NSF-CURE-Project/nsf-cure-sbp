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
  return process.env.PAYLOAD_ADMIN_COOKIE_DOMAIN || undefined
})()

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    cookies: {
      secure: cookieSecure,
      sameSite: cookieSameSite,
      domain: cookieDomain,
    },
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { id: { equals: req.user.id } }
    },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { id: { equals: req.user.id } }
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'firstName',
      label: 'First name',
      type: 'text',
      admin: {
        placeholder: 'First name',
      },
    },
    {
      name: 'lastName',
      label: 'Last name',
      type: 'text',
      admin: {
        placeholder: 'Last name',
      },
    },
    {
      name: 'adminTheme',
      label: 'Admin theme',
      type: 'select',
      defaultValue: 'light',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Syncs with the theme toggle in the admin UI.',
        hidden: true,
      },
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Professor', value: 'professor' },
        { label: 'Staff', value: 'staff' },
      ],
      admin: {
        description:
          'Admins can manage users, settings, and the entire CMS. Staff can edit content only.',
      },
    },
    // Add additional user fields as needed (e.g. name, department)
  ],
}
