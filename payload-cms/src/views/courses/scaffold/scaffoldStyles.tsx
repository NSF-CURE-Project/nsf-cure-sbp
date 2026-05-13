'use client'

import React from 'react'

// Shared layout + CSS for the scaffold-based block editor. Both
// LessonScaffoldEditor (lessons) and PageScaffoldEditor (CMS pages) mount
// this so they look identical: same sticky topbar, same outline rail,
// same block card chrome, same inline insertion points, same Lexical
// rich-text toolbar.
//
// Content is intentionally a single string template — Next.js inlines
// `<style>` children into the document at SSR time without scoping
// transformations, which is what we want for these globally-scoped
// `lse-*` and `cw-rt__*` class hooks the scaffold children expect.
export default function ScaffoldStyles() {
  return <style>{styles}</style>
}

const styles = `
        /* === Shell + sticky toolbar === */
        .lse-shell {
          display: grid;
          gap: 16px;
        }
        .lse-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          padding: 10px 18px;
          background: var(--admin-surface-elevated, #fcfdff);
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
          box-shadow: var(--admin-shadow-soft);
          margin: 0 -18px 0 -18px;
        }
        .lse-topbar__breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-topbar__breadcrumb a {
          color: var(--cpp-ink, #1b1f24);
          text-decoration: none;
          font-weight: 600;
        }
        .lse-topbar__breadcrumb a:hover { text-decoration: underline; }
        .lse-topbar__current { color: var(--cpp-ink, #1b1f24); font-weight: 600; }
        .lse-chip {
          display: inline-flex;
          align-items: center;
          padding: 1px 8px;
          margin-left: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-radius: 999px;
          border: 1px solid transparent;
        }
        .lse-chip--ok {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          border-color: rgba(16, 185, 129, 0.22);
        }
        .lse-chip--draft {
          background: rgba(100, 116, 139, 0.14);
          color: #475569;
          border-color: rgba(100, 116, 139, 0.22);
        }
        :root[data-theme='dark'] .lse-chip--ok { color: #6ee7b7; }
        :root[data-theme='dark'] .lse-chip--draft { color: #cbd5e1; }
        .lse-topbar__actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lse-topbar__autosave {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
          min-width: 110px;
          text-align: right;
        }
        /* Button hierarchy:
         *   default (secondary) — white surface, visible border
         *   --primary           — solid dark, drives "the" action (Publish)
         *   --ghost             — transparent until hover; for tertiary
         *   --active            — accent-tinted toggle state (e.g. Preview on)
         */
        .lse-btn {
          display: inline-flex;
          align-items: center;
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid var(--admin-surface-border-strong, #c2ccda);
          background: var(--admin-surface, #fff);
          color: var(--cpp-ink, #0f172a);
          cursor: pointer;
          transition: var(--admin-transition);
        }
        .lse-btn:hover {
          background: var(--admin-surface-muted, #f3f6fb);
          border-color: var(--cpp-muted, #475569);
        }
        .lse-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px var(--admin-accent-ring, rgba(59, 130, 246, 0.32));
        }
        .lse-btn:disabled { cursor: not-allowed; opacity: 0.55; }
        .lse-btn--primary {
          background: var(--cpp-ink, #0f172a);
          color: #fff;
          border-color: var(--cpp-ink, #0f172a);
          box-shadow: var(--admin-shadow-soft);
        }
        .lse-btn--primary:hover {
          background: #1e293b;
          border-color: #1e293b;
          box-shadow: var(--admin-shadow);
        }
        :root[data-theme='dark'] .lse-btn--primary {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #e2e8f0;
        }
        :root[data-theme='dark'] .lse-btn--primary:hover {
          background: #ffffff;
          border-color: #ffffff;
        }
        .lse-btn--ghost {
          background: transparent;
          border-color: transparent;
          color: var(--cpp-muted, #475569);
        }
        .lse-btn--ghost:hover {
          background: var(--admin-surface-muted, #f3f6fb);
          border-color: transparent;
          color: var(--cpp-ink, #0f172a);
        }

        /* === Body / 3-column layout === */
        .lse-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 24px;
          padding: 16px 4px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .lse-body { grid-template-columns: 240px minmax(0, 1fr); }
        }
        @media (min-width: 1280px) {
          .lse-body { grid-template-columns: 240px minmax(0, 1fr) 300px; }
        }
        @media (min-width: 1440px) {
          .lse-body { grid-template-columns: 260px minmax(0, 1fr) 340px; }
        }
        /* Split-preview mode collapses outline + inspector and gives the
         * canvas (where authors actually type) the larger share — preview
         * is for verification, not primary work surface. 3fr/2fr ≈ 60/40. */
        .lse-body--preview {
          grid-template-columns: minmax(0, 1fr) !important;
        }
        @media (min-width: 1024px) {
          .lse-body--preview {
            grid-template-columns: minmax(0, 3fr) minmax(0, 2fr) !important;
          }
        }
        .lse-canvas { display: grid; gap: 18px; }

        /* === Active toggle button (e.g. Preview while engaged) === */
        .lse-btn--active,
        .lse-btn--active:hover {
          background: var(--admin-accent-bg, #eef4ff);
          border-color: var(--admin-accent-border, #3b82f6);
          color: var(--admin-accent-text, #1d4ed8);
        }

        /* === Preview pane === */
        .lse-preview-pane {
          display: none;
          position: sticky;
          top: 76px;
          align-self: start;
          max-height: calc(100vh - 96px);
          padding: 12px 12px 16px 12px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 10px;
          box-shadow: var(--admin-shadow-soft);
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: 10px;
        }
        .lse-preview-pane__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
        }
        .lse-preview-pane__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cpp-ink, #0f172a);
        }
        .lse-preview-pane__viewport {
          display: inline-flex;
          padding: 2px;
          background: var(--admin-surface-muted, #f3f6fb);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 7px;
        }
        .lse-preview-pane__viewport-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 22px;
          padding: 0;
          font-size: 12px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: var(--cpp-muted, #475569);
          cursor: pointer;
          transition: var(--admin-transition);
        }
        .lse-preview-pane__viewport-btn:hover {
          color: var(--cpp-ink, #0f172a);
        }
        .lse-preview-pane__viewport-btn[aria-pressed='true'] {
          background: var(--admin-surface, #fff);
          color: var(--cpp-ink, #0f172a);
          box-shadow: var(--admin-shadow-soft);
        }
        /* Quick-close affordance inside the pane head so authors don't
         * have to scroll back to the topbar Preview toggle. */
        .lse-preview-pane__close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          margin-left: 4px;
          padding: 0;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          color: var(--cpp-muted, #475569);
          cursor: pointer;
          transition: var(--admin-transition);
        }
        .lse-preview-pane__close:hover {
          background: var(--admin-surface-muted, #f3f6fb);
          border-color: var(--admin-surface-border, #d7dfea);
          color: var(--cpp-ink, #0f172a);
        }
        .lse-preview-pane__close:focus-visible {
          outline: 2px solid var(--admin-accent-border, #3b82f6);
          outline-offset: 1px;
        }
        /* Frame is the visible window onto a scaled iframe. The iframe is
         * always rendered at its true device width (1280/768/390) so the
         * lesson page hits its real breakpoints; the scaler shrinks it
         * with transform: scale so the author sees the whole layout. */
        .lse-preview-pane__frame {
          position: relative;
          overflow: hidden;
          min-height: 600px;
          height: 100%;
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 8px;
          background: #fff;
        }
        .lse-preview-pane__scaler {
          position: absolute;
          top: 0;
          left: 0;
          transform-origin: top left;
          transition: transform 180ms ease, left 180ms ease;
        }
        .lse-preview-pane__iframe {
          width: 100%;
          height: 100%;
          border: 0;
          background: #fff;
          display: block;
        }
        .lse-preview-pane__empty {
          padding: 24px 12px;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
          text-align: center;
        }

        /* === Outline (left rail) === */
        .lse-outline {
          display: none;
          position: sticky;
          top: 76px; /* clears the sticky topbar */
          align-self: start;
          max-height: calc(100vh - 96px);
          overflow-y: auto;
          padding: 12px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 10px;
          box-shadow: var(--admin-shadow-soft);
        }
        @media (min-width: 1024px) { .lse-outline { display: block; } }
        .lse-outline__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cpp-ink, #0f172a);
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
        }
        .lse-outline__empty {
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
          padding: 8px 6px;
        }
        .lse-outline__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
        .lse-outline__item {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr);
          gap: 8px;
          align-items: start;
          width: 100%;
          padding: 6px 8px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          text-align: left;
          cursor: pointer;
          transition: var(--admin-transition);
        }
        .lse-outline__item:hover {
          background: var(--admin-surface-muted, #f3f6fb);
        }
        .lse-outline__item--selected,
        .lse-outline__item--selected:hover {
          background: var(--admin-accent-bg, #eef4ff);
          border-color: var(--admin-accent-border, #3b82f6);
        }
        .lse-outline__item--selected .lse-outline__item-summary {
          color: var(--admin-accent-text, #1d4ed8);
        }
        .lse-outline__item-index {
          font-size: 10px;
          font-weight: 700;
          color: var(--cpp-muted, #5d6b80);
          line-height: 18px;
        }
        .lse-outline__item-body { display: grid; gap: 1px; min-width: 0; }
        .lse-outline__item-type {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-outline__item-summary {
          font-size: 12px;
          color: var(--cpp-ink, #1b1f24);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :root[data-theme='dark'] .lse-outline__item-summary { color: var(--cpp-ink, #e6e8eb); }

        /* === Inspector (right rail) === */
        .lse-inspector {
          display: none;
          position: sticky;
          top: 76px;
          align-self: start;
          max-height: calc(100vh - 96px);
          overflow-y: auto;
          padding: 14px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 10px;
          box-shadow: var(--admin-shadow-soft);
        }
        @media (min-width: 1280px) { .lse-inspector { display: block; } }
        .lse-inspector__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cpp-ink, #0f172a);
          padding-bottom: 10px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
        }
        .lse-inspector__empty {
          font-size: 12px;
          color: var(--cpp-muted, #475569);
          line-height: 1.5;
        }
        .lse-inspector__empty-hint {
          font-size: 11px;
          color: var(--cpp-subtle, #64748b);
        }
        .lse-inspector__body { display: grid; gap: 14px; }
        .lse-inspector__heading {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lse-inspector__heading-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--admin-block-generic-icon);
          background: var(--admin-surface-muted, #f3f6fb);
          border: 1px solid var(--admin-surface-border, #d7dfea);
          border-radius: 999px;
        }
        /* Mirror the block's identity color onto the inspector badge so
         * the right rail visually echoes which block is selected. */
        .lse-inspector[data-block-type="richTextBlock"] .lse-inspector__heading-badge,
        .lse-inspector[data-block-type="textSection"] .lse-inspector__heading-badge,
        .lse-inspector[data-block-type="sectionTitle"] .lse-inspector__heading-badge {
          color: var(--admin-block-rich-icon);
        }
        .lse-inspector[data-block-type="videoBlock"] .lse-inspector__heading-badge {
          color: var(--admin-block-video-icon);
        }
        .lse-inspector[data-block-type="quizBlock"] .lse-inspector__heading-badge {
          color: var(--admin-block-quiz-icon);
        }
        .lse-inspector__heading-hint {
          font-size: 11px;
          color: var(--cpp-muted, #475569);
          font-weight: 500;
        }
        .lse-canvas__intro {
          display: grid;
          gap: 4px;
        }
        .lse-canvas__intro h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--cpp-ink, #1b1f24);
        }
        .lse-canvas__intro p {
          margin: 0;
          font-size: 13px;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-section {
          display: grid;
          gap: 12px;
          padding: 16px 18px;
          border-radius: 10px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
        }
        :root[data-theme='dark'] .lse-section {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .lse-label {
          display: grid;
          gap: 4px;
        }
        .lse-label__text {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-input {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--cpp-ink, #1b1f24);
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
        }
        .lse-input:focus {
          outline: 2px solid rgba(14, 165, 233, 0.4);
          outline-offset: 1px;
          border-color: rgba(14, 165, 233, 0.55);
        }
        :root[data-theme='dark'] .lse-input {
          background: var(--admin-surface-muted, #232938);
          border-color: var(--admin-surface-border, #2a3140);
          color: var(--cpp-ink, #e6e8eb);
        }
        .lse-hint {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-error {
          font-size: 12px;
          color: #b91c1c;
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
        }

        /* === Block list + cards === */
        .lse-blocks { display: grid; gap: 6px; }
        .lse-blocks__title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--cpp-muted, #5d6b80);
          padding: 0 2px;
        }
        .lse-blocks__empty {
          padding: 28px 16px;
          font-size: 13px;
          color: var(--cpp-muted, #5d6b80);
          background: var(--admin-surface-muted, #f5f7fa);
          border: 1px dashed var(--admin-surface-border, #d6dce5);
          border-radius: 10px;
          text-align: center;
        }
        .lse-blocks__list { display: grid; gap: 0; }
        .lse-block {
          border: 1px solid var(--admin-surface-border, #d7dfea);
          background: var(--admin-surface, #fff);
          border-radius: 10px;
          box-shadow: var(--admin-shadow-soft);
          overflow: hidden;
          transition: var(--admin-transition);
        }
        .lse-block:hover { border-color: var(--admin-surface-border-strong, #c2ccda); }
        .lse-block--dragging { box-shadow: var(--admin-shadow-deep); }
        .lse-block--selected,
        .lse-block--selected:hover {
          border-color: var(--admin-accent-border, #3b82f6);
          box-shadow: 0 0 0 3px var(--admin-accent-ring, rgba(59, 130, 246, 0.32));
        }
        .lse-block__header {
          display: grid;
          grid-template-columns: auto auto auto auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--admin-surface-muted, #f3f6fb);
          border-bottom: 1px solid var(--admin-surface-border, #d7dfea);
        }
        .lse-block--collapsed .lse-block__header { border-bottom-color: transparent; }

        /* === Block type identity ===
         * Subtle left-edge stripe (via ::before so it survives hover/
         * selected border changes) + icon-color tint on the type badge.
         * The card background stays neutral so block content doesn't
         * compete with the block's own visuals.
         * Mapping:
         *   rich    — richTextBlock, textSection, sectionTitle
         *   video   — videoBlock
         *   quiz    — quizBlock
         *   generic — buttonBlock, listBlock, stepsList, __passthrough
         */
        .lse-block { position: relative; }
        .lse-block[data-block-type]::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--admin-block-generic-edge);
          border-top-left-radius: inherit;
          border-bottom-left-radius: inherit;
          pointer-events: none;
        }
        .lse-block[data-block-type="richTextBlock"]::before,
        .lse-block[data-block-type="textSection"]::before,
        .lse-block[data-block-type="sectionTitle"]::before {
          background: var(--admin-block-rich-edge);
        }
        .lse-block[data-block-type="videoBlock"]::before {
          background: var(--admin-block-video-edge);
        }
        .lse-block[data-block-type="quizBlock"]::before {
          background: var(--admin-block-quiz-edge);
        }
        .lse-block[data-block-type="richTextBlock"] .lse-block__badge,
        .lse-block[data-block-type="textSection"] .lse-block__badge,
        .lse-block[data-block-type="sectionTitle"] .lse-block__badge {
          color: var(--admin-block-rich-icon);
        }
        .lse-block[data-block-type="videoBlock"] .lse-block__badge {
          color: var(--admin-block-video-icon);
        }
        .lse-block[data-block-type="quizBlock"] .lse-block__badge {
          color: var(--admin-block-quiz-icon);
        }
        .lse-block[data-block-type="buttonBlock"] .lse-block__badge,
        .lse-block[data-block-type="listBlock"] .lse-block__badge,
        .lse-block[data-block-type="stepsList"] .lse-block__badge,
        .lse-block[data-block-type="__passthrough"] .lse-block__badge {
          color: var(--admin-block-generic-icon);
        }
        .lse-block__handle,
        .lse-block__chevron {
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: var(--cpp-muted, #5d6b80);
          background: transparent;
          border: 0;
          border-radius: 4px;
          cursor: pointer;
        }
        .lse-block__handle { cursor: grab; }
        .lse-block__handle:active { cursor: grabbing; }
        .lse-block__handle:hover,
        .lse-block__chevron:hover { background: var(--admin-surface, #fff); }
        .lse-block__badge {
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
        :root[data-theme='dark'] .lse-block__badge {
          color: #cbd5e1;
          background: rgba(148, 163, 184, 0.22);
        }
        .lse-block__index {
          font-size: 11px;
          font-weight: 600;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-block__preview {
          background: transparent;
          border: 0;
          padding: 4px 6px;
          border-radius: 4px;
          text-align: left;
          font-size: 13px;
          color: var(--cpp-ink, #1b1f24);
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lse-block__preview:hover { background: var(--admin-surface, #fff); }
        .lse-block__remove {
          background: transparent;
          border: 1px solid transparent;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--cpp-muted, #5d6b80);
          border-radius: 4px;
          cursor: pointer;
        }
        .lse-block__remove:hover {
          color: #b91c1c;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.08);
        }
        .lse-block__body { padding: 14px 16px 16px 16px; }

        /* === Inline insertion point + bottom +Add === */
        .lse-insert {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .lse-insert--closed {
          height: 14px;
          opacity: 0;
          transition: opacity 120ms ease;
        }
        .lse-blocks__list:hover .lse-insert--closed,
        .lse-insert--closed:focus-within { opacity: 1; }
        .lse-insert--open { padding: 6px 0; }
        .lse-insert__trigger {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 4px 0;
          background: transparent;
          border: 0;
          cursor: pointer;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-insert__line {
          height: 1px;
          background: var(--admin-surface-border-strong, #b9c2d0);
        }
        .lse-insert__plus {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 999px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border-strong, #b9c2d0);
        }
        .lse-insert__trigger:hover .lse-insert__plus {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
        .lse-insert--open,
        .lse-end-picker {
          display: grid;
          gap: 4px;
          padding: 8px;
          background: var(--admin-surface, #fff);
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
        }
        :root[data-theme='dark'] .lse-insert--open,
        :root[data-theme='dark'] .lse-end-picker {
          background: var(--admin-surface, #1e2330);
          border-color: var(--admin-surface-border, #2a3140);
        }
        .lse-insert__option,
        .lse-end-picker__option {
          background: transparent;
          border: 0;
          text-align: left;
          padding: 6px 10px;
          font-size: 13px;
          color: var(--cpp-ink, #1b1f24);
          border-radius: 4px;
          cursor: pointer;
        }
        .lse-insert__option:hover,
        .lse-end-picker__option:hover,
        .lse-insert__option:focus,
        .lse-end-picker__option:focus {
          background: var(--admin-surface-muted, #f5f7fa);
          outline: none;
        }
        :root[data-theme='dark'] .lse-insert__option:hover,
        :root[data-theme='dark'] .lse-end-picker__option:hover,
        :root[data-theme='dark'] .lse-insert__option:focus,
        :root[data-theme='dark'] .lse-end-picker__option:focus {
          background: var(--admin-surface-muted, #232938);
        }
        .lse-insert__option--cancel,
        .lse-end-picker__option--cancel {
          font-size: 11px;
          color: var(--cpp-muted, #5d6b80);
        }
        .lse-add-block {
          align-self: start;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          color: var(--cpp-ink, #1b1f24);
          background: transparent;
          border: 1px dashed var(--admin-surface-border-strong, #b9c2d0);
          border-radius: 8px;
          cursor: pointer;
        }
        .lse-add-block:hover {
          background: var(--admin-surface-muted, #f5f7fa);
          border-style: solid;
        }
        :root[data-theme='dark'] .lse-add-block { color: var(--cpp-ink, #e6e8eb); }

        /* === Original Lexical editor styles (unchanged) === */
        .cw-rt {
          display: grid;
          grid-template-rows: auto 1fr;
          border: 1px solid var(--admin-surface-border, #d6dce5);
          border-radius: 8px;
          background: var(--admin-surface, #fff);
        }
        .cw-rt__toolbar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 6px;
          border-bottom: 1px solid var(--admin-surface-border, #d6dce5);
          background: var(--admin-surface-muted, #f5f7fa);
          border-radius: 8px 8px 0 0;
        }
        .cw-rt__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          font-size: 13px;
          color: var(--cpp-ink, #1b1f24);
          background: transparent;
          border: 0;
          border-radius: 4px;
          cursor: pointer;
        }
        .cw-rt__btn:hover { background: var(--admin-surface, #fff); }
        .cw-rt__sep {
          width: 1px;
          height: 18px;
          margin: 0 4px;
          background: var(--admin-surface-border, #d6dce5);
        }
        .cw-rt__surface { position: relative; }
        .cw-rt__editable {
          padding: 8px 12px;
          min-height: 80px;
          font-size: 14px;
          line-height: 1.55;
          color: var(--cpp-ink, #1b1f24);
          outline: none;
        }
        .cw-rt__placeholder {
          position: absolute;
          top: 8px;
          left: 12px;
          font-size: 14px;
          color: var(--cpp-muted, #5d6b80);
          pointer-events: none;
          user-select: none;
        }
        .cw-rt__paragraph { margin: 0 0 6px; }
        .cw-rt__paragraph:last-child { margin-bottom: 0; }
        .cw-rt__h1 { font-size: 20px; font-weight: 700; margin: 8px 0; }
        .cw-rt__h2 { font-size: 17px; font-weight: 700; margin: 8px 0; }
        .cw-rt__h3 { font-size: 15px; font-weight: 700; margin: 6px 0; }
        .cw-rt__ul, .cw-rt__ol { margin: 4px 0 4px 20px; padding: 0; }
        .cw-rt__li { margin: 2px 0; }
        .cw-rt__bold { font-weight: 700; }
        .cw-rt__italic { font-style: italic; }
        .cw-rt__underline { text-decoration: underline; }
        .cw-rt__link {
          color: var(--cw-accent, #0d6efd);
          text-decoration: underline;
        }
`
