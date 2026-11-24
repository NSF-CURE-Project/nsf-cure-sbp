export type EntityId = string

type CreatedDoc<T = Record<string, unknown>> = { doc?: T & { id?: string | number } }

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
    const topLevel = (data.errors ?? [])
      .map((err) => (err.field ? `${err.field}: ${err.message}` : err.message))
      .filter(Boolean)
      .join('; ')
    if (topLevel) return topLevel
    if (data.message) return data.message
  } catch {
    // body wasn't JSON
  }
  return `Request failed (${response.status}) for ${path}`
}

const post = async <T = unknown,>(
  path: string,
  body: Record<string, unknown>,
  query: Record<string, string> = {},
): Promise<T> => {
  const search = new URLSearchParams(query).toString()
  const fullPath = search ? `${path}?${search}` : path
  const response = await fetch(fullPath, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(await extractErrorMessage(response, fullPath))
  return response.json() as Promise<T>
}

const patch = async (
  path: string,
  body: Record<string, unknown>,
  query: Record<string, string> = {},
): Promise<void> => {
  const search = new URLSearchParams(query).toString()
  const fullPath = search ? `${path}?${search}` : path
  const response = await fetch(fullPath, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(await extractErrorMessage(response, fullPath))
}

const remove = async (path: string): Promise<void> => {
  const response = await fetch(path, { method: 'DELETE', credentials: 'include' })
  if (!response.ok) throw new Error(await extractErrorMessage(response, path))
}

export type CreatePageInput = {
  title: string
  slug: string
  layout?: Record<string, unknown>[]
}

export const createPage = async (
  input: CreatePageInput,
): Promise<{ id: EntityId; title: string; slug: string }> => {
  // Create as draft. Pages have drafts enabled — the published flip happens
  // via a separate `_status: 'published'` PATCH from the editor's publish
  // action.
  const result = await post<CreatedDoc<{ title?: string; slug?: string }>>(
    '/api/pages',
    {
      title: input.title,
      slug: input.slug,
      layout: input.layout ?? [],
      _status: 'draft',
    },
    { draft: 'true' },
  )
  const doc = result.doc
  if (!doc?.id) throw new Error('Page create response missing id')
  return {
    id: String(doc.id),
    title: doc.title ?? input.title,
    slug: doc.slug ?? input.slug,
  }
}

export type UpdatePageInput = {
  title?: string
  slug?: string
  layout?: Record<string, unknown>[]
  // intent='autosave' keeps the working draft current without bumping the
  // published version. intent='publish' flips _status to 'published'.
  intent: 'autosave' | 'draft' | 'publish'
}

export const updatePage = async (pageId: EntityId, input: UpdatePageInput): Promise<void> => {
  const body: Record<string, unknown> = {}
  if (input.title !== undefined) body.title = input.title
  if (input.slug !== undefined) body.slug = input.slug
  if (input.layout !== undefined) body.layout = input.layout
  if (input.intent === 'publish') {
    body._status = 'published'
  } else {
    body._status = 'draft'
  }
  // draft=true makes Payload save the working draft instead of publishing
  // implicitly; we set `_status: 'published'` explicitly to publish.
  await patch(`/api/pages/${pageId}`, body, {
    draft: input.intent === 'publish' ? 'false' : 'true',
  })
}

export const deletePage = async (pageId: EntityId): Promise<void> => {
  await remove(`/api/pages/${pageId}`)
}

export const setPageHidden = async (
  pageId: EntityId,
  hidden: boolean,
): Promise<void> => {
  // draft=false keeps the published doc in sync so visibility flips reflect
  // on the live site immediately rather than waiting for a publish.
  await patch(`/api/pages/${pageId}`, { hidden }, { draft: 'false' })
}

const getJson = async <T = unknown,>(path: string): Promise<T> => {
  const response = await fetch(path, { credentials: 'include' })
  if (!response.ok) throw new Error(await extractErrorMessage(response, path))
  return response.json() as Promise<T>
}

// Look up the most-recent published version for a page. Returns null if no
// version has ever been published. Used by the publish-review modal to show
// "Last published Xh ago — publishing version N+1". Mirrors the lesson
// helper of the same shape.
export const getLastPublishedPageVersion = async (
  pageId: EntityId,
): Promise<{
  versionId: EntityId
  updatedAt: string | null
  publishedCount: number
} | null> => {
  const params = new URLSearchParams()
  params.set('where[parent][equals]', String(pageId))
  params.set('where[version._status][equals]', 'published')
  params.set('sort', '-updatedAt')
  params.set('depth', '0')
  params.set('limit', '1')
  const json = await getJson<{
    docs?: Array<{ id: string | number; updatedAt?: string }>
    totalDocs?: number
  }>(`/api/pages/versions?${params.toString()}`)
  const doc = json.docs?.[0]
  if (!doc) return null
  return {
    versionId: String(doc.id),
    updatedAt: doc.updatedAt ?? null,
    publishedCount: typeof json.totalDocs === 'number' ? json.totalDocs : 1,
  }
}

// Fetch one version's full snapshot for diff. depth=1 so relationship ids
// inside the layout come back as objects (matches the editor's hydrate path).
export const getPageVersion = async (
  versionId: EntityId,
): Promise<{ title: string; layout: unknown }> => {
  const json = await getJson<{
    version?: { title?: string; layout?: unknown }
  }>(`/api/pages/versions/${versionId}?depth=1`)
  return {
    title: json.version?.title ?? '',
    layout: json.version?.layout ?? [],
  }
}
