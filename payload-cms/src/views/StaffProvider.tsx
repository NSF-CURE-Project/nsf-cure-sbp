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
  const getIsLoginPath = (pathname: string) =>
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/forgot-password') ||
    pathname.startsWith('/admin/reset-password')
  const getIsHelpPath = (pathname: string) => pathname.startsWith('/admin/help')
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href?: string }[]>([])
  const [isLoginPage, setIsLoginPage] = useState(() => {
    if (typeof window === 'undefined') return false
    return getIsLoginPath(window.location.pathname)
  })
  const [previewGate, setPreviewGate] = useState<{
    open: boolean
    url: string | null
    loading: boolean
    error: string | null
  }>({ open: false, url: null, loading: false, error: null })
  const isMountedRef = useRef(true)
  const pendingPublishRef = useRef<HTMLButtonElement | null>(null)
  const allowPublishRef = useRef(false)
  const previewRequestRef = useRef(0)
  const isLoginPath =
    typeof window === 'undefined' ? isLoginPage : getIsLoginPath(window.location.pathname)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const loginPage = getIsLoginPath(window.location.pathname)
    setIsLoginPage(loginPage)
    document.documentElement.setAttribute('data-admin-login', loginPage ? 'true' : 'false')
    const helpPage = getIsHelpPath(window.location.pathname)
    const context = loginPage ? 'login' : helpPage ? 'help' : 'app'
    document.documentElement.setAttribute('data-admin-context', context)

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
        const helpPage = getIsHelpPath(pathname)
        const context = loginPage ? 'login' : helpPage ? 'help' : 'app'
        document.documentElement.setAttribute('data-admin-context', context)
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
      document.documentElement.removeAttribute('data-admin-context')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!user?.id) return
    const pathname = window.location.pathname
    if (!getIsLoginPath(pathname)) {
      setIsLoginPage(false)
      document.documentElement.setAttribute('data-admin-login', 'false')
      if (!getIsHelpPath(pathname)) {
        document.documentElement.setAttribute('data-admin-context', 'app')
      }
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

  const hideAdminThemePreference = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    if (!window.location.pathname.startsWith('/admin/account')) return

    const labels = Array.from(document.querySelectorAll('label, legend, span, h3, h4, p, div'))
    let hidden = false
    labels.forEach((el) => {
      const text = el.textContent?.trim()
      if (!text || text !== 'Admin Theme') return
      const container = el.closest(
        '[data-field="adminTheme"], [data-field-name="adminTheme"], .field, .field-type, .form-field, .preferences__field, .account__field, .card, .group-field, .array-field',
      )
      if (container instanceof HTMLElement) {
        container.style.display = 'none'
        hidden = true
      } else if (el instanceof HTMLElement) {
        el.style.display = 'none'
        hidden = true
      }
    })

    if (hidden) return

    const themeRadios = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    ).filter((input) => ['automatic', 'light', 'dark'].includes(input.value))
    const container = themeRadios[0]?.closest(
      '.field, .field-type, .form-field, .preferences__field, .account__field, .card, .group-field, .array-field',
    )
    if (container instanceof HTMLElement) {
      container.style.display = 'none'
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    hideAdminThemePreference()
    const observer = new MutationObserver(() => hideAdminThemePreference())
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const getPreviewTarget = () => {
      const path = window.location.pathname
      const collectionMatch = path.match(/\/admin\/collections\/([^/]+)\/([^/]+)/)
      if (collectionMatch && collectionMatch[1] && collectionMatch[2]) {
        const collection = collectionMatch[1]
        const id = collectionMatch[2]
        if (id !== 'create') {
          return { type: 'collection' as const, slug: collection, id }
        }
      }
      const globalMatch = path.match(/\/admin\/globals\/([^/]+)/)
      if (globalMatch && globalMatch[1]) {
        const slug = globalMatch[1]
        return { type: 'global' as const, slug }
      }
      return null
    }

    const isPublishButton = (button: HTMLButtonElement) => {
      const label = button.textContent?.trim().toLowerCase() ?? ''
      if (!label) return false
      if (label.includes('unpublish')) return false
      return label.includes('publish')
    }

    const onClickCapture = (event: MouseEvent) => {
      if (allowPublishRef.current) return
      if (previewGate.open) return
      const target = event.target as HTMLElement | null
      if (!target) return
      const button = target.closest('button')
      if (!button) return
      if (!isPublishButton(button)) return
      const targetInfo = getPreviewTarget()
      if (!targetInfo) return

      event.preventDefault()
      event.stopPropagation()
      pendingPublishRef.current = button
      const requestId = previewRequestRef.current + 1
      previewRequestRef.current = requestId
      setPreviewGate({ open: true, url: null, loading: true, error: null })

      const query = new URLSearchParams()
      query.set('type', targetInfo.type)
      query.set('slug', targetInfo.slug)
      if (targetInfo.type === 'collection') {
        query.set('id', targetInfo.id)
      }

      fetch(`/api/preview-url?${query.toString()}`, {
        method: 'GET',
        credentials: 'include',
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => null)
            throw new Error(data?.message ?? 'Unable to load preview URL.')
          }
          return res.json()
        })
        .then((data: { url?: string }) => {
          if (previewRequestRef.current !== requestId) return
          if (!data?.url) {
            throw new Error('Preview URL is missing.')
          }
          setPreviewGate({ open: true, url: data.url, loading: false, error: null })
        })
        .catch((error) => {
          if (previewRequestRef.current !== requestId) return
          setPreviewGate({
            open: true,
            url: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unable to load preview URL.',
          })
        })
    }

    document.addEventListener('click', onClickCapture, true)
    return () => {
      document.removeEventListener('click', onClickCapture, true)
    }
  }, [previewGate.open])

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

        .collection-list {
          background: transparent;
          padding-top: 12px;
        }

        .collection-list__header {
          margin-top: 14px;
          padding: 24px 18px 16px;
          border-radius: 16px;
          border: 1px solid var(--admin-surface-border);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.04));
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.22);
          position: relative;
          overflow: hidden;
        }

        .collection-list__header::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(148, 163, 184, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px);
          background-size: 140px 140px;
          opacity: 0.16;
          pointer-events: none;
        }

        .collection-list__header h1 {
          font-size: 30px;
          letter-spacing: -0.4px;
          font-weight: 900;
          color: var(--cpp-ink);
          margin-top: 8px;
        }

        .collection-list__title,
        .collection-list__header .view-title,
        .collection-list__header-title {
          padding-top: 8px;
        }

        .collection-list__actions .btn {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: var(--admin-chip-primary-bg);
          color: var(--admin-chip-primary-text);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.28);
        }

        .collection-list__actions .btn--style-primary {
          background: var(--admin-chip-primary-bg);
          color: var(--admin-chip-primary-text);
          border: 1px solid rgba(148, 163, 184, 0.4);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.28);
        }

        .collection-list__actions .btn--style-primary:hover {
          filter: brightness(1.05);
        }

        .list-controls {
          margin-top: 14px;
          padding: 14px 16px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.06));
          border: 1px solid var(--admin-surface-border);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.22);
        }

        .list-controls__search {
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.12);
          border: 1px solid rgba(148, 163, 184, 0.24);
          box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
        }

        .list-controls__search input {
          background: transparent;
          color: var(--cpp-ink);
        }

        .list-controls__buttons .btn {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(15, 23, 42, 0.12);
          color: var(--cpp-ink);
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.2);
        }

        .list-controls__buttons .btn:hover {
          filter: brightness(1.05);
        }

        .table {
          margin-top: 14px;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.02));
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid var(--admin-surface-border);
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
        }

        .table thead th {
          background: rgba(15, 23, 42, 0.08);
          color: var(--cpp-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 11px;
        }

        .table tbody tr {
          background: transparent;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .table tbody tr:hover {
          background: rgba(15, 23, 42, 0.08);
        }

        .table tbody td a {
          color: var(--cpp-ink);
          font-weight: 600;
        }

        .list-selection {
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.14);
          border: 1px solid var(--admin-surface-border);
          box-shadow: 0 12px 26px rgba(15, 23, 42, 0.2);
        }

        .collection-list__no-results,
        .list__no-results,
        .list__no-results-message {
          color: var(--cpp-muted);
          font-size: 13px;
        }

        .collection-list__no-results > p,
        .list__no-results > p {
          display: none;
        }

        .collection-list__no-results::before,
        .list__no-results::before {
          content: 'No classes found. Create one below.';
          display: block;
          color: var(--cpp-muted);
          font-size: 13px;
          margin-bottom: 10px;
        }

        .collection-list__no-results .btn,
        .list__no-results .btn,
        .collection-list__no-results button,
        .list__no-results button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 14px;
          min-height: 34px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          border-radius: 8px;
          background: var(--admin-chip-primary-bg);
          color: var(--admin-chip-primary-text);
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .collection-list__no-results .btn:hover,
        .list__no-results .btn:hover,
        .collection-list__no-results button:hover,
        .list__no-results button:hover {
          filter: brightness(1.05);
        }

        html[data-admin-context='app'] .collection-edit,
        html[data-admin-context='app'] .global-edit,
        html[data-admin-context='app'] .edit-view {
          background: transparent;
        }

        html[data-admin-context='app'] .collection-edit__header,
        html[data-admin-context='app'] .global-edit__header,
        html[data-admin-context='app'] .edit-view__header,
        html[data-admin-context='app'] .document-header {
          margin-top: 12px;
          padding: 18px 20px;
          border-radius: 16px;
          border: 1px solid var(--admin-surface-border);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.04));
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.24);
        }

        html[data-admin-context='app'] .collection-edit__header h1,
        html[data-admin-context='app'] .global-edit__header h1,
        html[data-admin-context='app'] .edit-view__header h1,
        html[data-admin-context='app'] .document-header h1 {
          font-weight: 900;
          letter-spacing: -0.3px;
        }

        html[data-admin-context='app'] .collection-edit__main,
        html[data-admin-context='app'] .global-edit__main,
        html[data-admin-context='app'] .edit-view__content {
          background: transparent;
        }

        html[data-admin-context='app'] .document-fields,
        html[data-admin-context='app'] .document-fields__tabs,
        html[data-admin-context='app'] .form,
        html[data-admin-context='app'] .drawer__content,
        html[data-admin-context='app'] .popup,
        html[data-admin-context='app'] .modal,
        html[data-admin-context='app'] .card {
          background: var(--admin-surface);
          border: 1px solid var(--admin-surface-border);
          border-radius: 16px;
          box-shadow: var(--admin-shadow);
        }

        html[data-admin-context='app'] .document-fields,
        html[data-admin-context='app'] .document-fields__tabs {
          padding: 18px;
        }

        html[data-admin-context='app'] .tabs,
        html[data-admin-context='app'] .tabs__list {
          border-radius: 999px;
          padding: 6px;
          background: rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(148, 163, 184, 0.25);
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
        }

        html[data-admin-context='app'] .tabs__tab {
          border-radius: 999px;
          padding: 6px 14px;
          font-weight: 700;
          color: var(--cpp-muted);
        }

        html[data-admin-context='app'] .tabs__tab--active,
        html[data-admin-context='app'] .tabs__tab[aria-selected='true'] {
          background: var(--admin-chip-primary-bg);
          color: var(--admin-chip-primary-text);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
        }

        html[data-admin-context='app'] .field-type,
        html[data-admin-context='app'] .field-type--group,
        html[data-admin-context='app'] .array-field,
        html[data-admin-context='app'] .group-field {
          background: rgba(15, 23, 42, 0.04);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 14px;
          padding: 12px 14px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        }

        html[data-admin-context='app'] .array-field__header,
        html[data-admin-context='app'] .group-field__header {
          padding-bottom: 8px;
          margin-bottom: 10px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }

        html[data-admin-context='app'] .array-field__row {
          background: var(--admin-surface);
          border: 1px solid var(--admin-surface-border);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
        }

        html[data-admin-context='app'] .table [data-field='createdAt'],
        html[data-admin-context='app'] .table [data-field='updatedAt'],
        html[data-admin-context='app'] .table [data-field='lastModified'],
        html[data-admin-context='app'] .table td[data-column='createdAt'],
        html[data-admin-context='app'] .table td[data-column='updatedAt'],
        html[data-admin-context='app'] .table td[data-column='lastModified'] {
          font-size: 12px;
          color: var(--cpp-muted);
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        html[data-admin-context='app'] .document-header__meta,
        html[data-admin-context='app'] .document-header__meta *,
        html[data-admin-context='app'] .collection-edit__meta,
        html[data-admin-context='app'] .collection-edit__meta *,
        html[data-admin-context='app'] .global-edit__meta,
        html[data-admin-context='app'] .global-edit__meta *,
        html[data-admin-context='app'] .edit-view__meta,
        html[data-admin-context='app'] .edit-view__meta * {
          font-size: 12px;
          color: var(--cpp-muted);
          font-weight: 600;
          letter-spacing: 0.02em;
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

        .admin-preview-gate {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 24px;
        }

        .admin-preview-panel {
          width: min(1100px, 95vw);
          height: min(80vh, 760px);
          background: var(--admin-surface);
          border: 1px solid var(--admin-surface-border);
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.45);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .admin-preview-panel header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--admin-surface-border);
          background: var(--admin-surface-muted);
        }

        .admin-preview-panel h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--cpp-ink);
          margin: 0;
        }

        .admin-preview-panel iframe {
          flex: 1;
          border: none;
          width: 100%;
          background: var(--theme-bg);
        }

        .admin-preview-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
      {role === 'staff' ? (
        <style>{`
          .nav__toggle, [data-element="nav-toggle"] {
            display: none !important;
          }
        `}</style>
      ) : null}
      {!isLoginPath ? (
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
      {previewGate.open ? (
        <div className="admin-preview-gate">
          <div className="admin-preview-panel" role="dialog" aria-modal="true">
            <header>
              <h3>Review live preview before publishing</h3>
              <div className="admin-preview-actions">
                <button
                  type="button"
                  className="btn btn--style-secondary"
                  onClick={() => {
                    setPreviewGate({ open: false, url: null, loading: false, error: null })
                    pendingPublishRef.current = null
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn--style-primary"
                  disabled={previewGate.loading || Boolean(previewGate.error)}
                  onClick={() => {
                    const pendingButton = pendingPublishRef.current
                    setPreviewGate({ open: false, url: null, loading: false, error: null })
                    pendingPublishRef.current = null
                    if (pendingButton) {
                      allowPublishRef.current = true
                      pendingButton.click()
                      window.setTimeout(() => {
                        allowPublishRef.current = false
                      }, 0)
                    }
                  }}
                >
                  Publish now
                </button>
              </div>
            </header>
            {previewGate.loading ? (
              <div style={{ padding: 16, color: 'var(--cpp-muted)' }}>
                Loading preview…
              </div>
            ) : previewGate.error ? (
              <div style={{ padding: 16, color: '#dc2626' }}>{previewGate.error}</div>
            ) : previewGate.url ? (
              <iframe title="Live preview" src={previewGate.url} />
            ) : (
              <div style={{ padding: 16, color: 'var(--cpp-muted)' }}>
                Preview unavailable.
              </div>
            )}
          </div>
        </div>
      ) : null}
      {props.children}
    </>
  )
}

export default StaffProvider
