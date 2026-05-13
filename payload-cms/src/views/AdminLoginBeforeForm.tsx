import React from 'react'

// Renders above the email/password fields on the admin login page.
// Owns the "supporting description" the design brief asked for, plus a
// single <style> block that applies the entire atmospheric treatment for
// the login route (background, card elevation, inputs, focus, fade-in).
// Scoped via the .template-default--login class Payload assigns to the
// login template wrapper so admin pages downstream of login are unaffected.
export default function AdminLoginBeforeForm() {
  return (
    <>
      <style>{`
        /* === Page atmosphere ===
         * Soft radial wash + a faint blueprint grid so the login surface
         * reads as a deliberate entry point instead of an empty page.
         * The grid SVG is inlined as a data URL so there's no extra
         * network fetch on the auth route. */
        body:has(.template-default--login),
        body:has(.payload__app--login),
        html:has(.template-default--login) {
          background:
            radial-gradient(
              900px 600px at 20% 0%,
              rgba(47, 143, 70, 0.10) 0%,
              transparent 60%
            ),
            radial-gradient(
              700px 500px at 90% 100%,
              rgba(13, 110, 75, 0.08) 0%,
              transparent 60%
            ),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><g fill='none' stroke='%2335633F' stroke-opacity='0.045' stroke-width='1'><path d='M0 0H80V80H0z'/><path d='M0 40H80M40 0V80'/></g></svg>"),
            linear-gradient(180deg, #fcfdfb 0%, #f4f7f1 100%);
          background-attachment: fixed;
        }
        :root[data-theme='dark'] body:has(.template-default--login),
        :root[data-theme='dark'] body:has(.payload__app--login) {
          background:
            radial-gradient(
              900px 600px at 20% 0%,
              rgba(47, 143, 70, 0.14) 0%,
              transparent 60%
            ),
            radial-gradient(
              700px 500px at 90% 100%,
              rgba(13, 110, 75, 0.12) 0%,
              transparent 60%
            ),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><g fill='none' stroke='%236ee7b7' stroke-opacity='0.05' stroke-width='1'><path d='M0 0H80V80H0z'/><path d='M0 40H80M40 0V80'/></g></svg>"),
            linear-gradient(180deg, #0e1316 0%, #0a0f12 100%);
        }

        /* === Login card === */
        .template-default--login .template-default__wrap,
        .payload__app--login .template-default__wrap {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px) saturate(1.1);
          -webkit-backdrop-filter: blur(20px) saturate(1.1);
          border: 1px solid rgba(47, 143, 70, 0.14);
          border-radius: 16px;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.6) inset,
            0 24px 60px -20px rgba(13, 84, 50, 0.18),
            0 8px 24px -8px rgba(15, 23, 42, 0.08);
          padding: 36px 44px 40px;
          max-width: 460px;
          width: 100%;
          animation: adminLoginFadeIn 380ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
        :root[data-theme='dark'] .template-default--login .template-default__wrap,
        :root[data-theme='dark'] .payload__app--login .template-default__wrap {
          background: rgba(22, 27, 31, 0.85);
          border-color: rgba(110, 231, 183, 0.18);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.04) inset,
            0 24px 60px -20px rgba(0, 0, 0, 0.5),
            0 8px 24px -8px rgba(0, 0, 0, 0.3);
        }

        @keyframes adminLoginFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* === Logo + caption tighten + halo === */
        .admin-login-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-bottom: 52px;
          position: relative;
        }
        .admin-login-logo::before {
          content: '';
          position: absolute;
          inset: -36px -56px;
          background: radial-gradient(
            closest-side,
            rgba(47, 143, 70, 0.10),
            transparent 70%
          );
          pointer-events: none;
          z-index: -1;
        }
        .admin-login-logo img {
          width: min(320px, 64vw) !important;
          height: auto !important;
        }
        .admin-login-logo__caption {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--theme-elevation-500, #4b5563);
        }

        /* === Form inputs — tighter desktop sizing === */
        .template-default--login .field-type input[type='text'],
        .template-default--login .field-type input[type='email'],
        .template-default--login .field-type input[type='password'] {
          height: 34px;
          padding: 6px 12px;
          font-size: 14px;
          border-radius: 8px;
          border-color: rgba(15, 23, 42, 0.14);
          transition:
            border-color 160ms ease,
            box-shadow 200ms ease;
        }
        .template-default--login .field-type input:focus {
          border-color: #2F8F46;
          box-shadow: 0 0 0 4px rgba(47, 143, 70, 0.12);
          outline: none;
        }
        :root[data-theme='dark'] .template-default--login .field-type input:focus {
          border-color: #34c97a;
          box-shadow: 0 0 0 4px rgba(52, 201, 122, 0.16);
        }
        .template-default--login .field-type__label,
        .template-default--login .field-label {
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--theme-elevation-500, #5d6b80);
          margin-bottom: 3px !important;
        }
        .template-default--login .field-type {
          margin-bottom: 6px;
        }

        /* === Submit button — slightly tighter, darker green === */
        .template-default--login .form-submit,
        .template-default--login button[type='submit'] {
          height: 38px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          background: #1f7a3a;
          border-color: #1f7a3a;
          transition: background 140ms ease, transform 140ms ease;
        }
        .template-default--login .form-submit:hover,
        .template-default--login button[type='submit']:hover {
          background: #2F8F46;
          transform: translateY(-1px);
        }

        /* === Forgot password link === */
        .template-default--login .form-submit__link a,
        .template-default--login a {
          font-size: 12px;
          color: var(--theme-elevation-500, #5d6b80);
        }
        .template-default--login a:hover {
          color: #2F8F46;
        }

        /* === Adaptive composition for short-height desktops ===
         * Mirrors the height-tier rules in custom.scss but for selectors
         * scoped to this component (logo internals, intro, inputs, submit).
         * Goal: keep logo + fields + CTA above the fold on ~720-850px tall
         * desktop viewports without forcing the mobile layout. */
        @media (max-height: 850px) {
          .admin-login-logo {
            gap: 6px;
            margin-bottom: 28px;
          }
          .admin-login-logo img {
            width: min(220px, 46vw) !important;
          }
          .admin-login-logo::before {
            inset: -24px -40px;
          }
          .template-default--login .field-type input[type='text'],
          .template-default--login .field-type input[type='email'],
          .template-default--login .field-type input[type='password'] {
            height: 32px;
            padding: 5px 12px;
          }
          .template-default--login .field-type {
            margin-bottom: 4px;
          }
          .template-default--login .field-type__label,
          .template-default--login .field-label {
            margin-bottom: 2px !important;
          }
          .template-default--login .form-submit,
          .template-default--login button[type='submit'] {
            height: 36px;
          }
        }

        @media (max-height: 750px) {
          .admin-login-logo {
            gap: 4px;
            margin-bottom: 16px;
          }
          .admin-login-logo img {
            width: min(160px, 36vw) !important;
          }
          .admin-login-logo::before {
            inset: -16px -28px;
          }
          .admin-login-logo__caption {
            font-size: 10px;
            letter-spacing: 0.16em;
          }
          .template-default--login .field-type input[type='text'],
          .template-default--login .field-type input[type='email'],
          .template-default--login .field-type input[type='password'] {
            height: 30px;
            padding: 3px 12px;
            border-radius: 7px;
          }
          .template-default--login .field-type {
            margin-bottom: 2px;
          }
          .template-default--login .field-type__label,
          .template-default--login .field-label {
            font-size: 10px !important;
            margin-bottom: 1px !important;
          }
          .template-default--login .form-submit,
          .template-default--login button[type='submit'] {
            height: 32px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  )
}
