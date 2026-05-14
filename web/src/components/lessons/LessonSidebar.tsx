"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonSection } from "@/lib/lessons/toc";

type Props = {
  sections: LessonSection[];
  estimatedMinutes: number;
  lessonType: "Reading" | "Video" | "Quiz";
  // Sibling navigation for the current chapter.
  prev?: { slug: string; title: string } | null;
  next?: { slug: string; title: string } | null;
  hrefPrefix: string;
  // Optional context — drives the "Return to chapter" link + "Continue
  // through Chapter X" caption. Either can be missing on legacy lessons.
  chapter?: {
    title: string | null;
    slug: string | null;
    number: number | null;
    classSlug: string | null;
  };
  // Lesson position in the chapter (1-indexed); shows "Lesson 3 of 6" if
  // both are provided.
  lessonIndex?: number | null;
  lessonCount?: number | null;
};

// Sticky right-rail learning utility panel. Shows TOC anchored to the
// section headings in the rendered lesson, lesson metadata, in-chapter
// progress, and prev/next + return-to-chapter shortcuts. Auto-tracks the
// currently-visible section via IntersectionObserver so the active TOC
// entry follows the user's scroll position.
export default function LessonSidebar({
  sections,
  estimatedMinutes,
  lessonType,
  prev,
  next,
  hrefPrefix,
  chapter,
  lessonIndex,
  lessonCount,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );

  // Track which section is currently in view. The threshold + rootMargin
  // pair keeps the "active" indicator pegged to the section closest to the
  // top of the viewport once headers scroll under the topbar (96px).
  useEffect(() => {
    if (sections.length === 0) return;
    if (typeof window === "undefined") return;

    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    let current: string | null = sections[0]?.id ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            current = entry.target.id;
          }
        }
        if (current) setActiveId(current);
      },
      {
        rootMargin: "-96px 0px -60% 0px",
        threshold: [0, 1],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  const hasProgressCaption =
    typeof lessonIndex === "number" &&
    typeof lessonCount === "number" &&
    lessonCount > 0;

  return (
    <aside
      aria-label="Lesson outline"
      className="hidden xl:block xl:w-[260px] shrink-0"
    >
      <div className="sticky top-[calc(var(--nav-h,4rem)+1rem)] grid gap-4">
        {/* Lesson meta card */}
        <section className="rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-foreground/75">
              {lessonType}
            </span>
            <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />~{estimatedMinutes} min
            </span>
          </div>
          {hasProgressCaption ? (
            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-2 text-[11.5px] text-muted-foreground">
                <span>
                  Lesson{" "}
                  <strong className="text-foreground">{lessonIndex}</strong> of{" "}
                  {lessonCount}
                </span>
                {chapter?.number ? (
                  <span className="text-[10.5px] uppercase tracking-[0.06em]">
                    Ch {chapter.number}
                  </span>
                ) : null}
              </div>
              <div
                className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={lessonCount}
                aria-valuenow={lessonIndex}
                aria-label="Position in chapter"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((lessonIndex / lessonCount) * 100),
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
          {chapter?.title && chapter.slug && chapter.classSlug ? (
            <Link
              href={`/classes/${chapter.classSlug}/chapters/${chapter.slug}`}
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground/85 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to {chapter.title}
            </Link>
          ) : null}
        </section>

        {/* Table of contents */}
        {sections.length > 1 ? (
          <section className="rounded-xl border border-border/60 bg-card/40 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-foreground/75">
              <ListTree className="h-3.5 w-3.5" />
              In this lesson
            </div>
            <ul className="grid gap-0.5">
              {sections.map((section) => {
                const isActive = activeId === section.id;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={cn(
                        "flex items-start gap-2 rounded-md px-2 py-1.5 text-[12.5px] leading-snug transition-colors",
                        isActive
                          ? "bg-primary/10 text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                        section.level === "secondary" && "pl-4",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-1.5 inline-block h-1 w-1 rounded-full transition-colors",
                          isActive
                            ? "bg-primary"
                            : "bg-muted-foreground/40",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {section.title}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* Next lesson preview */}
        {next ? (
          <Link
            href={`${hrefPrefix}/${next.slug}`}
            className="group block rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:-translate-y-[1px] hover:border-primary/50 hover:bg-card/60 hover:shadow-sm"
          >
            <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Up next
            </div>
            <div className="mt-1 line-clamp-2 text-[13.5px] font-semibold leading-snug text-foreground">
              {next.title}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-primary">
              Continue
              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </Link>
        ) : null}

        {/* Subtle prev-lesson shortcut if there's no "next" target */}
        {!next && prev ? (
          <Link
            href={`${hrefPrefix}/${prev.slug}`}
            className="group block rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:-translate-y-[1px] hover:border-primary/50 hover:bg-card/60 hover:shadow-sm"
          >
            <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Previous lesson
            </div>
            <div className="mt-1 line-clamp-2 text-[13.5px] font-semibold leading-snug text-foreground">
              {prev.title}
            </div>
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
