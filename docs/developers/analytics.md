## Analytics — NSF CURE SBP

Overview
- The project captures basic usage events and pageviews to support program evaluation and product decisions. Analytics are implemented in the `web` app and can be extended in `web/src/lib/` and `web/src/hooks/`.

Where to look
- Client instrumentation: `web/src/lib/analytics.ts` (or `web/src/hooks/useAnalytics.ts` if present) — standard place for `track()` and `page()` wrappers.
- Server-side events: Use Payload endpoints in `payload-cms/src/endpoints/` to receive or forward analytics where needed.

Common tasks
- Add a page view: call the central `page()` helper in the page component's client effect or Next.js `useEffect`.
- Track an event: use `track('event_name', { properties })` from UI actions (e.g., quiz submission, lesson completion).

Storage & privacy
- No long-term analytics storage is included in the CMS by default. Events are typically forwarded to an external analytics provider (e.g., Plausible, PostHog, Google Analytics).
- Respect privacy: check `NEXT_PUBLIC_SITE_URL` and any environment flags before sending PII. For student data, prefer aggregated events and always confirm with project lead before exporting.

Testing analytics locally
- Use a mock analytics adapter during development (console logger) or route events to a dev-only endpoint.