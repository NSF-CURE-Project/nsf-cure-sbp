"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COOKIE_NAME = "cookie-banner-dismissed";

// One year — the banner shouldn't reappear weekly. Cookie auto-extends every
// time the user dismisses again so an active user effectively never sees it
// after the first acknowledgement.
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

const isDismissed = (): boolean => {
  if (typeof document === "undefined") return true;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .some((entry) => entry.startsWith(`${COOKIE_NAME}=1`));
};

const recordDismissal = () => {
  if (typeof document === "undefined") return;
  // SameSite=Lax + Secure pair so the cookie survives auth round-trips
  // (login → callback) but isn't sent on third-party iframes.
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const cookieParts = [
    `${COOKIE_NAME}=1`,
    `Max-Age=${COOKIE_MAX_AGE_SEC}`,
    "Path=/",
    "SameSite=Lax",
  ];
  if (isSecure) cookieParts.push("Secure");
  document.cookie = cookieParts.join("; ");
};

// Minimal cookie-acknowledgement banner. The site only uses strictly-
// necessary cookies (auth + UI preferences), so this is informational
// rather than a true consent gate — there's nothing to opt out of. Visible
// once per browser; "Got it" sets a year-long dismissal cookie.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Defer mount until after hydration so the banner doesn't paint into the
  // initial SSR HTML (avoids layout shift on the first frame for users
  // who've already dismissed it).
  useEffect(() => {
    if (isDismissed()) return;
    // Tiny delay so the slide-up animation reads as intentional rather than
    // landing on top of the page mid-paint.
    const handle = window.setTimeout(() => setVisible(true), 350);
    return () => window.clearTimeout(handle);
  }, []);

  const dismiss = () => {
    recordDismissal();
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 180);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 sm:pb-6",
      )}
    >
      <style>{`
        @keyframes cookie-banner-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cookie-banner-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(12px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-cookie-banner] { animation: none !important; }
        }
      `}</style>
      <div
        data-cookie-banner
        className={cn(
          "pointer-events-auto flex w-full max-w-[var(--content-max,72rem)] flex-col gap-3 rounded-2xl border border-border/70 bg-card/95 px-4 py-3.5 shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4",
        )}
        style={{
          animation: leaving
            ? "cookie-banner-out 180ms ease-in forwards"
            : "cookie-banner-in 260ms ease-out",
        }}
      >
        <span
          aria-hidden="true"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary"
        >
          <Cookie className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 text-[13.5px] leading-6 text-foreground/90">
          <p className="font-semibold text-foreground">We use a few cookies.</p>
          <p className="text-muted-foreground">
            They keep you signed in and remember your preferences. No
            third-party tracking. Read more in our{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss cookie notice"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
