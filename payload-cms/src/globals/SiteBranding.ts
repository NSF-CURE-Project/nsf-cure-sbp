import type { GlobalConfig } from 'payload'

const canManageSiteBranding = ({ req }: { req: { user?: { role?: string } | null } }) => {
  const role = String(req?.user?.role ?? '').toLowerCase()
  return role === 'admin' || role === 'staff'
}

export const SiteBranding: GlobalConfig = {
  slug: 'site-branding',
  label: 'Site Branding',
  access: {
    read: () => true,
    update: canManageSiteBranding,
  },
  versions: {
    drafts: true,
  },
  admin: {
    group: 'Settings',
    description: 'Controls branding assets used on the student-facing site.',
  },
  fields: [
    {
      name: 'programLogo',
      label: 'Program Logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Shown on the student home page and used as the browser tab icon (favicon).',
      },
    },
    {
      name: 'programLogoAlt',
      label: 'Program Logo Alt Text',
      type: 'text',
      defaultValue: 'NSF CURE Summer Bridge Program logo',
      admin: {
        description: 'Accessible description for the uploaded program logo.',
      },
    },
  ],
}
