# SEO Implementation Details

This is a record of how SEO was implemented across the Next.js + Payload site.

## 1) Centralized SEO Configuration

**File:** `web/src/lib/seo.ts`

Added a single helper to standardize metadata:

- `siteName`, `defaultDescription`, `siteUrl`
- `buildMetadata()` creates a Next.js `Metadata` object
- Canonical URLs are generated from `siteUrl` + `path`
- Open Graph + Twitter defaults are included
- Optional `noIndex` flag supported for private pages

## 2) Global Metadata Defaults

**File:** `web/src/app/layout.tsx`

Updated root metadata to establish site-wide defaults:

- `metadataBase` from `siteUrl`
- Title template `%s | NSF CURE SBP`
- Default description
- Default Open Graph + Twitter cards
- Existing favicon kept intact

## 3) Dynamic Metadata for Content Routes

**Class page**

- **File:** `web/src/app/(public)/classes/[classSlug]/page.tsx`
- Added `generateMetadata()` using Payload class data
- Uses class description when available, otherwise a safe fallback

**Chapter page**

- **File:** `web/src/app/(public)/classes/[classSlug]/chapters/[chapterSlug]/page.tsx`
- Added `generateMetadata()` after verifying chapter belongs to class
- Title/description based on chapter

**Lesson page**

- **File:** `web/src/app/(public)/classes/[classSlug]/lessons/[lessonSlug]/page.tsx`
- Added `generateMetadata()` using lesson title

**Custom pages (Payload pages)**

- **File:** `web/src/app/(public)/[slug]/page.tsx`
- Added `generateMetadata()` based on Payload page title

## 4) Static Page Metadata

Each static route exports `metadata = buildMetadata(...)`:

- **Home:** `web/src/app/(public)/page.tsx`
- **Directory:** `web/src/app/(public)/directory/page.tsx`
- **Search:** `web/src/app/(public)/search/page.tsx`
- **Resources:** `web/src/app/(public)/resources/page.tsx`
- **Contact Us:** `web/src/app/(public)/contact-us/page.tsx`
- **Getting Started:** `web/src/app/(public)/getting-started/page.tsx`
- **Learning hub:** `web/src/app/(public)/learning/page.tsx`
- **Data Transparency:** `web/src/app/(public)/data-transparency/page.tsx`
- **Analytics (public view):** `web/src/app/(public)/analytics/page.tsx`
- **Classrooms (public listing):** `web/src/app/(public)/classrooms/page.tsx`
- **Quiz Demo:** `web/src/app/(public)/quiz-demo/page.tsx`
- **Questions / Saved lessons / Problem attempts:** `web/src/app/(public)/{questions,saved-lessons,problem-attempts}/page.tsx`

## 5) No-Index for Private/Non-Public Pages

Auth and sensitive routes are marked `noIndex`:

- `web/src/app/(public)/login/page.tsx`
- `web/src/app/(public)/register/page.tsx`
- `web/src/app/(public)/forgot-password/page.tsx`
- `web/src/app/(public)/reset-password/page.tsx`
- `web/src/app/(public)/check-email/page.tsx`
- **Preview:** `web/src/app/(public)/preview/lesson/[lessonSlug]/page.tsx`

## 6) Robots.txt

**File:** `web/src/app/robots.ts`

Rules:

- `User-agent: *`, `Allow: /`.
- `Disallow`: `/admin`, `/api`, `/preview`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/check-email`, `/settings`, `/profile`.
- `Sitemap` URL included.

When you add a new authenticated/preview route, add it to the `disallow` list so search engines do not index it.

## 7) Sitemap

**File:** `web/src/app/sitemap.ts`

Includes:

- Static routes: `/`, `/learning`, `/directory`, `/search`, `/resources`, `/contact-us`, `/getting-started`.
- Payload pages (excluding `home` to avoid duplicate `/`), pulled via `getPages()`.
- Class, chapter, lesson URLs from `getClassesTree()`.

Routes intentionally **not** in the sitemap include `/data-transparency`, `/analytics`, `/classrooms`, `/quiz-demo`, `/questions`, `/saved-lessons`, `/problem-attempts`. They are still publicly reachable; add them to `staticRoutes` if/when they should be indexed.

## 8) Canonical URLs

Every page now includes a canonical link via:

```ts
alternates: { canonical: ... }
```

This prevents duplicate content issues and standardizes indexing.

## 9) Environment Requirements

To make canonical and sitemap URLs correct in production:

- Set `NEXT_PUBLIC_SITE_URL` (preferred) or `NEXT_PUBLIC_WEB_URL`
- Example: `https://yourdomain.com`
