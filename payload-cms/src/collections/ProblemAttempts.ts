import type { CollectionConfig, PayloadRequest } from 'payload'
import { gradeProblemAttemptAnswers } from '../utils/problemGrading'
import {
  getAttemptLimitContext,
  isProblemAttemptRateLimited,
} from '@/lib/problemSet/submissionGuards'
import {
  evaluateTemplateExpression,
  resolveProblemTemplateScope,
} from '@/lib/problemSet/problemTemplate'
import {
  signProblemTemplateVariant,
  verifyProblemTemplateVariantSignature,
} from '@/lib/problemSet/problemTemplateSignature'

const isStaff = (req?: PayloadRequest | null) =>
  req?.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req?.user?.role ?? '')

const getId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id != null ? String(id) : null
  }
  return null
}

const getVariantSeed = (value: unknown): string => {
  if (!value || typeof value !== 'object') return ''
  const raw = (value as { variantSeed?: unknown }).variantSeed
  return typeof raw === 'string' ? raw.trim() : ''
}

const getVariantSignature = (value: unknown): string => {
  if (!value || typeof value !== 'object') return ''
  const raw = (value as { variantSignature?: unknown }).variantSignature
  return typeof raw === 'string' ? raw.trim() : ''
}

export const ProblemAttempts: CollectionConfig = {
  slug: 'problem-attempts',
  admin: {
    useAsTitle: 'problemSet',
    group: 'Student Support',
    defaultColumns: ['problemSet', 'user', 'score', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (isStaff(req)) return true
      if (req.user?.collection === 'accounts') {
        return { user: { equals: req.user.id } }
      }
      return false
    },
    create: ({ req }) => req.user?.collection === 'accounts' || isStaff(req),
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isStaff(req),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (!data || !req?.payload) return data

        if (!data.user && req.user?.collection === 'accounts' && req.user?.id) {
          data.user = req.user.id
        }

        if (operation === 'create' && req.user?.collection === 'accounts') {
          const rateLimit = isProblemAttemptRateLimited(req)
          if (rateLimit.blocked) {
            req.payload.logger.warn({
              msg: 'Problem attempt create rate-limited',
              user: String(req.user.id ?? ''),
              retryAfterSec: rateLimit.retryAfterSec,
            })
            throw new Error(
              `Too many submissions. Please wait ${rateLimit.retryAfterSec} seconds and try again.`,
            )
          }

          const { maxAttempts, attemptCount } = await getAttemptLimitContext(
            req,
            data as Record<string, unknown>,
          )
          if (maxAttempts != null && attemptCount >= maxAttempts) {
            req.payload.logger.warn({
              msg: 'Problem attempt blocked by maxAttempts guard',
              user: String(req.user.id ?? ''),
              maxAttempts,
            })
            throw new Error(
              'Attempt limit reached for this problem set. You cannot submit additional attempts.',
            )
          }
        }

        const answerRows = Array.isArray(data.answers) ? data.answers : []
        const problemIds = answerRows
          .map((item) => getId((item as { problem?: unknown }).problem))
          .filter((id): id is string => Boolean(id))

        const problems = await Promise.all(
          problemIds.map((id) =>
            req.payload.findByID({
              collection: 'problems',
              id,
              depth: 0,
            }),
          ),
        )

        const problemTemplateScopeById = new Map<
          string,
          {
            seed: string
            scope: Record<string, number>
            parameters: unknown
            derived: unknown
          }
        >()

        const graded = await gradeProblemAttemptAnswers(
          answerRows.map((item) => ({
            problem: getId((item as { problem?: unknown }).problem) ?? '',
            variantSeed: getVariantSeed(item),
            variantSignature: getVariantSignature(item),
            parts: Array.isArray((item as { parts?: unknown[] }).parts)
              ? ((item as { parts?: unknown[] }).parts ?? []).map((part) => ({
                  partIndex:
                    typeof (part as { partIndex?: unknown }).partIndex === 'number'
                      ? ((part as { partIndex?: number }).partIndex ?? 0)
                      : 0,
                  studentAnswer:
                    typeof (part as { studentAnswer?: unknown }).studentAnswer === 'number' &&
                    Number.isFinite((part as { studentAnswer?: number }).studentAnswer)
                      ? ((part as { studentAnswer?: number }).studentAnswer ?? null)
                      : null,
                  studentExpression:
                    typeof (part as { studentExpression?: unknown }).studentExpression === 'string'
                      ? ((part as { studentExpression?: string }).studentExpression ?? '')
                      : null,
                  placedForces:
                    typeof (part as { placedForces?: unknown }).placedForces === 'object' &&
                    (part as { placedForces?: unknown }).placedForces !== null
                      ? ((part as { placedForces?: Record<string, unknown> }).placedForces ?? null)
                      : null,
                }))
              : [],
          })),
          problems.map((problem) => ({
            id: String((problem as { id?: string | number }).id ?? ''),
            templateScope: (() => {
              const problemId = String((problem as { id?: string | number }).id ?? '')
              const answerRow = answerRows.find(
                (item) => getId((item as { problem?: unknown }).problem) === problemId,
              )
              const requestedSeed = getVariantSeed(answerRow)
              const requestedSignature = getVariantSignature(answerRow)
              const verifiedSeed = verifyProblemTemplateVariantSignature({
                problemId,
                seed: requestedSeed,
                signature: requestedSignature,
              })
                ? requestedSeed
                : ''
              const resolved = resolveProblemTemplateScope({
                enabled: Boolean(
                  (problem as { parameterizationEnabled?: boolean }).parameterizationEnabled,
                ),
                parameterDefinitions: (problem as { parameterDefinitions?: unknown })
                  .parameterDefinitions,
                derivedValues: (problem as { derivedValues?: unknown }).derivedValues,
                seed: verifiedSeed,
              })

              if (!resolved.errors.length) {
                problemTemplateScopeById.set(problemId, {
                  seed: verifiedSeed,
                  scope: resolved.scope,
                  parameters: resolved.parameters,
                  derived: resolved.derived,
                })
              }

              return resolved.scope
            })(),
            parts: Array.isArray((problem as { parts?: unknown[] }).parts)
              ? ((problem as { parts?: unknown[] }).parts ?? []).map((part) => ({
                  partType: ((part as { partType?: string }).partType ?? 'numeric') as
                    | 'numeric'
                    | 'symbolic'
                    | 'fbd-draw',
                  correctAnswer: (() => {
                    const staticCorrectAnswer = Number(
                      (part as { correctAnswer?: number }).correctAnswer ?? 0,
                    )
                    const expression = (part as { correctAnswerExpression?: string | null })
                      .correctAnswerExpression
                    const scope = (
                      problem as { templateScope?: Record<string, number> | undefined }
                    ).templateScope
                    if (!expression || !scope) return staticCorrectAnswer
                    return evaluateTemplateExpression(expression, scope) ?? staticCorrectAnswer
                  })(),
                  tolerance: Number((part as { tolerance?: number }).tolerance ?? 0.05),
                  toleranceType: ((part as { toleranceType?: 'absolute' | 'relative' })
                    .toleranceType ?? 'absolute') as 'absolute' | 'relative',
                  significantFigures: (part as { significantFigures?: number | null })
                    .significantFigures,
                  scoringMode: (part as { scoringMode?: 'threshold' | 'linear-decay' | 'stepped' })
                    .scoringMode,
                  scoringSteps: Array.isArray((part as { scoringSteps?: unknown[] }).scoringSteps)
                    ? ((part as { scoringSteps?: unknown[] }).scoringSteps ?? [])
                        .map((step) => ({
                          errorBound: Number((step as { errorBound?: number }).errorBound),
                          score: Number((step as { score?: number }).score),
                        }))
                        .filter(
                          (step) => Number.isFinite(step.errorBound) && Number.isFinite(step.score),
                        )
                    : [],
                  symbolicAnswer: (part as { symbolicAnswer?: string | null }).symbolicAnswer,
                  symbolicVariables: Array.isArray(
                    (part as { symbolicVariables?: unknown[] }).symbolicVariables,
                  )
                    ? ((part as { symbolicVariables?: unknown[] }).symbolicVariables ?? [])
                        .map((variable) => {
                          const variableName = String(
                            (variable as { variable?: string }).variable ?? '',
                          )
                          const scope = (
                            problem as { templateScope?: Record<string, number> | undefined }
                          ).templateScope
                          const scopedValue =
                            scope && variableName in scope ? Number(scope[variableName]) : null
                          if (scopedValue != null && Number.isFinite(scopedValue)) {
                            return {
                              variable: variableName,
                              testMin: scopedValue,
                              testMax: scopedValue,
                            }
                          }
                          return {
                            variable: variableName,
                            testMin: Number((variable as { testMin?: number }).testMin ?? 1),
                            testMax: Number((variable as { testMax?: number }).testMax ?? 10),
                          }
                        })
                        .filter((variable) => Boolean(variable.variable))
                    : [],
                  symbolicTolerance: Number(
                    (part as { symbolicTolerance?: number }).symbolicTolerance ?? 0.000001,
                  ),
                  fbdRubric:
                    (part as { fbdRubric?: Record<string, unknown> | null }).fbdRubric ?? null,
                  unit: (part as { unit?: string | null }).unit,
                }))
              : [],
          })),
        )

        data.answers = graded.answers
        data.answers = (Array.isArray(data.answers) ? data.answers : []).map((answer) => {
          if (!answer || typeof answer !== 'object') return answer
          const answerProblemId = getId((answer as { problem?: unknown }).problem)
          if (!answerProblemId) return answer
          const template = problemTemplateScopeById.get(answerProblemId)
          if (!template) return answer
          return {
            ...(answer as Record<string, unknown>),
            variantSeed: template.seed,
            variantSignature: signProblemTemplateVariant(answerProblemId, template.seed),
            variantScope: template.scope,
            generatedVariant: {
              parameters: template.parameters,
              derived: template.derived,
            },
          }
        })
        data.score = graded.score
        data.maxScore = graded.maxScore
        data.correctCount = graded.correctCount

        if (operation === 'create') {
          if (!data.completedAt) data.completedAt = new Date().toISOString()
          if (!data.startedAt) data.startedAt = data.completedAt
        }

        if (data.startedAt && data.completedAt) {
          const started = new Date(data.startedAt).getTime()
          const completed = new Date(data.completedAt).getTime()
          if (Number.isFinite(started) && Number.isFinite(completed)) {
            data.durationSec = Math.max(0, Math.round((completed - started) / 1000))
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'problemSet',
      type: 'relationship',
      relationTo: 'problem-sets',
      required: true,
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'accounts',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    { name: 'startedAt', type: 'date' },
    { name: 'completedAt', type: 'date' },
    {
      name: 'durationSec',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'answers',
      type: 'array',
      fields: [
        {
          name: 'problem',
          type: 'relationship',
          relationTo: 'problems',
          required: true,
        },
        {
          name: 'variantSeed',
          type: 'text',
        },
        {
          name: 'variantSignature',
          type: 'text',
        },
        {
          name: 'variantScope',
          type: 'json',
          admin: { readOnly: true },
        },
        {
          name: 'generatedVariant',
          type: 'json',
          admin: { readOnly: true },
        },
        {
          name: 'parts',
          type: 'array',
          fields: [
            {
              name: 'partIndex',
              type: 'number',
              required: true,
            },
            {
              name: 'studentAnswer',
              type: 'number',
            },
            {
              name: 'studentExpression',
              type: 'text',
            },
            {
              name: 'placedForces',
              type: 'json',
            },
            {
              name: 'isCorrect',
              type: 'checkbox',
              admin: { readOnly: true },
            },
            {
              name: 'score',
              type: 'number',
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
    {
      name: 'score',
      type: 'number',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'maxScore',
      type: 'number',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'correctCount',
      type: 'number',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
