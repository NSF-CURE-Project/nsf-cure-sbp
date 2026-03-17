import { payload } from "./payloadClient";
import { withCmsFallback } from "./cmsOptional";
import type { ProblemSetDoc } from "./types";

export async function getProblemSetById(
  id: string,
  options?: { draft?: boolean; revalidate?: number }
): Promise<ProblemSetDoc | null> {
  return withCmsFallback(async () => {
    const data = await payload.get<ProblemSetDoc | { doc?: ProblemSetDoc }>(
      `/problem-sets/${encodeURIComponent(id)}?depth=3`,
      { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
    );
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
    qs.set("depth", "3");
    qs.set("limit", String(options?.limit ?? 50));
    qs.set("where[title][like]", prefix);
    qs.set("sort", "title");

    const data = await payload.get<{ docs?: ProblemSetDoc[] }>(
      `/problem-sets?${qs.toString()}`,
      { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
    );

    return Array.isArray(data?.docs) ? data.docs : [];
  }, []);
}
