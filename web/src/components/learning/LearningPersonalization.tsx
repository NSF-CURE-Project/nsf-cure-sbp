"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Bookmark,
  BookmarkCheck,
  Flame,
  PlayCircle,
  Target,
} from "lucide-react";
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

type NextBestAction = {
  key: string;
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

const WEEKLY_GOAL_TARGET = 5;

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

const toLocalDayKey = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return localDate.toISOString().slice(0, 10);
};

const getWeekStart = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
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

  const completedCount = completedLessonIds.size;

  const weeklyGoal = useMemo(() => {
    const weekStart = getWeekStart(new Date());
    const seen = new Set<string>();
    progressDocs.forEach((doc) => {
      if (!doc.completed) return;
      const lessonId = getRelationId(doc.lesson);
      const stamp = doc.completedAt ?? doc.updatedAt;
      if (!lessonId || !stamp) return;
      const completionDate = new Date(stamp);
      if (Number.isNaN(completionDate.getTime())) return;
      if (completionDate >= weekStart) {
        seen.add(lessonId);
      }
    });

    const completedThisWeek = seen.size;
    const progress = Math.min(completedThisWeek / WEEKLY_GOAL_TARGET, 1);
    return {
      completedThisWeek,
      remaining: Math.max(WEEKLY_GOAL_TARGET - completedThisWeek, 0),
      progress,
      reached: completedThisWeek >= WEEKLY_GOAL_TARGET,
    };
  }, [progressDocs]);

  const streak = useMemo(() => {
    const daySet = new Set<string>();
    progressDocs.forEach((doc) => {
      const stamp = doc.updatedAt ?? doc.completedAt;
      if (!stamp) return;
      const key = toLocalDayKey(stamp);
      if (key) daySet.add(key);
    });
    if (!daySet.size) return { count: 0, activeToday: false };

    const today = new Date();
    const todayKey = toLocalDayKey(today.toISOString());
    let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let count = 0;

    while (true) {
      const key = toLocalDayKey(cursor.toISOString());
      if (!key || !daySet.has(key)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      count,
      activeToday: !!todayKey && daySet.has(todayKey),
    };
  }, [progressDocs]);

  const milestoneBadges = useMemo(() => {
    const tiers = [1, 3, 5, 10, 20];
    return tiers.map((tier) => ({
      tier,
      earned: completedCount >= tier,
    }));
  }, [completedCount]);

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

  const nextBestActions = useMemo<NextBestAction[]>(() => {
    if (!resumeSelection) return [];

    const actions: NextBestAction[] = [
      {
        key: "resume",
        label: "Continue",
        title: resumeSelection.lesson.title,
        description: resumeSelection.hint,
        href: `/classes/${resumeSelection.lesson.classSlug}/lessons/${resumeSelection.lesson.slug}`,
        cta: "Open lesson",
      },
    ];

    if (!streak.activeToday) {
      actions.push({
        key: "streak",
        label: "Streak",
        title: streak.count
          ? `Keep your ${streak.count}-day streak alive`
          : "Start a learning streak today",
        description:
          "A short lesson today helps build momentum and stronger retention.",
        href: `/classes/${resumeSelection.lesson.classSlug}/lessons/${resumeSelection.lesson.slug}`,
        cta: "Do a quick lesson",
      });
    }

    if (!weeklyGoal.reached) {
      actions.push({
        key: "goal",
        label: "Weekly goal",
        title: `${weeklyGoal.remaining} lesson${weeklyGoal.remaining === 1 ? "" : "s"} left this week`,
        description: "Stay on pace by completing one more lesson now.",
        href: `/classes/${resumeSelection.lesson.classSlug}/lessons/${resumeSelection.lesson.slug}`,
        cta: "Make progress",
      });
    }

    if (savedLessons[0]) {
      actions.push({
        key: "saved",
        label: "Saved",
        title: `Revisit: ${savedLessons[0].title}`,
        description: "You bookmarked this topic for a reason—pick it back up.",
        href: savedLessons[0].href,
        cta: "Open saved lesson",
      });
    }

    return actions.slice(0, 3);
  }, [resumeSelection, savedLessons, streak, weeklyGoal]);

  return (
    <section className="mt-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Weekly Goal</h2>
          </div>
          {!resolvedUser || loadingData ? (
            <p className="text-sm text-muted-foreground">Loading goal...</p>
          ) : !user ? (
            <p className="text-sm text-muted-foreground">Sign in to track weekly goals.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {weeklyGoal.completedThisWeek} / {WEEKLY_GOAL_TARGET} lessons completed this week
              </p>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${weeklyGoal.progress * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {weeklyGoal.reached
                  ? "Goal reached. Amazing consistency."
                  : `${weeklyGoal.remaining} lesson${weeklyGoal.remaining === 1 ? "" : "s"} to go.`}
              </p>
            </div>
          )}
        </article>

        <article className="rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Progress Streak</h2>
          </div>
          {!resolvedUser || loadingData ? (
            <p className="text-sm text-muted-foreground">Loading streak...</p>
          ) : !user ? (
            <p className="text-sm text-muted-foreground">Sign in to maintain your streak.</p>
          ) : (
            <div>
              <p className="text-2xl font-bold text-foreground">{streak.count} day{streak.count === 1 ? "" : "s"}</p>
              <p className="text-sm text-muted-foreground">
                {streak.activeToday
                  ? "You’re active today—streak protected."
                  : "Complete a lesson today to extend your streak."}
              </p>
            </div>
          )}
        </article>

        <article className="rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Milestone Badges</h2>
          </div>
          {!resolvedUser || loadingData ? (
            <p className="text-sm text-muted-foreground">Loading badges...</p>
          ) : !user ? (
            <p className="text-sm text-muted-foreground">Sign in to unlock badges.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {milestoneBadges.map((badge) => (
                <li
                  key={badge.tier}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    badge.earned
                      ? "border-primary/40 bg-primary/15 text-foreground"
                      : "border-border/60 bg-background/30 text-muted-foreground"
                  }`}
                >
                  {badge.earned ? "✓ " : ""}
                  {badge.tier} lesson{badge.tier === 1 ? "" : "s"}
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Next Best Actions</h2>
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
          ) : nextBestActions.length ? (
            <ul className="space-y-3">
              {nextBestActions.map((action) => (
                <li
                  key={action.key}
                  className="rounded-lg border border-border/60 bg-background/30 p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {action.label}
                  </p>
                  <p className="font-semibold text-foreground">{action.title}</p>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                  <Button asChild size="sm" className="rounded-full">
                    <Link href={action.href}>{action.cta}</Link>
                  </Button>
                </li>
              ))}
            </ul>
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
    </section>
  );
}
