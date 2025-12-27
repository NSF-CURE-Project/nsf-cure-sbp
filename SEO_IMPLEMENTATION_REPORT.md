# SEO Implementation Report (NSF CURE SBP)

This is a detailed journal-style record of how SEO was implemented across the Next.js + Payload site.

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
- **Contacts:** `web/src/app/(public)/contacts/page.tsx`
- **Getting Started:** `web/src/app/(public)/getting-started/page.tsx`

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
- Allow all by default
- Disallow: `/admin`, `/api`, `/preview`, and auth/profile routes
- Sitemap URL included

## 7) Sitemap

**File:** `web/src/app/sitemap.ts`

Includes:
- Static routes: `/`, `/directory`, `/search`, `/resources`, `/contact-us`, `/contacts`, `/getting-started`
- Payload pages (excluding `home` to avoid duplicate `/`)
- Class, chapter, lesson URLs from `getClassesTree()`

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
