"use client";

import Link from "next/link";

type ResumeLearningCardProps = {
  item: {
    title: string;
    subtitle: string;
    href: string;
    hint?: string;
  } | null;
};

export function ResumeLearningCard({ item }: ResumeLearningCardProps) {
  return (
    <section className="rounded-md border border-border/60 bg-background/80 p-5">
      <h2 className="text-sm font-semibold text-foreground">Resume learning</h2>
      {!item ? (
        <p className="mt-2 text-sm text-muted-foreground">
          You are all caught up right now.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-base font-semibold text-foreground">{item.title}</p>
          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
          {item.hint ? (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.hint}
            </p>
          ) : null}
          <Link
            href={item.href}
            className="inline-block text-sm font-semibold text-primary underline underline-offset-4"
          >
            Continue
          </Link>
        </div>
      )}
    </section>
  );
}
