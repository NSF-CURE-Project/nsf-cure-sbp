import React from 'react'
import PrePostDetailView from '@/views/PrePostDetailView'

export default async function AdminPrePostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PrePostDetailView id={id} />
}
