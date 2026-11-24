import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import SiteManagementWorkspace, {
  type SiteUserRow,
} from '@/views/admin/SiteManagementWorkspace'

type UserDoc = {
  id?: string | number
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  role?: string | null
  updatedAt?: string | null
}

const loadUsers = async (): Promise<SiteUserRow[]> => {
  const payload = await getPayload({ config: configPromise })

  // Custom admin route — Payload's admin layout already gates by role, so
  // overrideAccess: true is fine here for an admin-managed listing.
  const result = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 500,
    sort: '-updatedAt',
    overrideAccess: true,
  })

  return (result.docs ?? []).map((doc) => {
    const entry = doc as UserDoc
    const rawRole = entry.role
    const role =
      rawRole === 'admin' || rawRole === 'professor' || rawRole === 'staff' ? rawRole : null
    return {
      id: String(entry.id ?? ''),
      email: entry.email ?? '',
      firstName: entry.firstName ?? null,
      lastName: entry.lastName ?? null,
      role,
      updatedAt: entry.updatedAt ?? null,
    }
  })
}

export default async function AdminSettingsPage() {
  const users = await loadUsers()
  return (
    <Gutter>
      <div style={{ maxWidth: 1000, margin: '24px auto 80px' }}>
        <SiteManagementWorkspace initialUsers={users} />
      </div>
    </Gutter>
  )
}
