import type { PageLayoutBlock } from "./types";
import { payload } from "./payloadClient";

export type PageDoc = {
  id: string;
  title: string;
  slug: string;
  layout?: PageLayoutBlock[] | null;
};

type PageQueryResponse = {
  docs?: PageDoc[];
};

type PagesQueryResponse = {
  docs?: PageDoc[];
};

export async function getPageBySlug(
  slug: string,
  options?: { draft?: boolean }
): Promise<PageDoc | null> {
  const query = `/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`;
  const data = await payload.get<PageQueryResponse>(query, {
    draft: options?.draft,
  });
  return data.docs?.[0] ?? null;
}

export async function getPages(options?: { draft?: boolean }): Promise<PageDoc[]> {
  const data = await payload.get<PagesQueryResponse>(
    "/pages?limit=100&sort=title",
    { draft: options?.draft }
  );
  return data.docs ?? [];
}
