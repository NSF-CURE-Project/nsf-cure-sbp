import type { PageLayoutBlock } from "./types";
import { withCmsFallback } from "./cmsOptional";
import { payload } from "./payloadClient";

export type PageDoc = {
  id: string;
  title: string;
  slug: string;
  navOrder?: number | null;
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
  return withCmsFallback(async () => {
    const query = `/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`;
    const data = await payload.get<PageQueryResponse>(query, {
      draft: options?.draft,
      revalidate: 60,
    });
    return data.docs?.[0] ?? null;
  }, null);
}

export async function getPages(options?: {
  draft?: boolean;
}): Promise<PageDoc[]> {
  return withCmsFallback(async () => {
    const data = await payload.get<PagesQueryResponse>(
      "/pages?limit=100&sort=navOrder",
      { draft: options?.draft, revalidate: 60 }
    );
    const docs = data.docs ?? [];
    return docs.sort((a, b) => {
      const aOrder =
        typeof a.navOrder === "number" ? a.navOrder : Number.POSITIVE_INFINITY;
      const bOrder =
        typeof b.navOrder === "number" ? b.navOrder : Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (a.title ?? "").localeCompare(b.title ?? "");
    });
  }, []);
}
