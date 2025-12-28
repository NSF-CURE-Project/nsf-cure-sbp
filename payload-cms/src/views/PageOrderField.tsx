'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import PageOrderList from './PageOrderList'

export default function PageOrderField() {
  const { value: titleValue } = useField<string>({ path: 'title' })
  const { value: idValue } = useField<string | number | null>({ path: 'id' })
  const { value: legacyIdValue } = useField<string | number | null>({ path: '_id' })
  const { setValue: setOrderValue, value: orderValue } = useField<number>({
    path: 'navOrder',
  })

  const hasId = Boolean(idValue ?? legacyIdValue)
  const pendingTitle = hasId
    ? null
    : typeof titleValue === 'string' && titleValue.trim().length > 0
      ? titleValue.trim()
      : 'Untitled page'
  const pendingOrder =
    typeof orderValue === 'number' && !Number.isNaN(orderValue) ? orderValue : null

  return (
    <div style={{ margin: '6px 0 20px' }}>
      <PageOrderList
        title="Reorder pages"
        showEditLinks
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
