"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { AdminViewServerProps } from "payload";

type ThemeMode = "light" | "dark";

const StaffProvider = (
  props: AdminViewServerProps & { children?: React.ReactNode },
) => {
  const role = (props as any)?.user?.role ?? (props as any)?.payload?.user?.role;
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("payload-admin-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
      return;
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = prefersDark ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("payload-admin-theme", next);
    }
  };

  const themeLabel = useMemo(
    () => (theme === "dark" ? "Switch to light mode" : "Switch to dark mode"),
    [theme],
  );

  return (
    <>
      <style>{`
        :root {
          --cpp-green: #475569;
          --cpp-gold: #94a3b8;
          --cpp-cream: #f8fafc;
          --cpp-ink: #0f172a;
          --cpp-muted: #64748b;
          --theme-bg: var(--cpp-cream);
          --theme-text: var(--cpp-ink);
          --theme-input-bg: #ffffff;
          --theme-elevation-0: var(--cpp-cream);
          --theme-elevation-50: #f1f5f9;
          --theme-elevation-100: #e2e8f0;
          --theme-elevation-150: #dbe2ea;
          --theme-elevation-200: #cbd5e1;
          --theme-elevation-800: var(--cpp-ink);
          --theme-elevation-900: #0b1220;
          --theme-elevation-1000: #05080f;
          --color-success-250: #e2e8f0;
        }

        :root[data-theme="dark"] {
          --cpp-cream: #0f1115;
          --cpp-ink: #e5e7eb;
          --cpp-muted: #94a3b8;
          --theme-bg: #0f1115;
          --theme-text: #e5e7eb;
          --theme-input-bg: #161a20;
          --theme-elevation-0: #0f1115;
          --theme-elevation-50: #12161c;
          --theme-elevation-100: #151a21;
          --theme-elevation-150: #191f27;
          --theme-elevation-200: #1f2630;
          --theme-elevation-800: #e5e7eb;
          --theme-elevation-900: #f1f5f9;
          --theme-elevation-1000: #ffffff;
          --color-success-250: #1f2937;
        }

        body,
        #app {
          background: var(--cpp-cream);
          color: var(--cpp-ink);
        }

        .app-header,
        .nav {
          background: var(--cpp-cream);
        }

        .app-header {
          border-bottom: 1px solid rgba(0, 80, 48, 0.15);
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

        .nav__link:hover,
        .nav__link:focus,
        .nav__link--active {
          background: rgba(0, 80, 48, 0.08);
        }

        a,
        .link,
        .btn--style-icon-label,
        .btn--style-icon-label .btn__label {
          color: var(--cpp-green);
        }

        .btn--style-primary {
          --bg-color: var(--cpp-green);
          --hover-bg: #006d40;
          --color: #ffffff;
        }

        .btn--style-secondary {
          --color: var(--cpp-green);
          --box-shadow: inset 0 0 0 1px rgba(0, 80, 48, 0.4);
          --hover-color: var(--cpp-green);
          --hover-box-shadow: inset 0 0 0 1px rgba(0, 80, 48, 0.6);
        }

        .pill,
        .btn--style-pill {
          --bg-color: rgba(0, 80, 48, 0.08);
          --color: var(--cpp-ink);
        }

        .table {
          --table-border-color: rgba(0, 80, 48, 0.12);
        }

        .card {
          border-color: rgba(0, 80, 48, 0.12);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        :root[data-theme="dark"] .app-header,
        :root[data-theme="dark"] .nav {
          background: #111419;
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
          --bg-color: #334155;
          --hover-bg: #3b4a5e;
          --color: #f8fafc;
        }

        :root[data-theme="dark"] .btn--style-secondary {
          --color: #cbd5e1;
          --box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
          --hover-color: #e2e8f0;
          --hover-box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.55);
        }

        :root[data-theme="dark"] .pill,
        :root[data-theme="dark"] .btn--style-pill {
          --bg-color: rgba(148, 163, 184, 0.18);
          --color: #e5e7eb;
        }

        :root[data-theme="dark"] .table {
          --table-border-color: rgba(255, 255, 255, 0.08);
        }

        :root[data-theme="dark"] .card {
          border-color: rgba(148, 163, 184, 0.25);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          background: #1b2129;
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
          background: #f8fafc;
          border-color: rgba(148, 163, 184, 0.4);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
        }

        :root[data-theme="dark"] .dashboard-card div,
        :root[data-theme="dark"] .quick-action-card > div div,
        :root[data-theme="dark"] .dashboard-stat-card div,
        :root[data-theme="dark"] .dashboard-panel div {
          color: #111827 !important;
        }

        :root[data-theme="dark"] .dashboard-panel div + div {
          color: #4b5563 !important;
        }

        :root[data-theme="dark"] .dashboard-chip {
          background: rgba(148, 163, 184, 0.18) !important;
          color: #111827 !important;
        }

        .admin-theme-toggle {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 9999;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.2);
          background: rgba(255, 255, 255, 0.9);
          color: var(--cpp-ink);
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
        }

        :root[data-theme="dark"] .admin-theme-toggle {
          background: rgba(15, 28, 22, 0.95);
          color: #e9f3ee;
          border-color: rgba(255, 255, 255, 0.12);
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
      {role === "staff" ? (
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
        aria-pressed={theme === "dark"}
        aria-label={themeLabel}
      >
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
      {props.children}
    </>
  );
};

export default StaffProvider;
