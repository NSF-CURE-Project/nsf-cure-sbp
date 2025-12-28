import type { Payload } from 'payload'

type PageSeed = {
  title: string
  slug: string
}

const seeds: PageSeed[] = [
  { title: 'Resources Page', slug: 'resources' },
  { title: 'Contact Page', slug: 'contact-us' },
  { title: 'Getting Started', slug: 'getting-started' },
]

export default async function seedPages(payload: Payload) {
  payload.logger.info('Seeding pages collection...')

  for (const seed of seeds) {
    const existing = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: seed.slug,
        },
      },
      limit: 1,
      depth: 0,
      draft: true,
    })

    if (existing.docs.length) {
      payload.logger.info(`Page already exists: ${seed.slug}`)
      continue
    }

    await payload.create({
      collection: 'pages',
      data: {
        title: seed.title,
        slug: seed.slug,
        layout: [],
        _status: 'published',
      },
      draft: false,
    })

    payload.logger.info(`Created page: ${seed.slug}`)
  }

  payload.logger.info('Page seeding complete.')
}
