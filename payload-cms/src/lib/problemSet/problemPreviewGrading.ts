import { evaluateTemplateExpression } from '@/lib/problemSet/problemTemplate'
import type { ProblemPartForGrading, SubmittedPartAnswer } from '@/utils/problemGrading'

export type PreviewPartType = 'numeric' | 'symbolic'

export type PreviewScoringStep = {
  errorBound?: number
  score?: number
}

export type PreviewSymbolicVariable = {
  variable?: string
  testMin?: number
  testMax?: number
}

export type PreviewPartInput = {
  partType?: PreviewPartType
  correctAnswer?: number
  correctAnswerExpression?: string
  tolerance?: number
  toleranceType?: 'absolute' | 'relative'
  significantFigures?: number
  scoringMode?: 'threshold' | 'linear-decay' | 'stepped'
  scoringSteps?: PreviewScoringStep[]
  symbolicAnswer?: string
  symbolicVariables?: PreviewSymbolicVariable[]
  symbolicTolerance?: number
}

const toNumeric = (value: unknown, fallback: number) => {
  const numberValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

export const normalizePreviewPartType = (value: unknown): PreviewPartType =>
  value === 'symbolic' ? value : 'numeric'

export const buildPreviewCanonicalParts = ({
  parts,
  templateScope,
}: {
  parts: PreviewPartInput[]
  templateScope: Record<string, number>
}): ProblemPartForGrading[] =>
  parts.map((part) => {
    const partType = normalizePreviewPartType(part.partType)
    const staticCorrect = toNumeric(part.correctAnswer, 0)
    const expression =
      partType === 'numeric' && typeof part.correctAnswerExpression === 'string'
        ? part.correctAnswerExpression.trim()
        : ''
    const scopedCorrect = expression ? evaluateTemplateExpression(expression, templateScope) : null
    return {
      partType,
      correctAnswer: scopedCorrect ?? staticCorrect,
      tolerance: Math.abs(toNumeric(part.tolerance, 0.05)),
      toleranceType: part.toleranceType === 'relative' ? 'relative' : 'absolute',
      significantFigures:
        typeof part.significantFigures === 'number' && Number.isFinite(part.significantFigures)
          ? part.significantFigures
          : null,
      scoringMode:
        part.scoringMode === 'linear-decay' || part.scoringMode === 'stepped'
          ? part.scoringMode
          : 'threshold',
      scoringSteps: Array.isArray(part.scoringSteps)
        ? part.scoringSteps
            .map((step) => ({
              errorBound: toNumeric(step.errorBound, Number.NaN),
              score: toNumeric(step.score, Number.NaN),
            }))
            .filter(
              (step) =>
                Number.isFinite(step.errorBound) &&
                Number.isFinite(step.score) &&
                step.errorBound >= 0,
            )
        : [],
      symbolicAnswer: typeof part.symbolicAnswer === 'string' ? part.symbolicAnswer : '',
      symbolicVariables: Array.isArray(part.symbolicVariables)
        ? part.symbolicVariables
            .map((variable) => {
              const variableName =
                typeof variable.variable === 'string' ? variable.variable.trim() : ''
              if (!variableName) return null
              if (
                Object.prototype.hasOwnProperty.call(templateScope, variableName) &&
                Number.isFinite(templateScope[variableName])
              ) {
                const value = Number(templateScope[variableName])
                return {
                  variable: variableName,
                  testMin: value,
                  testMax: value,
                }
              }
              return {
                variable: variableName,
                testMin: toNumeric(variable.testMin, 1),
                testMax: toNumeric(variable.testMax, 10),
              }
            })
            .filter((variable): variable is { variable: string; testMin: number; testMax: number } =>
              Boolean(variable),
            )
        : [],
      symbolicTolerance: Math.abs(toNumeric(part.symbolicTolerance, 0.000001)),
    }
  })

export const buildPreviewSubmittedParts = ({
  parts,
  studentInputs,
}: {
  parts: PreviewPartInput[]
  studentInputs: Record<number, string>
}): SubmittedPartAnswer[] =>
  parts.map((part, partIndex) => {
    const partType = normalizePreviewPartType(part.partType)
    if (partType === 'symbolic') {
      return {
        partIndex,
        studentAnswer: null,
        studentExpression: (studentInputs[partIndex] ?? '').trim(),
      }
    }

    const raw = (studentInputs[partIndex] ?? '').trim()
    const parsed = Number.parseFloat(raw)
    return {
      partIndex,
      studentAnswer: Number.isFinite(parsed) ? parsed : null,
      studentExpression: null,
    }
  })
