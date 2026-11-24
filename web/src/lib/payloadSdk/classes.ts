import { payload } from "./payloadClient";
import { withCmsFallback } from "./cmsOptional";
import type { ChapterDoc, ClassDoc, LessonDoc, PayloadFindResult } from "./types";

/**
 * A populated chapter (object, not a string ID) that exposes at least one
 * lesson visible to the current reader. Payload's lesson `read` access rule
 * already strips drafts for non-staff, so an empty `lessons` array here means
 * there's nothing the reader can open — and the chapter should not surface
 * on public pages, sitemaps, or search.
 */
export function chapterHasReadableLessons(
  chapter: ChapterDoc | string | number | null | undefined
): chapter is ChapterDoc & { lessons: LessonDoc[] } {
  if (typeof chapter !== "object" || chapter === null) return false;
  const lessons = (chapter as ChapterDoc & { lessons?: unknown[] }).lessons;
  return Array.isArray(lessons) && lessons.length > 0;
}

/**
 * Get all classes, with nested chapters and lessons.
 * Sorted by custom `order` first, then by `title`.
 */
export async function getClassesTree(options?: {
  draft?: boolean;
  revalidate?: number;
}): Promise<ClassDoc[]> {
  return withCmsFallback(async () => {
    const data = await payload.get<PayloadFindResult<ClassDoc>>(
      `/classes?limit=100&depth=3&sort=order&sort=title`,
      { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
    );
    return [...(data.docs ?? [])].sort((a, b) => {
      const orderA =
        typeof a.order === "number" && Number.isFinite(a.order)
          ? a.order
          : Number.MAX_SAFE_INTEGER;
      const orderB =
        typeof b.order === "number" && Number.isFinite(b.order)
          ? b.order
          : Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) return orderA - orderB;

      const titleA = typeof a.title === "string" ? a.title.toLowerCase() : "";
      const titleB = typeof b.title === "string" ? b.title.toLowerCase() : "";
      return titleA.localeCompare(titleB);
    });
  }, []);
}

/**
 * Get a single class by slug (with nested chapters + lessons).
 * Still using depth=3 for full tree.
 */
export async function getClassBySlug(
  slug: string,
  options?: { draft?: boolean; revalidate?: number }
): Promise<ClassDoc | null> {
  return withCmsFallback(async () => {
    const data = await payload.get<PayloadFindResult<ClassDoc>>(
      `/classes?where[slug][equals]=${encodeURIComponent(slug)}&depth=3&limit=1`,
      { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
    );
    return data.docs?.[0] ?? null;
  }, null);
}
