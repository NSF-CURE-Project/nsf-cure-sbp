'use client'

import React, { useMemo, useState } from 'react'

type FilterId = 'all' | 'not-started' | 'in-progress' | 'completed' | 'has-quiz'
type LessonType = 'VIDEO' | 'READING'
type LessonStatus = 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED'

type Lesson = {
  id: string
  number: string
  title: string
  type: LessonType
  time: string
  status: LessonStatus
  hasQuiz: boolean
}

type Chapter = {
  id: string
  label: string
  title: string
  lessonPace: string
  lessons: Lesson[]
}

const chapters: Chapter[] = [
  {
    id: 'chapter-1',
    label: 'CHAPTER 1',
    title: 'Force Vectors',
    lessonPace: '~8 min / lesson',
    lessons: [
      {
        id: '1-1',
        number: '1.1',
        title: 'Vector Operations',
        type: 'VIDEO',
        time: '~10 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
      {
        id: '1-2',
        number: '1.2',
        title: 'Vector Addition of Forces (Parallelogram Law)',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
      {
        id: '1-3',
        number: '1.3',
        title: 'Vector Addition of Forces (Law of Cosines)',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
      {
        id: '1-4',
        number: '1.4',
        title: 'Finding resultant Force, FR using components',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
      {
        id: '1-5',
        number: '1.5',
        title: 'Equilibrium of a Particle',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
      {
        id: '1-6',
        number: '1.6',
        title: 'Springs',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
    ],
  },
  {
    id: 'chapter-2',
    label: 'CHAPTER 2',
    title: 'Force System Resultants',
    lessonPace: '~8 min / lesson',
    lessons: [
      {
        id: '2-1',
        number: '2.1',
        title: 'Moment of a Force - Scalar Formulation',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
      {
        id: '2-2',
        number: '2.2',
        title: 'Moment of a Force - Vector Formulation',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
      {
        id: '2-3',
        number: '2.3',
        title: 'Principle of Moments',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
      {
        id: '2-4',
        number: '2.4',
        title: 'Resultant of a Force and Couple System',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
      {
        id: '2-5',
        number: '2.5',
        title: 'Distributed Loading',
        type: 'READING',
        time: '~8 min',
        status: 'NOT STARTED',
        hasQuiz: false,
      },
    ],
  },
]

const filterTabs: Array<{ id: FilterId; label: string; count: number }> = [
  { id: 'all', label: 'ALL', count: 15 },
  { id: 'not-started', label: 'NOT STARTED', count: 15 },
  { id: 'in-progress', label: 'IN PROGRESS', count: 0 },
  { id: 'completed', label: 'COMPLETED', count: 0 },
  { id: 'has-quiz', label: 'HAS QUIZ', count: 0 },
]

const matchesFilter = (lesson: Lesson, activeFilter: FilterId) => {
  if (activeFilter === 'all') return true
  if (activeFilter === 'not-started') return lesson.status === 'NOT STARTED'
  if (activeFilter === 'in-progress') return lesson.status === 'IN PROGRESS'
  if (activeFilter === 'completed') return lesson.status === 'COMPLETED'
  return lesson.hasQuiz
}

const normalizes = (value: string) => value.trim().toLowerCase()

export default function CurriculumDashboard() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'chapter-1': true,
    'chapter-2': false,
  })
  const [openedLessonId, setOpenedLessonId] = useState<string | null>(null)

  const normalizedQuery = normalizes(query)
  const visibleChapters = useMemo(() => {
    return chapters
      .map((chapter) => {
        const chapterMatches =
          !normalizedQuery ||
          normalizes(chapter.title).includes(normalizedQuery) ||
          normalizes(chapter.label).includes(normalizedQuery)

        const matchingLessons = chapter.lessons.filter((lesson) => {
          const queryMatches =
            !normalizedQuery ||
            chapterMatches ||
            normalizes(lesson.title).includes(normalizedQuery) ||
            normalizes(lesson.number).includes(normalizedQuery) ||
            normalizes(lesson.type).includes(normalizedQuery)

          return queryMatches && matchesFilter(lesson, activeFilter)
        })

        return {
          chapter,
          lessons: matchingLessons,
          chapterMatches,
        }
      })
      .filter(({ lessons, chapterMatches }) => {
        if (activeFilter === 'all' || activeFilter === 'not-started') {
          return chapterMatches || lessons.length > 0
        }

        return lessons.length > 0
      })
  }, [activeFilter, normalizedQuery])

  const openedLesson = chapters
    .flatMap((chapter) => chapter.lessons)
    .find((lesson) => lesson.id === openedLessonId)

  const toggleChapter = (chapterId: string) => {
    setExpanded((current) => ({ ...current, [chapterId]: !current[chapterId] }))
  }

  return (
    <main className="curriculum-dashboard">
      <div className="curriculum-shell">
        <label className="curriculum-sr-only" htmlFor="curriculum-search">
          Search chapters or lessons
        </label>
        <input
          id="curriculum-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chapters or lessons..."
          className="curriculum-search"
        />

        <div className="curriculum-tabs" role="group" aria-label="Filter lessons by status">
          {filterTabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className="curriculum-tab"
              data-active={activeFilter === tab.id}
              onClick={() => setActiveFilter(tab.id)}
              aria-pressed={activeFilter === tab.id}
            >
              <span>{tab.label}</span>
              <span className="curriculum-tab__count">{tab.count}</span>
            </button>
          ))}
        </div>

        <section className="chapter-stack" aria-label="Course chapters">
          {visibleChapters.length > 0 ? (
            visibleChapters.map(({ chapter, lessons }) => {
              const isExpanded = Boolean(expanded[chapter.id]) || Boolean(normalizedQuery)
              const panelId = `${chapter.id}-lessons`
              const completeCount = chapter.lessons.filter(
                (lesson) => lesson.status === 'COMPLETED',
              ).length
              const progress = Math.round((completeCount / chapter.lessons.length) * 100)

              return (
                <article className="chapter-card" key={chapter.id}>
                  <div className="chapter-header">
                    <div className="chapter-header__main">
                      <div className="chapter-kicker">{chapter.label}</div>
                      <h2 className="chapter-title">{chapter.title}</h2>
                      <div className="chapter-meta">
                        <span>
                          {chapter.lessons.length} lesson
                          {chapter.lessons.length === 1 ? '' : 's'}
                        </span>
                        <span aria-hidden="true">|</span>
                        <span>{chapter.lessonPace}</span>
                      </div>
                    </div>

                    <div className="chapter-actions">
                      <button
                        type="button"
                        className="chapter-link"
                        onClick={() => toggleChapter(chapter.id)}
                        aria-controls={panelId}
                        aria-expanded={isExpanded}
                      >
                        View chapter <span aria-hidden="true">→</span>
                      </button>
                      <button
                        type="button"
                        className="chapter-chevron"
                        onClick={() => toggleChapter(chapter.id)}
                        aria-controls={panelId}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${chapter.title}`}
                      >
                        <span aria-hidden="true">{isExpanded ? '⌃' : '⌄'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="chapter-progress">
                    <div className="chapter-progress__copy">
                      {completeCount} of {chapter.lessons.length} lessons complete
                    </div>
                    <div className="chapter-progress__track-wrap">
                      <div
                        className="chapter-progress__track"
                        role="progressbar"
                        aria-label={`${chapter.title} progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                      >
                        <span
                          className="chapter-progress__fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="chapter-progress__badge">{progress}%</span>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="lesson-list" id={panelId}>
                      {lessons.map((lesson) => (
                        <button
                          type="button"
                          key={lesson.id}
                          className="lesson-row"
                          onClick={() => setOpenedLessonId(lesson.id)}
                          aria-label={`Open ${lesson.number} ${lesson.title}`}
                        >
                          <span className="lesson-number">{lesson.number}</span>
                          <span className="lesson-icon" data-type={lesson.type} aria-hidden="true">
                            {lesson.type === 'VIDEO' ? '▶' : 'R'}
                          </span>
                          <span className="lesson-copy">
                            <span className="lesson-title">{lesson.title}</span>
                            <span className="lesson-meta">
                              {lesson.type} <span aria-hidden="true">|</span> {lesson.time}
                            </span>
                          </span>
                          <span className="lesson-status">{lesson.status}</span>
                          <span className="lesson-open">
                            Open <span aria-hidden="true">→</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </article>
              )
            })
          ) : (
            <div className="curriculum-empty" role="status">
              No lessons match the current view.
            </div>
          )}
        </section>

        <div className="curriculum-sr-only" aria-live="polite">
          {openedLesson ? `Opened ${openedLesson.number} ${openedLesson.title}` : ''}
        </div>
      </div>

      <style>{`
        .curriculum-dashboard {
          min-height: 100vh;
          background: #f6f8fb;
          color: #102033;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 16px;
          line-height: 1.5;
        }

        .curriculum-dashboard *,
        .curriculum-dashboard *::before,
        .curriculum-dashboard *::after {
          box-sizing: border-box;
        }

        .curriculum-shell {
          width: min(100%, 1180px);
          margin: 0 auto;
          padding: 40px 28px 72px;
        }

        .curriculum-sr-only {
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

        .curriculum-search {
          display: block;
          width: 100%;
          min-height: 56px;
          border: 1px solid #d8e2ec;
          border-radius: 12px;
          background: #ffffff;
          padding: 0 18px;
          color: #102033;
          font: inherit;
          font-size: 15px;
          outline: none;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
          transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
        }

        .curriculum-search::placeholder {
          color: #8494a8;
        }

        .curriculum-search:hover {
          border-color: #c8d4e0;
        }

        .curriculum-search:focus {
          border-color: #5f85aa;
          box-shadow: 0 0 0 4px rgba(95, 133, 170, 0.16);
        }

        .curriculum-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 18px 0 24px;
        }

        .curriculum-tab {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 36px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          padding: 7px 11px;
          color: #64748b;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          transition: background 140ms ease, color 140ms ease, box-shadow 140ms ease;
        }

        .curriculum-tab:hover {
          background: #edf2f7;
          color: #334155;
        }

        .curriculum-tab:focus-visible {
          outline: 3px solid rgba(22, 78, 54, 0.24);
          outline-offset: 2px;
        }

        .curriculum-tab[data-active='true'] {
          background: #164e36;
          color: #ffffff;
          box-shadow: 0 8px 18px rgba(22, 78, 54, 0.16);
        }

        .curriculum-tab__count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 22px;
          border-radius: 999px;
          background: #edf2f7;
          padding: 0 7px;
          color: #526274;
          font-size: 12px;
          font-weight: 700;
        }

        .curriculum-tab[data-active='true'] .curriculum-tab__count {
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
        }

        .chapter-stack {
          display: grid;
          gap: 18px;
        }

        .chapter-card {
          overflow: hidden;
          border: 1px solid #dce6f0;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        }

        .chapter-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: start;
          padding: 24px 24px 12px;
        }

        .chapter-header__main {
          min-width: 0;
        }

        .chapter-kicker {
          margin-bottom: 5px;
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .chapter-title {
          margin: 0;
          color: #102033;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.25;
        }

        .chapter-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 7px;
          color: #66788d;
          font-size: 14px;
        }

        .chapter-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chapter-link,
        .chapter-chevron {
          border: 0;
          background: transparent;
          color: #164e36;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
        }

        .chapter-link {
          padding: 8px 2px;
          white-space: nowrap;
        }

        .chapter-link:hover {
          color: #0f3827;
          text-decoration: underline;
        }

        .chapter-chevron {
          display: inline-flex;
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          border: 1px solid #dce6f0;
          border-radius: 9px;
          color: #526274;
          font-size: 18px;
          transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
        }

        .chapter-chevron:hover {
          border-color: #c8d4e0;
          background: #f8fafc;
          color: #102033;
        }

        .chapter-link:focus-visible,
        .chapter-chevron:focus-visible,
        .lesson-row:focus-visible {
          outline: 3px solid rgba(95, 133, 170, 0.22);
          outline-offset: 2px;
        }

        .chapter-progress {
          padding: 0 24px 22px;
        }

        .chapter-progress__copy {
          margin-bottom: 9px;
          color: #66788d;
          font-size: 13px;
          font-weight: 600;
        }

        .chapter-progress__track-wrap {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
        }

        .chapter-progress__track {
          position: relative;
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: #edf2f7;
        }

        .chapter-progress__fill {
          position: absolute;
          inset: 0 auto 0 0;
          border-radius: inherit;
          background: #164e36;
        }

        .chapter-progress__badge {
          display: inline-flex;
          min-width: 38px;
          height: 24px;
          align-items: center;
          justify-content: center;
          border: 1px solid #dce6f0;
          border-radius: 999px;
          background: #ffffff;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .lesson-list {
          border-top: 1px solid #e8eef5;
        }

        .lesson-row {
          display: grid;
          width: 100%;
          grid-template-columns: 54px 36px minmax(0, 1fr) auto auto;
          gap: 14px;
          align-items: center;
          border: 0;
          border-top: 1px solid #e8eef5;
          background: #ffffff;
          padding: 16px 24px;
          color: inherit;
          cursor: pointer;
          font: inherit;
          text-align: left;
          transition: background 140ms ease;
        }

        .lesson-row:first-child {
          border-top: 0;
        }

        .lesson-row:hover {
          background: #f8fafc;
        }

        .lesson-number {
          color: #64748b;
          font-size: 14px;
          font-weight: 800;
        }

        .lesson-icon {
          display: inline-flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
        }

        .lesson-icon[data-type='VIDEO'] {
          background: #e8f1ff;
          color: #1d5fbf;
        }

        .lesson-icon[data-type='READING'] {
          background: #e8f5ef;
          color: #13744c;
        }

        .lesson-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 3px;
        }

        .lesson-title {
          overflow: hidden;
          color: #132235;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .lesson-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          color: #718297;
          font-size: 12px;
          font-weight: 700;
        }

        .lesson-status {
          display: inline-flex;
          min-height: 28px;
          align-items: center;
          justify-content: center;
          border: 1px solid #dce6f0;
          border-radius: 999px;
          background: #f8fafc;
          padding: 0 10px;
          color: #526274;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .lesson-open {
          color: #164e36;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .curriculum-empty {
          border: 1px dashed #cfdbe7;
          border-radius: 12px;
          background: #ffffff;
          padding: 28px;
          color: #66788d;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }

        @media (max-width: 860px) {
          .curriculum-shell {
            padding: 28px 18px 56px;
          }

          .chapter-header {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .chapter-actions {
            justify-content: space-between;
          }

          .lesson-row {
            grid-template-columns: 48px 34px minmax(0, 1fr);
            gap: 12px;
          }

          .lesson-status {
            grid-column: 3;
            justify-self: start;
          }

          .lesson-open {
            grid-column: 3;
            justify-self: start;
          }
        }
      `}</style>
    </main>
  )
}
