// Client-side helpers for the custom quiz edit screen. Same pattern as
// courses-order-api: we hold relationship ids as strings for React key
// safety and coerce to integers at the network boundary (Payload's
// `isValidID` rejects numeric strings against integer-keyed collections —
// see the `payload-relationship-id` skill for the full backstory).

const relId = (id: string | number | null | undefined): number | string | null => {
  if (id == null || id === '') return null
  if (typeof id === 'number') return id
  return /^\d+$/.test(id) ? Number(id) : id
}

type PayloadFieldError = { message?: string; field?: string; label?: string; path?: string }
type PayloadErrorEntry = {
  message?: string
  field?: string
  data?: { errors?: PayloadFieldError[] } | PayloadFieldError[]
}

const extractErrorMessage = async (response: Response, path: string): Promise<string> => {
  try {
    const data = (await response.clone().json()) as {
      message?: string
      errors?: PayloadErrorEntry[]
    }
    const detailed: string[] = []
    for (const entry of data.errors ?? []) {
      const inner = Array.isArray(entry.data) ? entry.data : (entry.data?.errors ?? [])
      for (const fe of inner) {
        const key = fe.field ?? fe.path ?? fe.label
        if (fe.message) detailed.push(key ? `${key}: ${fe.message}` : fe.message)
      }
    }
    if (detailed.length > 0) return detailed.join('; ')
    if (data.message) return data.message
  } catch {
    // body wasn't JSON
  }
  return `Request failed (${response.status}) for ${path}`
}

export type QuizScoring = 'per-question' | 'all-or-nothing' | 'partial'
export type QuizDifficulty = 'intro' | 'easy' | 'medium' | 'hard' | ''

export type QuizUpdateFields = {
  title?: string
  description?: string
  course?: string | null
  chapter?: string | null
  tags?: string[]
  difficulty?: QuizDifficulty
  scoring?: QuizScoring
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
  timeLimitSec?: number | null
}

// Patch a quiz with the given fields. Empty-string relationships are sent as
// `null` so Payload clears them rather than tries to validate "".
export const updateQuiz = async (quizId: string, fields: QuizUpdateFields): Promise<void> => {
  const body: Record<string, unknown> = {}
  if (fields.title !== undefined) body.title = fields.title
  if (fields.description !== undefined) body.description = fields.description
  if (fields.course !== undefined) body.course = relId(fields.course)
  if (fields.chapter !== undefined) body.chapter = relId(fields.chapter)
  if (fields.tags !== undefined) body.tags = fields.tags
  if (fields.difficulty !== undefined) {
    body.difficulty = fields.difficulty === '' ? null : fields.difficulty
  }
  if (fields.scoring !== undefined) body.scoring = fields.scoring
  if (fields.shuffleQuestions !== undefined) body.shuffleQuestions = fields.shuffleQuestions
  if (fields.shuffleOptions !== undefined) body.shuffleOptions = fields.shuffleOptions
  if (fields.timeLimitSec !== undefined) body.timeLimitSec = fields.timeLimitSec

  const response = await fetch(`/api/quizzes/${quizId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, `/api/quizzes/${quizId}`))
  }
}
