"use client";

import { useState } from "react";

import { FBDCanvas, type FBDPlacedAnswer } from "@/components/problemSet/FBDCanvas";
import { PayloadRichText } from "@/components/ui/payloadRichText";
import type { EngineeringFigureDoc } from "@/lib/payloadSdk/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProblemAttemptAnswerCardProps = {
  index: number;
  problem: {
    id: string;
    title: string;
    prompt?: unknown;
    figure?: EngineeringFigureDoc | null;
    parts: {
      partIndex: number;
      partType: string;
      studentAnswer?: number | null;
      studentExpression?: string | null;
      placedForces?: {
        forces?: FBDPlacedAnswer["forces"];
        moments?: FBDPlacedAnswer["moments"];
      } | null;
      isCorrect: boolean;
      score: number;
      correctAnswer?: string | number | null;
      unit?: string | null;
      explanation?: unknown;
    }[];
  };
};

export function ProblemAttemptAnswerCard({
  index,
  problem,
}: ProblemAttemptAnswerCardProps) {
  const [openExplanations, setOpenExplanations] = useState<Record<number, boolean>>({});

  return (
    <article className="rounded-xl border border-border/60 bg-card/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          {index + 1}. {problem.title}
        </h2>
      </div>

      {problem.prompt ? (
        <div className="mt-3">
          <PayloadRichText
            content={
              problem.prompt as unknown as Parameters<typeof PayloadRichText>[0]["content"]
            }
            className="prose prose-invert max-w-none text-sm text-foreground"
          />
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {problem.parts.map((part) => {
          const isPartial = part.score > 0 && part.score < 1;
          const placedForces = part.placedForces
            ? {
                forces: Array.isArray(part.placedForces.forces)
                  ? part.placedForces.forces
                  : [],
                moments: Array.isArray(part.placedForces.moments)
                  ? part.placedForces.moments
                  : [],
              }
            : null;
          return (
            <div
              key={`${problem.id}-${part.partIndex}`}
              className="rounded-lg border border-border/60 bg-muted/20 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-foreground">
                  Part {part.partIndex + 1} · {part.partType}
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                    isPartial
                      ? "bg-amber-500/10 text-amber-300"
                      : part.isCorrect
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-300"
                  )}
                >
                  {isPartial
                    ? "Partially Correct"
                    : part.isCorrect
                      ? "Correct"
                      : "Incorrect"}
                </span>
              </div>

              <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Your answer:</span>{" "}
                  {part.partType === "fbd-draw"
                    ? placedForces?.forces.length || placedForces?.moments.length
                      ? "FBD drawing submitted"
                      : "No FBD drawing submitted"
                    : part.studentExpression?.trim()
                      ? part.studentExpression
                      : part.studentAnswer != null
                        ? `${part.studentAnswer}`
                        : "No answer"}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Correct answer:</span>{" "}
                  {part.partType === "fbd-draw"
                    ? "See rubric-based feedback (drawing-based answer)"
                    : part.correctAnswer ?? "Not available"}{" "}
                  {part.unit ?? ""}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Score:</span>{" "}
                  {part.score.toFixed(2)} ({Math.round(part.score * 100)}%)
                </p>
              </div>

              {part.partType === "fbd-draw" && problem.figure && placedForces ? (
                <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Submitted Diagram
                  </p>
                  <FBDCanvas
                    figure={problem.figure}
                    value={placedForces}
                    onChange={() => undefined}
                    disabled
                    readOnlyView
                  />
                </div>
              ) : null}

              {!part.isCorrect && part.explanation ? (
                <div className="mt-3 rounded-lg border border-border/60 bg-muted/35 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Explanation
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setOpenExplanations((current) => ({
                          ...current,
                          [part.partIndex]: !current[part.partIndex],
                        }))
                      }
                    >
                      {openExplanations[part.partIndex]
                        ? "Hide explanation"
                        : "Show explanation"}
                    </Button>
                  </div>
                  {openExplanations[part.partIndex] ? (
                    <PayloadRichText
                      content={
                        part.explanation as unknown as Parameters<typeof PayloadRichText>[0]["content"]
                      }
                      className="prose prose-invert mt-3 max-w-none text-sm text-foreground"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}
