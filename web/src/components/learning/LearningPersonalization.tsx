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
import { LoginLink } from "@/components/auth/LoginLink";
import { cn } from "@/lib/utils";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();
const WEEKLY_GOAL_TARGET = 5;

const INTERACTIVE_CARD_CLASS =
  "transition-all duration-200 hover:-translate-y-[2px] hover:border-primary/60 hover:bg-muted/25 focus-within:ring-2 focus-within:ring-primary/45 focus-within:ring-offset-2 focus-within:ring-offset-background";

const INTERACTIVE_LINK_CLASS =
  "transition-all duration-200 hover:-translate-y-[2px] hover:border-primary/60 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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

export type LearningClassSummary = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  totalChapters: number;
  lessons: LearningLessonIndexEntry[];
};

type Props = {
  lessonIndex: LearningLessonIndexEntry[];
  classSummaries: LearningClassSummary[];
};

type AccountUser = {
  id: string;
  firstName?: string | null;
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
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

type RecentActivity = {
  key: string;
  href: string;
  title: string;
  breadcrumb: string;
  timeLabel: string;
};

type ClassIconVariant = "review" | "statics" | "mechanics" | "default";

type ClassDashboardCard = {
  key: string;
  classSlug: string;
  title: string;
  description?: string | null;
  viewHref: string;
  continueHref?: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  hasProgress: boolean;
  iconVariant: ClassIconVariant;
};

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function Card({ children, className }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border/70 bg-muted/15 p-4 shadow-sm sm:p-5",
        className
      )}
    >
      {children}
    </article>
  );
}

type ProgressBarProps = {
  value: number;
  className?: string;
};

function ProgressBar({ value, className }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn("h-1.5 w-full rounded-full bg-muted", className)}>
      <div
        className="h-1.5 rounded-full bg-primary transition-all duration-200"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

type MetricCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value?: string;
  detail?: string;
  footnote?: string;
  loading: boolean;
  emptyCopy: string;
};

function MetricCard({
  icon: Icon,
  title,
  value,
  detail,
  footnote,
  loading,
  emptyCopy,
}: MetricCardProps) {
  const hasValue = !!value;

  return (
    <Card className={cn("min-h-[150px]", INTERACTIVE_CARD_CLASS)}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : hasValue ? (
        <div className="space-y-1.5">
          <p className="text-xl font-bold text-foreground">{value}</p>
          {detail ? <p className="text-sm text-muted-foreground">{detail}</p> : null}
          {footnote ? (
            <p className="text-xs text-muted-foreground/90">{footnote}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyCopy}</p>
      )}
    </Card>
  );
}

type ClassCardProps = {
  title: string;
  description?: string | null;
  viewHref: string;
  continueHref?: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  hasProgress: boolean;
  iconVariant: ClassIconVariant;
};

function ClassIcon({ variant }: { variant: ClassIconVariant }) {
  if (variant === "statics") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-4 w-4 text-primary"
        fill="none"
      >
        <path
          d="M3 14h14M6 14V9l4-3 4 3v5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "mechanics") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-4 w-4 text-primary"
        fill="none"
      >
        <path
          d="M5 7h10M6 10h8M7 13h6M4 4h12v12H4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "review") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-4 w-4 text-primary"
        fill="none"
      >
        <path
          d="M4 4h12v12H4zM7 8h6M7 11h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 text-primary"
      fill="none"
    >
      <path
        d="M4 5h12M4 10h12M4 15h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClassCard({
  title,
  description,
  viewHref,
  continueHref,
  progressPercent,
  completedLessons,
  totalLessons,
  hasProgress,
  iconVariant,
}: ClassCardProps) {
  return (
    <Card className={cn("flex h-full flex-col", INTERACTIVE_CARD_CLASS)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
          <ClassIcon variant={iconVariant} />
        </span>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>

      {description ? (
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{description}</p>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          Keep moving through this class at your own pace.
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">{progressPercent}%</span>
        </div>
        <ProgressBar value={progressPercent} />
        <p className="text-xs text-muted-foreground">
          {hasProgress
            ? `${completedLessons} / ${totalLessons} lessons completed`
            : totalLessons > 0
              ? "No progress yet"
              : "No lessons yet"}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {continueHref ? (
          <Link
            href={continueHref}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border border-primary/60 bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground",
              INTERACTIVE_LINK_CLASS
            )}
          >
            Continue
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span className="inline-flex items-center rounded-lg border border-border/60 bg-background/40 px-3.5 py-2 text-sm text-muted-foreground">
            Continue
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </span>
        )}

        <Link
          href={viewHref}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background/35 px-3.5 py-2 text-sm font-semibold text-foreground",
            INTERACTIVE_LINK_CLASS
          )}
        >
          View class
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Card>
  );
}

