import type { CollectionSlug, PayloadRequest, Where } from 'payload'

const fallbackSlug = 'untitled'

export const slugify = (value: string) => {
  const trimmed = value.toLowerCase().trim()
  const slug = trimmed
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug || fallbackSlug
}

type UniqueSlugArgs = {
  base: string
  collection: CollectionSlug
  req?: PayloadRequest | null
  id?: number | string | null
  where?: Where
}

export const ensureUniqueSlug = async ({ base, collection, req, id, where }: UniqueSlugArgs) => {
  if (!req?.payload) return base
  let candidate = base
  let suffix = 2

  while (true) {
    const queryWhere: Where = {
      slug: { equals: candidate },
      ...(where ?? {}),
    }
    if (id) {
      queryWhere.id = { not_equals: id }
    }

    const existing = await req.payload.find({
      collection,
      depth: 0,
      limit: 1,
      where: queryWhere,
    })

    if (existing.totalDocs === 0) return candidate
    candidate = `${base}-${suffix++}`
  }
}
