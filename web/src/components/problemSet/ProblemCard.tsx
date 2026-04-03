"use client";

import { EngineeringFigure } from "@/components/problemSet/EngineeringFigure";
import { type FBDPlacedAnswer } from "@/components/problemSet/FBDCanvas";
import { PartInputRow } from "@/components/problemSet/PartInputRow";
import { ResultPlot } from "@/components/problemSet/ResultPlot";
import { PayloadRichText } from "@/components/ui/payloadRichText";
import { cn } from "@/lib/utils";
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
  partAnswers: Record<number, string | FBDPlacedAnswer>;
  onChange: (partIndex: number, value: string | FBDPlacedAnswer) => void;
  submitted: boolean;
  evaluation?: ProblemEvaluation;
  showAnswers: boolean;
  isActive?: boolean;
  onFocus?: () => void;
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

const normalizeDifficulty = (difficulty?: string) => {
  if (!difficulty) return null;
  if (difficulty.toLowerCase() === "intro") return "Intro";
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

const buildGivenFacts = (
  problem: ProblemDoc,
  figure: EngineeringFigureDoc | null
) => {
  const facts: string[] = [];
  if (problem.topic) facts.push(`Topic: ${problem.topic}`);
  const difficulty = normalizeDifficulty(problem.difficulty);
  if (difficulty) facts.push(`Difficulty: ${difficulty}`);
  if (Array.isArray(problem.tags) && problem.tags.length > 0) {
    facts.push(`Tags: ${problem.tags.slice(0, 2).join(", ")}`);
  }

  if (figure?.figureData?.type === "beam") {
    const beam = figure.figureData;
    facts.push(`Span: ${beam.length} m`);
    facts.push(`Supports: ${beam.supports.length}`);
    if (Array.isArray(beam.pointLoads) && beam.pointLoads.length > 0) {
      facts.push(`Point loads: ${beam.pointLoads.length}`);
    }
    if (
      Array.isArray(beam.distributedLoads) &&
      beam.distributedLoads.length > 0
    ) {
      facts.push(`Distributed loads: ${beam.distributedLoads.length}`);
    }
  }
  if (figure?.figureData?.type === "truss") {
    const truss = figure.figureData;
    facts.push(`Nodes: ${truss.nodes.length}`);
    facts.push(`Members: ${truss.members.length}`);
  }
  if (figure?.figureData?.type === "fbd") {
    facts.push(`Forces: ${figure.figureData.forces.length}`);
  }
  if (problem.variant?.parameters?.length) {
    facts.push(`Variant seed: ${problem.variant.seed}`);
  }
  return facts.slice(0, 6);
};

export function ProblemCard({
  problem,
  index,
  partAnswers,
  onChange,
  submitted,
  evaluation,
  showAnswers,
  isActive,
  onFocus,
}: ProblemCardProps) {
  const parts: ProblemPart[] = Array.isArray(problem.parts)
    ? problem.parts
    : [];
  const figure = resolveFigure(problem.figure);
  const evaluationByPart = new Map(
    (evaluation?.parts ?? []).map((part) => [part.partIndex, part])
  );
  const plotScope = parts.reduce<Record<string, number>>(
    (scope, part, partIndex) => {
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
    },
    {}
  );
  const resultPlots = Array.isArray(problem.resultPlots)
    ? problem.resultPlots
    : [];
  const givenFacts = buildGivenFacts(problem, figure);
  const variantValues = [
    ...(Array.isArray(problem.variant?.parameters)
      ? problem.variant.parameters
      : []),
    ...(Array.isArray(problem.variant?.derived) ? problem.variant.derived : []),
  ];

  return (
    <article
      className={cn(
        "rounded-lg border bg-card/70 p-4 md:p-5 space-y-4 transition-colors",
        isActive
          ? "border-primary/45 shadow-sm shadow-primary/10"
          : "border-border/60"
      )}
      onClick={onFocus}
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            Problem {index + 1}
          </span>
          <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {parts.length} Step{parts.length === 1 ? "" : "s"}
          </span>
        </div>
        {problem.title ? (
          <p className="text-xl font-semibold text-foreground leading-snug">
            {problem.title}
          </p>
        ) : null}
      </header>

      {figure ? <EngineeringFigure figure={figure} /> : null}

      {givenFacts.length ? (
        <section className="rounded-md border border-border/60 bg-background/60 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Given
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {givenFacts.map((fact) => (
              <span
                key={fact}
                className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-foreground"
              >
                {fact}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {variantValues.length ? (
        <section className="rounded-md border border-border/60 bg-background/60 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Variant Inputs
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variantValues.map((entry) => (
              <span
                key={`${entry.key}-${entry.value}`}
                className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-foreground"
              >
                {entry.label}: {Number(entry.value.toFixed(6))}{" "}
                {entry.unit ? entry.unit : ""}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {isRichTextValue(problem.prompt) ? (
        <section className="rounded-md border border-border/60 bg-background/60 p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Task
          </p>
          <PayloadRichText
            content={
              problem.prompt as unknown as Parameters<
                typeof PayloadRichText
              >[0]["content"]
            }
            className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
          />
        </section>
      ) : null}

      <div className="space-y-3">
        {parts.map((part, partIndex) => (
          <PartInputRow
            key={part.id ?? `${problem.id}-${partIndex}`}
            part={part}
            partNumber={partIndex + 1}
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
          <h4 className="text-sm font-semibold text-foreground">
            Result Plots
          </h4>
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
