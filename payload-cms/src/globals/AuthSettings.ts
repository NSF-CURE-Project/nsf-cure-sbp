import type { GlobalConfig } from 'payload'

const canManageAuthSettings = ({
  req,
}: {
  req: { user?: { collection?: string | null; role?: string | null } | null }
}) => req?.user?.collection === 'users' && req.user?.role === 'admin'

export const AuthSettings: GlobalConfig = {
  slug: 'auth-settings',
  label: 'Auth Settings',
  access: {
    read: () => true,
    update: canManageAuthSettings,
  },
  admin: {
    group: 'Settings',
    description: 'Controls student-facing sign-in and account access.',
  },
  fields: [
    {
      name: 'studentLoginEnabled',
      label: 'Student Login Enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'When off, students cannot sign in, create accounts, or reset passwords. Admin login remains available.',
      },
    },
    {
      name: 'studentLoginDisabledMessage',
      label: 'Disabled Message',
      type: 'textarea',
      defaultValue:
        'Student account access is temporarily unavailable. Please check back later.',
      admin: {
        condition: (_, siblingData) => siblingData?.studentLoginEnabled === false,
        description: 'Shown on student login, registration, and password reset pages.',
      },
    },
  ],
}
