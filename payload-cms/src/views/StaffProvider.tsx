'use client'

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { AdminViewServerProps } from 'payload'
import { useAuth } from '@payloadcms/ui'

type ThemeMode = 'light' | 'dark'

const StaffProvider = (props: AdminViewServerProps & { children?: React.ReactNode }) => {
  const auth = useAuth()
  const serverUser = (props as any)?.user ?? (props as any)?.payload?.user
  const user = auth?.user ?? serverUser
  const role = user?.role
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href?: string }[]>([])
  const [isLoginPage, setIsLoginPage] = useState(false)
  const isMountedRef = useRef(true)
  const getIsLoginPath = (pathname: string) =>
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/forgot-password') ||
    pathname.startsWith('/admin/reset-password')

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const loginPage = getIsLoginPath(window.location.pathname)
    setIsLoginPage(loginPage)
    document.documentElement.setAttribute('data-admin-login', loginPage ? 'true' : 'false')

    const applyTheme = (value: ThemeMode) => {
      setTheme(value)
      document.documentElement.setAttribute('data-theme', value)
      document.body?.setAttribute('data-theme', value)
      window.localStorage.setItem('payload-admin-theme', value)
      window.localStorage.setItem('payload-theme', value)
      document.cookie = `payload-admin-theme=${value}; path=/; max-age=31536000`
      document.cookie = `payload-theme=${value}; path=/; max-age=31536000`
    }

    const userTheme = user?.adminTheme
    if (userTheme === 'light' || userTheme === 'dark') {
      applyTheme(userTheme)
      return
    }

    const stored =
      window.localStorage.getItem('payload-admin-theme') ??
      window.localStorage.getItem('payload-theme')
    if (stored === 'light' || stored === 'dark') {
      applyTheme(stored)
      return
    }

    const docTheme = document.documentElement.getAttribute('data-theme')
    if (docTheme === 'light' || docTheme === 'dark') {
      applyTheme(docTheme)
      return
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const initial = prefersDark ? 'dark' : 'light'
    applyTheme(initial)
  }, [user?.adminTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
    document.body?.setAttribute('data-theme', theme)
    window.localStorage.setItem('payload-admin-theme', theme)
    window.localStorage.setItem('payload-theme', theme)
    document.cookie = `payload-admin-theme=${theme}; path=/; max-age=31536000`
    document.cookie = `payload-theme=${theme}; path=/; max-age=31536000`

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes') continue
        const current = document.documentElement.getAttribute('data-theme')
        if (current && current !== theme) {
          document.documentElement.setAttribute('data-theme', theme)
          document.body?.setAttribute('data-theme', theme)
        }
      }
    })

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [theme])

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
        const pathname = window.location.pathname
        setBreadcrumbs(buildCrumbs(pathname))
        const loginPage = getIsLoginPath(pathname)
        setIsLoginPage(loginPage)
        document.documentElement.setAttribute('data-admin-login', loginPage ? 'true' : 'false')
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
      document.documentElement.removeAttribute('data-admin-login')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!user?.id) return
    const pathname = window.location.pathname
    if (!getIsLoginPath(pathname)) {
      setIsLoginPage(false)
      document.documentElement.setAttribute('data-admin-login', 'false')
    }
  }, [user?.id])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next)
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('payload-admin-theme', next)
      window.localStorage.setItem('payload-theme', next)
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
  const showBreadcrumbs = breadcrumbs.length > 1
  const initials = useMemo(() => {
    const first = (user as any)?.firstName?.trim() ?? (user as any)?.first_name?.trim()
    const last = (user as any)?.lastName?.trim() ?? (user as any)?.last_name?.trim()
    if (first || last) {
      return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U'
    }
    const email = (user as any)?.email ?? ''
    if (email) {
      return (
        email
          .split('@')[0]
          .split(/[^a-zA-Z0-9]/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join('') || 'U'
      )
    }
    return 'U'
  }, [user?.email, user?.firstName, user?.lastName])
  const displayName = useMemo(() => {
    const first = (user as any)?.firstName?.trim() ?? (user as any)?.first_name?.trim()
    const last = (user as any)?.lastName?.trim() ?? (user as any)?.last_name?.trim()
    const name = [first, last].filter(Boolean).join(' ')
    return name || (user as any)?.email || 'User'
  }, [user?.email, user?.firstName, user?.lastName])

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

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme]) {
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
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          color: var(--cpp-muted);
          padding: 0;
          background: transparent;
          border: 0;
        }

        .admin-breadcrumb-bar--hidden {
          display: none;
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
          --bg-color: var(--admin-chip-primary-bg);
          --hover-bg: var(--admin-chip-primary-bg);
          --color: var(--admin-chip-primary-text);
        }

        .btn--style-primary:hover {
          filter: brightness(0.95);
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
          --bg-color: var(--admin-chip-primary-bg);
          --hover-bg: var(--admin-chip-primary-bg);
          --color: var(--admin-chip-primary-text);
        }

        :root[data-theme="dark"] .btn--style-primary:hover {
          filter: brightness(1.05);
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

        .dashboard-chip {
          transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
        }

        .dashboard-chip:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 18px rgba(15, 23, 42, 0.16);
          border-color: rgba(148, 163, 184, 0.35);
        }

        :root[data-theme="dark"] .dashboard-chip:hover {
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.5);
          border-color: rgba(148, 163, 184, 0.4);
        }

        .dashboard-chip--link {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          color: var(--cpp-muted) !important;
        }

        .dashboard-chip--link:hover {
          transform: none;
          box-shadow: none;
          color: var(--cpp-ink) !important;
        }

        .dashboard-chip--secondary {
          background: transparent !important;
          box-shadow: none !important;
        }

        :root[data-theme="dark"] .admin-quick-overview {
          background: #131c2b;
          border-color: rgba(148, 163, 184, 0.22);
          box-shadow: 0 12px 28px rgba(8, 12, 20, 0.4);
        }

        :root[data-theme="dark"] .admin-dashboard-hero {
          background: #182235 !important;
          border-color: rgba(148, 163, 184, 0.2);
          box-shadow: 0 16px 36px rgba(7, 10, 16, 0.45);
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

        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 18px;
          background: var(--admin-surface);
          border-bottom: 1px solid var(--admin-surface-border);
        }

        .admin-topbar-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
        }

        .admin-topbar-actions {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .admin-user-menu summary {
          list-style: none;
          cursor: pointer;
        }

        .admin-user-menu summary::-webkit-details-marker {
          display: none;
        }

        .admin-user-menu {
          position: relative;
        }

        .admin-user-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px 6px 8px;
          border-radius: 999px;
          border: 1px solid var(--admin-surface-border);
          background: var(--admin-surface);
          color: var(--cpp-ink);
          font-weight: 600;
          box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
        }

        .admin-user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid var(--admin-surface-border);
          background: var(--admin-chip-primary-bg);
          color: var(--admin-chip-primary-text);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .admin-user-name {
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 13px;
        }

        .admin-user-caret {
          width: 14px;
          height: 14px;
          opacity: 0.7;
        }

        .admin-user-dropdown {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 10px;
          background: var(--admin-surface);
          border: 1px solid var(--admin-surface-border);
          border-radius: 8px;
          padding: 8px;
          min-width: 180px;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
        }

        .admin-user-dropdown a {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 6px;
          color: var(--cpp-ink);
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
        }

        .admin-user-dropdown a:hover {
          background: var(--admin-surface-muted);
        }

        .admin-user-divider {
          height: 1px;
          background: var(--admin-surface-border);
          margin: 6px 4px;
        }
      `}</style>
      {role === 'staff' ? (
        <style>{`
          .nav__toggle, [data-element="nav-toggle"] {
            display: none !important;
          }
        `}</style>
      ) : null}
      {!isLoginPage ? (
        <div className="admin-topbar">
          {showBreadcrumbs ? (
            <div className="admin-topbar-center">
              <div className="admin-breadcrumb-bar" role="navigation" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={`${crumb.label}-${index}`}>
                    {crumb.href && index < breadcrumbs.length - 1 ? (
                      <a href={crumb.href}>{crumb.label}</a>
                    ) : (
                      <span style={{ color: 'var(--cpp-ink)', fontWeight: 700 }}>
                        {crumb.label}
                      </span>
                    )}
                    {index < breadcrumbs.length - 1 ? (
                      <span className="admin-breadcrumb-sep">/</span>
                    ) : null}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
          <div className="admin-topbar-actions">
            <button
              type="button"
              className="admin-theme-toggle"
              onClick={toggleTheme}
              aria-pressed={theme === 'dark'}
              aria-label={themeLabel}
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <details className="admin-user-menu">
              <summary className="admin-user-button" aria-label="User menu">
                <span className="admin-user-avatar" aria-hidden="true">
                  {initials}
                </span>
                <span className="admin-user-name">{displayName}</span>
                <svg
                  className="admin-user-caret"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="admin-user-dropdown">
                <a href="/admin/account">Your Account</a>
                <a href="/admin/help">Help</a>
                <div className="admin-user-divider" />
                <a href="/admin/logout">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                  </span>
                </a>
              </div>
            </details>
          </div>
        </div>
      ) : null}
      {props.children}
    </>
  )
}

export default StaffProvider
