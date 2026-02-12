import { payload } from "./payloadClient";
import { withCmsFallback } from "./cmsOptional";
import type { QuizDoc } from "./types";

export async function getQuizById(
  id: string,
  options?: { draft?: boolean; revalidate?: number }
): Promise<QuizDoc | null> {
  return withCmsFallback(async () => {
    const data = await payload.get<QuizDoc | { doc?: QuizDoc }>(
      `/quizzes/${encodeURIComponent(id)}?depth=2`,
      { draft: options?.draft, revalidate: options?.revalidate ?? 60 }
    );
    if (!data) return null;
    if (typeof data === "object" && "doc" in data) {
      return data.doc ?? null;
    }
    return data as QuizDoc;
  }, null);
}
