import React from 'react'
import { Gutter } from '@payloadcms/ui'
import CreateCourseGuide from '@/views/courses/CreateCourseGuide'

export default function CreateCoursePage() {
  return (
    <Gutter>
      <div style={{ maxWidth: 880, margin: '24px auto 80px' }}>
        <CreateCourseGuide />
      </div>
    </Gutter>
  )
}
