"use client";

import { EngineeringFigure } from "@/components/problemSet/EngineeringFigure";
import { type PlacedForce } from "@/components/problemSet/FBDCanvas";
import { PartInputRow } from "@/components/problemSet/PartInputRow";
import { ResultPlot } from "@/components/problemSet/ResultPlot";
import { PayloadRichText } from "@/components/ui/payloadRichText";
import type {
  EngineeringFigureDoc,
  ProblemDoc,
  ProblemPart,
} from "@/lib/payloadSdk/types";

type ProblemPartEvaluation = {
  partIndex: number;
  studentAnswer?: number | null;
  studentExpression?: string | null;
  isCorrect?: boolean | null;
  score?: number | null;
};

type ProblemEvaluation = {
  problem: string;
  parts: ProblemPartEvaluation[];
};

type ProblemCardProps = {
  problem: ProblemDoc;
  index: number;
  partAnswers: Record<number, string | PlacedForce[]>;
  onChange: (partIndex: number, value: string | PlacedForce[]) => void;
  submitted: boolean;
  evaluation?: ProblemEvaluation;
  showAnswers: boolean;
};

const isRichTextValue = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object");

const toVariableName = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");

const resolveFigure = (value: unknown): EngineeringFigureDoc | null => {
  if (!value || typeof value !== "object") return null;
  if (!("figureData" in value)) return null;
  return value as EngineeringFigureDoc;
};

export function ProblemCard({
  problem,
  index,
  partAnswers,
  onChange,
  submitted,
  evaluation,
  showAnswers,
}: ProblemCardProps) {
  const parts: ProblemPart[] = Array.isArray(problem.parts) ? problem.parts : [];
  const figure = resolveFigure(problem.figure);
  const evaluationByPart = new Map(
    (evaluation?.parts ?? []).map((part) => [part.partIndex, part])
  );
  const plotScope = parts.reduce<Record<string, number>>((scope, part, partIndex) => {
    const partLabel = (part.label ?? "").trim();
    if (!partLabel) return scope;
    const rawInput = partAnswers[partIndex];
    const fromInput =
      typeof rawInput === "string" ? Number.parseFloat(rawInput) : Number.NaN;
    const fromEvaluation = evaluationByPart.get(partIndex)?.studentAnswer;
    const value = Number.isFinite(fromInput)
      ? fromInput
      : typeof fromEvaluation === "number" && Number.isFinite(fromEvaluation)
      ? fromEvaluation
      : null;
    if (value == null) return scope;
    scope[partLabel] = value;
    const sanitized = toVariableName(partLabel);
    if (sanitized) scope[sanitized] = value;
    return scope;
  }, {});
  const resultPlots = Array.isArray(problem.resultPlots) ? problem.resultPlots : [];

  return (
    <article className="rounded-xl border border-border/60 bg-card/50 p-5 space-y-4">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">
          Problem {index + 1}
        </h3>
        {problem.title ? (
          <p className="text-sm text-muted-foreground">{problem.title}</p>
        ) : null}
      </header>

      {figure ? <EngineeringFigure figure={figure} /> : null}

      {isRichTextValue(problem.prompt) ? (
        <PayloadRichText
          content={
            problem.prompt as unknown as Parameters<typeof PayloadRichText>[0]["content"]
          }
          className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
        />
      ) : null}

      <div className="space-y-3">
        {parts.map((part, partIndex) => (
          <PartInputRow
            key={part.id ?? `${problem.id}-${partIndex}`}
            part={part}
            value={partAnswers[partIndex] ?? ""}
            onChange={(nextValue) => onChange(partIndex, nextValue)}
            figure={figure}
            submitted={submitted}
            partEval={evaluationByPart.get(partIndex)}
            showAnswers={showAnswers}
          />
        ))}
      </div>

      {submitted && resultPlots.length ? (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Result Plots</h4>
          {resultPlots.map((plot, plotIndex) => (
            <ResultPlot
              key={plot.id ?? `${problem.id}-plot-${plotIndex}`}
              plot={plot}
              scope={plotScope}
            />
          ))}
        </section>
      ) : null}
    </article>
  );
}
