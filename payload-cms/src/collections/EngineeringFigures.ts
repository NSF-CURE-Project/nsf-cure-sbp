import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')
const isAdmin = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && req?.user?.role === 'admin'

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isPoint = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === 'number' &&
  Number.isFinite(value[0]) &&
  typeof value[1] === 'number' &&
  Number.isFinite(value[1])

const validateFigureDataShape = (type: string, value: unknown): true | string => {
  if (!isObject(value)) return 'figureData must be a JSON object.'
  const payloadType = value.type
  if (payloadType !== type) return `figureData.type must be "${type}".`

  if (type === 'fbd') {
    if (!isObject(value.body)) return 'FBD figureData.body is required.'
    if (!Array.isArray(value.forces)) return 'FBD figureData.forces must be an array.'
    for (const force of value.forces) {
      if (!isObject(force) || !isPoint(force.origin)) return 'Each FBD force requires origin: [x, y].'
      if (typeof force.angle !== 'number' || typeof force.magnitude !== 'number') {
        return 'Each FBD force requires numeric angle and magnitude.'
      }
    }
    return true
  }

  if (type === 'truss') {
    if (!Array.isArray(value.nodes) || !value.nodes.length) return 'Truss figureData.nodes is required.'
    if (!Array.isArray(value.members) || !value.members.length) return 'Truss figureData.members is required.'
    return true
  }

  if (type === 'beam') {
    if (typeof value.length !== 'number' || typeof value.scale !== 'number') {
      return 'Beam figureData.length and figureData.scale are required numbers.'
    }
    if (!Array.isArray(value.supports) || !value.supports.length) {
      return 'Beam figureData.supports is required.'
    }
    return true
  }

  if (type === 'moment-diagram') {
    if (
      typeof value.length !== 'number' ||
      typeof value.scale !== 'number' ||
      typeof value.yScale !== 'number'
    ) {
      return 'Moment diagram requires length, scale, and yScale numbers.'
    }
    if (!Array.isArray(value.points) || !value.points.length) {
      return 'Moment diagram figureData.points is required.'
    }
    return true
  }

  return 'Unsupported figure type.'
}

export const EngineeringFigures: CollectionConfig = {
  slug: 'engineering-figures',
  admin: {
    useAsTitle: 'title',
    group: 'Assessments',
    defaultColumns: ['title', 'type', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => isStaff(req),
    update: ({ req, doc }) => {
      if (isAdmin(req)) return true
      if (!isStaff(req)) return false
      if ((doc as { isTemplate?: boolean } | undefined)?.isTemplate) return false
      return true
    },
    delete: ({ req, doc }) => {
      if (isAdmin(req)) return true
      if (!isStaff(req)) return false
      if ((doc as { isTemplate?: boolean } | undefined)?.isTemplate) return false
      return true
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Free Body Diagram', value: 'fbd' },
        { label: 'Truss', value: 'truss' },
        { label: 'Beam', value: 'beam' },
        { label: 'Moment Diagram', value: 'moment-diagram' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'figureData',
      type: 'json',
      required: true,
      admin: {
        components: {
          Field: '@/views/FigureBuilderField#default',
        },
      },
      validate: (value, { data }) => {
        const figureType = (data as { type?: string | null })?.type
        if (!figureType) return 'Select a figure type before entering figureData.'
        return validateFigureDataShape(figureType, value)
      },
    },
    {
      name: 'width',
      type: 'number',
      defaultValue: 600,
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 400,
    },
    {
      name: 'isTemplate',
      type: 'checkbox',
      defaultValue: false,
      access: {
        create: ({ req }) => isAdmin(req),
        update: ({ req }) => isAdmin(req),
      },
      admin: {
        description: 'Mark as a reusable template. Templates appear in the template picker.',
      },
    },
  ],
}
