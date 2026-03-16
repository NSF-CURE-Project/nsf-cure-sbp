import Link from "next/link";

import { MasteryBadge } from "@/components/quiz-review/MasteryBadge";

type QuizReviewSummaryProps = {
  quizTitle: string;
  completedAt?: string | null;
  lessonTitle?: string | null;
  remediationLink?: string | null;
  summary: {
    score: number;
    maxScore: number;
    scorePercent: number;
    questionCount: number;
    correctCount: number;
    masteryThresholdPercent: number;
    mastered: boolean;
  };
};

export function QuizReviewSummary({
  quizTitle,
  completedAt,
  lessonTitle,
  remediationLink,
  summary,
}: QuizReviewSummaryProps) {
  const completedLabel = completedAt
    ? new Date(completedAt).toLocaleString()
    : "Unknown";

  return (
    <section className="rounded-xl border border-border/60 bg-background/80 p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Quiz review
      </p>
      <h1 className="mt-1 text-2xl font-bold text-foreground">{quizTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Completed {completedLabel}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <MasteryBadge
          mastered={summary.mastered}
          scorePercent={summary.scorePercent}
          thresholdPercent={summary.masteryThresholdPercent}
        />
        <span className="text-sm font-medium text-foreground">
          {summary.correctCount}/{summary.questionCount} correct
        </span>
        <span className="text-sm text-muted-foreground">
          Score {summary.score.toFixed(2)} / {summary.maxScore}
        </span>
      </div>

      {remediationLink ? (
        <div className="mt-4">
          <Link
            href={remediationLink}
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            Review {lessonTitle ?? "lesson"}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
