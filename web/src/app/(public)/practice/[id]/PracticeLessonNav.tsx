"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type PracticeLessonNavProps = {
  lessonHref: string | null;
  completedHint?: boolean;
};

export function PracticeLessonNav({
  lessonHref,
  completedHint = false,
}: PracticeLessonNavProps) {
  if (!lessonHref) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All practice
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Assigned from lesson
          </p>
          <p className="truncate text-[13px] text-muted-foreground">
            {completedHint
              ? "Practice saved — you can return to the lesson whenever you’re ready."
              : "Solve here, then return to continue the lesson."}
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link href={lessonHref}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to lesson
          </Link>
        </Button>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-4">
        <div className="pointer-events-auto flex w-full max-w-lg items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/95 px-3.5 py-2.5 shadow-[0_8px_30px_rgba(16,24,40,0.12)] backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <p className="min-w-0 text-[13px] text-muted-foreground">
            Done practicing?
          </p>
          <Button asChild size="sm" className="shrink-0">
            <Link href={lessonHref}>Return to lesson</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
