import { payload } from "./payloadClient";
import { withCmsFallback } from "./cmsOptional";
import type { ProblemSetDoc } from "./types";

export async function getProblemSetById(
  id: string,
  options?: { draft?: boolean; revalidate?: number }
): Promise<ProblemSetDoc | null> {
  return withCmsFallback(async () => {
    const path = options?.draft
      ? `/problem-sets/${encodeURIComponent(id)}?depth=3`
      : `/public/problem-sets/${encodeURIComponent(id)}`;
    const data = await payload.get<ProblemSetDoc | { doc?: ProblemSetDoc }>(path, {
      draft: options?.draft,
      revalidate: options?.revalidate ?? 60,
    });
    if (!data) return null;
    if (typeof data === "object" && "doc" in data) {
      return data.doc ?? null;
    }
    return data as ProblemSetDoc;
  }, null);
}

export async function getProblemSetsByTitlePrefix(
  prefix: string,
  options?: { draft?: boolean; revalidate?: number; limit?: number }
): Promise<ProblemSetDoc[]> {
  return withCmsFallback(async () => {
    const qs = new URLSearchParams();
    qs.set("limit", String(options?.limit ?? 50));
    if (options?.draft) {
      qs.set("depth", "3");
      qs.set("where[title][like]", prefix);
      qs.set("sort", "title");
    } else {
      qs.set("titlePrefix", prefix);
      qs.set("sort", "title");
    }

    const data = await payload.get<{ docs?: ProblemSetDoc[] }>(
      `${options?.draft ? "/problem-sets" : "/public/problem-sets"}?${qs.toString()}`,
      { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
    );

    return Array.isArray(data?.docs) ? data.docs : [];
  }, []);
}

export async function getProblemSets(
  options?: { draft?: boolean; revalidate?: number; limit?: number; sort?: string }
): Promise<ProblemSetDoc[]> {
  return withCmsFallback(async () => {
    const qs = new URLSearchParams();
    qs.set("limit", String(options?.limit ?? 50));
    qs.set("sort", options?.sort ?? "title");
    if (options?.draft) {
      qs.set("depth", "3");
    }

    const data = await payload.get<{ docs?: ProblemSetDoc[] }>(
      `${options?.draft ? "/problem-sets" : "/public/problem-sets"}?${qs.toString()}`,
      { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
    );

    return Array.isArray(data?.docs) ? data.docs : [];
  }, []);
}
