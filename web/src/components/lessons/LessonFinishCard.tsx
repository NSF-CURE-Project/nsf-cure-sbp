"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonSection } from "@/lib/lessons/toc";

type Props = {
  lessonTitle: string;
  sections: LessonSection[];
  next?: { slug: string; title: string } | null;
  hrefPrefix: string;
  // When provided, drives the "Lesson X of Y" caption and the chapter
  // shortcut at the bottom of the recap.
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

// End-of-lesson recap. Keeps the existing prev/next nav at the bottom
// (rendered elsewhere) and provides a quieter completion checkpoint above it.
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
      className="mt-11 border-t border-border/70 pt-6"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Lesson recap
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              You finished “{lessonTitle}”
            </h2>
            {hasProgressCaption && chapter?.number ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Chapter {chapter.number}
                {chapter.title ? ` · ${chapter.title}` : ""} -{" "}
                <strong className="font-semibold text-foreground">
                  {lessonIndex}
                </strong>{" "}
                of {lessonCount} lessons complete.
              </p>
            ) : null}
          </div>
          {trimmedSummary ? (
            <div className="space-y-1.5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                In summary
              </p>
              <p className="max-w-3xl whitespace-pre-line text-sm leading-6 text-foreground/90">
                {trimmedSummary}
              </p>
            </div>
          ) : summaryItems.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                What you covered
              </p>
              <ul className="grid gap-1">
                {summaryItems.map((section) => (
                  <li
                    key={section.id}
                    className="flex items-start gap-2 text-sm leading-6 text-foreground/90"
                  >
                    <span
                      className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600/80 dark:bg-emerald-400/80"
                      aria-hidden="true"
                    />
                    <span>{section.title}</span>
                  </li>
                ))}
              </ul>
              {sections.length > summaryItems.length ? (
                <p className="text-xs text-muted-foreground">
                  + {sections.length - summaryItems.length} more section
                  {sections.length - summaryItems.length === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end lg:pt-8">
          {next ? (
            <Button asChild className="group w-full sm:w-auto">
              <Link href={`${hrefPrefix}/${next.slug}`}>
                Continue to next lesson
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          ) : chapter?.title && chapter.slug && chapter.classSlug ? (
            <Button asChild className="group w-full sm:w-auto">
              <Link href={`/classes/${chapter.classSlug}/chapters/${chapter.slug}`}>
                Back to {chapter.title}
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          ) : null}
          {next && chapter?.title && chapter.slug && chapter.classSlug ? (
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href={`/classes/${chapter.classSlug}/chapters/${chapter.slug}`}>
                <ListTree className="h-4 w-4" />
                View chapter outline
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
