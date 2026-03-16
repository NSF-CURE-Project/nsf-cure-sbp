import { gradeSymbolic } from '../lib/problemSet/symbolicGrading'

export type ToleranceType = 'absolute' | 'relative'
export type ScoringMode = 'threshold' | 'linear-decay' | 'stepped'
export type PartType = 'numeric' | 'symbolic' | 'fbd-draw'

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
  fbdRubric?: {
    requiredForces?: {
      id: string
      label?: string
      correctAngle?: number
      angleTolerance?: number
      magnitudeRequired?: boolean
      correctMagnitude?: number
      magnitudeTolerance?: number
    }[]
    forbiddenForces?: number
  } | null
}

export type SubmittedPartAnswer = {
  partIndex: number
  studentAnswer?: number | null
  studentExpression?: string | null
  placedForces?: {
    forces?: {
      id: string
      origin: [number, number]
      angle: number
      magnitude: number
      label: string
    }[]
  } | null
}

export type SubmittedProblemAnswer = {
  problem: string | number
  parts?: SubmittedPartAnswer[]
}

export type ProblemForGrading = {
  id: string | number
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

const angleDiff = (a: number, b: number) => {
  const normalizedA = ((a % 360) + 360) % 360
  const normalizedB = ((b % 360) + 360) % 360
  const delta = Math.abs(normalizedA - normalizedB) % 360
  return delta > 180 ? 360 - delta : delta
}

const gradeFbdPart = (
  submittedForces: {
    id: string
    origin: [number, number]
    angle: number
    magnitude: number
    label: string
  }[],
  rubric: ProblemPartForGrading['fbdRubric'],
) => {
  const requiredForces = Array.isArray(rubric?.requiredForces) ? rubric?.requiredForces : []
  const forbiddenForces = Math.max(0, Number(rubric?.forbiddenForces ?? 0))
  if (!requiredForces.length) {
    const score = submittedForces.length <= forbiddenForces ? 1 : 0
    return { score, isCorrect: score === 1 }
  }

  const used = new Set<number>()
  let matched = 0
  for (const requiredForce of requiredForces) {
    const angleTolerance = Math.abs(Number(requiredForce.angleTolerance ?? 5))
    const magnitudeRequired = Boolean(requiredForce.magnitudeRequired)
    const correctMagnitude = Number(requiredForce.correctMagnitude ?? 0)
    const magnitudeTolerance = Math.abs(Number(requiredForce.magnitudeTolerance ?? 0.05))

    const matchIndex = submittedForces.findIndex((force, index) => {
      if (used.has(index)) return false
      if (angleDiff(force.angle, Number(requiredForce.correctAngle ?? 0)) > angleTolerance) return false
      if (!magnitudeRequired) return true
      if (!Number.isFinite(correctMagnitude)) return false
      const magnitudeError = Math.abs(force.magnitude - correctMagnitude)
      return magnitudeError <= magnitudeTolerance
    })

    if (matchIndex >= 0) {
      used.add(matchIndex)
      matched += 1
    }
  }

  const unmatchedExtra = Math.max(0, submittedForces.length - matched - forbiddenForces)
  const deduction = requiredForces.length ? unmatchedExtra / requiredForces.length : 0
  const score = clampScore(matched / requiredForces.length - deduction)
  return {
    score,
    isCorrect: score === 1,
  }
}

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

export function gradePart(studentRaw: number, config: PartGradingConfig): { score: number; isCorrect: boolean } {
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

  const normalizedAnswers = await Promise.all(submission.map(async (item) => {
    const problemId = String(item.problem)
    const problem = problemsById.get(problemId)
    const canonicalParts = Array.isArray(problem?.parts) ? problem.parts : []
    const submittedParts = Array.isArray(item.parts) ? item.parts : []
    const submittedByIndex = new Map<number, SubmittedPartAnswer>(
      submittedParts.map((part) => [part.partIndex, part]),
    )

    const gradedParts = await Promise.all(canonicalParts.map(async (part, partIndex) => {
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
      } else if (partType === 'fbd-draw') {
        const submittedForces = Array.isArray(submittedPart?.placedForces?.forces)
          ? submittedPart.placedForces?.forces
              ?.slice(0, 20)
              .filter(
                (force) =>
                  typeof force?.id === 'string' &&
                  Array.isArray(force?.origin) &&
                  force.origin.length === 2 &&
                  Number.isFinite(force.origin[0]) &&
                  Number.isFinite(force.origin[1]) &&
                  Number.isFinite(force?.angle) &&
                  Number.isFinite(force?.magnitude) &&
                  typeof force?.label === 'string',
              )
              .map((force) => ({
                id: force.id,
                origin: [force.origin[0], force.origin[1]] as [number, number],
                angle: force.angle,
                magnitude: force.magnitude,
                label: force.label,
              }))
          : []
        graded = gradeFbdPart(submittedForces, part.fbdRubric)
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
        placedForces:
          partType === 'fbd-draw' && Array.isArray(submittedPart?.placedForces?.forces)
            ? { forces: submittedPart?.placedForces?.forces?.slice(0, 20) ?? [] }
            : null,
        isCorrect: graded.isCorrect,
        score: partScore,
      }
    }))

    return {
      problem: problemId,
      parts: gradedParts,
    }
  }))

  return {
    answers: normalizedAnswers,
    score: totalScore,
    maxScore: totalParts,
    correctCount,
  }
}
