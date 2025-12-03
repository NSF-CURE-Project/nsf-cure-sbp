import { payload } from "./payloadClient";
import type { ClassDoc, PayloadFindResult } from "./types";

/**
 * Get all classes, with nested chapters and lessons.
 * Sorted by custom `order` first, then by `title`.
 */
export async function getClassesTree(): Promise<ClassDoc[]> {
  const data = await payload.get<PayloadFindResult<ClassDoc>>(
    `/classes?limit=100&depth=3&sort=order&sort=title`
  );
  return [...data.docs].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : Number(a.order ?? 0);
    const orderB = typeof b.order === "number" ? b.order : Number(b.order ?? 0);

    if (orderA !== orderB) return orderA - orderB;

    const titleA = typeof a.title === "string" ? a.title.toLowerCase() : "";
    const titleB = typeof b.title === "string" ? b.title.toLowerCase() : "";
    return titleA.localeCompare(titleB);
  });
}

/**
 * Get a single class by slug (with nested chapters + lessons).
 * Still using depth=3 for full tree.
 */
export async function getClassBySlug(
  slug: string,
): Promise<ClassDoc | null> {
  const data = await payload.get<PayloadFindResult<ClassDoc>>(
    `/classes?where[slug][equals]=${encodeURIComponent(slug)}&depth=3&limit=1`
  );
  return data.docs[0] ?? null;
}
