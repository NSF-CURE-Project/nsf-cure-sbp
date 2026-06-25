import type { GlobalConfig } from 'payload'

const canManageSiteBranding = ({
  req,
}: {
  req: { user?: { collection?: string | null; role?: string | null } | null }
}) => {
  if (req?.user?.collection !== 'users') return false
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
    {
      name: 'announcement',
      label: 'Announcement Banner',
      type: 'group',
      admin: {
        description:
          'Shows a thin announcement banner above the student-facing navigation bar.',
      },
      fields: [
        {
          name: 'enabled',
          label: 'Show Announcement Banner',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'message',
          label: 'Message',
          type: 'text',
          maxLength: 160,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
            description: 'Keep this short so it fits in the thin header banner.',
          },
        },
        {
          name: 'href',
          label: 'Optional Link URL',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
            description: 'Use a relative path like /resources or a full URL.',
          },
        },
        {
          name: 'linkLabel',
          label: 'Optional Link Label',
          type: 'text',
          defaultValue: 'Learn more',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
        },
      ],
    },
  ],
}
