'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import PageOrderList from './PageOrderList'

export default function PageOrderField() {
  const { value: titleValue } = useField<string>({ path: 'title' })
  const { setValue: setOrderValue, value: orderValue } = useField<number>({
    path: 'navOrder',
  })

  const pendingTitle =
    typeof titleValue === 'string' && titleValue.trim().length > 0
      ? titleValue.trim()
      : 'Untitled page'

  return (
    <div style={{ margin: '6px 0 20px' }}>
      <PageOrderList
        title="Reorder pages"
        showEditLinks
        pendingTitle={pendingTitle}
        pendingOrder={typeof orderValue === 'number' ? orderValue : null}
        onPendingOrderChange={(order) => {
          if (orderValue !== order) {
            setOrderValue(order)
          }
        }}
      />
    </div>
  )
}
