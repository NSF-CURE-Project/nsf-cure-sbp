"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  Key,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CalloutBlock,
  CheckpointBlock,
  DefinitionBlock,
  LessonSummaryBlock,
  WorkedExampleBlock,
} from "@/lib/payloadSdk/types";

// ────────────────────────────────────────────────────────────────────
// Callout
// ────────────────────────────────────────────────────────────────────

const CALLOUT_VARIANTS = {
  info: {
    label: "Info",
    icon: Info,
    accent: "border-sky-500/40 bg-sky-500/8 text-sky-900 dark:text-sky-100",
    iconBg: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    pill: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  tip: {
    label: "Tip",
    icon: Lightbulb,
    accent: "border-emerald-500/40 bg-emerald-500/8 text-emerald-900 dark:text-emerald-100",
    iconBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    accent: "border-amber-500/45 bg-amber-500/10 text-amber-900 dark:text-amber-100",
    iconBg: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    pill: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  },
  key: {
    label: "Key concept",
    icon: Key,
    accent: "border-violet-500/40 bg-violet-500/8 text-violet-900 dark:text-violet-100",
    iconBg: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    pill: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
} as const;

export function CalloutBlockView({ block }: { block: CalloutBlock }) {
  const variant = (block.variant ?? "info") as keyof typeof CALLOUT_VARIANTS;
  const palette = CALLOUT_VARIANTS[variant] ?? CALLOUT_VARIANTS.info;
  const Icon = palette.icon;
  return (
    <aside
      role="note"
      className={cn(
        "rounded-xl border px-4 py-3.5 sm:px-5 sm:py-4",
        "border-l-[3px] shadow-sm",
        palette.accent,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            palette.iconBg,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                palette.pill,
              )}
            >
              {palette.label}
            </span>
            {block.title ? (
              <span className="text-sm font-semibold">{block.title}</span>
            ) : null}
          </div>
          <p className="whitespace-pre-line text-[14.5px] leading-7 text-foreground/95">
            {block.body}
          </p>
        </div>
      </div>
    </aside>
  );
}

// ────────────────────────────────────────────────────────────────────
// Definition
// ────────────────────────────────────────────────────────────────────

export function DefinitionBlockView({ block }: { block: DefinitionBlock }) {
  return (
    <figure className="rounded-xl border border-border/60 bg-card/50 px-4 py-4 shadow-sm sm:px-5">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        Definition
      </div>
      <dt className="mt-1 text-lg font-bold tracking-tight text-foreground">
        {block.term}
      </dt>
      <dd className="mt-1.5 whitespace-pre-line text-[14.5px] leading-7 text-foreground/90">
        {block.definition}
      </dd>
    </figure>
  );
}

// ────────────────────────────────────────────────────────────────────
// Worked example
// ────────────────────────────────────────────────────────────────────

export function WorkedExampleBlockView({ block }: { block: WorkedExampleBlock }) {
  const steps = block.steps ?? [];
  return (
    <section className="overflow-hidden rounded-xl border border-primary/35 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm">
      <header className="flex items-center gap-2 border-b border-primary/20 px-4 py-2.5 sm:px-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
          <ListChecks className="h-3 w-3" />
          Worked example
        </span>
        {block.title ? (
          <span className="truncate text-sm font-semibold text-foreground">
            {block.title}
          </span>
        ) : null}
      </header>
      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Problem
          </div>
          <p className="mt-1 whitespace-pre-line text-[14.5px] leading-7 text-foreground/95">
            {block.problem}
          </p>
        </div>
        {steps.length > 0 ? (
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Solution
            </div>
            <ol className="mt-2 grid gap-2">
              {steps.map((step, index) => (
                <li
                  key={step.id ?? index}
                  className="flex gap-3 rounded-lg border border-border/55 bg-background/50 px-3 py-2"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold tabular-nums text-primary">
                    {index + 1}
                  </span>
                  <span className="whitespace-pre-line text-[14px] leading-6 text-foreground/95">
                    {step.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {block.finalAnswer ? (
          <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-300">
              Final answer
            </div>
            <div className="mt-0.5 text-[14.5px] font-semibold text-foreground">
              {block.finalAnswer}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────
// Checkpoint (with reveal-answer + optional hint)
// ────────────────────────────────────────────────────────────────────

export function CheckpointBlockView({ block }: { block: CheckpointBlock }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <section className="rounded-xl border border-amber-500/35 bg-gradient-to-br from-amber-500/8 via-card to-card px-4 py-4 shadow-sm sm:px-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-300">
          <Target className="h-3 w-3" />
          Checkpoint
        </span>
      </div>
      <p className="mt-2 whitespace-pre-line text-[15px] font-medium leading-7 text-foreground">
        {block.prompt}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {block.hint ? (
          <button
            type="button"
            onClick={() => setShowHint((value) => !value)}
            aria-expanded={showHint}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2.5 py-1 text-[12px] font-semibold text-foreground transition-colors hover:border-amber-500/45 hover:bg-amber-500/10"
          >
            <Lightbulb className="h-3 w-3" />
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setShowAnswer((value) => !value)}
          aria-expanded={showAnswer}
          className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 px-2.5 py-1 text-[12px] font-bold text-white transition-colors hover:bg-amber-500"
        >
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              showAnswer ? "rotate-180" : "",
            )}
          />
          {showAnswer ? "Hide answer" : "Reveal answer"}
        </button>
      </div>
      {showHint && block.hint ? (
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-[13.5px] leading-6 text-foreground/90">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-amber-700 dark:text-amber-300">
            Hint
          </div>
          <p className="mt-0.5 whitespace-pre-line">{block.hint}</p>
        </div>
      ) : null}
      {showAnswer ? (
        <div className="mt-3 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-[14px] leading-6 text-foreground">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-300">
            Answer
          </div>
          <p className="mt-0.5 whitespace-pre-line">{block.answer}</p>
        </div>
      ) : null}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────
// Lesson summary
// ────────────────────────────────────────────────────────────────────

export function LessonSummaryBlockView({ block }: { block: LessonSummaryBlock }) {
  const points = (block.points ?? []).filter((p) => p.text?.trim());
  if (points.length === 0 && !block.title) return null;
  return (
    <section className="rounded-xl border border-border/60 bg-card/50 px-4 py-4 shadow-sm sm:px-5">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <h3 className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-foreground/85">
          {block.title || "Key takeaways"}
        </h3>
      </div>
      {points.length > 0 ? (
        <ul className="mt-2 grid gap-1.5">
          {points.map((point, index) => (
            <li
              key={point.id ?? index}
              className="flex items-start gap-2 text-[14px] leading-6 text-foreground/95"
            >
              <CheckCircle2
                className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <span>{point.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
