"use client";

import { useState } from "react";
import { InlineMath } from "@/components/problemSet/InlineMath";
import { SymbolicInput } from "@/components/problemSet/SymbolicInput";
import { PayloadRichText } from "@/components/ui/payloadRichText";
import type { ProblemPart } from "@/lib/payloadSdk/types";
import { cn } from "@/lib/utils";

type PartEvaluation = {
  partIndex: number;
  studentAnswer?: number | null;
  isCorrect?: boolean | null;
  score?: number | null;
};

type PartInputRowProps = {
  part: ProblemPart;
  partNumber?: number;
  value?: string;
  onChange: (value: string) => void;
  submitted: boolean;
  partEval?: PartEvaluation;
  showAnswers: boolean;
  disabled?: boolean;
};

const isRichTextValue = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object");

const isSupportedPartType = (value: string | undefined) =>
  value === "numeric" || value === "symbolic" || value == null;

export function PartInputRow({
  part,
  partNumber,
  value,
  onChange,
  submitted,
  partEval,
  showAnswers,
  disabled,
}: PartInputRowProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const hasExplanation = isRichTextValue(part.explanation);
  const isCorrect = submitted ? Boolean(partEval?.isCorrect) : null;
  const score =
    typeof partEval?.score === "number" && Number.isFinite(partEval.score)
      ? partEval.score
      : null;
  const hasRevealableAnswer =
    part.partType === "symbolic"
      ? Boolean(part.symbolicAnswer)
      : Number.isFinite(part.correctAnswer);
  const isPartial = submitted && score != null && score > 0 && score < 1;
  const numericOrSymbolicValue = typeof value === "string" ? value : "";
  const isUnsupportedPartType = !isSupportedPartType(part.partType);

  return (
    <div className="rounded-md border border-border/60 bg-background/70 p-4 space-y-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
          Step {partNumber ?? 1}
        </span>
        <div className="text-sm font-semibold text-foreground">
          <InlineMath text={part.label || "Part"} />
        </div>
      </div>

      {isRichTextValue(part.prompt) ? (
        <PayloadRichText
          content={
            part.prompt as unknown as Parameters<
              typeof PayloadRichText
            >[0]["content"]
          }
          className="prose dark:prose-invert prose-invert leading-7 max-w-none text-muted-foreground"
        />
      ) : null}

      {isUnsupportedPartType ? (
        <div className="rounded-md border border-amber-300/60 bg-amber-500/10 p-3 text-xs text-amber-100">
          This problem uses a legacy interactive part type that is no longer supported in the learner UI.
        </div>
      ) : part.partType === "symbolic" ? (
        <SymbolicInput
          value={numericOrSymbolicValue}
          onChange={(nextValue) => onChange(nextValue)}
          disabled={disabled || submitted}
          variables={(part.symbolicVariables ?? []).map((item) => ({
            variable: item.variable,
            testMin: item.testMin,
            testMax: item.testMax,
          }))}
        />
      ) : (
        <label className="flex items-center gap-3">
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={numericOrSymbolicValue}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled || submitted}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Enter numeric answer"
          />
          {part.unit ? (
            <span className="shrink-0 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
              <InlineMath text={part.unit} />
            </span>
          ) : null}
        </label>
      )}

      {submitted ? (
        <div className="space-y-2">
          <div
            className={cn(
              "text-sm font-semibold",
              isPartial
                ? "text-amber-600"
                : isCorrect
                  ? "text-emerald-600"
                  : "text-red-500"
            )}
          >
            {isPartial
              ? "Partially correct"
              : isCorrect
                ? "Correct"
                : "Incorrect"}
          </div>
          {isPartial ? (
            <div className="text-xs font-medium text-amber-700">
              Partial credit: {Math.round(score * 100)}%
            </div>
          ) : null}
          {isUnsupportedPartType ? (
            <div className="text-xs text-amber-200">
              This legacy interactive part cannot be answered or reviewed from the current frontend.
            </div>
          ) : showAnswers && hasRevealableAnswer ? (
            <div className="text-xs text-muted-foreground">
              {part.partType === "symbolic" ? (
                <>
                  Correct expression:{" "}
                  <span className="font-medium text-foreground">
                    {part.symbolicAnswer || "N/A"}
                  </span>
                </>
              ) : (
                <>
                  Correct answer:{" "}
                  <span className="font-medium text-foreground">
                    {Number.isFinite(part.correctAnswer)
                      ? part.correctAnswer
                      : "N/A"}
                    {part.unit ? ` ${part.unit}` : ""}
                  </span>
                </>
              )}
            </div>
          ) : null}
          {hasExplanation ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowExplanation((current) => !current)}
                className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
              >
                {showExplanation ? "Hide explanation" : "Show explanation"}
              </button>
              {showExplanation ? (
                <div className="mt-3 rounded-md border border-border/60 bg-muted/25 p-3">
                  <PayloadRichText
                    content={
                      part.explanation as unknown as Parameters<
                        typeof PayloadRichText
                      >[0]["content"]
                    }
                    className="prose dark:prose-invert prose-invert max-w-none text-sm text-muted-foreground"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
