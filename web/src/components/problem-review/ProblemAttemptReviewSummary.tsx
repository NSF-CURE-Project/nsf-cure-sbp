import Link from "next/link";

import { MasteryBadge } from "@/components/quiz-review/MasteryBadge";

type ProblemAttemptReviewSummaryProps = {
  problemSetTitle: string;
  completedAt?: string | null;
  remediationLink?: string | null;
  summary: {
    score: number;
    maxScore: number;
    scorePercent: number;
    problemCount: number;
    correctCount: number;
    mastered: boolean;
  };
};

export function ProblemAttemptReviewSummary({
  problemSetTitle,
  completedAt,
  remediationLink,
  summary,
}: ProblemAttemptReviewSummaryProps) {
  const completedLabel = completedAt
    ? new Date(completedAt).toLocaleString()
    : "Unknown";

  return (
    <section className="rounded-xl border border-border/60 bg-background/80 p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Problem set review
      </p>
      <h1 className="mt-1 text-2xl font-bold text-foreground">{problemSetTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Completed {completedLabel}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <MasteryBadge
          mastered={summary.mastered}
          scorePercent={summary.scorePercent}
          thresholdPercent={80}
        />
        <span className="text-sm font-medium text-foreground">
          {summary.correctCount} correct parts across {summary.problemCount} problems
        </span>
        <span className="text-sm text-muted-foreground">
          Score {summary.score.toFixed(2)} / {summary.maxScore}
        </span>
      </div>

      {remediationLink ? (
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground">
            Study the related lesson content before retrying this problem set.
          </p>
          <Link
            href={remediationLink}
            className="mt-2 inline-flex text-sm font-semibold text-primary underline underline-offset-4"
          >
            Study related content
          </Link>
        </div>
      ) : null}
    </section>
  );
}
