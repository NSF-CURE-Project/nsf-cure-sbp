import React from 'react'
import QuizStatsView from '@/views/QuizStatsView'

export default async function AdminQuizStatsPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = await params
  return <QuizStatsView quizId={quizId} />
}
