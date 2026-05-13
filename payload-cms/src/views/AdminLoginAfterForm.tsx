import React from 'react'

// Renders below the email/password submit on the admin login page.
// Owns the trust + affiliation footer the design brief called for —
// "Authorized staff access only" + a small NSF / Cal Poly Pomona line
// so the auth surface reads as part of an institutional platform, not
// a generic CMS form.
export default function AdminLoginAfterForm() {
  return (
    <div className="admin-login-footer">
      <style>{`
        .admin-login-footer {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          display: grid;
          gap: 4px;
          text-align: center;
        }
        :root[data-theme='dark'] .admin-login-footer {
          border-top-color: rgba(255, 255, 255, 0.06);
        }
        .admin-login-footer__trust {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--theme-elevation-600, #475569);
        }
        :root[data-theme='dark'] .admin-login-footer__trust {
          color: var(--theme-elevation-400, #94a3b8);
        }
        .admin-login-footer__trust svg {
          color: #2F8F46;
          flex-shrink: 0;
        }
        .admin-login-footer__affiliation {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--theme-elevation-450, #5d6b80);
        }

        /* Adaptive footer compression for short-height desktops. */
        @media (max-height: 850px) {
          .admin-login-footer {
            margin-top: 8px;
            padding-top: 8px;
            gap: 3px;
          }
        }
        @media (max-height: 750px) {
          .admin-login-footer {
            margin-top: 6px;
            padding-top: 6px;
            gap: 2px;
          }
          .admin-login-footer__trust {
            font-size: 10px;
          }
          .admin-login-footer__affiliation {
            font-size: 9px;
          }
        }
      `}</style>

      <div className="admin-login-footer__trust">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Authorized staff access only
      </div>
      <div className="admin-login-footer__affiliation">
        Cal Poly Pomona · NSF CURE Program
      </div>
    </div>
  )
}
