import React from 'react'
import { notFound } from 'next/navigation'
import { Gutter } from '@payloadcms/ui'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import QuizEditEditor from '@/views/quizzes/QuizEditEditor'
import type {
  QuizDifficulty,
  QuizScoring,
} from '@/views/quizzes/quiz-api'

// Custom edit screen for a quiz. Replaces Payload's default
// /admin/collections/quizzes/[id] form (which is now hidden) so the editing
// surface matches the rest of the curriculum chrome. The questions
// relationship is rendered read-only here; bulk question management
// continues to live in the Quiz Bank where the existing
// QuizQuestionPickerField is wired.

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

const extractRelId = (value: unknown): string | null => {
  if (value == null) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in (value as object)) {
    const inner = (value as { id?: unknown }).id
    if (typeof inner === 'string' || typeof inner === 'number') return String(inner)
  }
  return null
}

const extractRelTitle = (value: unknown): string => {
  if (value && typeof value === 'object' && 'title' in (value as object)) {
    const title = (value as { title?: unknown }).title
    if (typeof title === 'string') return title
  }
  return ''
}

const normalizeDifficulty = (value: unknown): QuizDifficulty => {
  if (
    value === 'intro' ||
    value === 'easy' ||
    value === 'medium' ||
    value === 'hard'
  ) {
    return value
  }
  return ''
}

const normalizeScoring = (value: unknown): QuizScoring => {
  if (value === 'all-or-nothing' || value === 'partial') return value
  return 'per-question'
}

const normalizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.map((entry) => asString(entry)).filter(Boolean)
}

const normalizeStatus = (value: unknown): 'draft' | 'published' | null => {
  if (value === 'draft' || value === 'published') return value
  return null
}

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = await params
  const payload = await getPayload({ config: configPromise })

  // depth: 2 so course, chapter, and quiz-question relationships come back
  // hydrated with titles for read-only display.
  const quiz = await payload
    .findByID({
      collection: 'quizzes',
      id: quizId,
      depth: 2,
      overrideAccess: true,
      draft: true,
    })
    .catch(() => null)

  if (!quiz) notFound()

  const doc = quiz as unknown as Record<string, unknown>

  // Fetch the course + chapter lists for the dropdowns. Same overrideAccess
  // path the rest of the admin uses — the page itself is staff-only via the
  // /admin shell, so we don't need the access layer here.
  const [coursesResult, chaptersResult] = await Promise.all([
    payload.find({
      collection: 'classes',
      limit: 500,
      depth: 0,
      sort: 'title',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'chapters',
      limit: 1000,
      depth: 0,
      sort: 'chapterNumber',
      overrideAccess: true,
    }),
  ])

  const courses = coursesResult.docs.map((row) => {
    const r = row as { id?: string | number; title?: string }
    return { id: String(r.id ?? ''), title: r.title ?? 'Untitled course' }
  })

  const chapters = chaptersResult.docs.map((row) => {
    const r = row as {
      id?: string | number
      title?: string
      class?: string | number | { id?: string | number } | null
    }
    return {
      id: String(r.id ?? ''),
      title: r.title ?? 'Untitled chapter',
      courseId: extractRelId(r.class),
    }
  })

  const rawQuestions = Array.isArray(doc.questions) ? doc.questions : []
  const questions = rawQuestions
    .map((q) => ({
      id: extractRelId(q) ?? '',
      title: extractRelTitle(q),
    }))
    .filter((q) => q.id !== '')

  return (
    <Gutter>
      <div style={{ maxWidth: 1500, margin: '0 auto 80px' }}>
        <QuizEditEditor
          quizId={quizId}
          courses={courses}
          chapters={chapters}
          initial={{
            title: asString(doc.title),
            description: asString(doc.description),
            courseId: extractRelId(doc.course),
            chapterId: extractRelId(doc.chapter),
            tags: normalizeTags(doc.tags),
            difficulty: normalizeDifficulty(doc.difficulty),
            scoring: normalizeScoring(doc.scoring),
            shuffleQuestions: Boolean(doc.shuffleQuestions),
            shuffleOptions: Boolean(doc.shuffleOptions),
            timeLimitSec:
              typeof doc.timeLimitSec === 'number' && Number.isFinite(doc.timeLimitSec)
                ? doc.timeLimitSec
                : null,
            status: normalizeStatus(doc._status),
            questions,
          }}
        />
      </div>
    </Gutter>
  )
}
