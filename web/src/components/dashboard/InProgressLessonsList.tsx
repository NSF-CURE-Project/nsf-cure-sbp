"use client";

import Link from "next/link";

export type InProgressLessonItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  updatedAt?: string;
};

type InProgressLessonsListProps = {
  items: InProgressLessonItem[];
};

export function InProgressLessonsList({ items }: InProgressLessonsListProps) {
  return (
    <section className="rounded-md border border-border/60 bg-background/80 p-5">
      <h2 className="text-sm font-semibold text-foreground">In-progress lessons</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Start a lesson to track progress here.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-md border border-border/50 bg-muted/20 p-3">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <Link
                  href={item.href}
                  className="text-xs font-semibold text-primary underline underline-offset-4"
                >
                  Resume lesson
                </Link>
                {item.updatedAt ? (
                  <span className="text-[11px] text-muted-foreground">
                    Active {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
