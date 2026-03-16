import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { QuizReviewQuestionCard } from "@/components/quiz-review/QuizReviewQuestionCard";
import { QuizReviewSummary } from "@/components/quiz-review/QuizReviewSummary";

type RouteParams = { attemptId: string };

type QuizReviewPayload = {
  attemptId: string;
  completedAt?: string | null;
  quiz: {
    id: string;
    title: string;
  };
  lesson?: {
    id: string;
    title?: string | null;
    remediationLink?: string | null;
  } | null;
  summary: {
    score: number;
    maxScore: number;
    scorePercent: number;
    questionCount: number;
    correctCount: number;
    masteryThresholdPercent: number;
    mastered: boolean;
  };
  questions: {
    id: string;
    title: string;
    prompt?: unknown;
    explanation?: unknown;
    selectedLabels: string[];
    correctLabels: string[];
    isCorrect: boolean;
    remediationLink?: string | null;
  }[];
};

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

export default async function QuizAttemptReviewPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { attemptId } = await params;
  const base = await buildBaseUrl();
  if (!base) notFound();

  const meRes = await fetch(`${base.base}/api/accounts/me`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!meRes.ok) {
    redirect(`/login?next=${encodeURIComponent(`/quiz-attempts/${attemptId}`)}`);
  }

  const reviewRes = await fetch(
    `${base.base}/api/quiz-attempts/${encodeURIComponent(attemptId)}/review`,
    {
      headers: base.cookie ? { cookie: base.cookie } : undefined,
      cache: "no-store",
    }
  );

  if (reviewRes.status === 404) notFound();
  if (reviewRes.status === 401) {
    redirect(`/login?next=${encodeURIComponent(`/quiz-attempts/${attemptId}`)}`);
  }
  if (!reviewRes.ok) {
    throw new Error("Unable to load quiz review.");
  }

  const data = (await reviewRes.json()) as QuizReviewPayload;

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,96ch)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Learning review
          </p>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            Back to dashboard
          </Link>
        </div>

        <QuizReviewSummary
          quizTitle={data.quiz.title}
          completedAt={data.completedAt}
          lessonTitle={data.lesson?.title ?? null}
          remediationLink={data.lesson?.remediationLink ?? null}
          summary={data.summary}
        />

        <section className="space-y-3">
          {data.questions.map((question, index) => (
            <QuizReviewQuestionCard
              key={question.id || `${index}`}
              index={index}
              question={question}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
