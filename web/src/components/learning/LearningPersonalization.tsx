"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

export type LearningLessonIndexEntry = {
  id: string;
  title: string;
  slug: string;
  classSlug: string;
  classTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  order: number;
};

type Props = {
  lessonIndex: LearningLessonIndexEntry[];
};

type AccountUser = {
  id: string;
};

type RelationValue =
  | string
  | number
  | null
  | undefined
  | {
      id?: string | number;
      slug?: string;
      title?: string;
      chapter?: RelationValue;
      class?: RelationValue;
    };

type ProgressDoc = {
  id: string | number;
  lesson?: RelationValue;
  completed?: boolean;
  updatedAt?: string;
  completedAt?: string | null;
};

type BookmarkDoc = {
  id: string | number;
  lesson?: RelationValue;
  chapter?: RelationValue;
  class?: RelationValue;
  updatedAt?: string;
};

type ResumeSelection = {
  lesson: LearningLessonIndexEntry;
  hint: string;
};

type SavedLessonItem = {
  key: string;
  href: string;
  title: string;
  subtitle: string;
  savedAt?: string;
};

const getRelationId = (value: RelationValue): string | null => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object" && value && "id" in value && value.id != null) {
    return String(value.id);
  }
  return null;
};

const getRelationSlug = (value: RelationValue): string | null => {
  if (typeof value === "object" && value && typeof value.slug === "string") {
    return value.slug;
  }
  return null;
};

const getRelationTitle = (value: RelationValue): string | null => {
  if (typeof value === "object" && value && typeof value.title === "string") {
    return value.title;
  }
  return null;
};

const getRelationObject = (value: RelationValue) =>
  typeof value === "object" && value ? value : null;

