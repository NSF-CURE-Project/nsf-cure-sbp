'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { AdminViewServerProps } from 'payload'

type ThemeMode = 'light' | 'dark'

const StaffProvider = (props: AdminViewServerProps & { children?: React.ReactNode }) => {
  const user = (props as any)?.user ?? (props as any)?.payload?.user
  const role = user?.role
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href?: string }[]>([])
  const isMountedRef = useRef(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const applyTheme = (value: ThemeMode) => {
      setTheme(value)
      document.documentElement.setAttribute('data-theme', value)
      window.localStorage.setItem('payload-admin-theme', value)
    }

    const userTheme = user?.adminTheme
    if (userTheme === 'light' || userTheme === 'dark') {
      applyTheme(userTheme)
      return
    }

    const stored = window.localStorage.getItem('payload-admin-theme')
    if (stored === 'light' || stored === 'dark') {
      applyTheme(stored)
      return
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const initial = prefersDark ? 'dark' : 'light'
    applyTheme(initial)
  }, [user?.adminTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const formatLabel = (value: string) =>
      value
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())

    const buildCrumbs = (pathname: string) => {
      const segments = pathname.split('/').filter(Boolean)
      const crumbs: { label: string; href?: string }[] = [
        { label: 'Home', href: '/admin' },
      ]

      if (segments[0] !== 'admin') return crumbs
      const rest = segments.slice(1)

      if (!rest.length) return crumbs
      if (rest[0] === 'collections' && rest[1]) {
        const collection = rest[1]
        crumbs.push({ label: formatLabel(collection), href: `/admin/collections/${collection}` })
        if (rest[2]) {
          crumbs.push({ label: rest[2] === 'create' ? 'Create' : 'Edit' })
        }
        return crumbs
      }

      if (rest[0] === 'globals' && rest[1]) {
        crumbs.push({ label: formatLabel(rest[1]) })
        return crumbs
      }

      rest.forEach((segment, index) => {
        const href = `/admin/${rest.slice(0, index + 1).join('/')}`
        crumbs.push({ label: formatLabel(segment), href })
      })

      return crumbs
    }

    const scheduleUpdate = () => {
      window.setTimeout(() => {
        if (!isMountedRef.current) return
        setBreadcrumbs(buildCrumbs(window.location.pathname))
      }, 0)
    }

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args as any)
      scheduleUpdate()
    }
    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args as any)
      scheduleUpdate()
    }

    window.addEventListener('popstate', scheduleUpdate)
    scheduleUpdate()

    return () => {
      isMountedRef.current = false
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('popstate', scheduleUpdate)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next)
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('payload-admin-theme', next)
    }
    if (user?.id) {
      fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminTheme: next }),
      }).catch(() => undefined)
    }
  }

  const themeLabel = useMemo(
    () => (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'),
    [theme],
  )

  return (
    <>
      <style>{`
        :root {
          --cpp-green: #0f172a;
          --cpp-gold: #64748b;
          --cpp-cream: #f7f9ff;
          --cpp-ink: #111827;
          --cpp-muted: #6b7280;
          --admin-surface: #ffffff;
          --admin-surface-muted: #f3f4f6;
          --admin-surface-border: rgba(15, 23, 42, 0.12);
          --admin-hero-bg: var(--admin-surface);
          --admin-hero-border: var(--admin-surface-border);
          --admin-hero-grid: rgba(15, 23, 42, 0.04);
          --admin-chip-bg: rgba(15, 23, 42, 0.06);
          --admin-chip-primary-bg: #111827;
          --admin-chip-primary-text: #ffffff;
          --admin-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
          --theme-bg: #f7f9ff;
          --theme-text: #111827;
          --theme-input-bg: #ffffff;
          --theme-elevation-0: #f7f9ff;
          --theme-elevation-50: #f2f5fb;
          --theme-elevation-100: #e3e9f3;
          --theme-elevation-150: #d4ddec;
          --theme-elevation-200: #c2cfe6;
          --theme-elevation-800: #0f172a;
          --theme-elevation-900: #0b1220;
          --theme-elevation-1000: #05080f;
          --color-success-250: #e2e8f0;
        }

        :root[data-theme="light"] {
          --cpp-cream: #f7f9ff;
          --theme-bg: #f7f9ff;
          --theme-elevation-0: #f7f9ff;
        }

        :root[data-theme="dark"] {
          --cpp-cream: #070b14;
          --cpp-ink: #e7edf6;
          --cpp-muted: #9aa4b2;
          --admin-surface: #0f1624;
          --admin-surface-muted: #121b2a;
          --admin-surface-border: rgba(148, 163, 184, 0.18);
          --admin-hero-bg: var(--admin-surface);
          --admin-hero-border: var(--admin-surface-border);
          --admin-hero-grid: rgba(148, 163, 184, 0.08);
          --admin-chip-bg: rgba(148, 163, 184, 0.14);
          --admin-chip-primary-bg: #e7edf6;
          --admin-chip-primary-text: #070b14;
          --admin-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          --theme-bg: #070b14;
          --theme-text: #e7edf6;
          --theme-input-bg: #0c1220;
          --theme-elevation-0: #070b14;
          --theme-elevation-50: #0b111d;
          --theme-elevation-100: #101827;
          --theme-elevation-150: #151f30;
          --theme-elevation-200: #1b263a;
          --theme-elevation-800: #e7edf6;
          --theme-elevation-900: #f3f6fb;
          --theme-elevation-1000: #ffffff;
          --color-success-250: #1f2937;
        }

        body,
        #app {
          background: var(--theme-bg);
          color: var(--cpp-ink);
        }

        .app-header,
        .nav {
          background: var(--cpp-cream);
        }

        .app-header {
          border-bottom: 1px solid rgba(15, 23, 42, 0.12);
        }

        .app-header {
          display: none;
        }

        .app-header + .template {
          padding-top: 0;
        }

        .admin-breadcrumb-bar {
          position: sticky;
          top: 0;
          z-index: 1200;
          background: var(--admin-surface);
          border-bottom: 1px solid var(--admin-surface-border);
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--cpp-muted);
        }

        .admin-breadcrumb-bar a {
          color: var(--cpp-muted);
          text-decoration: none;
          font-weight: 600;
        }

        .admin-breadcrumb-bar a:hover {
          color: var(--cpp-ink);
        }

        .admin-breadcrumb-sep {
          color: rgba(15, 23, 42, 0.35);
        }

        :root[data-theme="dark"] .admin-breadcrumb-bar {
          background: var(--admin-surface);
          border-bottom: 1px solid var(--admin-surface-border);
        }

        :root[data-theme="dark"] .admin-breadcrumb-sep {
          color: rgba(226, 232, 240, 0.4);
        }

        :root {
          --app-header-height: calc(var(--base) * 2.8);
        }

        .app-header__content {
          min-height: var(--app-header-height);
        }

        .app-header {
          min-height: var(--app-header-height);
        }

        .app-header__controls-wrapper,
        .app-header__controls {
          align-items: center;
        }

        .nav__link {
          background: var(--admin-chip-primary-bg);
          color: var(--admin-chip-primary-text);
          border-radius: calc(var(--base) * 0.4);
          border: 1px solid var(--admin-surface-border);
        }

        .nav__link:hover,
        .nav__link:focus,
        .nav__link--active {
          background: var(--admin-chip-primary-bg);
          color: var(--admin-chip-primary-text);
          filter: brightness(0.96);
        }

        a,
        .link,
        .btn--style-icon-label,
        .btn--style-icon-label .btn__label {
          color: var(--cpp-green);
        }

        .btn--style-primary {
          --bg-color: #111827;
          --hover-bg: #0b1220;
          --color: #ffffff;
        }

        .btn--style-secondary {
          --color: #111827;
          --box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.25);
          --hover-color: #111827;
          --hover-box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.4);
        }

        .pill,
        .btn--style-pill {
          --bg-color: rgba(15, 23, 42, 0.08);
          --color: var(--cpp-ink);
        }

        .table {
          --table-border-color: rgba(15, 23, 42, 0.12);
        }

        .card {
          border-color: rgba(15, 23, 42, 0.12);
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
        }

        :root[data-theme="dark"] .app-header,
        :root[data-theme="dark"] .nav {
          background: #070b14;
        }

        :root[data-theme="dark"] .app-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        :root[data-theme="dark"] .nav__link:hover,
        :root[data-theme="dark"] .nav__link:focus,
        :root[data-theme="dark"] .nav__link--active {
          background: rgba(255, 255, 255, 0.06);
        }

        :root[data-theme="dark"] a,
        :root[data-theme="dark"] .link,
        :root[data-theme="dark"] .btn--style-icon-label,
        :root[data-theme="dark"] .btn--style-icon-label .btn__label {
          color: #cbd5e1;
        }

        :root[data-theme="dark"] .btn--style-primary {
          --bg-color: #e7edf6;
          --hover-bg: #f3f6fb;
          --color: #070b14;
        }

        :root[data-theme="dark"] .btn--style-secondary {
          --color: #e7edf6;
          --box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
          --hover-color: #ffffff;
          --hover-box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.45);
        }

        :root[data-theme="dark"] .pill,
        :root[data-theme="dark"] .btn--style-pill {
          --bg-color: rgba(148, 163, 184, 0.18);
          --color: #e7edf6;
        }

        :root[data-theme="dark"] .table {
          --table-border-color: rgba(255, 255, 255, 0.08);
        }

        :root[data-theme="dark"] .card {
          border-color: rgba(148, 163, 184, 0.2);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5);
          background: #0f1624;
        }

        :root[data-theme="dark"] .field-type {
          color: var(--theme-text);
        }

        :root[data-theme="dark"] .input,
        :root[data-theme="dark"] input,
        :root[data-theme="dark"] textarea,
        :root[data-theme="dark"] select {
          background: var(--theme-input-bg);
          color: var(--theme-text);
          border-color: rgba(255, 255, 255, 0.1);
        }

        :root[data-theme="dark"] .dashboard-card,
        :root[data-theme="dark"] .quick-action-card > div,
        :root[data-theme="dark"] .dashboard-stat-card,
        :root[data-theme="dark"] .dashboard-panel {
          background: var(--admin-surface);
          border-color: var(--admin-surface-border);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
        }

        :root[data-theme="dark"] .dashboard-card div,
        :root[data-theme="dark"] .quick-action-card > div div,
        :root[data-theme="dark"] .dashboard-stat-card div,
        :root[data-theme="dark"] .dashboard-panel div {
          color: var(--cpp-ink) !important;
        }

        :root[data-theme="dark"] .dashboard-panel div + div {
          color: var(--cpp-muted) !important;
        }

        :root[data-theme="dark"] .dashboard-chip {
          background: var(--admin-chip-bg) !important;
          color: var(--cpp-ink) !important;
        }

        .admin-theme-toggle {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 9999;
          border-radius: 0;
          border: 1px solid var(--admin-surface-border);
          background: var(--admin-surface);
          color: var(--cpp-ink);
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: var(--admin-shadow);
          transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;
        }

        .admin-theme-toggle:hover {
          filter: brightness(0.97);
          transform: translateY(-1px);
        }

        .admin-theme-toggle:active {
          transform: translateY(0);
        }

        :root[data-theme="dark"] .admin-theme-toggle {
          background: var(--admin-surface);
          color: var(--cpp-ink);
          border-color: var(--admin-surface-border);
        }

        .collection-edit--lessons .collection-edit__main-wrapper,
        .collection-edit--pages .collection-edit__main-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .collection-edit--lessons .live-preview-window,
        .collection-edit--pages .live-preview-window {
          order: -1;
          width: 100%;
          height: 70vh;
          position: relative;
          top: 0;
        }

        .collection-edit--lessons .live-preview-window__wrapper,
        .collection-edit--pages .live-preview-window__wrapper {
          height: 100%;
        }

        .collection-edit--lessons .collection-edit__main,
        .collection-edit--pages .collection-edit__main {
          width: 100%;
        }
      `}</style>
      {role === 'staff' ? (
        <style>{`
          .nav__toggle, [data-element="nav-toggle"] {
            display: none !important;
          }
        `}</style>
      ) : null}
      <button
        type="button"
        className="admin-theme-toggle"
        onClick={toggleTheme}
        aria-pressed={theme === 'dark'}
        aria-label={themeLabel}
      >
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
      {breadcrumbs.length ? (
        <div className="admin-breadcrumb-bar" role="navigation" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {crumb.href && index < breadcrumbs.length - 1 ? (
                <a href={crumb.href}>{crumb.label}</a>
              ) : (
                <span style={{ color: 'var(--cpp-ink)', fontWeight: 700 }}>{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 ? (
                <span className="admin-breadcrumb-sep">/</span>
              ) : null}
            </React.Fragment>
          ))}
        </div>
      ) : null}
      {props.children}
    </>
  )
}

export default StaffProvider
