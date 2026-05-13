import React from 'react'
import { Gutter } from '@payloadcms/ui'
import CreatePageGuide from '@/views/pages/CreatePageGuide'

export default function CreatePageRoute() {
  return (
    <Gutter>
      <div style={{ maxWidth: 880, margin: '24px auto 80px' }}>
        <CreatePageGuide />
      </div>
    </Gutter>
  )
}
