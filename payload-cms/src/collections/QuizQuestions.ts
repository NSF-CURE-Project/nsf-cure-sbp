import type { CollectionConfig, PayloadRequest } from 'payload'
import { QUIZ_QUESTION_TYPES, getQuestionIssues, parseStringArray } from '../lib/quiz'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

const validateQuestionType = (value: unknown) =>
  typeof value === 'string' && QUIZ_QUESTION_TYPES.includes(value as (typeof QUIZ_QUESTION_TYPES)[number])
    ? true
    : 'Choose a supported question format.'

export const QuizQuestions: CollectionConfig = {
  slug: 'quiz-questions',
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
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'questionType',
      type: 'text',
      required: true,
      defaultValue: 'single-select',
      validate: validateQuestionType,
      admin: {
        description: 'Supported values: single-select, multi-select, true-false, short-text, numeric.',
      },
    },
    {
      name: 'prompt',
      type: 'richText',
      required: true,
    },
    {
      name: 'options',
      type: 'array',
      validate: (value, { data }) => {
        const issues = getQuestionIssues({
          ...(typeof data === 'object' && data ? data : {}),
          options: value as unknown[] | null,
        })
        return issues.length > 0 ? `Fix question format: ${issues.join(', ')}` : true
      },
      admin: {
        condition: (_, siblingData) =>
          (typeof siblingData?.questionType === 'string' ? siblingData.questionType : 'single-select') ===
            'single-select' ||
          siblingData?.questionType === 'multi-select',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'isCorrect',
          label: 'Correct answer',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'trueFalseAnswer',
      label: 'Correct answer is True',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.questionType === 'true-false',
      },
    },
    {
      name: 'acceptedAnswers',
      type: 'json',
      validate: (value, { data }) => {
        const questionType =
          typeof (data as { questionType?: unknown })?.questionType === 'string'
            ? (data as { questionType?: string }).questionType
            : 'single-select'
        if (questionType !== 'short-text') return true
        return parseStringArray(value).length > 0 ? true : 'Add at least 1 accepted answer.'
      },
      admin: {
        condition: (_, siblingData) => siblingData?.questionType === 'short-text',
        description: 'Provide a JSON array or newline/comma-separated answers, e.g. ["stress","normal stress"].',
      },
    },
    {
      name: 'textMatchMode',
      type: 'text',
      defaultValue: 'normalized',
      validate: (value: unknown, { data }: { data?: unknown }) => {
        const questionType =
          typeof (data as { questionType?: unknown })?.questionType === 'string'
            ? (data as { questionType?: string }).questionType
            : 'single-select'
        if (questionType !== 'short-text') return true
        return value === 'exact' || value === 'normalized'
          ? true
          : 'Use "exact" or "normalized" for short-text questions.'
      },
      admin: {
        condition: (_, siblingData) => siblingData?.questionType === 'short-text',
        description: 'Use "normalized" to ignore case and extra spacing, or "exact" for strict matching.',
      },
    },
    {
      name: 'numericCorrectValue',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData?.questionType === 'numeric',
      },
    },
    {
      name: 'numericTolerance',
      type: 'number',
      min: 0,
      admin: {
        condition: (_, siblingData) => siblingData?.questionType === 'numeric',
      },
    },
    {
      name: 'numericUnit',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.questionType === 'numeric',
      },
    },
    {
      name: 'explanation',
      type: 'richText',
    },
    {
      name: 'attachments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
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
      name: 'concepts',
      type: 'relationship',
      relationTo: 'concepts',
      hasMany: true,
      admin: {
        description: 'Concepts this question primarily assesses. Drives mastery, remediation, and concept-level analytics.',
      },
    },
    {
      name: 'bloomLevel',
      type: 'select',
      admin: {
        description: 'Cognitive level the question targets (Bloom’s taxonomy).',
      },
      options: [
        { label: 'Remember', value: 'remember' },
        { label: 'Understand', value: 'understand' },
        { label: 'Apply', value: 'apply' },
        { label: 'Analyze', value: 'analyze' },
        { label: 'Evaluate', value: 'evaluate' },
        { label: 'Create', value: 'create' },
      ],
    },
  ],
}
