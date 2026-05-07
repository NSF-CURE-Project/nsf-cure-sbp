import type { CollectionConfig, PayloadRequest } from 'payload'
import { validateProblemTemplate } from '../lib/problemSet/problemTemplate'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

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
      async ({ data }) => {
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

        const templateValidation = validateProblemTemplate({
          enabled: Boolean(
            (data as { parameterizationEnabled?: boolean } | undefined)?.parameterizationEnabled,
          ),
          parameterDefinitions: (data as { parameterDefinitions?: unknown } | undefined)
            ?.parameterDefinitions,
          derivedValues: (data as { derivedValues?: unknown } | undefined)?.derivedValues,
        })

        if (templateValidation.errors.length) {
          throw new Error(templateValidation.errors.join(' '))
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
                  ],
                },
                {
                  name: 'correctAnswer',
                  type: 'number',
                  required: true,
                  admin: {
                    condition: (_, siblingData) =>
                      (siblingData?.partType ?? 'numeric') === 'numeric',
                  },
                },
                {
                  name: 'correctAnswerExpression',
                  type: 'text',
                  admin: {
                    condition: (_, siblingData) =>
                      (siblingData?.partType ?? 'numeric') === 'numeric',
                    description:
                      'Optional formula for template-enabled problems. Example: "w * L / 2". If present, this overrides the static numeric answer during grading.',
                  },
                },
                {
                  name: 'tolerance',
                  type: 'number',
                  required: true,
                  defaultValue: 0.05,
                  admin: {
                    condition: (_, siblingData) =>
                      (siblingData?.partType ?? 'numeric') === 'numeric',
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
                    condition: (_, siblingData) =>
                      (siblingData?.partType ?? 'numeric') === 'numeric',
                  },
                },
                {
                  name: 'significantFigures',
                  type: 'number',
                  admin: {
                    condition: (_, siblingData) =>
                      (siblingData?.partType ?? 'numeric') === 'numeric',
                  },
                },
                {
                  name: 'toleranceExplainer',
                  type: 'ui',
                  admin: {
                    condition: (_, siblingData) =>
                      (siblingData?.partType ?? 'numeric') === 'numeric',
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
                    condition: (_, siblingData) =>
                      (siblingData?.partType ?? 'numeric') === 'numeric',
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
                  name: 'explanation',
                  type: 'richText',
                },
              ],
            },
          ],
        },
        {
          label: 'Templates',
          fields: [
            {
              name: 'parameterizationEnabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Enable deterministic template variables so one authored problem can be previewed across many generated variants.',
              },
            },
            {
              name: 'parameterSeed',
              type: 'text',
              defaultValue: 'template-default',
              admin: {
                condition: (data) => Boolean(data?.parameterizationEnabled),
                description:
                  'Default seed used by the admin preview to reproduce the same generated variant.',
              },
            },
            {
              name: 'parameterDefinitions',
              type: 'array',
              admin: {
                condition: (data) => Boolean(data?.parameterizationEnabled),
                description:
                  'Author independent variables here. The preview will sample values from each defined range using the chosen seed.',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                },
                {
                  name: 'unit',
                  type: 'text',
                },
                {
                  name: 'defaultValue',
                  type: 'number',
                },
                {
                  name: 'min',
                  type: 'number',
                },
                {
                  name: 'max',
                  type: 'number',
                },
                {
                  name: 'step',
                  type: 'number',
                },
                {
                  name: 'precision',
                  type: 'number',
                },
              ],
            },
            {
              name: 'derivedValues',
              type: 'array',
              admin: {
                condition: (data) => Boolean(data?.parameterizationEnabled),
                description:
                  'Derived values are evaluated in order and may reference previously defined parameters and derived values.',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                },
                {
                  name: 'expression',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'unit',
                  type: 'text',
                },
              ],
            },
            {
              name: 'templatePreview',
              type: 'ui',
              admin: {
                condition: (data) => Boolean(data?.parameterizationEnabled),
                components: {
                  Field: '@/views/ProblemTemplatePreviewField#default',
                },
              },
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
