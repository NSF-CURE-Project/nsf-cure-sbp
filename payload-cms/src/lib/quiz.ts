type RawOption = {
  id?: string | number | null
  label?: string | null
  isCorrect?: boolean | null
}

type RawQuestion = {
  id?: string | number | null
  title?: string | null
  questionType?: string | null
  options?: unknown[] | null
  trueFalseAnswer?: boolean | null
  acceptedAnswers?: unknown
  textMatchMode?: string | null
  numericCorrectValue?: number | null
  numericTolerance?: number | null
  numericUnit?: string | null
}

type RawAnswer = {
  selectedOptionIds?: unknown
  textAnswer?: unknown
  numericAnswer?: unknown
}

export const QUIZ_QUESTION_TYPES = [
  'single-select',
  'multi-select',
  'true-false',
  'short-text',
  'numeric',
] as const

export type QuizQuestionType = (typeof QUIZ_QUESTION_TYPES)[number]

export const isQuizQuestionType = (value: unknown): value is QuizQuestionType =>
  typeof value === 'string' && (QUIZ_QUESTION_TYPES as readonly string[]).includes(value)

export const getId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id != null ? String(id) : null
  }
  return null
}

export const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, ' ')

export const normalizeFreeText = (value: string) => normalizeWhitespace(value).toLowerCase()

export const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : ''))
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,;|]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export const getQuestionType = (question?: RawQuestion | null): QuizQuestionType => {
  if (question && isQuizQuestionType(question.questionType)) {
    return question.questionType
  }
  const options = Array.isArray(question?.options) ? question.options : []
  const correctCount = options.filter(
    (option) => typeof option === 'object' && option !== null && Boolean((option as RawOption).isCorrect),
  ).length
  return correctCount > 1 ? 'multi-select' : 'single-select'
}

export const getTextMatchMode = (question?: RawQuestion | null): 'exact' | 'normalized' => {
  return question?.textMatchMode === 'exact' ? 'exact' : 'normalized'
}

export const getChoiceOptions = (question?: RawQuestion | null) => {
  const type = getQuestionType(question)
  if (type === 'true-false') {
    const correctIsTrue = Boolean(question?.trueFalseAnswer)
    return [
      { id: 'true', label: 'True', isCorrect: correctIsTrue },
      { id: 'false', label: 'False', isCorrect: !correctIsTrue },
    ]
  }

  const options = Array.isArray(question?.options) ? question.options : []
  return options
    .map((item, index) => {
      if (typeof item !== 'object' || item === null) return null
      const option = item as RawOption
      const id = getId(option) ?? `${getId(question) ?? 'question'}-${index}`
      return {
        id,
        label: typeof option.label === 'string' && option.label.trim() ? option.label.trim() : 'Untitled option',
        isCorrect: Boolean(option.isCorrect),
      }
    })
    .filter((item): item is { id: string; label: string; isCorrect: boolean } => Boolean(item))
}

export const getAcceptedAnswers = (question?: RawQuestion | null) => parseStringArray(question?.acceptedAnswers)

export const getQuestionIssues = (question?: RawQuestion | null) => {
  const type = getQuestionType(question)
  const issues: string[] = []

  if (type === 'single-select') {
    const options = getChoiceOptions(question)
    const correctCount = options.filter((option) => option.isCorrect).length
    if (options.length < 2) issues.push('needs 2+ options')
    if (correctCount !== 1) issues.push('needs exactly 1 correct answer')
  }

  if (type === 'multi-select') {
    const options = getChoiceOptions(question)
    const correctCount = options.filter((option) => option.isCorrect).length
    if (options.length < 3) issues.push('needs 3+ options')
    if (correctCount < 1) issues.push('needs a correct answer')
  }

  if (type === 'true-false' && typeof question?.trueFalseAnswer !== 'boolean') {
    issues.push('needs a true/false answer')
  }

  if (type === 'short-text' && getAcceptedAnswers(question).length < 1) {
    issues.push('needs at least 1 accepted answer')
  }

  if (type === 'numeric') {
    if (typeof question?.numericCorrectValue !== 'number' || Number.isNaN(question.numericCorrectValue)) {
      issues.push('needs a numeric correct value')
    }
    if (
      question?.numericTolerance != null &&
      (typeof question.numericTolerance !== 'number' || Number.isNaN(question.numericTolerance) || question.numericTolerance < 0)
    ) {
      issues.push('numeric tolerance must be 0 or greater')
    }
  }

  return issues
}

export const normalizeSelectedOptionIds = (value?: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null && 'optionId' in item) {
        return String((item as { optionId?: string }).optionId ?? '')
      }
      return ''
    })
    .filter(Boolean)
}

const normalizeNumeric = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export const gradeQuizAnswer = (
  question: RawQuestion,
  answer: RawAnswer,
  scoring: string | null | undefined,
) => {
  const type = getQuestionType(question)

  if (type === 'single-select' || type === 'multi-select' || type === 'true-false') {
    const selectedIds = normalizeSelectedOptionIds(answer.selectedOptionIds)
    const correctIds = getChoiceOptions(question)
      .filter((option) => option.isCorrect)
      .map((option) => option.id)
    const selectedSet = new Set(selectedIds)
    const correctSet = new Set(correctIds)
    const exactMatch =
      correctIds.length > 0 &&
      correctIds.length === selectedSet.size &&
      correctIds.every((id) => selectedSet.has(id))

    let score = 0
    if (scoring === 'partial' && type === 'multi-select' && correctIds.length > 0) {
      const correctSelected = selectedIds.filter((id) => correctSet.has(id)).length
      const incorrectSelected = selectedIds.filter((id) => !correctSet.has(id)).length
      const raw = (correctSelected - incorrectSelected) / correctIds.length
      score = Math.max(0, Math.min(1, raw))
    } else {
      score = exactMatch ? 1 : 0
    }

    return {
      responseKind: 'option-selection',
      selectedOptionIds: selectedIds,
      textAnswer: null,
      numericAnswer: null,
      normalizedAnswer: selectedIds.join(','),
      score,
      isCorrect: score === 1,
    }
  }

  if (type === 'short-text') {
    const textAnswer = typeof answer.textAnswer === 'string' ? answer.textAnswer : ''
    const trimmed = textAnswer.trim()
    const acceptedAnswers = getAcceptedAnswers(question)
    const matchMode = getTextMatchMode(question)
    const normalizedAnswer = matchMode === 'exact' ? trimmed : normalizeFreeText(trimmed)
    const matched = acceptedAnswers.some((candidate) =>
      (matchMode === 'exact' ? candidate.trim() : normalizeFreeText(candidate)) === normalizedAnswer,
    )

    return {
      responseKind: 'text',
      selectedOptionIds: [],
      textAnswer: trimmed,
      numericAnswer: null,
      normalizedAnswer,
      score: matched ? 1 : 0,
      isCorrect: matched,
    }
  }

  const numericAnswer = normalizeNumeric(answer.numericAnswer)
  const correctValue = normalizeNumeric(question.numericCorrectValue)
  const tolerance =
    typeof question.numericTolerance === 'number' && Number.isFinite(question.numericTolerance)
      ? Math.max(0, question.numericTolerance)
      : 0
  const matched =
    numericAnswer != null && correctValue != null ? Math.abs(numericAnswer - correctValue) <= tolerance : false

  return {
    responseKind: 'numeric',
    selectedOptionIds: [],
    textAnswer: null,
    numericAnswer,
    normalizedAnswer: numericAnswer != null ? String(numericAnswer) : '',
    score: matched ? 1 : 0,
    isCorrect: matched,
  }
}
