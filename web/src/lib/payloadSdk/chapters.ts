import { payload } from "./payloadClient";
import type { ChapterDoc, PayloadFindResult } from "./types";

/** Get a chapter by slug (including its class + lessons). */
export async function getChapterBySlug(
  slug: string,
  options?: { draft?: boolean; revalidate?: number }
): Promise<ChapterDoc | null> {
  const data = await payload.get<PayloadFindResult<ChapterDoc>>(
    `/chapters?where[slug][equals]=${encodeURIComponent(slug)}&depth=3&limit=1`,
    { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
  );
  return data.docs[0] ?? null;
}

/** Get all chapters for a given class ID. */
export async function getChaptersForClass(
  classId: string | number,
  options?: { draft?: boolean; revalidate?: number }
): Promise<ChapterDoc[]> {
  const data = await payload.get<PayloadFindResult<ChapterDoc>>(
    `/chapters?where[class][equals]=${encodeURIComponent(
      String(classId)
    )}&depth=2&sort=order`,
    { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
  );
  return data.docs;
}
