type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === 'object' && value !== null ? (value as UnknownRecord) : null

const stripPartAnswerKeyFields = (part: UnknownRecord): UnknownRecord => {
  const next: UnknownRecord = { ...part }
  delete next.correctAnswer
  delete next.tolerance
  delete next.toleranceType
  delete next.significantFigures
  delete next.scoringMode
  delete next.scoringSteps
  delete next.symbolicAnswer
  delete next.symbolicVariables
  delete next.symbolicTolerance
  delete next.fbdRubric
  return next
}

const sanitizeProblem = (problem: unknown): unknown => {
  const problemRecord = asRecord(problem)
  if (!problemRecord) return problem

  const next: UnknownRecord = { ...problemRecord }
  if (Array.isArray(problemRecord.parts)) {
    next.parts = problemRecord.parts.map((part) => {
      const partRecord = asRecord(part)
      return partRecord ? stripPartAnswerKeyFields(partRecord) : part
    })
  }

  return next
}

export const sanitizeProblemSetForPublic = (problemSet: unknown): UnknownRecord => {
  const problemSetRecord = asRecord(problemSet)
  if (!problemSetRecord) return {}

  const next: UnknownRecord = { ...problemSetRecord }
  if (Array.isArray(problemSetRecord.problems)) {
    next.problems = problemSetRecord.problems.map((problem) => sanitizeProblem(problem))
  }

  return next
}
