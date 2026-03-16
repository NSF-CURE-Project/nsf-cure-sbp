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
