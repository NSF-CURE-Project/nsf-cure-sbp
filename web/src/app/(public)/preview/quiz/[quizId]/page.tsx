import { notFound } from "next/navigation";
import { QuizBlock as QuizBlockComponent } from "@/components/quiz/QuizBlock";
import { getQuizById } from "@/lib/payloadSdk/quizzes";
import type { QuizBlock, QuizDoc } from "@/lib/payloadSdk/types";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

type RouteParams = { quizId: string };

export default async function PreviewQuizPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { quizId } = await params;
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);

  const quiz: QuizDoc | null = await getQuizById(quizId, {
    draft: isPreview,
  }).catch(() => null);

  if (!quiz) return notFound();

  const previewQuiz = {
    ...quiz,
    shuffleQuestions: false,
    shuffleOptions: false,
  };

  const block: QuizBlock = {
    blockType: "quizBlock",
    quiz: previewQuiz,
    showTitle: true,
    showAnswers: true,
  };

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 sm:px-6 lg:px-8 py-8">
        <QuizBlockComponent block={block} />
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { quizId } = await params;
  return buildMetadata({
    title: "Quiz Preview",
    description: "Preview quiz content.",
    path: `/preview/quiz/${quizId}`,
    noIndex: true,
  });
}
