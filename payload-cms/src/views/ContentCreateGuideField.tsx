'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type GuideConfig = {
  eyebrow: string
  heading: string
  description: string
  chips: string[]
  cards: { title: string; body: string }[]
  backHref: string
  backLabel: string
}

const panelStyle: React.CSSProperties = {
  margin: '4px 0 20px',
  borderRadius: 14,
  border: '1px solid var(--admin-surface-border)',
  background: 'linear-gradient(160deg, #ffffff 0%, #edf5ff 62%, #e7f7ff 100%)',
  boxShadow: '0 1px 0 rgba(18, 65, 147, 0.08)',
  padding: '16px 18px',
  display: 'grid',
  gap: 14,
}

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: '#0b61b9',
  fontWeight: 800,
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  color: '#0b4aaf',
  background: 'rgba(21, 83, 207, 0.1)',
  border: '1px solid rgba(21, 83, 207, 0.16)',
}

const backLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 14px',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
  color: 'var(--cpp-ink)',
  background: 'rgba(255, 255, 255, 0.92)',
  border: '1px solid rgba(21, 83, 207, 0.24)',
  boxShadow: '0 6px 14px rgba(15, 23, 42, 0.08)',
  textDecoration: 'none',
}

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--admin-surface-border)',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: '12px 14px',
  display: 'grid',
  gap: 6,
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
    backHref: '/admin/collections/pages',
    backLabel: 'Back to Pages',
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
    if (!collection || !isCreate) return null
    return guideByCollection[collection] ?? null
  }, [pathname])

  if (!guide) return null

  return (
    <section style={panelStyle}>
      <div style={eyebrowStyle}>{guide.eyebrow}</div>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cpp-ink)' }}>
          {guide.heading}
        </div>
        <div style={{ fontSize: 13, color: 'var(--cpp-muted)', lineHeight: 1.6, maxWidth: 860 }}>
          {guide.description}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {guide.chips.map((chip) => (
          <span key={chip} style={chipStyle}>
            {chip}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {guide.cards.map((card) => (
          <div key={card.title} style={cardStyle}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--cpp-ink)' }}>
              {card.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--cpp-muted)', lineHeight: 1.55 }}>
              {card.body}
            </div>
          </div>
        ))}
      </div>

      <div>
        <Link href={guide.backHref} aria-label={guide.backLabel} style={backLinkStyle}>
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
    </section>
  )
}
