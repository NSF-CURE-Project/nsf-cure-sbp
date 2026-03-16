"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type SavedLesson = {
  id: string;
  title: string;
  className: string;
  chapterName: string;
  href: string;
  bookmarkedAt: string | null;
};

type SavedLessonsShellProps = {
  groupedLessons: {
    className: string;
    items: SavedLesson[];
  }[];
};

export function SavedLessonsShell({ groupedLessons }: SavedLessonsShellProps) {
  const [groups, setGroups] = useState(groupedLessons);

  const handleRemove = async (bookmarkId: string) => {
    const res = await fetch(`/api/lesson-bookmarks/${bookmarkId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) return;

    setGroups((current) =>
      current
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.id !== bookmarkId),
        }))
        .filter((group) => group.items.length > 0)
    );
  };

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,100ch)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Saved lessons
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            Bookmarked lessons
          </h1>
        </header>

        {groups.length === 0 ? (
          <section className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
            No saved lessons yet. Bookmark a lesson to see it here.
          </section>
        ) : (
          groups.map((group) => (
            <section key={group.className} className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">{group.className}</h2>
              <div className="grid gap-3">
                {group.items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-border/60 bg-card/50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.chapterName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Bookmarked{" "}
                          {item.bookmarkedAt
                            ? new Date(item.bookmarkedAt).toLocaleDateString()
                            : "recently"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={item.href}>Open lesson</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleRemove(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
