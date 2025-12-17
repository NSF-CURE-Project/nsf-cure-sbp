import { payload } from "./payloadClient";
import type { LessonDoc, PayloadFindResult } from "./types";

/** Get a single lesson by slug (with chapter + class populated). */
export async function getLessonBySlug(
  slug: string,
  options?: { draft?: boolean },
): Promise<LessonDoc | null> {
  const data = await payload.get<PayloadFindResult<LessonDoc>>(
    `/lessons?where[slug][equals]=${encodeURIComponent(
      slug,
    )}&depth=3&limit=1`,
    { draft: options?.draft },
  );
  return data.docs[0] ?? null;
}

/** Get all lessons for a given chapter ID. */
export async function getLessonsForChapter(
  chapterId: string | number,
  options?: { draft?: boolean },
): Promise<LessonDoc[]> {
  const data = await payload.get<PayloadFindResult<LessonDoc>>(
    `/lessons?where[chapter][equals]=${encodeURIComponent(
      String(chapterId),
    )}&depth=2&sort=order`,
    { draft: options?.draft },
  );
  return data.docs;
}
