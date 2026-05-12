'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CourseNode } from './types'
import CourseOutlineBoard from './CourseOutlineBoard'
import {
  LessonsTab,
  PreviewTab,
  PublishTab,
  QuizzesTab,
  SettingsTab,
} from './WorkspaceTabs'
import { HelpLink } from '../admin/HelpLink'
import { useBreadcrumbTitle } from '../admin/breadcrumbTitle'

type WorkspaceTab = 'outline' | 'lessons' | 'quizzes' | 'preview' | 'settings' | 'publish'

type CourseWorkspaceProps = {
  initialCourse: CourseNode
  publicOrigin?: string
}

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: 'outline', label: 'Outline' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'quizzes', label: 'Quizzes' },
  { id: 'preview', label: 'Preview' },
  { id: 'settings', label: 'Settings' },
  { id: 'publish', label: 'Publish' },
]

export default function CourseWorkspace({ initialCourse, publicOrigin }: CourseWorkspaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('outline')
  const [course, setCourse] = useState<CourseNode>(initialCourse)
  useBreadcrumbTitle(course.title)

  const stats = useMemo(() => {
    const allLessons = course.chapters.flatMap((chapter) => chapter.lessons)
    const lessonCount = allLessons.length
    const publishedCount = allLessons.filter(
      (lesson) => (lesson.status ?? 'published') === 'published',
    ).length
    const quizCount = allLessons.filter((lesson) => Boolean(lesson.quizTitle)).length
    const coverage = lessonCount === 0 ? 0 : Math.round((quizCount / lessonCount) * 100)
    return {
      chapterCount: course.chapters.length,
      lessonCount,
      publishedCount,
      quizCount,
      coverage,
    }
  }, [course])

  const status = stats.chapterCount === 0 ? 'Empty' : 'Active'
  const trimmedOrigin = (publicOrigin ?? '').replace(/\/+$/, '')
  const previewHref = course.slug
    ? trimmedOrigin
      ? `${trimmedOrigin}/classes/${course.slug}`
      : `/classes/${course.slug}`
    : null

  return (
    <div className="course-workspace">
      <style>{`
        .course-workspace {
          font-family: 'Inter', 'Satoshi', 'Avenir Next', system-ui, -apple-system, 'Segoe UI', sans-serif;
          font-feature-settings: 'cv11', 'ss01';
          letter-spacing: -0.005em;
          color: var(--cpp-ink);
          --cw-border: rgba(15, 23, 42, 0.08);
          --cw-border-strong: rgba(15, 23, 42, 0.14);
          --cw-surface: #ffffff;
          --cw-surface-muted: #f8fafc;
          --cw-surface-tinted: #f1f5f9;
          --cw-accent: #0f172a;
          --cw-accent-soft: rgba(15, 23, 42, 0.06);
          --cw-shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 0 rgba(15, 23, 42, 0.02);
          --cw-shadow-md: 0 4px 14px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        :root[data-theme='dark'] .course-workspace {
          --cw-border: rgba(148, 163, 184, 0.14);
          --cw-border-strong: rgba(148, 163, 184, 0.24);
          --cw-surface: #111827;
          --cw-surface-muted: #1e293b;
          --cw-surface-tinted: #1c2536;
          --cw-accent: #e2e8f0;
          --cw-accent-soft: rgba(148, 163, 184, 0.12);
          --cw-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
          --cw-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
          background: #0f172a;
        }
        .course-workspace-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 0;
        }
        .course-workspace-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--cpp-muted);
        }
        .course-workspace-breadcrumb a {
          color: var(--cpp-muted);
          text-decoration: none;
          transition: color 120ms ease;
        }
        .course-workspace-breadcrumb a:hover {
          color: var(--cw-accent);
        }
        .course-workspace-titlebar {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .course-workspace-title-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }
        .course-workspace-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .course-workspace-title {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: var(--cw-accent);
        }
        .course-workspace-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .course-workspace-status-pill[data-tone='active'] {
          background: rgba(16, 185, 129, 0.1);
          color: #047857;
          border-color: rgba(16, 185, 129, 0.18);
        }
        .course-workspace-status-pill[data-tone='empty'] {
          background: rgba(217, 119, 6, 0.1);
          color: #b45309;
          border-color: rgba(217, 119, 6, 0.2);
        }
        :root[data-theme='dark'] .course-workspace-status-pill[data-tone='active'] {
          background: rgba(16, 185, 129, 0.18);
          color: #6ee7b7;
          border-color: rgba(16, 185, 129, 0.28);
        }
        :root[data-theme='dark'] .course-workspace-status-pill[data-tone='empty'] {
          background: rgba(217, 119, 6, 0.18);
          color: #fcd34d;
          border-color: rgba(217, 119, 6, 0.32);
        }
        .course-workspace-progress {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px 16px;
          font-size: 13px;
          color: var(--cpp-muted);
        }
        .course-workspace-progress strong {
          color: var(--cw-accent);
          font-weight: 600;
        }
        .course-workspace-progress-divider {
          color: var(--cw-border-strong);
        }
        .course-workspace-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cw-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.2;
          border-radius: 8px;
          border: 1px solid var(--cw-border);
          background: var(--cw-surface);
          color: var(--cw-accent);
          text-decoration: none;
          cursor: pointer;
          transition: background 120ms ease, border-color 120ms ease, transform 120ms ease, box-shadow 120ms ease;
        }
        .cw-btn:hover {
          background: var(--cw-surface-muted);
          border-color: var(--cw-border-strong);
        }
        .cw-btn:active {
          transform: translateY(1px);
        }
        .cw-btn--primary {
          background: var(--cw-accent);
          color: var(--cw-surface);
          border-color: var(--cw-accent);
          font-weight: 600;
        }
        .cw-btn--primary:hover {
          background: #1f2937;
          border-color: #1f2937;
        }
        :root[data-theme='dark'] .cw-btn--primary {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #f1f5f9;
        }
        :root[data-theme='dark'] .cw-btn--primary:hover {
          background: #ffffff;
          border-color: #ffffff;
        }
        .cw-btn--ghost {
          background: transparent;
          border-color: transparent;
          color: var(--cpp-muted);
        }
        .cw-btn--ghost:hover {
          background: var(--cw-accent-soft);
          color: var(--cw-accent);
          border-color: transparent;
        }
        .cw-btn[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .course-workspace-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          border-bottom: 1px solid var(--cw-border);
          margin: 0;
          padding: 0;
        }
        .course-workspace-tab {
          position: relative;
          background: transparent;
          border: none;
          padding: 10px 14px 12px;
          margin-bottom: -1px;
          font-size: 14px;
          font-weight: 500;
          color: var(--cpp-muted);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color 120ms ease, border-color 120ms ease;
        }
        .course-workspace-tab:hover {
          color: var(--cw-accent);
        }
        .course-workspace-tab[aria-current='page'] {
          color: var(--cw-accent);
          font-weight: 600;
          border-bottom-color: var(--cw-accent);
        }
        :root[data-theme='dark'] .course-workspace-tab[aria-current='page'] {
          border-bottom-color: #e2e8f0;
        }

        /* === Outline === */
        .course-workspace .cw-outline {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 96px;
        }
        .course-workspace .cw-outline__toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
        }
        .course-workspace .cw-outline__summary {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--cpp-muted);
        }
        .course-workspace .cw-outline__summary strong {
          color: var(--cw-accent);
          font-weight: 600;
        }
        .course-workspace .cw-outline__sep {
          color: var(--cw-border-strong);
        }
        .course-workspace .cw-outline__mode-pill {
          margin-left: 4px;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(14, 165, 233, 0.12);
          color: #0369a1;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        :root[data-theme='dark'] .course-workspace .cw-outline__mode-pill {
          background: rgba(56, 189, 248, 0.18);
          color: #7dd3fc;
        }
        .course-workspace .cw-outline__toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .course-workspace .cw-error-banner {
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(220, 38, 38, 0.08);
          color: #b91c1c;
          font-size: 13px;
          border: 1px solid rgba(220, 38, 38, 0.16);
        }

        /* === Chapter container === */
        .course-workspace .cw-chapter-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .course-workspace .cw-chapter {
          position: relative;
          border-radius: 14px;
          background: var(--cw-surface-muted);
          border: 1px solid var(--cw-border);
          padding: 8px;
          transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
        }
        .course-workspace .cw-chapter:hover {
          border-color: var(--cw-border-strong);
        }
        .course-workspace .cw-chapter--selected {
          border-color: rgba(14, 165, 233, 0.45);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
        }
        :root[data-theme='dark'] .course-workspace .cw-chapter {
          background: var(--cw-surface);
        }
        .course-workspace .cw-chapter__header {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          padding: 14px 16px 14px 12px;
        }
        .course-workspace .cw-chapter__handle {
          opacity: 0.35;
          transition: opacity 140ms ease;
        }
        .course-workspace .cw-chapter:hover .cw-chapter__handle,
        .course-workspace .cw-chapter[data-reorder] .cw-chapter__handle {
          opacity: 1;
        }
        .course-workspace .cw-chapter__titlebtn {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0;
          margin: 0;
          background: transparent;
          border: 0;
          text-align: left;
          cursor: pointer;
          min-width: 0;
        }
        .course-workspace .cw-chapter__titlebtn:focus-visible {
          outline: 2px solid rgba(14, 165, 233, 0.45);
          outline-offset: 4px;
          border-radius: 6px;
        }
        .course-workspace .cw-chapter__eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cpp-muted);
        }
        .course-workspace .cw-chapter__title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.015em;
          color: var(--cw-accent);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .course-workspace .cw-chapter__meta {
          font-size: 13px;
          color: var(--cpp-muted);
        }
        .course-workspace .cw-chapter__actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .course-workspace .cw-chapter__lessons {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0 4px 8px 36px;
        }

        .course-workspace .cw-chapter__add-inline {
          align-self: flex-start;
          margin-top: 4px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 500;
          color: var(--cpp-muted);
          background: transparent;
          border: 1px dashed var(--cw-border);
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 140ms ease, color 140ms ease, background 140ms ease;
        }
        .course-workspace .cw-chapter__add-inline:hover {
          color: var(--cw-accent);
          border-color: var(--cw-border-strong);
          background: var(--cw-accent-soft);
        }

        /* === Lesson card === */
        .course-workspace .cw-lesson {
          position: relative;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: var(--cw-surface);
          border: 1px solid var(--cw-border);
          border-radius: 10px;
          transition: border-color 140ms ease, background 140ms ease, transform 140ms ease,
            box-shadow 140ms ease;
        }
        .course-workspace .cw-lesson:hover {
          background: var(--cw-surface-muted);
          border-color: var(--cw-border-strong);
          transform: translateY(-1px);
          box-shadow: var(--cw-shadow-sm);
        }
        .course-workspace .cw-lesson--selected {
          border-color: rgba(14, 165, 233, 0.55);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
        }
        .course-workspace .cw-lesson__handle {
          opacity: 0.3;
          transition: opacity 140ms ease;
        }
        .course-workspace .cw-lesson:hover .cw-lesson__handle,
        .course-workspace .cw-lesson[data-reorder] .cw-lesson__handle {
          opacity: 1;
        }
        .course-workspace .cw-lesson__titlebtn {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0;
          margin: 0;
          background: transparent;
          border: 0;
          text-align: left;
          cursor: pointer;
          min-width: 0;
        }
        .course-workspace .cw-lesson__titlebtn:focus-visible {
          outline: 2px solid rgba(14, 165, 233, 0.45);
          outline-offset: 4px;
          border-radius: 6px;
        }
        .course-workspace .cw-lesson__title {
          font-size: 15px;
          font-weight: 500;
          color: var(--cw-accent);
          line-height: 1.35;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .course-workspace .cw-lesson__meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--cpp-muted);
        }
        .course-workspace .cw-lesson__sep {
          color: var(--cw-border-strong);
        }
        .course-workspace .cw-lesson__actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .course-workspace .cw-lesson__edit {
          padding: 6px 10px;
          font-size: 12px;
        }

        /* === Status + quiz badges === */
        .course-workspace .cw-status {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .course-workspace .cw-status--ok {
          background: rgba(16, 185, 129, 0.1);
          color: #047857;
          border-color: rgba(16, 185, 129, 0.18);
        }
        .course-workspace .cw-status--draft {
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
          border-color: rgba(100, 116, 139, 0.18);
        }
        :root[data-theme='dark'] .course-workspace .cw-status--ok {
          background: rgba(16, 185, 129, 0.16);
          color: #6ee7b7;
        }
        :root[data-theme='dark'] .course-workspace .cw-status--draft {
          background: rgba(148, 163, 184, 0.18);
          color: #cbd5e1;
        }
        .course-workspace .cw-status--staged {
          background: rgba(245, 158, 11, 0.14);
          color: #b45309;
          border-color: rgba(245, 158, 11, 0.22);
        }
        :root[data-theme='dark'] .course-workspace .cw-status--staged {
          background: rgba(245, 158, 11, 0.2);
          color: #fcd34d;
        }
        .course-workspace .cw-lesson--staged {
          border-style: dashed;
        }
        .course-workspace .cw-lesson--staged .cw-lesson__title {
          font-style: italic;
          color: var(--cpp-muted);
        }
        .course-workspace .cw-chapter__add-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }
        .course-workspace .cw-chapter__add-row--expanded {
          gap: 8px;
        }
        .course-workspace .cw-chapter__add-input {
          flex: 1;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--cpp-ink);
          background: var(--cw-surface);
          border: 1px solid var(--cw-border-strong);
          border-radius: 8px;
        }
        .course-workspace .cw-chapter__add-input:focus {
          outline: 2px solid rgba(14, 165, 233, 0.45);
          outline-offset: 1px;
          border-color: rgba(14, 165, 233, 0.55);
        }
        .course-workspace .cw-chapter__attach-link {
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 500;
          color: var(--cpp-muted);
          background: transparent;
          border: 0;
          border-radius: 6px;
          cursor: pointer;
          transition: color 140ms ease, background 140ms ease;
        }
        .course-workspace .cw-chapter__attach-link:hover {
          color: var(--cw-accent);
          background: var(--cw-accent-soft);
        }
        .course-workspace .cw-quiz-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 999px;
          border: 1px solid transparent;
          cursor: pointer;
          background: transparent;
          transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
        }
        .course-workspace .cw-quiz-badge__glyph {
          font-size: 11px;
          font-weight: 700;
        }
        .course-workspace .cw-quiz-badge--ok {
          background: rgba(16, 185, 129, 0.1);
          color: #047857;
          border-color: rgba(16, 185, 129, 0.16);
        }
        .course-workspace .cw-quiz-badge--ok:hover {
          background: rgba(16, 185, 129, 0.18);
        }
        .course-workspace .cw-quiz-badge--missing {
          background: rgba(148, 163, 184, 0.1);
          color: var(--cpp-muted);
          border-color: var(--cw-border);
        }
        .course-workspace .cw-quiz-badge--missing:hover {
          color: var(--cw-accent);
          background: var(--cw-accent-soft);
          border-color: var(--cw-border-strong);
        }
        :root[data-theme='dark'] .course-workspace .cw-quiz-badge--ok {
          background: rgba(16, 185, 129, 0.18);
          color: #6ee7b7;
          border-color: rgba(16, 185, 129, 0.28);
        }

        /* === Drag overlay & reorder bar === */
        .course-workspace .cw-drag-overlay {
          padding: 12px 16px;
          background: var(--cw-surface);
          border: 1px solid rgba(14, 165, 233, 0.55);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--cw-accent);
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.14);
        }
        .course-workspace .cw-reorder-bar {
          position: fixed;
          inset-inline: 0;
          bottom: 0;
          z-index: 30;
          padding: 14px 16px;
          background: var(--cw-surface);
          border-top: 1px solid var(--cw-border);
          box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.08);
        }
        .course-workspace .cw-reorder-bar__inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .course-workspace .cw-reorder-bar__hint {
          font-size: 13px;
          color: var(--cpp-muted);
        }
        .course-workspace .cw-reorder-bar__actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <header className="course-workspace-header">
        <div className="course-workspace-breadcrumb">
          <Link href="/admin/courses">Courses</Link>
          <span aria-hidden>/</span>
          <span style={{ color: 'var(--cw-accent)' }}>{course.title}</span>
        </div>

        <div className="course-workspace-titlebar">
          <div className="course-workspace-title-block">
            <div className="course-workspace-title-row">
              <h1 className="course-workspace-title">{course.title}</h1>
              <span
                className="course-workspace-status-pill"
                data-tone={status === 'Active' ? 'active' : 'empty'}
              >
                {status}
              </span>
            </div>
            <div className="course-workspace-progress">
              <span>
                <strong>{stats.lessonCount}</strong> lesson{stats.lessonCount === 1 ? '' : 's'}
              </span>
              <span className="course-workspace-progress-divider" aria-hidden>
                •
              </span>
              <span>
                <strong>{stats.publishedCount}</strong> published
              </span>
              <span className="course-workspace-progress-divider" aria-hidden>
                •
              </span>
              <span>
                <strong>{stats.quizCount}</strong> quiz
                {stats.quizCount === 1 ? '' : 'zes'} attached
              </span>
              <span className="course-workspace-progress-divider" aria-hidden>
                •
              </span>
              <span>
                <strong>{stats.coverage}%</strong> quiz coverage
              </span>
            </div>
          </div>

          <div className="course-workspace-actions">
            <HelpLink topic="courses" />
            <Link
              href={`/admin/collections/classes/${course.id}`}
              className="cw-btn cw-btn--ghost"
            >
              Edit Course
            </Link>
            {previewHref ? (
              <a
                href={previewHref}
                target="_blank"
                rel="noreferrer"
                className="cw-btn cw-btn--primary"
              >
                Preview
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="cw-btn cw-btn--primary"
                title="Set a slug to enable public preview"
              >
                Preview
              </button>
            )}
          </div>
        </div>

        <nav className="course-workspace-tabs" aria-label="Course workspace sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="course-workspace-tab"
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {activeTab === 'outline' ? (
          <CourseOutlineBoard initialCourse={course} onCourseChange={setCourse} />
        ) : null}
        {activeTab === 'lessons' ? <LessonsTab course={course} /> : null}
        {activeTab === 'quizzes' ? <QuizzesTab course={course} /> : null}
        {activeTab === 'preview' ? (
          <PreviewTab course={course} publicOrigin={trimmedOrigin} />
        ) : null}
        {activeTab === 'settings' ? (
          <SettingsTab
            course={course}
            onCourseChanged={({ title, slug }) => {
              setCourse((prev) => ({ ...prev, title, slug }))
              router.refresh()
            }}
          />
        ) : null}
        {activeTab === 'publish' ? <PublishTab course={course} /> : null}
      </main>
    </div>
  )
}
