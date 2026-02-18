'use client'

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { useAuth } from '@payloadcms/ui'

type ThemeMode = 'light' | 'dark'
type AdminUser = {
  email?: string
  role?: string
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
}

const StaffProvider = (props: AdminViewServerProps & { children?: React.ReactNode }) => {
  const auth = useAuth()
  const serverUser =
    (props as { user?: AdminUser; payload?: { user?: AdminUser } })?.user ??
    (props as { payload?: { user?: AdminUser } })?.payload?.user
  const user = (auth?.user as AdminUser | undefined) ?? serverUser
  const role = user?.role
  const userTheme = (user as { adminTheme?: string } | null)?.adminTheme
  const userId = (user as { id?: string | number } | null)?.id
  const getIsLoginPath = (pathname: string) =>
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/forgot-password') ||
    pathname.startsWith('/admin/reset-password')
  const getIsHelpPath = (pathname: string) => pathname.startsWith('/admin/help')
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [backHref, setBackHref] = useState<string | null>(null)
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
  const previewGateOpenRef = useRef(false)
  const isMountedRef = useRef(true)
  const pendingPublishRef = useRef<HTMLButtonElement | null>(null)
  const allowPublishRef = useRef(false)
  const previewRequestRef = useRef(0)
  const fetchRef = useRef<typeof window.fetch | null>(null)
  const fetchWrappedRef = useRef(false)
  const allowDraftSaveRef = useRef(false)
  const publishIntentRef = useRef(false)
  const autoSaveTimerRef = useRef<number | null>(null)
  const autoSaveInFlightRef = useRef(false)
  const lastPathRef = useRef<string | null>(null)
  const backHrefRef = useRef<string | null>(null)
  const backUpdateTimerRef = useRef<number | null>(null)
  const pathStackRef = useRef<string[]>([])

  const expandPageLayout = useCallback(() => {
    if (typeof document === 'undefined') return
    const form = document.querySelector<HTMLElement>(
      'form.collection-edit__form, form.global-edit__form',
    )
    if (!form) {
      document.documentElement.setAttribute('data-layout-ready', 'false')
      return
    }
    if (form.dataset.layoutExpanded === 'true') {
      document.documentElement.setAttribute('data-layout-ready', 'true')
      return
    }

    const showAllButtons = Array.from(
      form.querySelectorAll<HTMLButtonElement>('button, a'),
    ).filter((btn) => {
      const label = btn.textContent?.trim().toLowerCase() ?? ''
      return label === 'show all' || label === 'expand all'
    })

    showAllButtons.forEach((btn) => {
      if (!btn.disabled) {
        btn.click()
      }
    })

    form.dataset.layoutExpanded = 'true'
    document.documentElement.setAttribute('data-layout-ready', 'true')
  }, [])

  const getStatusStorageKey = useCallback(() => {
    if (typeof window === 'undefined') return null
    const path = window.location.pathname
    const collectionMatch = path.match(/\/admin\/collections\/([^/]+)\/([^/]+)/)
    if (collectionMatch?.[1] && collectionMatch?.[2] && collectionMatch[2] !== 'create') {
      return `admin-status:collection:${collectionMatch[1]}:${collectionMatch[2]}`
    }
    const globalMatch = path.match(/\/admin\/globals\/([^/]+)/)
    if (globalMatch?.[1]) {
      return `admin-status:global:${globalMatch[1]}`
    }
    return null
  }, [])

  const forceStatusPublished = useCallback(() => {
    const status = document.querySelector<HTMLElement>('.admin-status-pill')
    if (!status) return false
    const text = status.textContent?.toLowerCase() ?? ''
    if (!text.includes('draft') && !text.includes('changed')) return false
    status.textContent = 'Status: Published'
    status.classList.add('admin-status-published')
    const key = getStatusStorageKey()
    if (key) {
      window.localStorage.setItem(key, 'published')
    }
    return true
  }, [getStatusStorageKey])

  const forceStatusChanged = useCallback(() => {
    const status = document.querySelector<HTMLElement>('.admin-status-pill')
    if (!status) return false
    status.textContent = 'Status: Changed'
    status.classList.remove('admin-status-published')
    const key = getStatusStorageKey()
    if (key) {
      window.localStorage.removeItem(key)
    }
    return true
  }, [getStatusStorageKey])

  const syncStatusFromDoc = useCallback(() => {
    const status = document.querySelector<HTMLElement>('.admin-status-pill')
    if (!status) return false
    const hasRevert = Boolean(
      document.querySelector('.doc-controls__meta a[href*="revert"]') ||
        document.querySelector('.doc-controls__meta a[href*="revert-to-published"]') ||
        document.querySelector('.doc-controls__meta button[aria-label*="Revert"]')
    )
    if (hasRevert) {
      return forceStatusChanged()
    }
    status.textContent = 'Status: Published'
    status.classList.add('admin-status-published')
    const key = getStatusStorageKey()
    if (key) {
      window.localStorage.setItem(key, 'published')
    }
    return true
  }, [forceStatusChanged, getStatusStorageKey])

  const triggerPreviewDisable = (previewUrl?: string | null) => {
    if (!previewUrl) return
    try {
      const origin = new URL(previewUrl).origin
      const img = new Image()
      img.src = `${origin}/api/preview/disable?ts=${Date.now()}`
    } catch {
      // ignore invalid URL
    }
  }

  useEffect(() => {
    previewGateOpenRef.current = previewGate.open
  }, [previewGate.open])
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
  }, [userTheme])

  useLayoutEffect(() => {
    expandPageLayout()
    document.documentElement.setAttribute('data-layout-ready', 'false')
    const layoutObserver = new MutationObserver(expandPageLayout)
    layoutObserver.observe(document.body, { childList: true, subtree: true })
    return () => layoutObserver.disconnect()
  }, [expandPageLayout])

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

    const updatePageMeta = () => {
      if (!isMountedRef.current) return
      const pathname = window.location.pathname
      if (typeof window !== 'undefined') {
        const stored = window.sessionStorage.getItem('admin-path-stack')
        const stack = stored ? stored.split('|').filter(Boolean) : []
        const last = stack[stack.length - 1]
        if (last !== pathname) {
          stack.push(pathname)
        }
        if (stack.length > 50) {
          stack.splice(0, stack.length - 50)
        }
        pathStackRef.current = stack
        window.sessionStorage.setItem('admin-path-stack', stack.join('|'))
        const prev = stack.length > 1 ? stack[stack.length - 2] : null
        if (backHrefRef.current !== prev) {
          backHrefRef.current = prev
          setBackHref(prev)
        }
      }
      lastPathRef.current = pathname
      const loginPage = getIsLoginPath(pathname)
      setIsLoginPage(loginPage)
      document.documentElement.setAttribute('data-admin-login', loginPage ? 'true' : 'false')
      const helpPage = getIsHelpPath(pathname)
      const context = loginPage ? 'login' : helpPage ? 'help' : 'app'
      document.documentElement.setAttribute('data-admin-context', context)
    }

    const scheduleUpdate = () => {
      if (backUpdateTimerRef.current) {
        window.clearTimeout(backUpdateTimerRef.current)
      }
      backUpdateTimerRef.current = window.setTimeout(() => {
        updatePageMeta()
      }, 0)
    }

    const originalPushState = window.history.pushState.bind(window.history)
    const originalReplaceState = window.history.replaceState.bind(window.history)

    window.history.pushState = function (...args: Parameters<History['pushState']>) {
      originalPushState(...args)
      scheduleUpdate()
    }
    window.history.replaceState = function (...args: Parameters<History['replaceState']>) {
      originalReplaceState(...args)
      scheduleUpdate()
    }

    window.addEventListener('popstate', scheduleUpdate)
    scheduleUpdate()
    const pathPoll = window.setInterval(() => {
      if (!isMountedRef.current) return
      if (window.location.pathname !== lastPathRef.current) {
        scheduleUpdate()
      }
    }, 200)

    return () => {
      isMountedRef.current = false
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('popstate', scheduleUpdate)
      window.clearInterval(pathPoll)
      if (backUpdateTimerRef.current) {
        window.clearTimeout(backUpdateTimerRef.current)
      }
      document.documentElement.removeAttribute('data-admin-login')
      document.documentElement.removeAttribute('data-admin-context')
    }
  }, [role])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!userId) return
    const pathname = window.location.pathname
    if (!getIsLoginPath(pathname)) {
      setIsLoginPage(false)
      document.documentElement.setAttribute('data-admin-login', 'false')
      if (!getIsHelpPath(pathname)) {
        document.documentElement.setAttribute('data-admin-context', 'app')
      }
    }
  }, [userId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let rafId = 0

    const updateEditHeader = () => {
      const path = window.location.pathname
      const isEditView =
        /\/admin\/collections\/[^/]+\/[^/]+/.test(path) ||
        /\/admin\/globals\/[^/]+/.test(path)
      if (!isEditView) return

      const header = document.querySelector(
        '.doc-controls, .document-header, .collection-edit__header, .global-edit__header, .edit-view__header',
      ) as HTMLElement | null
        if (!header) return

      header.classList.add('admin-edit-header')

      const meta = header.querySelector(
        '.doc-controls__meta, .document-header__meta, .collection-edit__meta, .global-edit__meta, .edit-view__meta',
      ) as HTMLElement | null
      if (meta) {
        meta.classList.add('admin-edit-meta')
        const statusItem = Array.from(meta.children).find((child) =>
          child.textContent?.toLowerCase().includes('status'),
        ) as HTMLElement | undefined
        if (statusItem) {
          statusItem.classList.add('admin-status-pill')
          const statusText = statusItem.textContent?.toLowerCase() ?? ''
          const key = getStatusStorageKey()
          if (
            key &&
            statusText.includes('draft') &&
            !statusText.includes('changed') &&
            window.localStorage.getItem(key) === 'published'
          ) {
            statusItem.textContent = 'Status: Published'
            statusItem.classList.add('admin-status-published')
          }
        }
      }

      const actions = header.querySelector(
        '.doc-controls__actions, .document-header__actions, .document-controls__actions, .document-header__action-buttons',
      ) as HTMLElement | null
      if (actions) actions.classList.add('admin-edit-actions')

      if (actions) {
        const livePreviewButton = actions.querySelector<HTMLButtonElement>(
          '.live-preview-toggler',
        )
        if (livePreviewButton && !livePreviewButton.querySelector('.admin-live-preview-label')) {
          const label = document.createElement('span')
          label.className = 'admin-live-preview-label'
          label.textContent = 'Live preview'
          livePreviewButton.appendChild(label)
        }
      }

        const headerTabs = Array.from(
          header.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>('a, button'),
        )
        const globalTabs = Array.from(
          document.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>('.tabs a, .tabs button'),
        )
        const tabCandidates = Array.from(new Set([...headerTabs, ...globalTabs]))
        const moreLinks: { label: string; href?: string }[] = []

        tabCandidates.forEach((tab) => {
          const label = tab.textContent?.trim() ?? ''
          const normalized = label.toLowerCase()
          if (normalized === 'versions' || normalized === 'api') {
            tab.classList.add('admin-hidden-tab')
            const href =
              tab instanceof HTMLAnchorElement
                ? tab.href
                : (tab.getAttribute('href') ?? undefined)
            if (normalized !== 'api' || role === 'admin') {
              moreLinks.push({ label, href })
            }
          }
          if (normalized === 'api' && role !== 'admin') {
            tab.classList.add('admin-hide-api')
          }
          if (normalized === 'edit') {
            tab.textContent = 'Edit mode'
          }
        })

      const existingMenu = header.querySelector('.admin-edit-more')
      if (!moreLinks.length) {
        existingMenu?.remove()
        return
      }

        const menu = existingMenu ?? document.createElement('details')
        if (!existingMenu) {
          menu.className = 'admin-edit-more'
        }
        if (!existingMenu) {
          const summary = document.createElement('summary')
          summary.textContent = 'More'
          menu.appendChild(summary)
          const list = document.createElement('div')
          list.className = 'admin-edit-more__menu'
          menu.appendChild(list)
        const target = actions ?? header
        target.appendChild(menu)
      }

        const list = menu.querySelector('.admin-edit-more__menu')
        if (list) {
          list.innerHTML = ''
          moreLinks.forEach((link) => {
            if (link.href) {
              const item = document.createElement('a')
              item.textContent = link.label
              item.href = link.href
              list.appendChild(item)
              return
            }

            const item = document.createElement('button')
            item.type = 'button'
            item.textContent = link.label
            item.className = 'admin-edit-more__button'
            item.addEventListener('click', () => {
              const fallback = tabCandidates.find(
                (tab) => tab.textContent?.trim() === link.label,
              ) as HTMLButtonElement | HTMLAnchorElement | undefined
              fallback?.click()
            })
            list.appendChild(item)
          })
        }
      }

    const scheduleUpdate = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        updateEditHeader()
      })
    }

    scheduleUpdate()
    const observer = new MutationObserver(scheduleUpdate)
    observer.observe(document.body, { childList: true, subtree: true })

    const intervalId = window.setInterval(updateEditHeader, 750)

    return () => {
      observer.disconnect()
      if (rafId) window.cancelAnimationFrame(rafId)
      window.clearInterval(intervalId)
    }
  }, [getStatusStorageKey, role])

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
    if (userId) {
      fetch(`/api/users/${userId}`, {
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
  const initials = useMemo(() => {
    const userInfo = user ?? {}
    const first = userInfo.firstName?.trim() ?? userInfo.first_name?.trim()
    const last = userInfo.lastName?.trim() ?? userInfo.last_name?.trim()
    if (first || last) {
      return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'U'
    }
    const email = userInfo.email ?? ''
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
  }, [user])
  const displayName = useMemo(() => {
    const userInfo = user ?? {}
    const first = userInfo.firstName?.trim() ?? userInfo.first_name?.trim()
    const last = userInfo.lastName?.trim() ?? userInfo.last_name?.trim()
    const name = [first, last].filter(Boolean).join(' ')
    return name || userInfo.email || 'User'
  }, [user])
  const handleAccountClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (typeof window === 'undefined') return
      let targetId = userId
      if (!targetId) {
        try {
          const res = await fetch('/api/users/me', {
            credentials: 'include',
            cache: 'no-store',
          })
          if (res.ok) {
            const data = (await res.json()) as { user?: { id?: string | number } }
            targetId = data?.user?.id
          }
        } catch {
          targetId = undefined
        }
      }
      if (targetId) {
        window.location.assign(`/admin/collections/users/${targetId}`)
        return
      }
      window.location.assign('/admin/login?redirect=%2Fadmin%2Faccount')
    },
    [userId],
  )
  const handleAdminLogout = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (typeof window === 'undefined') return
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      window.location.assign('/admin/login')
    }
  }, [])

  const hideAdminThemePreference = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    const path = window.location.pathname
    if (!path.startsWith('/admin/account') && !/\/admin\/collections\/users\/[^/]+/.test(path)) {
      return
    }

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
    if (typeof window === 'undefined') return
    if (!userId) return
    if (window.location.pathname === '/admin/account') {
      window.location.replace(`/admin/collections/users/${userId}`)
    }
  }, [userId])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    const enablePublishPreviewGate = process.env.NEXT_PUBLIC_ENABLE_PUBLISH_PREVIEW_GATE === 'true'

    if (!enablePublishPreviewGate) {
      Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-publish-gate-bound="true"]')).forEach(
        (button) => {
          if (button.isConnected) {
            button.style.display = ''
            const originalType = button.dataset.publishGateType as
              | 'submit'
              | 'button'
              | 'reset'
              | undefined
            if (originalType) button.type = originalType
          }
          delete button.dataset.publishGateBound
        },
      )
      Array.from(
        document.querySelectorAll<HTMLButtonElement>('button[data-publish-gate-proxy="true"]'),
      ).forEach((proxy) => proxy.remove())
      return
    }

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
      const id = button.getAttribute('id')?.toLowerCase() ?? ''
      if (!label) return false
      if (label.includes('unpublish')) return false
      if (label.includes('publish')) return true
      return id === 'action-save' || id.includes('publish')
    }

    const findDraftButton = () => {
      const selectorMatches = Array.from(
        document.querySelectorAll<HTMLButtonElement>(
          'button#action-save-draft, button[data-action="save-draft"], button[aria-label*="Save Draft"], button[title*="Save Draft"]',
        ),
      )
      if (selectorMatches.length) return selectorMatches[0]

      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
      return buttons.find((btn) => {
        const label = btn.textContent?.trim().toLowerCase() ?? ''
        return label.includes('save draft')
      }) as HTMLButtonElement | undefined
    }

    const waitForDraftSave = async () => {
      const draftButton = findDraftButton()
      if (!draftButton || draftButton.disabled) return
      allowDraftSaveRef.current = true
      const originalLabel = draftButton.textContent
      draftButton.textContent = 'Autosaving...'
      try {
        draftButton.click()

        const start = Date.now()
        while (Date.now() - start < 4000) {
          await new Promise((resolve) => window.setTimeout(resolve, 120))
          const current = findDraftButton()
          if (!current) break
          const label = current.textContent?.trim().toLowerCase() ?? ''
          if (!current.disabled && !label.includes('saving')) break
        }
      } finally {
        const current = findDraftButton()
        if (current) {
          current.textContent = originalLabel ?? 'Save Draft'
        }
        allowDraftSaveRef.current = false
        window.setTimeout(() => {
          syncStatusFromDoc()
        }, 300)
      }
    }

    const submitWithoutPreviewGate = (button: HTMLButtonElement) => {
      allowPublishRef.current = true
      publishIntentRef.current = false
      pendingPublishRef.current = null

      const originalType = (button.dataset.publishGateType as 'submit' | 'button' | 'reset' | undefined) ?? 'submit'
      button.type = originalType
      const form = button.closest('form')
      const isSubmitButton = originalType === 'submit'
      if (form && 'requestSubmit' in form && isSubmitButton) {
        ;(form as HTMLFormElement).requestSubmit(button)
      } else {
        button.click()
      }

      window.setTimeout(() => {
        if (button.isConnected) {
          button.type = 'button'
        }
        allowPublishRef.current = false
      }, 1200)
    }

    const beginPreviewGate = (button: HTMLButtonElement) => {
      const targetInfo = getPreviewTarget()
      if (!targetInfo) return false

      publishIntentRef.current = true
      pendingPublishRef.current = button

      const requestId = previewRequestRef.current + 1
      previewRequestRef.current = requestId
      setPreviewGate({ open: true, url: null, loading: true, error: null })

      const runPreview = async () => {
        await waitForDraftSave()

        const query = new URLSearchParams()
        query.set('type', targetInfo.type)
        query.set('slug', targetInfo.slug)
        if (targetInfo.type === 'collection') {
          query.set('id', targetInfo.id)
        }

        return fetch(`/api/preview-url?${query.toString()}`, {
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

      void runPreview()
      return true
    }

    const isEditableInput = (element: HTMLElement | null) => {
      if (!element) return false
      if (element.closest('[contenteditable="true"]')) return true
      if (element.matches('input, textarea, select')) return true
      return false
    }

    const scheduleAutoSave = () => {
      if (previewGateOpenRef.current) return
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current)
      }
      autoSaveTimerRef.current = window.setTimeout(async () => {
        if (autoSaveInFlightRef.current) return
        autoSaveInFlightRef.current = true
        try {
          await waitForDraftSave()
        } finally {
          autoSaveInFlightRef.current = false
        }
      }, 700)
    }

    const onInputCapture = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (!isEditableInput(target)) return
      const form = target?.closest('form.collection-edit__form, form.global-edit__form')
      if (!form) return
      forceStatusChanged()
      scheduleAutoSave()
    }

    const interceptPublish = (event: Event, target: HTMLElement | null) => {
      if (allowPublishRef.current) return
      if (previewGateOpenRef.current) return
      if (!target) return
      const button = target.closest('button')
      if (!button) return
      if (button.dataset.publishGateProxy === 'true') return
      if (!isPublishButton(button)) return
      if (!beginPreviewGate(button)) return
      event.preventDefault()
      event.stopPropagation()
      if ('stopImmediatePropagation' in event) {
        ;(event as Event).stopImmediatePropagation()
      }
    }

    const onPointerDownCapture = (event: PointerEvent) => {
      interceptPublish(event, event.target as HTMLElement | null)
    }

    const onClickCapture = (event: MouseEvent) => {
      interceptPublish(event, event.target as HTMLElement | null)
    }

    const onSubmitCapture = (event: Event) => {
      if (allowPublishRef.current) return
      if (previewGateOpenRef.current) return
      const submitEvent = event as SubmitEvent
      const submitter = submitEvent.submitter as HTMLButtonElement | null
      const candidate = submitter ?? (document.activeElement as HTMLButtonElement | null)
      if (!candidate || candidate.tagName !== 'BUTTON') return
      if (candidate.dataset.publishGateProxy === 'true') return
      if (!isPublishButton(candidate)) return
      if (!beginPreviewGate(candidate)) return

      event.preventDefault()
      event.stopPropagation()
      if ('stopImmediatePropagation' in event) {
        ;(event as Event).stopImmediatePropagation()
      }
    }

    const onKeyDownCapture = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      interceptPublish(event, event.target as HTMLElement | null)
    }

    const attachPublishGateButtons = () => {
      const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>('button#action-save, button[data-action="publish"]'),
      )
      buttons.forEach((button) => {
        if (button.dataset.publishGateBound === 'true') return
        button.dataset.publishGateBound = 'true'
        if (!button.dataset.publishGateType) {
          button.dataset.publishGateType = button.type || 'submit'
        }
        button.type = 'button'
        const parent = button.parentElement
        if (!parent) return

        let proxy = parent.querySelector<HTMLButtonElement>('[data-publish-gate-proxy="true"]')
        if (!proxy) {
          proxy = document.createElement('button')
          proxy.type = 'button'
          proxy.className = button.className
          proxy.dataset.publishGateProxy = 'true'
          proxy.textContent = button.textContent?.trim() || 'Publish changes'
          parent.insertBefore(proxy, button.nextSibling)
        }

        // Replace existing proxy node to avoid stale click handlers across re-renders/HMR.
        const replacement = proxy.cloneNode(true) as HTMLButtonElement
        proxy.replaceWith(replacement)
        proxy = replacement

        const syncState = () => {
          proxy!.disabled = button.disabled
          if (button.textContent?.trim()) {
            proxy!.textContent = button.textContent.trim()
          }
        }
        syncState()

        button.style.display = 'none'

        proxy.addEventListener(
          'click',
          (event) => {
            if (allowPublishRef.current || previewGateOpenRef.current) return
            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()
            const started = beginPreviewGate(button)
            if (!started) {
              submitWithoutPreviewGate(button)
              return
            }
          },
          true,
        )

        const stateObserver = new MutationObserver(syncState)
        stateObserver.observe(button, {
          attributes: true,
          attributeFilter: ['disabled', 'class', 'data-state'],
          childList: true,
          subtree: true,
        })
      })
    }

    attachPublishGateButtons()
    const buttonObserver = new MutationObserver(attachPublishGateButtons)
    buttonObserver.observe(document.body, { childList: true, subtree: true })

    if (!fetchWrappedRef.current && typeof window.fetch === 'function') {
      fetchWrappedRef.current = true
      fetchRef.current = window.fetch.bind(window)
      const originalFetch = fetchRef.current

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url
        const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()

        const targetInfo = getPreviewTarget()
        const targetPrefix =
          targetInfo?.type === 'collection'
            ? `/api/${targetInfo.slug}/`
            : targetInfo?.type === 'global'
              ? `/api/globals/${targetInfo.slug}`
              : null
        const urlString = typeof url === 'string' ? url : ''
        const targetPrefixValue = targetPrefix ?? ''
        if (!previewGateOpenRef.current && pendingPublishRef.current && !allowPublishRef.current) {
          pendingPublishRef.current = null
          publishIntentRef.current = false
        }
        const shouldGate =
          previewGateOpenRef.current &&
          Boolean(targetPrefixValue) &&
          urlString.includes(targetPrefixValue) &&
          ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) &&
          publishIntentRef.current &&
          pendingPublishRef.current &&
          !allowPublishRef.current &&
          !allowDraftSaveRef.current

        if (shouldGate) {
          return new Promise<Response>((resolve) => {
            const startedAt = Date.now()
            const interval = window.setInterval(() => {
              if (allowPublishRef.current && originalFetch) {
                window.clearInterval(interval)
                resolve(originalFetch(input, init))
              }
              if (!pendingPublishRef.current && !allowPublishRef.current) {
                window.clearInterval(interval)
                resolve(
                  new Response(JSON.stringify({ message: 'Publish canceled.' }), {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' },
                  }),
                )
              }
              if (Date.now() - startedAt > 15000) {
                window.clearInterval(interval)
                pendingPublishRef.current = null
                publishIntentRef.current = false
                resolve(originalFetch ? originalFetch(input, init) : fetch(input, init))
              }
            }, 80)
          })
        }

        return originalFetch ? originalFetch(input, init) : fetch(input, init)
      }
    }

    document.addEventListener('pointerdown', onPointerDownCapture, true)
    document.addEventListener('click', onClickCapture, true)
    document.addEventListener('submit', onSubmitCapture, true)
    document.addEventListener('keydown', onKeyDownCapture, true)
    document.addEventListener('input', onInputCapture, true)
    document.addEventListener('change', onInputCapture, true)
    return () => {
      buttonObserver.disconnect()
      document.removeEventListener('pointerdown', onPointerDownCapture, true)
      document.removeEventListener('click', onClickCapture, true)
      document.removeEventListener('submit', onSubmitCapture, true)
      document.removeEventListener('keydown', onKeyDownCapture, true)
      document.removeEventListener('input', onInputCapture, true)
      document.removeEventListener('change', onInputCapture, true)
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
      // Restore native publish controls so a fresh effect run can rebind cleanly.
      Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-publish-gate-bound="true"]')).forEach(
        (button) => {
          if (button.isConnected) {
            button.style.display = ''
            const originalType = button.dataset.publishGateType as
              | 'submit'
              | 'button'
              | 'reset'
              | undefined
            if (originalType) button.type = originalType
          }
          delete button.dataset.publishGateBound
        },
      )
      Array.from(
        document.querySelectorAll<HTMLButtonElement>('button[data-publish-gate-proxy="true"]'),
      ).forEach((proxy) => proxy.remove())
      publishIntentRef.current = false
      pendingPublishRef.current = null
      allowPublishRef.current = false
      allowDraftSaveRef.current = false
    }
  }, [forceStatusChanged, syncStatusFromDoc])

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

        .admin-back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--admin-surface-border);
          border-radius: 999px;
          background: var(--admin-surface);
          color: var(--cpp-ink);
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          text-decoration: none;
          box-shadow: var(--admin-shadow);
        }

        .admin-back-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
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

        html[data-admin-context='app'] {
          --admin-content-gutter: 20px;
        }

        html[data-admin-context='app'] .collection-edit__header,
        html[data-admin-context='app'] .global-edit__header,
        html[data-admin-context='app'] .edit-view__header,
        html[data-admin-context='app'] .document-header {
          margin-top: 12px;
          padding: 14px var(--admin-content-gutter, 60px);
          border-radius: 0;
          border: none;
          background: transparent;
          box-shadow: none;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px 16px;
        }

        html[data-admin-context='app'] .doc-header,
        html[data-admin-context='app'] .doc-header__title {
          padding-top: 0;
          padding-bottom: 0;
          margin: 0;
        }

        html[data-admin-context='app'] .doc-controls {
          border: none;
          border-radius: 0;
          box-shadow: none;
          background: transparent;
          padding: 8px var(--admin-content-gutter, 40px);
          border-top: none !important;
          border-bottom: none !important;
        }

        html[data-admin-context='app'] .doc-header__header {
          padding-left: var(--admin-content-gutter, 40px);
        }

        html[data-admin-context='app'] .doc-header__title {
          margin-left: 0;
        }

        html[data-admin-context='app'] .collection-edit__form,
        html[data-admin-context='app'] .global-edit__form,
        html[data-admin-context='app'] .edit-view__content {
          background: transparent;
          border: none;
          border-radius: 0;
          box-shadow: none;
          overflow: hidden;
        }

        html[data-admin-context='app'] form.collection-edit__form {
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
        }

        html[data-admin-context='app'] .doc-controls,
        html[data-admin-context='app'] .document-fields,
        html[data-admin-context='app'] .document-fields__tabs,
        html[data-admin-context='app'] .collection-edit__main-wrapper,
        html[data-admin-context='app'] .global-edit__main-wrapper {
          background: transparent;
          border: none;
          box-shadow: none;
        }

        html[data-admin-context='app'] .document-fields,
        html[data-admin-context='app'] .document-fields__tabs,
        html[data-admin-context='app'] .field-type,
        html[data-admin-context='app'] .array-field,
        html[data-admin-context='app'] .group-field,
        html[data-admin-context='app'] .card,
        html[data-admin-context='app'] .collection-edit__form,
        html[data-admin-context='app'] .global-edit__form,
        html[data-admin-context='app'] .document-fields__main,
        html[data-admin-context='app'] .document-fields__edit {
          border-radius: 0 !important;
        }

        html[data-admin-context='app'] .document-fields,
        html[data-admin-context='app'] .document-fields__tabs,
        html[data-admin-context='app'] .collection-edit__main-wrapper,
        html[data-admin-context='app'] .global-edit__main-wrapper,
        html[data-admin-context='app'] .document-fields__main,
        html[data-admin-context='app'] .document-fields__edit {
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
        }

        html[data-admin-context='app'] .collection-edit__main-wrapper,
        html[data-admin-context='app'] .global-edit__main-wrapper {
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          box-shadow: none !important;
          outline: none !important;
        }

        html[data-admin-context='app'] .collection-edit__main,
        html[data-admin-context='app'] .global-edit__main,
        html[data-admin-context='app'] .edit-view__content {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          background: transparent !important;
        }

        :root[data-theme="dark"] html[data-admin-context='app'] .collection-edit__main,
        :root[data-theme="dark"] html[data-admin-context='app'] .global-edit__main,
        :root[data-theme="dark"] html[data-admin-context='app'] .edit-view__content,
        :root[data-theme="dark"] html[data-admin-context='app'] .document-fields,
        :root[data-theme="dark"] html[data-admin-context='app'] .document-fields__main,
        :root[data-theme="dark"] html[data-admin-context='app'] .document-fields__edit,
        :root[data-theme="dark"] html[data-admin-context='app'] .collection-edit__main-wrapper {
          border-left: none !important;
          border-right: none !important;
          box-shadow: none !important;
          outline: none !important;
        }

        :root[data-theme="dark"] html[data-admin-context='app'] form.collection-edit__form {
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
        }

        html[data-admin-context='app'] .collection-edit__form,
        html[data-admin-context='app'] .global-edit__form,
        html[data-admin-context='app'] .document-fields__main,
        html[data-admin-context='app'] .document-fields__edit,
        html[data-admin-context='app'] .document-fields__wrapper,
        html[data-admin-context='app'] .document-fields__sidebar-wrap {
          box-shadow: none !important;
          outline: none !important;
        }

        html[data-admin-context='app'] .gutter.document-fields__edit,
        html[data-admin-context='app'] .gutter.document-fields__main {
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          box-shadow: none !important;
          outline: none !important;
        }

        html[data-admin-context='app'] .document-fields {
          margin-top: 0;
        }

        html[data-admin-context='app'][data-layout-ready='false'] .collection-edit__main-wrapper,
        html[data-admin-context='app'][data-layout-ready='false'] .document-fields {
          opacity: 0;
        }

        html[data-admin-context='app'][data-layout-ready='true'] .collection-edit__main-wrapper,
        html[data-admin-context='app'][data-layout-ready='true'] .document-fields {
          opacity: 1;
          transition: opacity 120ms ease;
        }

        html[data-admin-context='app'] .doc-controls__meta {
          margin: 0;
          padding: 12px var(--admin-content-gutter, 60px);
          border-top: none !important;
          border-bottom: none !important;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 10px 18px;
          font-size: 11px;
          color: rgba(148, 163, 184, 0.9);
          font-weight: 600;
        }

        html[data-admin-context='app'] .admin-doc-header-inline {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 260px;
          font-size: 12px;
          letter-spacing: 0.02em;
          grid-column: 1;
        }

        html[data-admin-context='app'] .admin-meta-cluster {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 14px;
          flex-wrap: wrap;
          grid-column: 2;
          transform: translateX(120px);
        }

        html[data-admin-context='app'] .admin-doc-header-inline .doc-header__title {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        html[data-admin-context='app'] .admin-doc-header-inline h1 {
          font-size: 20px;
          font-weight: 800;
          margin: 0;
          color: #e2e8f0;
          white-space: nowrap;
        }

        html[data-admin-context='app'] .admin-doc-header-inline .doc-tabs__tabs {
          display: inline-flex;
          gap: 8px;
          background: rgba(148, 163, 184, 0.08);
          border-radius: 999px;
          padding: 2px;
        }

        html[data-admin-context='app'] .admin-doc-header-inline .doc-tabs__tabs .btn {
          padding: 4px 10px;
          font-size: 11px;
          border-radius: 999px;
        }

        html[data-admin-context='app'] .collection-edit__header h1,
        html[data-admin-context='app'] .global-edit__header h1,
        html[data-admin-context='app'] .edit-view__header h1,
        html[data-admin-context='app'] .document-header h1 {
          font-weight: 900;
          letter-spacing: -0.3px;
          font-size: 20px;
          line-height: 1.1;
          margin: 0;
        }

        html[data-admin-context='app'] .admin-edit-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          align-items: center;
        }

        html[data-admin-context='app'] .admin-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 14px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.12);
          color: #0b4d3f;
          border: 1px solid rgba(16, 185, 129, 0.25);
          font-weight: 700;
          letter-spacing: 0.01em;
          text-transform: none;
          font-size: 11px;
          box-shadow: none;
        }

        html[data-admin-context='app'] .admin-status-published {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.25);
          color: #0b4d3f;
        }

        html[data-admin-context='app'] .admin-status-pill * {
          color: inherit;
          font-weight: inherit;
        }

        html[data-admin-context='app'] .doc-controls__meta a {
          color: inherit;
          text-decoration: underline;
        }

        html[data-admin-context='app'] .admin-edit-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          grid-column: 3;
          justify-self: end;
        }

        html[data-admin-context='app'] .admin-tab-muted,
        html[data-admin-context='app'] .admin-hidden-tab {
          display: none !important;
        }

        html[data-admin-context='app'] .admin-hide-api {
          display: none !important;
        }

        html[data-admin-context='app'] .admin-edit-more {
          position: relative;
        }

        html[data-admin-context='app'] .admin-edit-more summary {
          list-style: none;
          cursor: pointer;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid var(--admin-surface-border);
          color: var(--cpp-ink);
          background: var(--admin-surface-muted);
        }

        html[data-admin-context='app'] .admin-edit-more summary::-webkit-details-marker {
          display: none;
        }

        html[data-admin-context='app'] .admin-edit-more__menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          min-width: 160px;
          background: var(--admin-surface);
          border: 1px solid var(--admin-surface-border);
          border-radius: 10px;
          box-shadow: 0 18px 32px rgba(15, 23, 42, 0.16);
          padding: 8px;
          display: grid;
          gap: 4px;
          z-index: 20;
        }

        html[data-admin-context='app'] .admin-edit-more__menu a {
          display: block;
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--cpp-ink);
          font-weight: 600;
          font-size: 13px;
        }

        html[data-admin-context='app'] .admin-edit-more__button {
          display: block;
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--cpp-ink);
          font-weight: 600;
          font-size: 13px;
          background: transparent;
          border: none;
          text-align: left;
        }

        html[data-admin-context='app'] .admin-edit-more__menu a:hover {
          background: var(--admin-surface-muted);
        }

        html[data-admin-context='app'] .admin-edit-more__button:hover {
          background: var(--admin-surface-muted);
        }

        html[data-admin-context='app'] .doc-controls__actions .live-preview-toggler {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        html[data-admin-context='app'] .admin-live-preview-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--cpp-muted);
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

        .collection-edit--lessons .collection-edit__main-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .collection-edit--lessons .live-preview-window {
          order: -1;
          width: 100%;
          height: 70vh;
          position: relative;
          top: 0;
        }

        .collection-edit--lessons .live-preview-window__wrapper {
          height: 100%;
        }

        .collection-edit--lessons .collection-edit__main {
          width: 100%;
        }

        .collection-edit--pages .document-fields__sidebar-wrap,
        .collection-edit--pages .document-fields__sidebar,
        .collection-edit--pages .document-fields__sidebar-fields,
        .collection-edit--pages .document-fields__sidebar-wrap > *,
        .collection-edit--pages .document-fields__sidebar > * {
          display: none !important;
        }

        .collection-edit--pages .collection-edit__main {
          width: 100%;
        }

        html[data-admin-context='app'] .nav,
        html[data-admin-context='app'] .template__nav,
        html[data-admin-context='app'] .template-default__nav {
          display: none !important;
        }

        html[data-admin-context='app'] .template__wrap,
        html[data-admin-context='app'] .template-default__wrap {
          grid-template-columns: 1fr !important;
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

        .admin-user-dropdown a,
        .admin-user-dropdown button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 6px;
          color: var(--cpp-ink);
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .admin-user-dropdown a:hover,
        .admin-user-dropdown button:hover {
          background: var(--admin-surface-muted);
        }

        .admin-user-divider {
          height: 1px;
          background: var(--admin-surface-border);
          margin: 6px 4px;
        }

        .doc-controls__controls [aria-label='Preview'],
        .doc-controls__controls [title='Preview'],
        .doc-controls__controls [data-tooltip='Preview'] {
          display: none !important;
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
          padding: 16px 20px;
          border-bottom: 1px solid var(--admin-surface-border);
          background: #f8fafc;
        }

        .admin-preview-panel h3 {
          font-size: 16px;
          font-weight: 800;
          color: #0b1220;
          margin: 0;
        }

        .admin-preview-panel p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #334155;
          font-weight: 500;
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

        .admin-preview-button {
          border-radius: 999px;
          padding: 12px 20px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.01em;
          border: 1px solid transparent;
          transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
        }

        .admin-preview-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .admin-preview-button--ghost {
          background: #e2e8f0;
          border-color: #cbd5f5;
          color: #0f172a;
        }

        .admin-preview-button--ghost:hover {
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
          transform: translateY(-1px);
          background: #d8e1ec;
        }

        .admin-preview-button--primary {
          background: #111827;
          color: #f8fafc;
          border-color: #111827;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
        }

        .admin-preview-button--primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.25);
        }

        .admin-global-footer {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--cpp-muted);
          letter-spacing: 0.02em;
          margin: 32px 0 24px;
        }
      `}</style>
      {role === 'staff' ? (
        <style>{`
          .nav__toggle, [data-element="nav-toggle"] {
            display: none !important;
          }
          .doc-tabs__tabs [aria-label='API'],
          .doc-tabs__tabs [title='API'] {
            display: none !important;
          }
        `}</style>
      ) : null}
      {!isLoginPath ? (
        <div className="admin-topbar">
          <div className="admin-topbar-center">
            {backHref ? (
              <button
                type="button"
                className="admin-back-button"
                onClick={() => {
                  if (typeof window === 'undefined') return
                  const stack = pathStackRef.current.length
                    ? pathStackRef.current
                    : (window.sessionStorage.getItem('admin-path-stack') ?? '')
                        .split('|')
                        .filter(Boolean)
                  if (stack.length <= 1) return
                  stack.pop()
                  const prev = stack[stack.length - 1] ?? '/admin'
                  pathStackRef.current = stack
                  window.sessionStorage.setItem('admin-path-stack', stack.join('|'))
                  window.location.assign(prev)
                }}
              >
                <span aria-hidden="true">←</span>
                Back
              </button>
            ) : null}
          </div>
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
                <button type="button" onClick={handleAccountClick}>
                  Your Account
                </button>
                <Link href="/admin/help">Help</Link>
                <div className="admin-user-divider" />
                <button type="button" onClick={handleAdminLogout}>
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
                </button>
              </div>
            </details>
          </div>
        </div>
      ) : null}
      {previewGate.open ? (
        <div className="admin-preview-gate">
          <div className="admin-preview-panel" role="dialog" aria-modal="true">
            <header>
              <div>
                <h3>Review changes before publishing</h3>
                <p>Confirm content changes, layout, and links to proceed.</p>
              </div>
              <div className="admin-preview-actions">
                <button
                  type="button"
                  className="admin-preview-button admin-preview-button--ghost"
                  onClick={() => {
                    triggerPreviewDisable(previewGate.url)
                    setPreviewGate({ open: false, url: null, loading: false, error: null })
                    pendingPublishRef.current = null
                    publishIntentRef.current = false
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-preview-button admin-preview-button--primary"
                  disabled={previewGate.loading || Boolean(previewGate.error)}
                  onClick={() => {
                    const pendingButton = pendingPublishRef.current
                    setPreviewGate({ open: false, url: null, loading: false, error: null })
                    if (pendingButton) {
                      allowPublishRef.current = true
                      const originalType = (pendingButton.dataset.publishGateType as
                        | 'submit'
                        | 'button'
                        | 'reset'
                        | undefined) ?? 'submit'
                      pendingButton.type = originalType
                      const form = pendingButton.closest('form')
                      const isSubmitButton = originalType === 'submit'
                      if (form && 'requestSubmit' in form && isSubmitButton) {
                        ;(form as HTMLFormElement).requestSubmit(pendingButton)
                      } else {
                        pendingButton.click()
                      }
                      window.setTimeout(() => {
                        pendingButton.type = 'button'
                        allowPublishRef.current = false
                        publishIntentRef.current = false
                        pendingPublishRef.current = null
                        triggerPreviewDisable(previewGate.url)
                      }, 3000)

                      let attempts = 0
                      const statusTimer = window.setInterval(() => {
                        attempts += 1
                        if (forceStatusPublished() || attempts > 12) {
                          window.clearInterval(statusTimer)
                        }
                      }, 300)
                    }
                  }}
                >
                  Publish Live
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
      <footer className="admin-global-footer">
        © 2025 Cal Poly Pomona Engineering — NSF CURE Summer Bridge Program
      </footer>
    </>
  )
}

export default StaffProvider
