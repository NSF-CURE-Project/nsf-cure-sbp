import Link from "next/link";

import { PayloadRichText } from "@/components/ui/payloadRichText";
import { cn } from "@/lib/utils";

type QuizReviewQuestionCardProps = {
  index: number;
  question: {
    id: string;
    title: string;
    prompt?: unknown;
    explanation?: unknown;
    selectedLabels: string[];
    correctLabels: string[];
    isCorrect: boolean;
    remediationLink?: string | null;
  };
};

export function QuizReviewQuestionCard({
  index,
  question,
}: QuizReviewQuestionCardProps) {
  return (
    <article className="rounded-xl border border-border/60 bg-card/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          {index + 1}. {question.title}
        </h2>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
            question.isCorrect
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-300"
          )}
        >
          {question.isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      {question.prompt ? (
        <div className="mt-3">
          <PayloadRichText
            content={
              question.prompt as unknown as Parameters<typeof PayloadRichText>[0]["content"]
            }
            className="prose prose-invert max-w-none text-sm text-foreground"
          />
        </div>
      ) : null}

      <div className="mt-3 space-y-2 text-sm">
        <p>
          <span className="font-semibold text-foreground">Your answer:</span>{" "}
          <span className="text-muted-foreground">
            {question.selectedLabels.length
              ? question.selectedLabels.join(", ")
              : "No answer selected"}
          </span>
        </p>
        <p>
          <span className="font-semibold text-foreground">Correct answer:</span>{" "}
          <span className="text-muted-foreground">
            {question.correctLabels.length
              ? question.correctLabels.join(", ")
              : "Not available"}
          </span>
        </p>
      </div>

      {!question.isCorrect && question.explanation ? (
        <div className="mt-4 rounded-lg border border-border/60 bg-muted/35 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Explanation
          </p>
          <PayloadRichText
            content={
              question.explanation as unknown as Parameters<typeof PayloadRichText>[0]["content"]
            }
            className="prose prose-invert max-w-none text-sm text-foreground"
          />
        </div>
      ) : null}

      {!question.isCorrect && question.remediationLink ? (
        <div className="mt-4">
          <Link
            href={question.remediationLink}
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            Review lesson content
          </Link>
        </div>
      ) : null}
    </article>
  );
}
