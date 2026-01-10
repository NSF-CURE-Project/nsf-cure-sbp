import type { Payload } from 'payload'

const collections = ['classes', 'chapters', 'lessons'] as const
const internalKeys = new Set(['id', '_id', 'createdAt', 'updatedAt', '_status'])

export default async function backfillVersions(payload: Payload) {
  for (const slug of collections) {
    let page = 1
    const limit = 100

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await payload.find({
        collection: slug,
        limit,
        page,
        depth: 0,
      })

      if (!res.docs.length) break

      for (const doc of res.docs) {
        const raw = doc as unknown as Record<string, unknown>
        const id = raw.id as number | string
        const createdAt =
          typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()
        const updatedAt =
          typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString()

        const existing = await payload.db.findVersions({
          collection: slug,
          limit: 1,
          pagination: false,
          where: {
            parent: {
              equals: id,
            },
          },
        })

        if (existing.docs.length) continue

        const versionData = Object.fromEntries(
          Object.entries(raw).filter(([key]) => !internalKeys.has(key) && !key.startsWith('_')),
        )

        await payload.db.createVersion({
          autosave: false,
          collectionSlug: slug,
          createdAt,
          updatedAt,
          parent: id,
          versionData: {
            ...versionData,
            _status: 'draft',
          },
        })

        payload.logger.info(`Backfilled draft version for ${slug} -> ${id}`)
      }

      if (page * limit >= res.totalDocs) break
      page += 1
    }
  }

  payload.logger.info('Backfill complete.')
}
