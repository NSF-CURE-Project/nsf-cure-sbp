import { gradeSymbolic } from '../lib/problemSet/symbolicGrading'

export type ToleranceType = 'absolute' | 'relative'
export type ScoringMode = 'threshold' | 'linear-decay' | 'stepped'
export type PartType = 'numeric' | 'symbolic'

export type PartGradingConfig = {
  correctAnswer: number
  tolerance: number
  toleranceType: ToleranceType
  significantFigures?: number | null
  scoringMode?: ScoringMode
  scoringSteps?: { errorBound: number; score: number }[] | null
}

export type ProblemPartForGrading = PartGradingConfig & {
  partType?: PartType | null
  unit?: string | null
  symbolicAnswer?: string | null
  symbolicVariables?: { variable: string; testMin: number; testMax: number }[]
  symbolicTolerance?: number | null
}

export type SubmittedPartAnswer = {
  partIndex: number
  studentAnswer?: number | null
  studentExpression?: string | null
}

export type SubmittedProblemAnswer = {
  problem: string | number
  variantSeed?: string | null
  variantSignature?: string | null
  variantScope?: Record<string, number> | null
  parts?: SubmittedPartAnswer[]
}

export type ProblemForGrading = {
  id: string | number
  templateScope?: Record<string, number> | null
  parts?: ProblemPartForGrading[]
}

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return value
}

export const roundToSigFigs = (value: number, significantFigures: number): number => {
  if (!Number.isFinite(value) || value === 0) return value
  const sig = Math.max(1, Math.trunc(significantFigures))
  const magnitude = Math.floor(Math.log10(Math.abs(value)))
  const factor = 10 ** (sig - magnitude - 1)
  return Math.round(value * factor) / factor
}

const clampScore = (value: number) => Math.max(0, Math.min(1, value))

const getNormalizedError = (studentRaw: number, config: PartGradingConfig): number => {
  let student = studentRaw
  if (config.significantFigures && config.significantFigures > 0) {
    student = roundToSigFigs(student, config.significantFigures)
  }
  const diff = Math.abs(student - config.correctAnswer)

  if (config.toleranceType === 'relative') {
    const denominator = Math.abs(config.correctAnswer)
    if (denominator === 0) return diff
    return diff / denominator
  }

  return diff
}

export function gradePart(
  studentRaw: number,
  config: PartGradingConfig,
): { score: number; isCorrect: boolean } {
  const tolerance = Math.abs(config.tolerance)
  const normalizedError = getNormalizedError(studentRaw, config)
  const scoringMode = config.scoringMode ?? 'threshold'

  if (scoringMode === 'linear-decay') {
    const score =
      tolerance <= 0 ? (normalizedError === 0 ? 1 : 0) : clampScore(1 - normalizedError / tolerance)
    return {
      score,
      isCorrect: score === 1,
    }
  }

  if (scoringMode === 'stepped') {
    const steps = Array.isArray(config.scoringSteps) ? config.scoringSteps : []
    const sortedSteps = [...steps]
      .filter(
        (step) =>
          Number.isFinite(step.errorBound) &&
          typeof step.score === 'number' &&
          Number.isFinite(step.score),
      )
      .sort((a, b) => a.errorBound - b.errorBound)
    const bounded = [...sortedSteps, { errorBound: Number.POSITIVE_INFINITY, score: 0 }]
    const match = bounded.find((step) => normalizedError <= step.errorBound)
    const score = clampScore(match?.score ?? 0)
    return {
      score,
      isCorrect: score === 1,
    }
  }

  const score = normalizedError <= tolerance ? 1 : 0
  return {
    score,
    isCorrect: score === 1,
  }
}

export const gradeProblemAttemptAnswers = async (
  submission: SubmittedProblemAnswer[],
  problems: ProblemForGrading[],
) => {
  const problemsById = new Map(problems.map((problem) => [String(problem.id), problem]))

  let totalScore = 0
  let totalParts = 0
  let correctCount = 0

  const normalizedAnswers = await Promise.all(
    submission.map(async (item) => {
      const problemId = String(item.problem)
      const problem = problemsById.get(problemId)
      const canonicalParts = Array.isArray(problem?.parts) ? problem.parts : []
      const submittedParts = Array.isArray(item.parts) ? item.parts : []
      const submittedByIndex = new Map<number, SubmittedPartAnswer>(
        submittedParts.map((part) => [part.partIndex, part]),
      )

      const gradedParts = await Promise.all(
        canonicalParts.map(async (part, partIndex) => {
          totalParts += 1
          const submittedPart = submittedByIndex.get(partIndex)
          const partType = part.partType ?? 'numeric'
          const rawStudent = toFiniteNumber(submittedPart?.studentAnswer)
          const studentExpression =
            typeof submittedPart?.studentExpression === 'string'
              ? submittedPart.studentExpression.trim()
              : ''

          let graded = { score: 0, isCorrect: false }

          if (partType === 'symbolic') {
            const isCorrect = await gradeSymbolic(
              studentExpression,
              part.symbolicAnswer ?? '',
              part.symbolicVariables ?? [],
              Math.abs(part.symbolicTolerance ?? 0.000001),
              5,
              `${problemId}:${partIndex}`,
            )
            graded = { score: isCorrect ? 1 : 0, isCorrect }
          } else {
            graded =
              rawStudent == null
                ? { score: 0, isCorrect: false }
                : gradePart(rawStudent, {
                    correctAnswer: part.correctAnswer,
                    tolerance: part.tolerance,
                    toleranceType: part.toleranceType,
                    significantFigures: part.significantFigures,
                    scoringMode: part.scoringMode,
                    scoringSteps: part.scoringSteps,
                  })
          }
          const partScore = Number(graded.score.toFixed(4))
          totalScore += partScore
          if (graded.isCorrect) correctCount += 1

          return {
            partIndex,
            studentAnswer: rawStudent,
            studentExpression: studentExpression || null,
            isCorrect: graded.isCorrect,
            score: partScore,
          }
        }),
      )

      return {
        problem: problemId,
        parts: gradedParts,
      }
    }),
  )

  return {
    answers: normalizedAnswers,
    score: totalScore,
    maxScore: totalParts,
    correctCount,
  }
}
