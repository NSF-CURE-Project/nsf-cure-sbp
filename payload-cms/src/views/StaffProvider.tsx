import React from 'react';
import type { AdminViewServerProps } from 'payload';

const StaffProvider = (props: AdminViewServerProps & { children?: React.ReactNode }) => {
  const role = (props as any)?.user?.role ?? (props as any)?.payload?.user?.role;

  return (
    <>
      <style>{`
        :root {
          --cpp-green: #005030;
          --cpp-gold: #FFB81C;
          --cpp-cream: #f7f4ee;
          --cpp-ink: #0b3d27;
          --cpp-muted: #5b6f66;
          --theme-bg: var(--cpp-cream);
          --theme-text: var(--cpp-ink);
          --theme-input-bg: #ffffff;
          --theme-elevation-0: var(--cpp-cream);
          --theme-elevation-50: #f3efe6;
          --theme-elevation-100: #efe9db;
          --theme-elevation-150: #e6dfcd;
          --theme-elevation-200: #ddd3bd;
          --theme-elevation-800: var(--cpp-ink);
          --theme-elevation-900: #082b1c;
          --theme-elevation-1000: #061f14;
          --color-success-250: #d7eadc;
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

        .collection-edit--lessons .collection-edit__main-wrapper,
        .global-edit--home-page .collection-edit__main-wrapper,
        .global-edit--resources-page .collection-edit__main-wrapper,
        .global-edit--contact-page .collection-edit__main-wrapper,
        .global-edit--getting-started .collection-edit__main-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .collection-edit--lessons .live-preview-window,
        .global-edit--home-page .live-preview-window,
        .global-edit--resources-page .live-preview-window,
        .global-edit--contact-page .live-preview-window,
        .global-edit--getting-started .live-preview-window {
          order: -1;
          width: 100%;
          height: 70vh;
          position: relative;
          top: 0;
        }

        .collection-edit--lessons .live-preview-window__wrapper,
        .global-edit--home-page .live-preview-window__wrapper,
        .global-edit--resources-page .live-preview-window__wrapper,
        .global-edit--contact-page .live-preview-window__wrapper,
        .global-edit--getting-started .live-preview-window__wrapper {
          height: 100%;
        }

        .collection-edit--lessons .collection-edit__main,
        .global-edit--home-page .collection-edit__main,
        .global-edit--resources-page .collection-edit__main,
        .global-edit--contact-page .collection-edit__main,
        .global-edit--getting-started .collection-edit__main {
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
      {props.children}
    </>
  );
};

export default StaffProvider;
