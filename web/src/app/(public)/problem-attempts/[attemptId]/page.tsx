import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProblemAttemptAnswerCard } from "@/components/problem-review/ProblemAttemptAnswerCard";
import { ProblemAttemptReviewSummary } from "@/components/problem-review/ProblemAttemptReviewSummary";

type RouteParams = { attemptId: string };

type ProblemAttemptReviewPayload = {
  attemptId: string;
  completedAt?: string | null;
  problemSet: {
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
    problemCount: number;
    correctCount: number;
    mastered: boolean;
  };
  problems: {
    id: string;
    title: string;
    prompt?: unknown;
    parts: {
      partIndex: number;
      partType: string;
      studentAnswer?: number | null;
      studentExpression?: string | null;
      legacyInteractiveSubmission?: boolean;
      isCorrect: boolean;
      score: number;
      correctAnswer?: string | number | null;
      unit?: string | null;
      explanation?: unknown;
    }[];
  }[];
};

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

export default async function ProblemAttemptReviewPage({
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
    redirect(`/login?next=${encodeURIComponent(`/problem-attempts/${attemptId}`)}`);
  }

  const reviewRes = await fetch(
    `${base.base}/api/problem-attempts/${encodeURIComponent(attemptId)}/review`,
    {
      headers: base.cookie ? { cookie: base.cookie } : undefined,
      cache: "no-store",
    }
  );

  if (reviewRes.status === 404) notFound();
  if (reviewRes.status === 401) {
    redirect(`/login?next=${encodeURIComponent(`/problem-attempts/${attemptId}`)}`);
  }
  if (!reviewRes.ok) {
    throw new Error("Unable to load problem attempt review.");
  }

  const data = (await reviewRes.json()) as ProblemAttemptReviewPayload;

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

        <ProblemAttemptReviewSummary
          problemSetTitle={data.problemSet.title}
          completedAt={data.completedAt}
          remediationLink={data.lesson?.remediationLink ?? null}
          summary={data.summary}
        />

        <section className="space-y-3">
          {data.problems.map((problem, index) => (
            <ProblemAttemptAnswerCard
              key={problem.id || `${index}`}
              index={index}
              problem={problem}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
