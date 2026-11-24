"use client";

import Link from "next/link";

export type SavedLessonItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  savedAt?: string;
};

type SavedLessonsListProps = {
  items: SavedLessonItem[];
};

export function SavedLessonsList({ items }: SavedLessonsListProps) {
  return (
    <section className="border-y border-border/60 py-5">
      <h2 className="text-sm font-semibold text-foreground">Saved lessons</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Save lessons to build a quick revisit list.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border/60 border-y border-border/60">
          {items.map((item) => (
            <li key={item.id} className="py-3">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <Link
                  href={item.href}
                  className="text-xs font-semibold text-primary underline underline-offset-4"
                >
                  Open lesson
                </Link>
                {item.savedAt ? (
                  <span className="text-[11px] text-muted-foreground">
                    Saved {new Date(item.savedAt).toLocaleDateString()}
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
