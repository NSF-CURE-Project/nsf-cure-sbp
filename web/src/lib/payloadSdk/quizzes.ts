import { payload } from "./payloadClient";
import type { QuizDoc } from "./types";

export async function getQuizById(
  id: string,
  options?: { draft?: boolean }
): Promise<QuizDoc | null> {
  const data = await payload.get<QuizDoc | { doc?: QuizDoc }>(
    `/quizzes/${encodeURIComponent(id)}?depth=2`,
    { draft: options?.draft }
  );
  if (!data) return null;
  if (typeof data === "object" && "doc" in data) {
    return data.doc ?? null;
  }
  return data as QuizDoc;
}