type ActivityItemProps = {
  item: RecentActivity;
};

function ActivityItem({ item }: ActivityItemProps) {
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "block rounded-lg border border-border/60 bg-background/30 px-3 py-2.5",
          INTERACTIVE_LINK_CLASS
        )}
      >
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.breadcrumb}</p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/90">
          {item.timeLabel}
        </p>
      </Link>
    </li>
  );
}

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

const getFirstName = (user: AccountUser | null) => {
  if (!user) return null;

  const raw =
    user.firstName?.trim() ||
    user.fullName?.trim() ||
    user.name?.trim() ||
    user.email?.split("@")[0]?.trim() ||
    "";

  if (!raw) return null;

  const first = raw.split(/\s+/).find(Boolean);
  return first ?? null;
};

const formatRelativeTime = (value?: string | null) => {
  if (!value) return "Recently";

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "Recently";

  const deltaMs = Date.now() - timestamp;
  if (deltaMs < 0) return "Recently";

  const minutes = Math.floor(deltaMs / (1000 * 60));
  const hours = Math.floor(deltaMs / (1000 * 60 * 60));
  const days = Math.floor(deltaMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    const shown = Math.max(minutes, 1);
    return `${shown}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 8) {
    return `${days}d ago`;
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const pickClassIconVariant = (title: string): ClassIconVariant => {
  const normalized = title.toLowerCase();
  if (normalized.includes("review")) return "review";
  if (normalized.includes("statics")) return "statics";
  if (normalized.includes("mechanics")) return "mechanics";
  return "default";
};

export function LearningPersonalization({ lessonIndex, classSummaries }: Props) {
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

  const progressByActivity = useMemo(
    () =>
      [...progressDocs].sort((a, b) => {
        const aStamp = toTimestamp(a.updatedAt ?? a.completedAt);
        const bStamp = toTimestamp(b.updatedAt ?? b.completedAt);
        return bStamp - aStamp;
      }),
    [progressDocs]
  );

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
      progress,
      remaining: Math.max(WEEKLY_GOAL_TARGET - completedThisWeek, 0),
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
    const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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
        const recentIndex = orderedLessons.findIndex((lesson) => lesson.id === recentId);
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

    return null;
  }, [completedLessonIds, lessonsById, orderedLessons, progressByActivity]);

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
        const lessonSlug = fromIndex?.slug ?? getRelationSlug(bookmark.lesson) ?? null;
        const classSlug = fromIndex?.classSlug ?? getRelationSlug(bookmark.class) ?? null;
        const classTitle =
          fromIndex?.classTitle ?? getRelationTitle(bookmark.class) ?? "Learning";
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
          subtitle: chapterTitle ? `${classTitle} · ${chapterTitle}` : classTitle,
          savedAt: bookmark.updatedAt,
        });
      });

    return items.slice(0, 8);
  }, [bookmarkDocs, lessonsById]);

  const classDashboardCards = useMemo<ClassDashboardCard[]>(() => {
    return classSummaries.map((classSummary) => {
      const lessonIdSet = new Set(classSummary.lessons.map((lesson) => lesson.id));
      const completedLessons = classSummary.lessons.filter((lesson) =>
        completedLessonIds.has(lesson.id)
      ).length;
      const totalLessons = classSummary.lessons.length;
      const progressPercent = totalLessons
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      const inProgressDoc = progressByActivity.find((doc) => {
        if (doc.completed) return false;
        const lessonId = getRelationId(doc.lesson);
        return !!lessonId && lessonIdSet.has(lessonId);
      });

      const inProgressId = inProgressDoc ? getRelationId(inProgressDoc.lesson) : null;
      const inProgressLesson = inProgressId ? lessonsById.get(inProgressId) : null;

      return {
        key: classSummary.id,
        classSlug: classSummary.slug,
        title: classSummary.title,
        description: classSummary.description,
        viewHref: classSummary.slug ? `/classes/${classSummary.slug}` : "/learning",
        continueHref: inProgressLesson
          ? `/classes/${inProgressLesson.classSlug}/lessons/${inProgressLesson.slug}`
          : undefined,
        progressPercent,
        completedLessons,
        totalLessons,
        hasProgress: completedLessons > 0,
        iconVariant: pickClassIconVariant(classSummary.title),
      };
    });
  }, [classSummaries, completedLessonIds, lessonsById, progressByActivity]);

  const classProgressBySlug = useMemo(() => {
    const map = new Map<string, number>();
    classDashboardCards.forEach((item) => {
      if (item.classSlug) {
        map.set(item.classSlug, item.progressPercent);
      }
    });
    return map;
  }, [classDashboardCards]);

  const recentActivity = useMemo<RecentActivity[]>(() => {
    const items: RecentActivity[] = [];
    const seen = new Set<string>();

    progressByActivity.forEach((doc) => {
      if (items.length >= 5) return;
      const lessonId = getRelationId(doc.lesson);
      if (!lessonId || seen.has(lessonId)) return;

      const lesson = lessonsById.get(lessonId);
      if (!lesson) return;

      const stamp = doc.updatedAt ?? doc.completedAt;
      seen.add(lessonId);
      items.push({
        key: `${lessonId}-${stamp ?? "recent"}`,
        href: `/classes/${lesson.classSlug}/lessons/${lesson.slug}`,
        title: lesson.title,
        breadcrumb: `${lesson.classTitle} · ${lesson.chapterTitle}`,
        timeLabel: formatRelativeTime(stamp),
      });
    });

    return items;
  }, [lessonsById, progressByActivity]);

  const firstName = getFirstName(user);
  const greeting = firstName ? `Welcome back, ${firstName}` : "Welcome back";

  const heroProgress = resumeSelection
    ? classProgressBySlug.get(resumeSelection.lesson.classSlug) ?? 0
    : 0;

  const loadingState = !resolvedUser || loadingData;
  const earnedBadgeCount = milestoneBadges.filter((badge) => badge.earned).length;
  const firstClassHref = classDashboardCards[0]?.viewHref ?? "/learning";

  return (
    <section className="mt-4 space-y-6">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-foreground sm:text-xl">{greeting}</p>
        <p className="text-sm text-muted-foreground">
          Jump back into your topics and track completion at a glance.
        </p>
      </div>

      <section className="grid gap-4">
        <Card
          className={cn(
            "overflow-hidden border-primary/25 bg-gradient-to-r from-primary/15 via-background/45 to-secondary/20",
            INTERACTIVE_CARD_CLASS
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                <PlayCircle className="h-3.5 w-3.5" />
                Resume learning
              </div>

              {loadingState ? (
                <p className="text-sm text-muted-foreground">Loading your latest lesson...</p>
              ) : user && resumeSelection ? (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                    {resumeSelection.lesson.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {resumeSelection.lesson.classTitle} · {resumeSelection.lesson.chapterTitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {heroProgress}% complete in this class
                  </p>
                  <p className="text-sm text-muted-foreground">{resumeSelection.hint}</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">
                    Sign in to resume where you left off.
                  </p>
                  {user ? (
                    <p className="text-xs text-muted-foreground/90">
                      Start a lesson to begin tracking your resume history.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/90">
                      Your progress, goals, and saved lessons sync to your account.
                    </p>
                  )}
                </div>
              )}
            </div>

            {user && resumeSelection ? (
              <Button
                asChild
                className={cn(
                  "rounded-lg px-4 focus-visible:ring-primary/55 focus-visible:ring-offset-2",
                  "hover:-translate-y-[2px] transition-all duration-200"
                )}
              >
                <Link
                  href={`/classes/${resumeSelection.lesson.classSlug}/lessons/${resumeSelection.lesson.slug}`}
                >
                  Resume lesson
                  <span aria-hidden="true">→</span>
                </Link>
              </Button>
            ) : user ? (
              <Button
                asChild
                variant="outline"
                className={cn(
                  "rounded-lg border-border/70 bg-background/50 text-foreground",
                  "hover:border-primary/50 hover:bg-background/80 focus-visible:ring-primary/45"
                )}
              >
                <Link href={firstClassHref}>Browse classes</Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                className={cn(
                  "rounded-lg border-border/70 bg-background/50 text-foreground",
                  "hover:border-primary/50 hover:bg-background/80 focus-visible:ring-primary/45"
                )}
              >
                <LoginLink>Sign in</LoginLink>
              </Button>
            )}
          </div>

          {user && resumeSelection ? (
            <div className="mt-4">
              <ProgressBar value={heroProgress} />
            </div>
          ) : null}
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Target}
          title="Weekly Goal"
          loading={loadingState}
          value={user ? `${weeklyGoal.completedThisWeek} / ${WEEKLY_GOAL_TARGET}` : undefined}
          detail={user ? "Lessons completed this week" : undefined}
          footnote={
            user
              ? weeklyGoal.reached
                ? "Goal reached this week."
                : `${weeklyGoal.remaining} lesson${weeklyGoal.remaining === 1 ? "" : "s"} to go.`
              : undefined
          }
          emptyCopy="Sign in to track weekly goals."
        />

        <MetricCard
          icon={Flame}
          title="Progress Streak"
          loading={loadingState}
          value={user ? `${streak.count} day${streak.count === 1 ? "" : "s"}` : undefined}
          detail={user ? (streak.activeToday ? "Active today" : "Inactive today") : undefined}
          footnote={
            user
              ? streak.activeToday
                ? "Great consistency."
                : "Complete one lesson today to extend it."
              : undefined
          }
          emptyCopy="Sign in to maintain your streak."
        />

        <MetricCard
          icon={Award}
          title="Milestone Badges"
          loading={loadingState}
          value={user ? `${earnedBadgeCount} / ${milestoneBadges.length}` : undefined}
          detail={user ? "Milestones earned" : undefined}
          footnote={user ? `${completedCount} lessons completed overall` : undefined}
          emptyCopy="Sign in to unlock badges."
        />

        <MetricCard
          icon={savedLessons.length > 0 ? BookmarkCheck : Bookmark}
          title="Saved Lessons"
          loading={loadingState}
          value={user ? String(savedLessons.length) : undefined}
          detail={user ? "Bookmarked topics" : undefined}
          footnote={
            user
              ? savedLessons[0]
                ? `Latest: ${savedLessons[0].title}`
                : "Save lessons to revisit faster."
              : undefined
          }
          emptyCopy="Sign in to access saved lessons."
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Your classes</h2>
          {user ? (
            <span className="text-xs text-muted-foreground">Progress updates in real time</span>
          ) : (
            <span className="text-xs text-muted-foreground">Sign in to track class progress</span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classDashboardCards.map((classCard) => (
            <ClassCard
              key={classCard.key}
              title={classCard.title}
              description={classCard.description}
              viewHref={classCard.viewHref}
              continueHref={user ? classCard.continueHref : undefined}
              progressPercent={user ? classCard.progressPercent : 0}
              completedLessons={user ? classCard.completedLessons : 0}
              totalLessons={classCard.totalLessons}
              hasProgress={user ? classCard.hasProgress : false}
              iconVariant={classCard.iconVariant}
            />
          ))}
        </div>

        {classDashboardCards.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes available yet.</p>
        ) : null}
      </section>

      <section>
        <Card className={INTERACTIVE_CARD_CLASS}>
          <div className="mb-3 flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Recent activity</h2>
          </div>

          {loadingState ? (
            <p className="text-sm text-muted-foreground">Loading activity...</p>
          ) : recentActivity.length ? (
            <ul className="space-y-2">
              {recentActivity.map((item) => (
                <ActivityItem key={item.key} item={item} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity yet.</p>
          )}
        </Card>
      </section>
    </section>
  );
}