const toTimestamp = (value?: string | null) => {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function LearningPersonalization({ lessonIndex }: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [resolvedUser, setResolvedUser] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [progressDocs, setProgressDocs] = useState<ProgressDoc[]>([]);
  const [bookmarkDocs, setBookmarkDocs] = useState<BookmarkDoc[]>([]);

  const orderedLessons = useMemo(
    () => [...lessonIndex].sort((a, b) => a.order - b.order),
    [lessonIndex]
  );

  const lessonsById = useMemo(() => {
    const map = new Map<string, LearningLessonIndexEntry>();
    orderedLessons.forEach((lesson) => map.set(lesson.id, lesson));
    return map;
  }, [orderedLessons]);

  useEffect(() => {
    const controller = new AbortController();
    const loadUser = async () => {
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = (await res.json()) as { user?: AccountUser };
        setUser(data?.user ?? null);
      } catch {
        if (!controller.signal.aborted) {
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setResolvedUser(true);
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setProgressDocs([]);
      setBookmarkDocs([]);
      setLoadingData(false);
      return;
    }

    const controller = new AbortController();
    const loadPersonalizationData = async () => {
      setLoadingData(true);
      try {
        const [progressRes, bookmarksRes] = await Promise.all([
          fetch(`${PAYLOAD_URL}/api/lesson-progress?limit=500&sort=-updatedAt`, {
            credentials: "include",
            signal: controller.signal,
          }),
          fetch(
            `${PAYLOAD_URL}/api/lesson-bookmarks?limit=100&sort=-updatedAt&depth=2`,
            {
              credentials: "include",
              signal: controller.signal,
            }
          ),
        ]);

        if (progressRes.ok) {
          const progressData = (await progressRes.json()) as {
            docs?: ProgressDoc[];
          };
          setProgressDocs(progressData.docs ?? []);
        } else {
          setProgressDocs([]);
        }

        if (bookmarksRes.ok) {
          const bookmarkData = (await bookmarksRes.json()) as {
            docs?: BookmarkDoc[];
          };
          setBookmarkDocs(bookmarkData.docs ?? []);
        } else {
          setBookmarkDocs([]);
        }
      } catch {
        if (!controller.signal.aborted) {
          setProgressDocs([]);
          setBookmarkDocs([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingData(false);
        }
      }
    };

    loadPersonalizationData();
    return () => controller.abort();
  }, [user?.id]);

  const completedLessonIds = useMemo(() => {
    const ids = new Set<string>();
    progressDocs.forEach((doc) => {
      if (!doc.completed) return;
      const lessonId = getRelationId(doc.lesson);
      if (lessonId) ids.add(lessonId);
    });
    return ids;
  }, [progressDocs]);

  const resumeSelection = useMemo<ResumeSelection | null>(() => {
    if (!orderedLessons.length) return null;

    const progressByActivity = [...progressDocs].sort((a, b) => {
      const aStamp = toTimestamp(a.updatedAt ?? a.completedAt);
      const bStamp = toTimestamp(b.updatedAt ?? b.completedAt);
      return bStamp - aStamp;
    });

    const inProgress = progressByActivity.find((doc) => {
      if (doc.completed) return false;
      const lessonId = getRelationId(doc.lesson);
      return !!lessonId && lessonsById.has(lessonId);
    });
    if (inProgress) {
      const lessonId = getRelationId(inProgress.lesson);
      if (lessonId) {
        const lesson = lessonsById.get(lessonId);
        if (lesson) {
          return {
            lesson,
            hint: "Resume your in-progress lesson.",
          };
        }
      }
    }

    const mostRecent = progressByActivity.find((doc) => {
      const lessonId = getRelationId(doc.lesson);
      return !!lessonId && lessonsById.has(lessonId);
    });

    if (mostRecent) {
      const recentId = getRelationId(mostRecent.lesson);
      if (recentId) {
        const recentIndex = orderedLessons.findIndex(
          (lesson) => lesson.id === recentId
        );
        if (recentIndex >= 0) {
          const nextIncomplete = orderedLessons
            .slice(recentIndex + 1)
            .find((lesson) => !completedLessonIds.has(lesson.id));
          if (nextIncomplete) {
            return {
              lesson: nextIncomplete,
              hint: "Continue to your next lesson.",
            };
          }

          const current = orderedLessons[recentIndex];
          if (current) {
            return {
              lesson: current,
              hint: "Pick up where you left off.",
            };
          }
        }
      }
    }

    const firstIncomplete = orderedLessons.find(
      (lesson) => !completedLessonIds.has(lesson.id)
    );
    if (firstIncomplete) {
      return {
        lesson: firstIncomplete,
        hint: progressDocs.length
          ? "Continue your learning path."
          : "Start your first lesson.",
      };
    }

    return {
      lesson: orderedLessons[0],
      hint: "Review any lesson anytime.",
    };
  }, [orderedLessons, progressDocs, lessonsById, completedLessonIds]);

  const savedLessons = useMemo<SavedLessonItem[]>(() => {
    const dedupe = new Set<string>();
    const items: SavedLessonItem[] = [];

    [...bookmarkDocs]
      .sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))
      .forEach((bookmark) => {
        const lessonId = getRelationId(bookmark.lesson);
        const fromIndex = lessonId ? lessonsById.get(lessonId) : undefined;
        const lessonObject = getRelationObject(bookmark.lesson);

        const lessonTitle =
          fromIndex?.title ??
          getRelationTitle(bookmark.lesson) ??
          lessonObject?.title ??
          "Saved lesson";
        const lessonSlug =
          fromIndex?.slug ?? getRelationSlug(bookmark.lesson) ?? null;
        const classSlug =
          fromIndex?.classSlug ?? getRelationSlug(bookmark.class) ?? null;
        const classTitle =
          fromIndex?.classTitle ??
          getRelationTitle(bookmark.class) ??
          "Learning";
        const chapterTitle =
          fromIndex?.chapterTitle ?? getRelationTitle(bookmark.chapter) ?? "";

        if (!lessonSlug || !classSlug) return;

        const key = lessonId ?? `${classSlug}/${lessonSlug}`;
        if (dedupe.has(key)) return;
        dedupe.add(key);

        items.push({
          key,
          href: `/classes/${classSlug}/lessons/${lessonSlug}`,
          title: lessonTitle,
          subtitle: chapterTitle
            ? `${classTitle} · ${chapterTitle}`
            : classTitle,
          savedAt: bookmark.updatedAt,
        });
      });

    return items.slice(0, 8);
  }, [bookmarkDocs, lessonsById]);

  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-2">
      <article className="rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Continue Learning</h2>
        </div>

        {!resolvedUser || loadingData ? (
          <p className="text-sm text-muted-foreground">
            Loading your progress...
          </p>
        ) : !user ? (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-semibold text-foreground">
              Sign in
            </Link>{" "}
            to resume where you left off.
          </p>
        ) : resumeSelection ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Next up
              </p>
              <p className="text-lg font-semibold text-foreground">
                {resumeSelection.lesson.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {resumeSelection.lesson.classTitle} ·{" "}
                {resumeSelection.lesson.chapterTitle}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {resumeSelection.hint}
            </p>
            <Button asChild className="rounded-full">
              <Link
                href={`/classes/${resumeSelection.lesson.classSlug}/lessons/${resumeSelection.lesson.slug}`}
              >
                Resume lesson
              </Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No lessons available to resume yet.
          </p>
        )}
      </article>

      <article className="rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          {savedLessons.length > 0 ? (
            <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          )}
          <h2 className="text-base font-semibold">Saved Lessons</h2>
        </div>

        {!resolvedUser || loadingData ? (
          <p className="text-sm text-muted-foreground">
            Loading your saved lessons...
          </p>
        ) : !user ? (
          <p className="text-sm text-muted-foreground">
            Sign in to access your saved lessons.
          </p>
        ) : savedLessons.length ? (
          <ul className="space-y-3">
            {savedLessons.map((item) => {
              const savedAtLabel = formatDate(item.savedAt);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="block rounded-lg border border-border/60 bg-background/30 px-3 py-2 transition hover:border-border/90 hover:bg-background/50"
                  >
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subtitle}
                      {savedAtLabel ? ` · Saved ${savedAtLabel}` : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No saved lessons yet. Use the save button on any lesson page.
          </p>
        )}
      </article>
    </section>
  );
}
