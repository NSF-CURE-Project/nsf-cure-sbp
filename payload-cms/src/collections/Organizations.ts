import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaffUser = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'organizationName',
    group: 'Reporting',
    defaultColumns: ['organizationName', 'organizationType', 'partnerRole', 'updatedAt'],
  },
  access: {
    read: ({ req }) => isStaffUser(req),
    create: ({ req }) => isStaffUser(req),
    update: ({ req }) => isStaffUser(req),
    delete: ({ req }) => req.user?.collection === 'users' && req.user.role === 'admin',
  },
  fields: [
    {
      name: 'organizationName',
      type: 'text',
      required: true,
    },
    {
      name: 'organizationType',
      type: 'select',
      options: [
        { label: 'Academic Institution', value: 'academic' },
        { label: 'Industry', value: 'industry' },
        { label: 'Non-profit', value: 'nonprofit' },
        { label: 'Government', value: 'government' },
        { label: 'School District', value: 'school_district' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'partnerRole',
      type: 'text',
      admin: {
        description: 'Role this organization plays in the project (e.g., curriculum partner).',
      },
    },
    {
      name: 'contributionSummary',
      type: 'textarea',
    },
    {
      name: 'contactName',
      type: 'text',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'website',
      type: 'text',
    },
  ],
}
