import type { Payload } from 'payload'

type Mapping = {
  globalSlug: string
  pageSlug: string
  title: string
}

const mappings: Mapping[] = [
  { globalSlug: 'home-page', pageSlug: 'home', title: 'Home Page' },
  { globalSlug: 'resources-page', pageSlug: 'resources', title: 'Resources Page' },
  { globalSlug: 'contact-page', pageSlug: 'contact-us', title: 'Contact Page' },
  { globalSlug: 'getting-started', pageSlug: 'getting-started', title: 'Getting Started' },
]

const layoutFrom = (data: unknown) => {
  const layout = (data as { layout?: unknown })?.layout
  return Array.isArray(layout) ? layout : []
}

const layoutsMatch = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

export default async function migrateGlobalsToPages(payload: Payload) {
  payload.logger.info('Migrating globals to pages collection...')

  for (const mapping of mappings) {
    const published = await payload
      .findGlobal({
        slug: mapping.globalSlug,
        draft: false,
        depth: 0,
      })
      .catch(() => null)

    const draft = await payload
      .findGlobal({
        slug: mapping.globalSlug,
        draft: true,
        depth: 0,
      })
      .catch(() => null)

    const publishedLayout = layoutFrom(published)
    const draftLayout = layoutFrom(draft)

    const existing = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: mapping.pageSlug,
        },
      },
      depth: 0,
      limit: 1,
      draft: true,
    })

    let pageId = existing.docs[0]?.id as string | undefined

    if (published) {
      const data = {
        title: mapping.title,
        slug: mapping.pageSlug,
        layout: publishedLayout,
        _status: 'published',
      }

      if (pageId) {
        await payload.update({
          collection: 'pages',
          id: pageId,
          data,
          draft: false,
        })
      } else {
        const created = await payload.create({
          collection: 'pages',
          data,
          draft: false,
        })
        pageId = created.id as string
      }
    }

    const draftIsDraft = (draft as { _status?: string })?._status === 'draft'
    const needsDraft = draftIsDraft && !layoutsMatch(draftLayout, publishedLayout)

    if (draft && needsDraft) {
      const data = {
        title: mapping.title,
        slug: mapping.pageSlug,
        layout: draftLayout,
        _status: 'draft',
      }

      if (pageId) {
        await payload.update({
          collection: 'pages',
          id: pageId,
          data,
          draft: true,
        })
      } else {
        const created = await payload.create({
          collection: 'pages',
          data,
          draft: true,
        })
        pageId = created.id as string
      }
    }

    if (!published && !draft) {
      payload.logger.warn(`Skipping ${mapping.globalSlug} (no global data found).`)
      continue
    }

    payload.logger.info(`Migrated ${mapping.globalSlug} -> pages/${mapping.pageSlug}`)
  }

  payload.logger.info('Globals to pages migration complete.')
}
