import React from 'react'
import { notFound } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import PageScaffoldEditor from '@/views/pages/PageScaffoldEditor'

type PageDoc = {
  id?: string | number
  title?: string
  slug?: string
  layout?: unknown
  _status?: 'draft' | 'published'
}

export default async function EditPageRoute({
  params,
}: {
  params: Promise<{ pageId: string }>
}) {
  const { pageId } = await params
  const payload = await getPayload({ config: configPromise })

  // draft: true so we load the working draft (which is what the editor
  // mutates). depth: 0 — the editor reads the raw layout array; relations
  // inside blocks (quiz, media) are picked separately by their own pickers.
  const page = await payload
    .findByID({
      collection: 'pages',
      id: pageId,
      depth: 0,
      overrideAccess: true,
      draft: true,
    })
    .catch(() => null)

  if (!page) notFound()

  const doc = page as PageDoc

  return (
    <Gutter>
      <div style={{ maxWidth: 1500, margin: '0 auto 80px' }}>
        <PageScaffoldEditor
          pageId={String(doc.id ?? pageId)}
          initialTitle={doc.title ?? ''}
          initialSlug={doc.slug ?? ''}
          initialStatus={doc._status === 'published' ? 'published' : 'draft'}
          initialLayout={doc.layout ?? []}
        />
      </div>
    </Gutter>
  )
}
