'use client'

import React, { useMemo, useState } from 'react'

type FaqItem = {
  id: string
  category: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    id: 'program-purpose',
    category: 'Program',
    question: 'What is NSF CURE SBP?',
    answer:
      'NSF CURE SBP is a Cal Poly Pomona learning platform for students working through course-based undergraduate research and supporting statics, review, and mechanics topics.',
  },
  {
    id: 'who-can-use',
    category: 'Access',
    question: 'Who can use the learning platform?',
    answer:
      'Students enrolled in participating courses can use the learning materials assigned by their instructor. Staff, professors, and administrators use the admin portal to manage content and review progress.',
  },
  {
    id: 'signin-required',
    category: 'Access',
    question: 'Do I need to sign in to view lessons?',
    answer:
      'Some public resources may be available without an account, but course lessons, quizzes, progress tracking, and classroom materials generally require sign-in.',
  },
  {
    id: 'find-lessons',
    category: 'Learning',
    question: 'Where do I find lessons and study topics?',
    answer:
      'Use Learning from the top navigation or choose a study-topic area from the left sidebar. Lessons are organized by chapter and can include readings, videos, quizzes, and practice activities.',
  },
  {
    id: 'progress',
    category: 'Learning',
    question: 'How is my progress tracked?',
    answer:
      'Progress is tracked as you open and complete assigned lessons and quizzes. Your instructor may use this information to understand class pacing and identify topics that need additional support.',
  },
  {
    id: 'quiz-retake',
    category: 'Quizzes',
    question: 'Can I retake quizzes?',
    answer:
      'Quiz attempt rules depend on how the lesson was configured by your instructor. If a quiz does not allow another attempt, ask your instructor or course staff for guidance.',
  },
  {
    id: 'technical-issue',
    category: 'Support',
    question: 'What should I do if something is not loading?',
    answer:
      'Refresh the page first, then try signing out and back in. If the issue continues, send the page URL, your browser, and a short description of what happened to the course staff.',
  },
  {
    id: 'feedback',
    category: 'Support',
    question: 'How do I report a mistake or send feedback?',
    answer:
      'Use the feedback option on the site when available, or contact the course team with the lesson title and a brief description of the issue.',
  },
]

const categories = ['All', 'Program', 'Access', 'Learning', 'Quizzes', 'Support']
const sidebarTopics = ['Study Topics', 'Review', 'Statics', 'Mechanics of Materials']

