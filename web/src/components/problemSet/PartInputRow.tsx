"use client";

import { useState } from "react";
import {
  FBDCanvas,
  type FBDPlacedAnswer,
  type PlacedForce,
} from "@/components/problemSet/FBDCanvas";
import { InlineMath } from "@/components/problemSet/InlineMath";
import { SymbolicInput } from "@/components/problemSet/SymbolicInput";
import { PayloadRichText } from "@/components/ui/payloadRichText";
import type { EngineeringFigureDoc, ProblemPart } from "@/lib/payloadSdk/types";
import { cn } from "@/lib/utils";

type PartEvaluation = {
  partIndex: number;
  studentAnswer?: number | null;
  isCorrect?: boolean | null;
  score?: number | null;
};

type PartInputRowProps = {
  part: ProblemPart;
  figure?: EngineeringFigureDoc | null;
  value?: string | FBDPlacedAnswer | PlacedForce[];
  onChange: (value: string | FBDPlacedAnswer) => void;
  submitted: boolean;
  partEval?: PartEvaluation;
  showAnswers: boolean;
  disabled?: boolean;
};

const isRichTextValue = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object");

export function PartInputRow({
  part,
  figure,
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
  const isPartial = submitted && score != null && score > 0 && score < 1;
  const numericOrSymbolicValue = typeof value === "string" ? value : "";
  const fbdValue: FBDPlacedAnswer = Array.isArray(value)
    ? { forces: value, moments: [] }
    : value && typeof value === "object"
    ? {
        forces: Array.isArray((value as FBDPlacedAnswer).forces)
          ? (value as FBDPlacedAnswer).forces
          : [],
        moments: Array.isArray((value as FBDPlacedAnswer).moments)
          ? (value as FBDPlacedAnswer).moments
          : [],
      }
    : { forces: [], moments: [] };

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 p-4 space-y-3">
      <div className="text-sm font-medium text-foreground">
        <InlineMath text={part.label || "Part"} />
      </div>

      {isRichTextValue(part.prompt) ? (
        <PayloadRichText
          content={
            part.prompt as unknown as Parameters<typeof PayloadRichText>[0]["content"]
          }
          className="prose dark:prose-invert prose-invert leading-7 max-w-none text-muted-foreground"
        />
      ) : null}

      {part.partType === "symbolic" ? (
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
      ) : part.partType === "fbd-draw" && figure ? (
        <FBDCanvas
          figure={figure}
          value={fbdValue}
          onChange={(nextForces) => onChange(nextForces)}
          disabled={disabled || submitted}
        />
      ) : part.partType === "fbd-draw" ? (
        <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          This FBD part needs a linked figure before students can place forces.
        </div>
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
            {isPartial ? "Partially correct" : isCorrect ? "Correct" : "Incorrect"}
          </div>
          {isPartial ? (
            <div className="text-xs font-medium text-amber-700">
              Partial credit: {Math.round(score * 100)}%
            </div>
          ) : null}
          {showAnswers ? (
            <div className="text-xs text-muted-foreground">
              {part.partType === "symbolic" ? (
                <>
                  Correct expression:{" "}
                  <span className="font-medium text-foreground">
                    {part.symbolicAnswer || "N/A"}
                  </span>
                </>
              ) : part.partType === "fbd-draw" ? (
                <>
                  FBD rubric:{" "}
                  <span className="font-medium text-foreground">
                    {(part.fbdRubric?.requiredForces ?? []).length} required force(s)
                  </span>
                </>
              ) : (
                <>
                  Correct answer:{" "}
                  <span className="font-medium text-foreground">
                    {Number.isFinite(part.correctAnswer) ? part.correctAnswer : "N/A"}
                    {part.unit ? ` ${part.unit}` : ""}
                  </span>
                </>
              )}
            </div>
          ) : null}
          {hasExplanation ? (
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => setShowExplanation((prev) => !prev)}
            >
              {showExplanation ? "Hide explanation" : "Show explanation"}
            </button>
          ) : null}
        </div>
      ) : null}

      {submitted && showExplanation && hasExplanation ? (
        <div className="rounded-md border border-border/60 bg-muted/40 p-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            Explanation
          </div>
          <PayloadRichText
            content={
              part.explanation as unknown as Parameters<typeof PayloadRichText>[0]["content"]
            }
            className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
          />
        </div>
      ) : null}
    </div>
  );
}
