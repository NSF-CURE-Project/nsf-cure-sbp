import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import FeedbackHome from '@/views/feedback/FeedbackHome'
import type { FeedbackItem } from '@/views/feedback/FeedbackHomeCard'

type FeedbackDoc = {
  id?: string | number
  message?: string | null
  email?: string | null
  pageUrl?: string | null
  userAgent?: string | null
  read?: boolean | null
  createdAt?: string | null
}

const buildInbox = async (): Promise<FeedbackItem[]> => {
  const payload = await getPayload({ config: configPromise })

  // Custom route sits behind Payload's admin middleware. overrideAccess is
  // fine because the parent layout already gates by role.
  const result = await payload.find({
    collection: 'feedback',
    depth: 0,
    limit: 500,
    sort: '-createdAt',
    overrideAccess: true,
  })

  return (result.docs ?? []).map((doc) => {
    const entry = doc as FeedbackDoc
    return {
      id: String(entry.id ?? ''),
      message: entry.message ?? '',
      email: entry.email ?? null,
      pageUrl: entry.pageUrl ?? null,
      userAgent: entry.userAgent ?? null,
      read: entry.read === true,
      createdAt: entry.createdAt ?? null,
    }
  })
}

export default async function AdminFeedbackPage() {
  const inbox = await buildInbox()
  return (
    <Gutter>
      <div style={{ maxWidth: 1040, margin: '24px auto 80px' }}>
        <FeedbackHome initialFeedback={inbox} />
      </div>
    </Gutter>
  )
}
