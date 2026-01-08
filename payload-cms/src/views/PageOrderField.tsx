'use client'

import React, { useEffect, useState } from 'react'
import { Link, useField } from '@payloadcms/ui'
import PageOrderList from './PageOrderList'

export default function PageOrderField() {
  const [isCreate, setIsCreate] = useState<boolean | null>(null)
  const { value: titleValue } = useField<string>({ path: 'title' })
  const { value: idValue } = useField<string | number | null>({ path: 'id' })
  const { value: legacyIdValue } = useField<string | number | null>({ path: '_id' })
  const { setValue: setOrderValue, value: orderValue } = useField<number>({
    path: 'navOrder',
  })

  const hasId = Boolean(idValue ?? legacyIdValue)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsCreate(window.location.pathname.includes('/create'))
  }, [])

  const pendingTitle = hasId
    ? null
    : typeof titleValue === 'string' && titleValue.trim().length > 0
      ? titleValue.trim()
      : 'Untitled page'
  const pendingOrder =
    typeof orderValue === 'number' && !Number.isNaN(orderValue) ? orderValue : null

  if (isCreate === false || hasId) {
    return (
      <div style={{ margin: '6px 0 20px', fontSize: 12, color: 'var(--cpp-muted, #5b6f66)' }}>
        Reorder pages in{' '}
        <Link href="/admin/settings" style={{ color: 'inherit', textDecoration: 'underline' }}>
          Settings
        </Link>
        .
      </div>
    )
  }

  return (
    <div style={{ margin: '6px 0 20px' }}>
      <PageOrderList
        title="Reorder pages"
        showEditLinks
        showHint={false}
        pendingTitle={pendingTitle}
        pendingOrder={hasId ? null : pendingOrder}
        onPendingOrderChange={(order) => {
          if (!hasId && orderValue !== order) {
            setOrderValue(order)
          }
        }}
      />
    </div>
  )
}
