'use client'

import React from 'react'
import RelationshipPicker from './RelationshipPicker'
import { searchProblemSets } from '../courses-order-api'

type ProblemSetPickerProps = {
  value: string | number | null
  onChange: (next: string | number | null) => void
}

export default function ProblemSetPicker({ value, onChange }: ProblemSetPickerProps) {
  return (
    <RelationshipPicker
      value={value}
      onChange={onChange}
      searchFn={searchProblemSets}
      noun="problem set"
    />
  )
}
