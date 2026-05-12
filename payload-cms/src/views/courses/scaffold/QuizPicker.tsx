'use client'

import React from 'react'
import RelationshipPicker from './RelationshipPicker'
import { searchQuizzes } from '../courses-order-api'

type QuizPickerProps = {
  value: string | number | null
  onChange: (next: string | number | null) => void
}

export default function QuizPicker({ value, onChange }: QuizPickerProps) {
  return (
    <RelationshipPicker
      value={value}
      onChange={onChange}
      searchFn={searchQuizzes}
      noun="quiz"
    />
  )
}
