import React from 'react'
import ConceptDetailView from '@/views/ConceptDetailView'

export default async function AdminConceptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ConceptDetailView slug={slug} />
}