export default function FaqPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [openId, setOpenId] = useState('program-purpose')

  const normalizedQuery = query.trim().toLowerCase()
  const filteredFaqs = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const matchesQuery =
        !normalizedQuery ||
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [activeCategory, normalizedQuery])

  return (
    <main className="faq-page">
      <header className="faq-topbar">
        <a className="faq-brand" href="/" aria-label="NSF CURE SBP home">
          <img src="/assets/logos/cpp_green.png" alt="Cal Poly Pomona" className="faq-brand__cpp" />
          <img src="/assets/logos/nsf.png" alt="NSF" className="faq-brand__nsf" />
          <span>NSF CURE SBP</span>
        </a>

        <nav className="faq-nav" aria-label="Primary navigation">
          <a href="/">Home</a>
          <a href="/learning">Learning</a>
          <a href="/resources">Resources</a>
          <a href="/contact-us">Contact Us</a>
        </nav>

        <div className="faq-topbar__actions">
          <label className="faq-sr-only" htmlFor="program-search">
            Search program
          </label>
          <div className="faq-search">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input id="program-search" type="search" placeholder="Search program..." />
            <kbd>⌘K</kbd>
          </div>
          <button className="faq-theme-button" type="button" aria-label="Toggle theme">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M21 13.2A8.2 8.2 0 0 1 10.8 3 7 7 0 1 0 21 13.2Z" />
            </svg>
          </button>
          <a className="faq-signin" href="/admin">
            Sign In
          </a>
        </div>
      </header>

      <div className="faq-layout">
        <aside className="faq-sidebar" aria-label="Study topics">
          <div className="faq-sidebar__head">
            <span>Study Topics</span>
            <button type="button" aria-label="Collapse study topics">
              ‹
            </button>
          </div>
          <nav>
            {sidebarTopics.slice(1).map((topic) => (
              <a href="/learning" key={topic}>
                {topic}
              </a>
            ))}
          </nav>
        </aside>

        <section className="faq-content" aria-labelledby="faq-title">
          <div className="faq-kicker">Support</div>
          <h1 id="faq-title">Frequently asked questions</h1>
          <p className="faq-lede">
            Quick answers for students and instructors using the NSF CURE SBP learning platform.
          </p>

          <div className="faq-tools">
            <label className="faq-sr-only" htmlFor="faq-search">
              Search FAQs
            </label>
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search questions..."
            />
            <div className="faq-category-tabs" role="group" aria-label="Filter FAQ category">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  data-active={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="faq-list">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item) => {
                const open = openId === item.id
                return (
                  <article className="faq-item" key={item.id}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? '' : item.id)}
                    >
                      <span>
                        <span className="faq-item__category">{item.category}</span>
                        <span className="faq-item__question">{item.question}</span>
                      </span>
                      <span className="faq-item__chevron" aria-hidden="true">
                        {open ? '−' : '+'}
                      </span>
                    </button>
                    {open ? <p>{item.answer}</p> : null}
                  </article>
                )
              })
            ) : (
              <div className="faq-empty">No FAQ entries match the current search.</div>
            )}
          </div>
        </section>
      </div>

      <style>{`
        .faq-page {
          min-height: 100vh;
          background: #ffffff;
          color: #0f172a;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          line-height: 1.5;
        }

        .faq-page *,
        .faq-page *::before,
        .faq-page *::after {
          box-sizing: border-box;
        }

        .faq-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .faq-topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 28px;
          min-height: 86px;
          border-bottom: 1px solid #e5ebf3;
          background: rgba(255, 255, 255, 0.96);
          padding: 0 30px;
          backdrop-filter: blur(14px);
        }

        .faq-brand {
          display: inline-flex;
          align-items: center;
          gap: 22px;
          color: #0f172a;
          font-size: 27px;
          font-weight: 800;
          letter-spacing: -0.02em;
          text-decoration: none;
          white-space: nowrap;
        }

        .faq-brand img {
          display: block;
          object-fit: contain;
        }

        .faq-brand__cpp {
          width: 138px;
          height: 64px;
        }

        .faq-brand__nsf {
          width: 58px;
          height: 58px;
        }

        .faq-nav {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .faq-nav a {
          color: #0b5135;
          font-size: 18px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .faq-nav a:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .faq-topbar__actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .faq-search {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 290px;
          height: 42px;
          border: 1px solid #dfe7f1;
          border-radius: 4px;
          background: #fbfdff;
          padding: 0 10px 0 14px;
          color: #65758b;
        }

        .faq-search svg,
        .faq-theme-button svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .faq-search input {
          min-width: 0;
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: #0f172a;
          font: inherit;
          font-size: 18px;
        }

        .faq-search input::placeholder {
          color: #718096;
        }

        .faq-search kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 26px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: #ffffff;
          color: #475569;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 1px 1px rgba(15, 23, 42, 0.04);
        }

        .faq-theme-button {
          display: inline-flex;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border: 1px solid #dfe7f1;
          border-radius: 999px;
          background: #ffffff;
          color: #0f172a;
          cursor: pointer;
        }

        .faq-signin {
          display: inline-flex;
          min-width: 96px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid #dfe7f1;
          border-radius: 4px;
          background: #f8fafc;
          color: #0f172a;
          font-size: 18px;
          font-weight: 700;
          text-decoration: none;
        }

        .faq-layout {
          display: grid;
          grid-template-columns: 344px minmax(0, 1fr);
          min-height: calc(100vh - 86px);
        }

        .faq-sidebar {
          border-right: 1px solid #f0f3f8;
          background: #fafbfc;
          padding: 18px 20px;
        }

        .faq-sidebar__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #748094;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .faq-sidebar__head button {
          border: 0;
          background: transparent;
          color: #748094;
          cursor: pointer;
          font-size: 28px;
          line-height: 1;
        }

        .faq-sidebar nav {
          display: grid;
          gap: 30px;
          margin-top: 36px;
          padding-left: 16px;
        }

        .faq-sidebar a {
          color: #748094;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-decoration: none;
          text-transform: uppercase;
        }

        .faq-sidebar a:hover {
          color: #0b5135;
        }

        .faq-content {
          width: min(920px, calc(100% - 48px));
          margin: 0 auto;
          padding: 92px 0 80px;
        }

        .faq-kicker {
          color: #087f5b;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.28em;
          text-align: center;
          text-transform: uppercase;
        }

        .faq-content h1 {
          margin: 14px 0 0;
          color: #0f172a;
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 800;
          line-height: 1.05;
          text-align: center;
        }

        .faq-lede {
          max-width: 680px;
          margin: 20px auto 0;
          color: #56657a;
          font-size: 21px;
          line-height: 1.45;
          text-align: center;
        }

        .faq-tools {
          display: grid;
          gap: 16px;
          margin-top: 42px;
        }

        .faq-tools input {
          width: 100%;
          min-height: 52px;
          border: 1px solid #dfe7f1;
          border-radius: 8px;
          background: #ffffff;
          padding: 0 16px;
          color: #0f172a;
          font: inherit;
          font-size: 16px;
          outline: none;
          transition: border-color 140ms ease, box-shadow 140ms ease;
        }

        .faq-tools input:focus {
          border-color: #087f5b;
          box-shadow: 0 0 0 4px rgba(8, 127, 91, 0.12);
        }

        .faq-category-tabs {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }

        .faq-category-tabs button {
          border: 1px solid #dfe7f1;
          border-radius: 999px;
          background: #ffffff;
          padding: 8px 14px;
          color: #475569;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
        }

        .faq-category-tabs button[data-active='true'] {
          border-color: #087f5b;
          background: #087f5b;
          color: #ffffff;
        }

        .faq-list {
          display: grid;
          gap: 12px;
          margin-top: 26px;
        }

        .faq-item {
          border: 1px solid #dfe7f1;
          border-radius: 10px;
          background: #ffffff;
          overflow: hidden;
        }

        .faq-item button {
          display: grid;
          width: 100%;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: center;
          border: 0;
          background: transparent;
          padding: 20px 22px;
          color: inherit;
          cursor: pointer;
          font: inherit;
          text-align: left;
        }

        .faq-item button:hover {
          background: #f8fafc;
        }

        .faq-item__category {
          display: block;
          margin-bottom: 4px;
          color: #087f5b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .faq-item__question {
          display: block;
          color: #0f172a;
          font-size: 18px;
          font-weight: 800;
          line-height: 1.35;
        }

        .faq-item__chevron {
          display: inline-flex;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          border: 1px solid #dfe7f1;
          border-radius: 999px;
          color: #0b5135;
          font-size: 22px;
          font-weight: 700;
        }

        .faq-item p {
          margin: 0;
          border-top: 1px solid #edf2f7;
          padding: 0 22px 20px;
          color: #56657a;
          font-size: 16px;
          line-height: 1.65;
        }

        .faq-empty {
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          padding: 26px;
          color: #56657a;
          text-align: center;
        }

        @media (max-width: 1180px) {
          .faq-topbar {
            grid-template-columns: 1fr auto;
            gap: 16px;
          }

          .faq-nav {
            display: none;
          }

          .faq-search {
            width: 250px;
          }
        }

        @media (max-width: 900px) {
          .faq-topbar {
            position: static;
            grid-template-columns: 1fr;
            align-items: start;
            padding: 16px 20px;
          }

          .faq-brand {
            gap: 14px;
            font-size: 22px;
          }

          .faq-brand__cpp {
            width: 112px;
            height: 52px;
          }

          .faq-brand__nsf {
            width: 46px;
            height: 46px;
          }

          .faq-topbar__actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .faq-search {
            flex: 1 1 260px;
          }

          .faq-layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .faq-sidebar {
            display: none;
          }

          .faq-content {
            width: min(100% - 32px, 780px);
            padding-top: 52px;
          }
        }

        @media (max-width: 560px) {
          .faq-topbar__actions {
            display: grid;
            grid-template-columns: 1fr auto auto;
          }

          .faq-search {
            grid-column: 1 / -1;
            width: 100%;
          }

          .faq-content h1 {
            font-size: 38px;
          }

          .faq-lede {
            font-size: 18px;
          }
        }
      `}</style>
    </main>
  )
}
