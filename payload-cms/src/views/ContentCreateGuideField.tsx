'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AdminCard,
  AdminCardHeader,
  AdminChipRow,
  AdminMiniCard,
  adminPrimaryActionStyle,
} from '@/views/admin/AdminCardPrimitives'

type GuideConfig = {
  eyebrow: string
  heading: string
  description: string
  chips: string[]
  cards: { title: string; body: string }[]
  backHref: string
  backLabel: string
  compactTitle: string
  compactBody: string
}

const guideByCollection: Record<string, GuideConfig> = {
  chapters: {
    eyebrow: 'Create Chapter',
    heading: 'Add a chapter inside a course.',
    description:
      'Use this page to create a chapter within the selected course. After you save, return to Course Workspace to add lessons and continue the sequence.',
    chips: ['Course required', 'Chapter title required', 'Lessons added after save'],
    cards: [
      {
        title: 'Fill in now',
        body: 'Enter the chapter title, confirm the course, and add a chapter number if you want the chapter ordered clearly in the sidebar.',
      },
      {
        title: 'Not on this page',
        body: 'You do not need to build lesson content yet. Lessons are added after the chapter is saved.',
      },
      {
        title: 'What happens next',
        body: 'Save the chapter, go back to Course Workspace, and use Add lesson to start building the actual lesson pages.',
      },
    ],
    backHref: '/admin/courses',
    backLabel: 'Back to Course Workspace',
    compactTitle: 'Chapter editing guidance',
    compactBody:
      'Update the chapter title, number, or course assignment here. Add and revise lesson content from the related lesson records, then save before leaving the page.',
  },
  lessons: {
    eyebrow: 'Create Lesson',
    heading: 'Build lesson content here.',
    description:
      'Use this page to name the lesson, confirm the chapter, and build the content in Page Layout. If you already have a lesson document, paste it into Rich Text blocks and organize it into sections.',
    chips: ['Title required', 'Chapter required', 'Build in Page Layout'],
    cards: [
      {
        title: 'Fill in now',
        body: 'Enter the lesson title and confirm the chapter. The lesson slug is created automatically for you.',
      },
      {
        title: 'Best workflow',
        body: 'Add a Rich Text block first, paste content section by section, then add videos, lists, buttons, or quizzes where they belong in the lesson flow.',
      },
      {
        title: 'What happens next',
        body: 'Save Draft while you work, preview before publishing, and return to Course Workspace when you are ready to move on to the next lesson.',
      },
    ],
    backHref: '/admin/courses',
    backLabel: 'Back to Course Workspace',
    compactTitle: 'Lesson editing reminder',
    compactBody:
      'Continue building in Page Layout, keep content organized in blocks, and preview before publishing changes.',
  },
  quizzes: {
    eyebrow: 'Create Quiz',
    heading: 'Create a reusable lesson quiz.',
    description:
      'Use this page to build a quiz that can be attached inside lesson content. Add questions from the bank or create new ones, then review the quiz before publishing.',
    chips: ['Title required', 'Add questions', 'Reusable in lessons'],
    cards: [
      {
        title: 'Fill in now',
        body: 'Enter the quiz title and optional description. Course and chapter tags help staff filter quizzes later, but they are not required.',
      },
      {
        title: 'Add questions',
        body: 'Use the question picker to pull in existing questions or create new ones. A publishable quiz needs questions with enough answer choices and at least one correct answer.',
      },
      {
        title: 'What happens next',
        body: 'Preview the quiz, adjust settings like shuffle and time limit, then attach it to a lesson using a Quiz block in Page Layout.',
      },
    ],
    backHref: '/admin/quiz-bank',
    backLabel: 'Back to Quiz Bank',
    compactTitle: 'Quiz editing reminder',
    compactBody:
      'Review question quality, settings, and preview behavior before publishing. Attach the quiz to lessons from a Quiz block.',
  },
  pages: {
    eyebrow: 'Create Page',
    heading: 'Build a standalone site page here.',
    description:
      'Use this page to create a public-facing page and build its content with sections in Page Layout. If this should be the homepage, use Home as the page title.',
    chips: ['Title required', 'Build in Page Layout', 'Nav order managed elsewhere'],
    cards: [
      {
        title: 'Fill in now',
        body: 'Enter the page title first. The slug is generated automatically, and using Home creates the homepage slug.',
      },
      {
        title: 'Best workflow',
        body: 'Build the page with reusable blocks such as Hero, Section Title, Rich Text, Video, Lists, Resources, and Buttons instead of putting everything in one block.',
      },
      {
        title: 'What happens next',
        body: 'Save Draft while building, preview the layout before publishing, and reorder pages from the page ordering workspace when needed.',
      },
    ],
    backHref: '/admin/pages',
    backLabel: 'Back to Pages',
    compactTitle: 'Page editing reminder',
    compactBody:
      'Keep the page organized in reusable layout blocks, save draft while working, and preview the public layout before publishing.',
  },
}

const getCollectionFromPath = (pathname: string) => {
  const match = pathname.match(/^\/admin\/collections\/([^/]+)\/(create|[^/]+)$/)
  if (!match) return { collection: null, isCreate: false }
  return { collection: match[1] ?? null, isCreate: match[2] === 'create' }
}

export default function ContentCreateGuideField() {
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setPathname(window.location.pathname)
  }, [])

  const guide = useMemo(() => {
    const { collection, isCreate } = getCollectionFromPath(pathname)
    if (!collection) return null
    const config = guideByCollection[collection] ?? null
    if (!config) return null
    return { ...config, isCreate }
  }, [pathname])

  if (!guide) return null

  if (!guide.isCreate) {
    const isCompactChapterGuide = pathname.includes('/admin/collections/chapters/')

    return (
      <AdminCard
        variant="meta"
        style={{
          margin: '4px 0 14px',
          padding: isCompactChapterGuide ? '12px 14px' : '16px 18px',
          gap: isCompactChapterGuide ? 6 : 8,
          borderRadius: isCompactChapterGuide ? 14 : 18,
        }}
      >
        <AdminCardHeader
          compact
          eyebrow={guide.eyebrow}
          title={guide.compactTitle}
          description={guide.compactBody}
        />
      </AdminCard>
    )
  }

  return (
    <AdminCard variant="info" style={{ margin: '4px 0 20px' }}>
      <AdminCardHeader eyebrow={guide.eyebrow} title={guide.heading} description={guide.description} />

      <AdminChipRow items={guide.chips} />

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {guide.cards.map((card) => (
          <AdminMiniCard key={card.title} title={card.title} body={card.body} />
        ))}
      </div>

      <div>
        <Link href={guide.backHref} aria-label={guide.backLabel} style={adminPrimaryActionStyle}>
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: 999,
              background: 'rgba(21, 83, 207, 0.1)',
              color: '#0b4aaf',
              flexShrink: 0,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 3.5L2 8m0 0l4.5 4.5M2 8h12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>{guide.backLabel}</span>
        </Link>
      </div>
    </AdminCard>
  )
}
