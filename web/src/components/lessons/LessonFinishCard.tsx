"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import type { LessonSection } from "@/lib/lessons/toc";

type Props = {
  lessonTitle: string;
  sections: LessonSection[];
  next?: { slug: string; title: string } | null;
  hrefPrefix: string;
  // When provided, drives the "Lesson X of Y" caption and the chapter
  // shortcut at the bottom of the card.
  chapter?: {
    title: string | null;
    slug: string | null;
    number: number | null;
    classSlug: string | null;
  };
  lessonIndex?: number | null;
  lessonCount?: number | null;
  // Authored summary on the lesson. When present, the recap renders this
  // verbatim instead of falling back to the derived section list.
  summary?: string | null;
};

// End-of-lesson recap card. Replaces the abrupt "next lesson" nav with a
// momentum block: what you just finished, what's coming up, and a clear
// continue CTA. Keeps the existing prev/next nav at the bottom (rendered
// elsewhere) — this sits above it.
export default function LessonFinishCard({
  lessonTitle,
  sections,
  next,
  hrefPrefix,
  chapter,
  lessonIndex,
  lessonCount,
  summary,
}: Props) {
  const summaryItems = sections.slice(0, 4);
  const hasProgressCaption =
    typeof lessonIndex === "number" &&
    typeof lessonCount === "number" &&
    lessonCount > 0;
  const trimmedSummary = summary?.trim();

  return (
    <section
      aria-label="Lesson recap"
      className="relative mt-12 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card p-5 shadow-sm sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl"
      />

      <div className="relative grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Lesson recap
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            You finished “{lessonTitle}”
          </h2>
          {trimmedSummary ? (
            <div className="space-y-1.5">
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-foreground/75">
                In summary
              </p>
              <p className="whitespace-pre-line text-[14px] leading-6 text-foreground/95">
                {trimmedSummary}
              </p>
            </div>
          ) : summaryItems.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-foreground/75">
                What you covered
              </p>
              <ul className="grid gap-1">
                {summaryItems.map((section) => (
                  <li
                    key={section.id}
                    className="flex items-start gap-2 text-[13.5px] text-foreground/90"
                  >
                    <Sparkles
                      className="mt-1 h-3 w-3 shrink-0 text-emerald-600/85 dark:text-emerald-400/85"
                      aria-hidden="true"
                    />
                    <span>{section.title}</span>
                  </li>
                ))}
              </ul>
              {sections.length > summaryItems.length ? (
                <p className="text-[11.5px] text-muted-foreground">
                  + {sections.length - summaryItems.length} more section
                  {sections.length - summaryItems.length === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
          ) : null}
          {hasProgressCaption && chapter?.number ? (
            <p className="text-[12.5px] text-muted-foreground">
              Chapter {chapter.number}
              {chapter.title ? ` · ${chapter.title}` : ""} —{" "}
              <strong className="text-foreground">{lessonIndex}</strong> of{" "}
              {lessonCount} lessons complete.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {next ? (
            <Link
              href={`${hrefPrefix}/${next.slug}`}
              className="group inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Continue to next lesson
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ) : chapter?.title && chapter.slug && chapter.classSlug ? (
            <Link
              href={`/classes/${chapter.classSlug}/chapters/${chapter.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90"
            >
              Back to {chapter.title}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
          {next && chapter?.title && chapter.slug && chapter.classSlug ? (
            <Link
              href={`/classes/${chapter.classSlug}/chapters/${chapter.slug}`}
              className="text-center text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-right"
            >
              View chapter outline
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
