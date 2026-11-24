import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import PagesHome from '@/views/pages/PagesHome'
import type { PageCatalogItem } from '@/views/pages/PagesHomeCard'

type PageDoc = {
  id?: string | number
  title?: string
  slug?: string
  navOrder?: number | null
  hidden?: boolean | null
  layout?: unknown[]
  _status?: 'draft' | 'published'
  updatedAt?: string | null
}

const buildCatalog = async (): Promise<PageCatalogItem[]> => {
  const payload = await getPayload({ config: configPromise })

  // depth: 0 — we only need the page-level fields for the list. We pass
  // draft: true so unpublished drafts surface in the listing; the card
  // tags each row by `_status` so staff can see what's live.
  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 200,
    sort: 'navOrder',
    overrideAccess: true,
    draft: true,
  })

  return (result.docs ?? []).map((doc) => {
    const page = doc as PageDoc
    const layout = Array.isArray(page.layout) ? page.layout : []
    return {
      id: String(page.id ?? ''),
      title: page.title ?? 'Untitled page',
      slug: page.slug ?? '',
      status: page._status === 'published' ? 'published' : 'draft',
      navOrder: typeof page.navOrder === 'number' ? page.navOrder : null,
      hidden: Boolean(page.hidden),
      blockCount: layout.length,
      updatedAt: page.updatedAt ?? null,
    }
  })
}

export default async function AdminPagesPage() {
  const catalog = await buildCatalog()
  return (
    <Gutter>
      <div style={{ maxWidth: 1080, margin: '24px auto 80px' }}>
        <PagesHome initialPages={catalog} />
      </div>
    </Gutter>
  )
}
