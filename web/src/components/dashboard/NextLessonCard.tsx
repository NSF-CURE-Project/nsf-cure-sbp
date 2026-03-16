"use client";

import Link from "next/link";

export type NextLessonTarget = {
  classSlug: string;
  chapterSlug?: string;
  lessonSlug: string;
  lessonTitle: string;
  classTitle: string;
};

type NextLessonCardProps = {
  nextLesson: NextLessonTarget | null;
};

export function NextLessonCard({ nextLesson }: NextLessonCardProps) {
  if (!nextLesson) {
    return (
      <section className="rounded-md border border-border/60 bg-background/80 p-5">
        <h2 className="text-sm font-semibold text-foreground">Next lesson</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You are all caught up across your enrolled classes.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-border/60 bg-background/80 p-5">
      <h2 className="text-sm font-semibold text-foreground">Next lesson</h2>
      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
        {nextLesson.classTitle}
      </p>
      <p className="mt-1 text-base font-semibold text-foreground">
        {nextLesson.lessonTitle}
      </p>
      <Link
        href={`/classes/${nextLesson.classSlug}/lessons/${nextLesson.lessonSlug}`}
        className="mt-3 inline-block text-sm font-semibold text-primary underline underline-offset-4"
      >
        Continue learning
      </Link>
    </section>
  );
}
