import type { CollectionConfig, PayloadRequest } from 'payload'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' && ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

export const Problems: CollectionConfig = {
  slug: 'problems',
  admin: {
    useAsTitle: 'title',
    group: 'Assessments',
    defaultColumns: ['title', 'difficulty', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: ({ req }) => isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isStaff(req),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        const parts = Array.isArray((data as { parts?: unknown[] } | undefined)?.parts)
          ? (((data as { parts?: unknown[] }).parts ?? []) as Array<Record<string, unknown>>)
          : []

        for (const part of parts) {
          const scoringSteps = Array.isArray(part.scoringSteps) ? part.scoringSteps : []
          if (!scoringSteps.length) continue
          part.scoringSteps = [...scoringSteps]
            .filter(
              (step) =>
                typeof (step as { errorBound?: unknown }).errorBound === 'number' &&
                Number.isFinite((step as { errorBound?: number }).errorBound) &&
                typeof (step as { score?: unknown }).score === 'number' &&
                Number.isFinite((step as { score?: number }).score),
            )
            .sort(
              (a, b) =>
                ((a as { errorBound: number }).errorBound ?? 0) -
                ((b as { errorBound: number }).errorBound ?? 0),
            )
        }

        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Problem',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'prompt',
              type: 'richText',
              required: true,
            },
            {
              name: 'figure',
              type: 'relationship',
              relationTo: 'engineering-figures',
            },
            {
              name: 'difficulty',
              type: 'select',
              options: [
                { label: 'Intro', value: 'intro' },
                { label: 'Easy', value: 'easy' },
                { label: 'Medium', value: 'medium' },
                { label: 'Hard', value: 'hard' },
              ],
            },
            {
              name: 'topic',
              type: 'text',
            },
            {
              name: 'tags',
              type: 'text',
              hasMany: true,
            },
            {
              name: 'parts',
              type: 'array',
              required: true,
              minRows: 1,
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'prompt',
                  type: 'richText',
                },
                {
                  name: 'unit',
                  type: 'text',
                },
                {
                  name: 'partType',
                  type: 'select',
                  defaultValue: 'numeric',
                  options: [
                    { label: 'Numeric', value: 'numeric' },
                    { label: 'Symbolic', value: 'symbolic' },
                    { label: 'Free-Body Diagram (Draw)', value: 'fbd-draw' },
                  ],
                },
                {
                  name: 'correctAnswer',
                  type: 'number',
                  required: true,
                  admin: {
                    condition: (_, siblingData) => (siblingData?.partType ?? 'numeric') === 'numeric',
                  },
                },
                {
                  name: 'tolerance',
                  type: 'number',
                  required: true,
                  defaultValue: 0.05,
                  admin: {
                    condition: (_, siblingData) => (siblingData?.partType ?? 'numeric') === 'numeric',
                  },
                },
                {
                  name: 'toleranceType',
                  type: 'select',
                  required: true,
                  defaultValue: 'absolute',
                  options: [
                    { label: 'Absolute', value: 'absolute' },
                    { label: 'Relative', value: 'relative' },
                  ],
                  admin: {
                    condition: (_, siblingData) => (siblingData?.partType ?? 'numeric') === 'numeric',
                  },
                },
                {
                  name: 'significantFigures',
                  type: 'number',
                  admin: {
                    condition: (_, siblingData) => (siblingData?.partType ?? 'numeric') === 'numeric',
                  },
                },
                {
                  name: 'toleranceExplainer',
                  type: 'ui',
                  admin: {
                    condition: (_, siblingData) => (siblingData?.partType ?? 'numeric') === 'numeric',
                    components: {
                      Field: '@/views/ToleranceExplainerField#default',
                    },
                  },
                },
                {
                  name: 'scoringMode',
                  type: 'select',
                  defaultValue: 'threshold',
                  admin: {
                    condition: (_, siblingData) => (siblingData?.partType ?? 'numeric') === 'numeric',
                  },
                  options: [
                    { label: 'Threshold', value: 'threshold' },
                    { label: 'Linear Decay', value: 'linear-decay' },
                    { label: 'Stepped', value: 'stepped' },
                  ],
                },
                {
                  name: 'scoringSteps',
                  type: 'array',
                  admin: {
                    condition: (_, siblingData) =>
                      (siblingData?.partType ?? 'numeric') === 'numeric' &&
                      siblingData?.scoringMode === 'stepped',
                  },
                  fields: [
                    {
                      name: 'errorBound',
                      type: 'number',
                      required: true,
                    },
                    {
                      name: 'score',
                      type: 'number',
                      required: true,
                    },
                  ],
                },
                {
                  name: 'symbolicAnswer',
                  type: 'text',
                  admin: {
                    condition: (_, siblingData) => siblingData?.partType === 'symbolic',
                    components: {
                      Field: '@/views/FormulaHelperField#default',
                    },
                  },
                },
                {
                  name: 'symbolicVariables',
                  type: 'array',
                  admin: {
                    condition: (_, siblingData) => siblingData?.partType === 'symbolic',
                    description:
                      'Auto-populated by Formula Helper. Keep variable names aligned with the symbolic expression.',
                  },
                  fields: [
                    {
                      name: 'variable',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'testMin',
                      type: 'number',
                      defaultValue: 1,
                    },
                    {
                      name: 'testMax',
                      type: 'number',
                      defaultValue: 10,
                    },
                  ],
                },
                {
                  name: 'symbolicTolerance',
                  type: 'number',
                  defaultValue: 0.000001,
                  admin: {
                    condition: (_, siblingData) => siblingData?.partType === 'symbolic',
                  },
                },
                {
                  name: 'fbdRubric',
                  type: 'group',
                  admin: {
                    condition: (_, siblingData) => siblingData?.partType === 'fbd-draw',
                    components: {
                      Field: '@/views/FbdRubricBuilderField#FbdRubricBuilderField',
                    },
                  },
                  fields: [
                    {
                      name: 'requiredForces',
                      dbName: 'req_f',
                      type: 'array',
                      fields: [
                        {
                          name: 'id',
                          type: 'text',
                          required: true,
                        },
                        {
                          name: 'label',
                          type: 'text',
                        },
                        {
                          name: 'correctAngle',
                          type: 'number',
                          required: true,
                          defaultValue: 0,
                        },
                        {
                          name: 'angleTolerance',
                          type: 'number',
                          defaultValue: 5,
                        },
                        {
                          name: 'magnitudeRequired',
                          type: 'checkbox',
                          defaultValue: false,
                        },
                        {
                          name: 'correctMagnitude',
                          type: 'number',
                        },
                        {
                          name: 'magnitudeTolerance',
                          type: 'number',
                          defaultValue: 0.05,
                        },
                      ],
                    },
                    {
                      name: 'requiredMoments',
                      dbName: 'req_m',
                      type: 'array',
                      label: 'Required Moment Arrows',
                      fields: [
                        {
                          name: 'id',
                          type: 'text',
                          required: true,
                        },
                        {
                          name: 'label',
                          type: 'text',
                        },
                        {
                          name: 'direction',
                          dbName: 'dir',
                          type: 'select',
                          required: true,
                          options: [
                            { label: 'Clockwise', value: 'cw' },
                            { label: 'Counter-clockwise', value: 'ccw' },
                          ],
                        },
                        {
                          name: 'magnitudeRequired',
                          type: 'checkbox',
                          defaultValue: false,
                        },
                        {
                          name: 'correctMagnitude',
                          type: 'number',
                          admin: {
                            condition: (_, siblingData) => Boolean(siblingData?.magnitudeRequired),
                          },
                        },
                        {
                          name: 'magnitudeTolerance',
                          type: 'number',
                          admin: {
                            condition: (_, siblingData) => Boolean(siblingData?.magnitudeRequired),
                          },
                        },
                      ],
                    },
                    {
                      name: 'forbiddenForces',
                      type: 'number',
                      defaultValue: 0,
                    },
                  ],
                },
                {
                  name: 'fbdSyncValidator',
                  type: 'ui',
                  admin: {
                    condition: (_, siblingData) => siblingData?.partType === 'fbd-draw',
                    components: {
                      Field: '@/views/FbdSyncValidatorField#FbdSyncValidatorField',
                    },
                  },
                },
                {
                  name: 'explanation',
                  type: 'richText',
                },
              ],
            },
            {
              name: 'resultPlots',
              type: 'array',
              fields: [
                {
                  name: 'plotType',
                  type: 'select',
                  required: true,
                  defaultValue: 'shear',
                  options: [
                    { label: 'Shear', value: 'shear' },
                    { label: 'Moment', value: 'moment' },
                    { label: 'Deflection', value: 'deflection' },
                    { label: 'Custom', value: 'custom' },
                  ],
                },
                {
                  name: 'title',
                  type: 'text',
                },
                {
                  name: 'xLabel',
                  type: 'text',
                  defaultValue: 'x (m)',
                },
                {
                  name: 'yLabel',
                  type: 'text',
                },
                {
                  name: 'xMin',
                  type: 'number',
                  defaultValue: 0,
                },
                {
                  name: 'xMax',
                  type: 'text',
                },
                {
                  name: 'plotWizard',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '@/views/PlotWizardField#default',
                    },
                  },
                },
                {
                  name: 'segments',
                  type: 'array',
                  fields: [
                    {
                      name: 'xStart',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'xEnd',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'formula',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
                {
                  name: 'criticalPoints',
                  type: 'array',
                  fields: [
                    {
                      name: 'x',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'label',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Preview',
          fields: [
            {
              name: 'problemPreview',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/views/ProblemPreviewTab#default',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
