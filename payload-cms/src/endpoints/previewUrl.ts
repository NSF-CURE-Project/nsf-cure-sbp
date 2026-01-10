import type { CollectionSlug, GlobalSlug, PayloadRequest } from 'payload'

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

  const requestMeta = req as unknown as {
    json?: () => Promise<unknown>
    text?: () => Promise<string>
    query?: Record<string, unknown>
    url?: string
    headers?: Headers | Record<string, string | undefined>
  }

  let body: unknown = req.body
  if (!body && typeof requestMeta.json === 'function') {
    try {
      body = await requestMeta.json()
    } catch {
      body = undefined
    }
  }
  if (!body && typeof requestMeta.text === 'function') {
    try {
      const raw = await requestMeta.text()
      if (raw) {
        body = JSON.parse(raw)
      }
    } catch {
      body = undefined
    }
  }

  const bodyData = body as { type?: string; slug?: string; id?: string | number } | undefined
  let type = bodyData?.type
  let slug = bodyData?.slug
  let id = bodyData?.id

  const query = requestMeta.query ?? {}
  if (!type && typeof query?.type === 'string') type = query.type
  if (!slug && typeof query?.slug === 'string') slug = query.slug
  if (!id && typeof query?.id === 'string') id = query.id

  if ((!type || !slug) && typeof requestMeta?.url === 'string') {
    try {
      const params = new URL(requestMeta.url, 'http://localhost').searchParams
      if (!type) type = params.get('type') ?? undefined
      if (!slug) slug = params.get('slug') ?? undefined
      if (!id) id = params.get('id') ?? undefined
    } catch {
      // ignore parse errors
    }
  }

  if (!type || !slug) {
    const referer =
      requestMeta.headers &&
      'get' in requestMeta.headers &&
      typeof requestMeta.headers.get === 'function'
        ? requestMeta.headers.get('referer') ?? requestMeta.headers.get('referrer')
        : (requestMeta.headers as Record<string, string | undefined>)?.referer ??
          (requestMeta.headers as Record<string, string | undefined>)?.referrer
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
          url: requestMeta.url,
          referer:
            requestMeta.headers &&
            'get' in requestMeta.headers &&
            typeof requestMeta.headers.get === 'function'
              ? requestMeta.headers.get('referer') ?? requestMeta.headers.get('referrer')
              : (requestMeta.headers as Record<string, string | undefined>)?.referer ??
                (requestMeta.headers as Record<string, string | undefined>)?.referrer,
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
      collection: slug as CollectionSlug,
      id,
      depth: 2,
    })

    const previewBase = process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'
    const secret = process.env.PREVIEW_SECRET ?? ''

    if (slug === 'lessons') {
      const lessonSlug = (doc as { slug?: string })?.slug ?? ''
      if (!lessonSlug) {
        return jsonResponse({ message: 'Lesson slug is missing.' }, 400)
      }
      const lessonDoc = doc as {
        class?: { slug?: string } | string | null
        chapter?: { class?: { slug?: string } | null } | string | null
      }
      const classSlug =
        (typeof lessonDoc.class === 'object' && lessonDoc.class?.slug) ||
        (typeof lessonDoc.chapter === 'object' &&
          lessonDoc.chapter?.class &&
          typeof lessonDoc.chapter.class === 'object' &&
          lessonDoc.chapter.class.slug) ||
        ''
      const search = new URLSearchParams({
        secret,
        type: 'lesson',
        slug: lessonSlug,
        ts: Date.now().toString(),
      })
      if (classSlug) search.set('classSlug', classSlug)
      return jsonResponse({ url: `${previewBase}/api/preview?${search.toString()}` }, 200)
    }

    if (slug === 'pages') {
      const pageSlug = (doc as { slug?: string })?.slug ?? ''
      const search = new URLSearchParams({
        secret,
        type: 'page',
        slug: pageSlug,
        ts: Date.now().toString(),
      })
      return jsonResponse({ url: `${previewBase}/api/preview?${search.toString()}` }, 200)
    }

    if (slug === 'classes') {
      const classSlug = (doc as { slug?: string })?.slug ?? ''
      const search = new URLSearchParams({
        secret,
        type: 'class',
        slug: classSlug,
        ts: Date.now().toString(),
      })
      return jsonResponse({ url: `${previewBase}/api/preview?${search.toString()}` }, 200)
    }

    const previewConfig = collectionConfig.admin?.livePreview ?? collectionConfig.admin?.preview
    const previewUrl =
      typeof previewConfig === 'function'
        ? await Promise.resolve(
            (previewConfig as unknown as (...args: unknown[]) => string | Promise<string>)({
              data: doc,
              req,
            }),
          )
        : typeof previewConfig?.url === 'function'
          ? await Promise.resolve(
              (previewConfig.url as unknown as (...args: unknown[]) => string | Promise<string>)({
                data: doc,
                req,
                payload: req.payload,
                locale: req.locale,
              }),
            )
          : previewConfig?.url
    if (!previewUrl) {
      return jsonResponse({ message: 'Preview not configured.' }, 404)
    }

    return jsonResponse({ url: previewUrl }, 200)
  }

  if (type === 'global') {
    const globalConfig = config.globals?.find((global) => global.slug === slug)
    if (!globalConfig) {
      return jsonResponse({ message: 'Global not found.' }, 404)
    }

    const doc = await req.payload.findGlobal({
      slug: slug as GlobalSlug,
      depth: 2,
    })

    const previewConfig = globalConfig.admin?.livePreview ?? globalConfig.admin?.preview
    const previewUrl =
      typeof previewConfig === 'function'
        ? await Promise.resolve(
            (previewConfig as unknown as (...args: unknown[]) => string | Promise<string>)({
              data: doc,
              req,
            }),
          )
        : typeof previewConfig?.url === 'function'
          ? await Promise.resolve(
              (previewConfig.url as unknown as (...args: unknown[]) => string | Promise<string>)({
                data: doc,
                req,
                payload: req.payload,
                locale: req.locale,
              }),
            )
          : previewConfig?.url
    if (!previewUrl) {
      return jsonResponse({ message: 'Preview not configured.' }, 404)
    }

    return jsonResponse({ url: previewUrl }, 200)
  }

  return jsonResponse({ message: 'Invalid preview target.' }, 400)
}
