import { payload } from "./payloadClient";
import { withCmsFallback } from "./cmsOptional";
import type { LessonDoc, PayloadFindResult } from "./types";

// Force-filter to published unless explicitly in draft/preview mode. The CMS
// also enforces this via collection access rules; this is belt-and-suspenders
// so the contract is visible at the read site too.
function publishedClause(draft?: boolean) {
  return draft ? "" : "&where[_status][equals]=published";
}

/** Get a single lesson by slug (with chapter + class populated). */
export async function getLessonBySlug(
  slug: string,
  options?: { draft?: boolean; revalidate?: number }
): Promise<LessonDoc | null> {
  return withCmsFallback(async () => {
    const data = await payload.get<PayloadFindResult<LessonDoc>>(
      `/lessons?where[slug][equals]=${encodeURIComponent(
        slug
      )}&depth=3&limit=1${publishedClause(options?.draft)}`,
      { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
    );
    return data.docs?.[0] ?? null;
  }, null);
}

/** Get all lessons for a given chapter ID. */
export async function getLessonsForChapter(
  chapterId: string | number,
  options?: { draft?: boolean; revalidate?: number }
): Promise<LessonDoc[]> {
  return withCmsFallback(async () => {
    const data = await payload.get<PayloadFindResult<LessonDoc>>(
      `/lessons?where[chapter][equals]=${encodeURIComponent(
        String(chapterId)
      )}&depth=2&sort=order${publishedClause(options?.draft)}`,
      { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
    );
    return data.docs ?? [];
  }, []);
}
