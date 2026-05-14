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
import { useFlashToast } from '../admin/useFlashToast'

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
  const { flashElement } = useFlashToast()

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
      {flashElement}
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
          gap: 18px;
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
          gap: 12px;
          padding-bottom: 0;
        }
        /* Sticky topbar — same shape as .lse-topbar in the lesson editor so
         * the two screens feel like a single product. Action buttons live
         * here so they stay visible while authors scroll through chapters. */
        .course-workspace-topbar {
          position: sticky;
          top: 0;
          z-index: 30;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          padding: 8px 18px;
          margin: 0 -18px;
          background: var(--admin-surface, var(--cw-surface));
          border-bottom: 1px solid var(--admin-surface-border, var(--cw-border));
        }
        :root[data-theme='dark'] .course-workspace-topbar {
          background: var(--cw-surface);
          border-bottom-color: var(--cw-border);
        }
        .course-workspace-breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 12px;
          color: var(--cpp-muted);
        }
        .course-workspace-breadcrumb a {
          color: var(--cw-accent);
          font-weight: 600;
          text-decoration: none;
          transition: color 120ms ease;
        }
        .course-workspace-breadcrumb a:hover {
          text-decoration: underline;
        }
        .course-workspace-breadcrumb__current {
          color: var(--cw-accent);
          font-weight: 600;
        }
        .course-workspace-topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
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
          gap: 6px;
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
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 700;
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
          padding: 6px 12px;
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
          gap: 2px;
          border-bottom: 1px solid var(--cw-border);
          margin: 0;
          padding: 0;
        }
        .course-workspace-tab {
          position: relative;
          background: transparent;
          border: none;
          padding: 8px 12px 10px;
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
          gap: 12px;
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
          gap: 14px;
        }
        /* Chapter card chrome mirrors the lesson editor's BlockCard:
         * persistent header bar (drag, badge, index, title, count, overflow)
         * over a body of lesson rows. Same visual grammar across screens.
         * Stronger elevation here so chapters feel like parent grouping
         * structures and not just bigger rows. */
        .course-workspace .cw-chapter {
          position: relative;
          border-radius: 12px;
          background: var(--cw-surface);
          border: 1px solid var(--cw-border-strong);
          box-shadow:
            0 1px 0 rgba(15, 23, 42, 0.04),
            0 4px 12px rgba(15, 23, 42, 0.06);
          overflow: hidden;
          transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
        }
        .course-workspace .cw-chapter:hover {
          border-color: rgba(14, 165, 233, 0.35);
          box-shadow:
            0 1px 0 rgba(15, 23, 42, 0.05),
            0 8px 20px rgba(15, 23, 42, 0.08);
        }
        .course-workspace .cw-chapter--selected {
          border-color: rgba(14, 165, 233, 0.6);
          box-shadow:
            0 0 0 3px rgba(14, 165, 233, 0.18),
            0 6px 16px rgba(14, 165, 233, 0.1);
        }
        :root[data-theme='dark'] .course-workspace .cw-chapter {
          box-shadow:
            0 1px 0 rgba(0, 0, 0, 0.4),
            0 6px 16px rgba(0, 0, 0, 0.35);
        }
        :root[data-theme='dark'] .course-workspace .cw-chapter:hover {
          border-color: rgba(56, 189, 248, 0.45);
        }
        :root[data-theme='dark'] .course-workspace .cw-chapter--selected {
          border-color: rgba(56, 189, 248, 0.65);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.22);
        }
        .course-workspace .cw-chapter__header {
          display: grid;
          grid-template-columns: auto auto auto auto minmax(0, 1fr) auto auto;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          background: linear-gradient(
            180deg,
            var(--cw-surface-muted) 0%,
            rgba(148, 163, 184, 0.06) 100%
          );
          border-bottom: 1px solid var(--cw-border-strong);
        }
        :root[data-theme='dark'] .course-workspace .cw-chapter__header {
          background: linear-gradient(
            180deg,
            rgba(148, 163, 184, 0.08) 0%,
            rgba(148, 163, 184, 0.04) 100%
          );
        }
        .course-workspace .cw-chapter__handle {
          opacity: 0.5;
          transition: opacity 140ms ease;
        }
        .course-workspace .cw-chapter:hover .cw-chapter__handle,
        .course-workspace .cw-chapter[data-reorder] .cw-chapter__handle {
          opacity: 1;
        }
        .course-workspace .cw-chapter__collapse {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          margin: 0;
          font-size: 14px;
          color: var(--cpp-muted);
          background: transparent;
          border: 0;
          border-radius: 4px;
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease;
        }
        .course-workspace .cw-chapter__collapse:hover {
          background: rgba(148, 163, 184, 0.14);
          color: var(--cpp-ink);
        }
        .course-workspace .cw-chapter__collapse:focus-visible {
          outline: 2px solid rgba(14, 165, 233, 0.45);
          outline-offset: 1px;
        }
        /* Collapsed chapter: header survives, body hides. Header also drops
         * its bottom border so the chapter card reads as a single bar. */
        .course-workspace .cw-chapter--collapsed .cw-chapter__header {
          border-bottom-color: transparent;
        }
        .course-workspace .cw-chapter__badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #334155;
          background: rgba(148, 163, 184, 0.18);
          border-radius: 999px;
        }
        :root[data-theme='dark'] .course-workspace .cw-chapter__badge {
          color: #cbd5e1;
          background: rgba(148, 163, 184, 0.22);
        }
        .course-workspace .cw-chapter__index {
          font-size: 11px;
          font-weight: 600;
          color: var(--cpp-muted);
        }
        .course-workspace .cw-chapter__titlebtn {
          padding: 4px 6px;
          margin: 0;
          background: transparent;
          border: 0;
          text-align: left;
          cursor: pointer;
          min-width: 0;
          border-radius: 4px;
        }
        .course-workspace .cw-chapter__titlebtn:hover {
          background: var(--cw-surface);
        }
        .course-workspace .cw-chapter__titlebtn:focus-visible {
          outline: 2px solid rgba(14, 165, 233, 0.45);
          outline-offset: 1px;
        }
        .course-workspace .cw-chapter__title {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: var(--cpp-ink);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          letter-spacing: -0.005em;
        }
        .course-workspace .cw-chapter__meta {
          font-size: 12px;
          color: var(--cpp-muted);
          white-space: nowrap;
        }
        .course-workspace .cw-chapter__actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .course-workspace .cw-chapter__lessons {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 8px 10px 10px 10px;
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

        /* === Lesson row ===
         * Hovering should feel active: subtle lift, deeper shadow, and a
         * tinted background so curriculum navigation feels alive instead of
         * flat. Density tightened (was 7/10) so longer courses scan faster. */
        .course-workspace .cw-lesson {
          position: relative;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          padding: 5px 10px;
          background: var(--cw-surface);
          border: 1px solid var(--cw-border);
          border-radius: 8px;
          cursor: pointer;
          transition:
            background 150ms ease,
            border-color 150ms ease,
            box-shadow 150ms ease,
            transform 150ms ease;
        }
        .course-workspace .cw-lesson:hover {
          border-color: rgba(14, 165, 233, 0.4);
          background: var(--cw-surface-muted);
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
          transform: translateY(-1px);
        }
        :root[data-theme='dark'] .course-workspace .cw-lesson:hover {
          border-color: rgba(56, 189, 248, 0.4);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        .course-workspace .cw-lesson--selected {
          border-color: rgba(14, 165, 233, 0.6);
          background: rgba(14, 165, 233, 0.04);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
        }
        :root[data-theme='dark'] .course-workspace .cw-lesson--selected {
          background: rgba(56, 189, 248, 0.08);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.22);
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
          gap: 2px;
          padding: 0;
          margin: 0;
          background: transparent;
          border: 0;
          text-align: left;
          cursor: pointer;
          min-width: 0;
          color: inherit;
          text-decoration: none;
        }
        .course-workspace .cw-lesson__titlebtn:focus-visible {
          outline: 2px solid rgba(14, 165, 233, 0.45);
          outline-offset: 4px;
          border-radius: 6px;
        }
        .course-workspace .cw-lesson__titlelink:hover .cw-lesson__title {
          text-decoration: underline;
          text-decoration-color: rgba(14, 165, 233, 0.45);
          text-underline-offset: 3px;
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
          gap: 6px;
          font-size: 12px;
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

        /* === Empty chapter card ===
         * Informational. The "+ Add lesson" / "attach existing" affordances
         * live in the InlineLessonInput sibling below, so this card is the
         * announcement, not the action surface. */
        .course-workspace .cw-empty-lessons {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          padding: 12px 14px;
          background: var(--cw-surface-muted);
          border: 1px dashed var(--cw-border-strong);
          border-radius: 10px;
          color: var(--cpp-muted);
        }
        :root[data-theme='dark'] .course-workspace .cw-empty-lessons {
          background: rgba(148, 163, 184, 0.06);
        }
        .course-workspace .cw-empty-lessons__glyph {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--cw-surface);
          border: 1px solid var(--cw-border);
          color: var(--cw-accent);
        }
        .course-workspace .cw-empty-lessons__title {
          font-size: 13px;
          font-weight: 600;
          color: var(--cpp-ink);
        }
        .course-workspace .cw-empty-lessons__hint {
          margin-top: 2px;
          font-size: 12px;
          color: var(--cpp-muted);
          line-height: 1.4;
        }

        /* === Status + quiz badges ===
         * Goal: status legibility at a glance for an author scanning a long
         * curriculum. Published = confident green; Draft = warm amber so it
         * reads as "in progress"; staged = orange (not yet persisted). */
        .course-workspace .cw-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 9px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .course-workspace .cw-status::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .course-workspace .cw-status--ok {
          background: rgba(16, 185, 129, 0.16);
          color: #047857;
          border-color: rgba(16, 185, 129, 0.32);
        }
        .course-workspace .cw-status--draft {
          background: rgba(245, 158, 11, 0.14);
          color: #b45309;
          border-color: rgba(245, 158, 11, 0.28);
        }
        :root[data-theme='dark'] .course-workspace .cw-status--ok {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
          border-color: rgba(16, 185, 129, 0.42);
        }
        :root[data-theme='dark'] .course-workspace .cw-status--draft {
          background: rgba(245, 158, 11, 0.2);
          color: #fcd34d;
          border-color: rgba(245, 158, 11, 0.42);
        }
        .course-workspace .cw-status--staged {
          background: rgba(249, 115, 22, 0.16);
          color: #9a3412;
          border-color: rgba(249, 115, 22, 0.32);
        }
        :root[data-theme='dark'] .course-workspace .cw-status--staged {
          background: rgba(249, 115, 22, 0.22);
          color: #fdba74;
          border-color: rgba(249, 115, 22, 0.44);
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
        /* Quiz Attached = strong success (deeper than Published so the
         * curricular signal "this lesson has a comprehension check" reads
         * with confidence). No Quiz = warning-toned neutral so missing
         * assessments are noticeable but not alarming. */
        .course-workspace .cw-quiz-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 999px;
          border: 1px solid transparent;
          cursor: pointer;
          background: transparent;
          transition: background 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms ease;
        }
        .course-workspace .cw-quiz-badge:hover {
          transform: translateY(-1px);
        }
        .course-workspace .cw-quiz-badge__glyph {
          font-size: 11px;
          font-weight: 700;
        }
        .course-workspace .cw-quiz-badge--ok {
          background: rgba(16, 185, 129, 0.18);
          color: #065f46;
          border-color: rgba(16, 185, 129, 0.4);
        }
        .course-workspace .cw-quiz-badge--ok:hover {
          background: rgba(16, 185, 129, 0.26);
          border-color: rgba(16, 185, 129, 0.55);
        }
        .course-workspace .cw-quiz-badge--missing {
          background: rgba(245, 158, 11, 0.12);
          color: #92400e;
          border-color: rgba(245, 158, 11, 0.32);
        }
        .course-workspace .cw-quiz-badge--missing:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
        }
        :root[data-theme='dark'] .course-workspace .cw-quiz-badge--ok {
          background: rgba(16, 185, 129, 0.22);
          color: #6ee7b7;
          border-color: rgba(16, 185, 129, 0.4);
        }
        :root[data-theme='dark'] .course-workspace .cw-quiz-badge--missing {
          background: rgba(245, 158, 11, 0.18);
          color: #fcd34d;
          border-color: rgba(245, 158, 11, 0.4);
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

      <div className="course-workspace-topbar">
        <div className="course-workspace-breadcrumb">
          <Link href="/admin/courses">Courses</Link>
          <span aria-hidden>›</span>
          <span className="course-workspace-breadcrumb__current">{course.title}</span>
          <span
            className="course-workspace-status-pill"
            data-tone={status === 'Active' ? 'active' : 'empty'}
          >
            {status}
          </span>
        </div>
        <div className="course-workspace-topbar-actions">
          <HelpLink topic="courses" />
          <Link
            href={`/admin/courses/${course.id}/edit`}
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

      <header className="course-workspace-header">
        <div className="course-workspace-titlebar">
          <div className="course-workspace-title-block">
            <h1 className="course-workspace-title">{course.title}</h1>
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
