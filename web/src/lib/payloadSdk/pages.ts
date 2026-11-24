import type { PageLayoutBlock } from "./types";
import { withCmsFallback } from "./cmsOptional";
import { payload } from "./payloadClient";

export type PageDoc = {
  id: string;
  title: string;
  slug: string;
  navOrder?: number | null;
  hidden?: boolean | null;
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

// Public routes call this to decide whether to 404. Hidden pages are gated
// behind a draft/preview session so admins can still verify before unhiding.
export function isPageHiddenPublicly(
  page: PageDoc | null,
  options?: { draft?: boolean }
): boolean {
  return Boolean(page?.hidden) && !options?.draft;
}

export async function getPages(options?: {
  draft?: boolean;
  includeHidden?: boolean;
}): Promise<PageDoc[]> {
  return withCmsFallback(async () => {
    const data = await payload.get<PagesQueryResponse>(
      "/pages?limit=100&sort=navOrder",
      { draft: options?.draft, revalidate: 60 }
    );
    const docs = (data.docs ?? []).filter(
      (doc) => options?.includeHidden || !doc.hidden
    );
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
