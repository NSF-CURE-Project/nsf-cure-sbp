import type { PayloadRequest } from 'payload'

const isStaff = (req: PayloadRequest) =>
  req.user?.collection === 'users' &&
  ['admin', 'staff', 'professor'].includes(req.user?.role ?? '')

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const previewUrlHandler = async (req: PayloadRequest) => {
  if (!isStaff(req)) {
    return jsonResponse({ message: 'Not authorized.' }, 403)
  }

  let body = req.body
  if (!body && typeof (req as any).json === 'function') {
    try {
      body = await (req as any).json()
    } catch {
      body = undefined
    }
  }
  if (!body && typeof (req as any).text === 'function') {
    try {
      const raw = await (req as any).text()
      if (raw) {
        body = JSON.parse(raw)
      }
    } catch {
      body = undefined
    }
  }

  let type = (body as any)?.type
  let slug = (body as any)?.slug
  let id = (body as any)?.id

  const query = (req as any)?.query ?? {}
  if (!type && typeof query?.type === 'string') type = query.type
  if (!slug && typeof query?.slug === 'string') slug = query.slug
  if (!id && typeof query?.id === 'string') id = query.id

  if ((!type || !slug) && typeof (req as any)?.url === 'string') {
    try {
      const params = new URL((req as any).url, 'http://localhost').searchParams
      if (!type) type = params.get('type') ?? undefined
      if (!slug) slug = params.get('slug') ?? undefined
      if (!id) id = params.get('id') ?? undefined
    } catch {
      // ignore parse errors
    }
  }

  const normalized = {
    type,
    slug,
    id,
  } as {
    type?: string
    slug?: string
    id?: string | number
  }
  if (!type || !slug) {
    const referer =
      (req as any)?.headers?.get?.('referer') ??
      (req as any)?.headers?.get?.('referrer') ??
      (req as any)?.headers?.referer ??
      (req as any)?.headers?.referrer
    if (typeof referer === 'string') {
      try {
        const refURL = new URL(referer)
        const path = refURL.pathname
        const collectionMatch = path.match(/\/admin\/collections\/([^/]+)\/([^/]+)/)
        if (!type && collectionMatch?.[1] && collectionMatch?.[2]) {
          type = 'collection'
          slug = collectionMatch[1]
          id = collectionMatch[2]
        }
        const globalMatch = path.match(/\/admin\/globals\/([^/]+)/)
        if (!type && globalMatch?.[1]) {
          type = 'global'
          slug = globalMatch[1]
        }
      } catch {
        // ignore
      }
    }
  }

  if (!type || !slug) {
    return jsonResponse(
      {
        message: 'Preview target is missing.',
        received: {
          hasBody: Boolean(body),
          keys: body && typeof body === 'object' ? Object.keys(body as object) : [],
          queryKeys: Object.keys(query ?? {}),
          url: (req as any)?.url,
          referer:
            (req as any)?.headers?.get?.('referer') ??
            (req as any)?.headers?.get?.('referrer') ??
            (req as any)?.headers?.referer ??
            (req as any)?.headers?.referrer,
        },
      },
      400,
    )
  }

  const config = req.payload?.config
  if (!config) {
    return jsonResponse({ message: 'Preview config unavailable.' }, 500)
  }

  if (type === 'collection') {
    if (!id) {
      return jsonResponse({ message: 'Document id is required.' }, 400)
    }

    const collectionConfig = config.collections?.find((collection) => collection.slug === slug)
    if (!collectionConfig) {
      return jsonResponse({ message: 'Collection not found.' }, 404)
    }

    const doc = await req.payload.findByID({
      collection: slug,
      id,
      depth: 2,
    })

    const previewBase = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
    const secret = process.env.PREVIEW_SECRET ?? ''

    if (slug === 'lessons') {
      const lessonSlug = (doc as any)?.slug ?? ''
      if (!lessonSlug) {
        return jsonResponse({ message: 'Lesson slug is missing.' }, 400)
      }
      const classSlug =
        (typeof (doc as any)?.class === 'object' && (doc as any)?.class?.slug) ||
        (typeof (doc as any)?.chapter === 'object' &&
          (doc as any)?.chapter?.class &&
          typeof (doc as any)?.chapter?.class === 'object' &&
          (doc as any)?.chapter?.class?.slug) ||
        ''
      const search = new URLSearchParams({ secret, type: 'lesson', slug: lessonSlug })
      if (classSlug) search.set('classSlug', classSlug)
      return jsonResponse({ url: `${previewBase}/api/preview?${search.toString()}` }, 200)
    }

    if (slug === 'pages') {
      const pageSlug = (doc as any)?.slug ?? ''
      const search = new URLSearchParams({ secret, type: 'page', slug: pageSlug })
      return jsonResponse({ url: `${previewBase}/api/preview?${search.toString()}` }, 200)
    }

    if (slug === 'classes') {
      const classSlug = (doc as any)?.slug ?? ''
      const search = new URLSearchParams({ secret, type: 'class', slug: classSlug })
      return jsonResponse({ url: `${previewBase}/api/preview?${search.toString()}` }, 200)
    }

    const previewConfig = collectionConfig.admin?.livePreview ?? collectionConfig.admin?.preview
    const previewUrl = previewConfig?.url
    if (!previewUrl) {
      return jsonResponse({ message: 'Preview not configured.' }, 404)
    }

    const url = typeof previewUrl === 'function' ? previewUrl({ data: doc, req }) : previewUrl
    return jsonResponse({ url }, 200)
  }

  if (type === 'global') {
    const globalConfig = config.globals?.find((global) => global.slug === slug)
    if (!globalConfig) {
      return jsonResponse({ message: 'Global not found.' }, 404)
    }

    const doc = await req.payload.findGlobal({
      slug,
      depth: 2,
    })

    const previewConfig = globalConfig.admin?.livePreview ?? globalConfig.admin?.preview
    const previewUrl = previewConfig?.url
    if (!previewUrl) {
      return jsonResponse({ message: 'Preview not configured.' }, 404)
    }

    const url = typeof previewUrl === 'function' ? previewUrl({ data: doc, req }) : previewUrl
    return jsonResponse({ url }, 200)
  }

  return jsonResponse({ message: 'Invalid preview target.' }, 400)
}
