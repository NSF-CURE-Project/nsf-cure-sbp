import React from 'react'
import QuestionStatsView from '@/views/QuestionStatsView'

export default async function AdminQuestionStatsPage({
  params,
}: {
  params: Promise<{ questionId: string }>
}) {
  const { questionId } = await params
  return <QuestionStatsView questionId={questionId} />
}
