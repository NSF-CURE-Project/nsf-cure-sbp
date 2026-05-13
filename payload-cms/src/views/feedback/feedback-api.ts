export type FeedbackId = string

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

export const updateFeedback = async (
  id: FeedbackId,
  body: Record<string, unknown>,
): Promise<void> => {
  const path = `/api/feedback/${id}`
  const response = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(await extractErrorMessage(response, path))
}

export const deleteFeedback = async (id: FeedbackId): Promise<void> => {
  const path = `/api/feedback/${id}`
  const response = await fetch(path, { method: 'DELETE', credentials: 'include' })
  if (!response.ok) throw new Error(await extractErrorMessage(response, path))
}
