import React from 'react'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import UsersDirectory, { type AdminUserRow } from '@/views/users/UsersDirectory'

type UserDoc = {
  id?: string | number
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  role?: string | null
  adminTheme?: string | null
  updatedAt?: string | null
}

const buildDirectory = async (): Promise<AdminUserRow[]> => {
  const payload = await getPayload({ config: configPromise })

  // Custom route sits behind Payload's admin middleware; overrideAccess is
  // fine because the parent layout already gates by role.
  const result = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 500,
    sort: 'email',
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
      adminTheme: entry.adminTheme ?? null,
      updatedAt: entry.updatedAt ?? null,
    }
  })
}

export default async function AdminUsersDirectoryPage() {
  const users = await buildDirectory()
  return (
    <Gutter>
      <div style={{ maxWidth: 960, margin: '24px auto 80px' }}>
        <UsersDirectory users={users} />
      </div>
    </Gutter>
  )
}
