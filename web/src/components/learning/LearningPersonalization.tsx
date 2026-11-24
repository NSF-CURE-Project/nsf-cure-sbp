"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginLink } from "@/components/auth/LoginLink";
import { cn } from "@/lib/utils";
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

export type LearningClassSummary = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  totalChapters: number;
  lessons: LearningLessonIndexEntry[];
};

export type LearningPracticeSummary = {
  enabled: boolean;
  totalProblems: number;
};

type Props = {
  lessonIndex: LearningLessonIndexEntry[];
  classSummaries: LearningClassSummary[];
  practiceSummary?: LearningPracticeSummary;
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
  classProgressPercent: number;
  lessonsRemainingInClass: number;
};

type SavedLessonItem = {
  key: string;
  href: string;
  title: string;
  subtitle: string;
};

type RecentActivity = {
  key: string;
  href: string;
  title: string;
  breadcrumb: string;
  timeLabel: string;
  completed: boolean;
};

type ClassIconVariant = "review" | "statics" | "mechanics" | "default";

type ClassDashboardCard = {
  key: string;
  classSlug: string;
  title: string;
  description: string;
  viewHref: string;
  firstLessonHref?: string;
  continueHref?: string;
  progressPercent: number;
  completedLessons: number;
  totalChapters: number;
  totalLessons: number;
  hasProgress: boolean;
  iconVariant: ClassIconVariant;
  lastActivityAt?: string | null;
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

const getRelationId = (value: RelationValue): string | null => {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
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

const getFirstName = (user: AccountUser | null) => {
  if (!user) return null;
  const raw =
    user.firstName?.trim() ||
    user.fullName?.trim() ||
    user.name?.trim() ||
    user.email?.split("@")[0]?.trim() ||
    "";
  if (!raw) return null;
  return raw.split(/\s+/).find(Boolean) ?? null;
};

const getGreetingPrefix = (now: Date): string => {
  const hours = now.getHours();
  if (hours < 12) return "Good morning";
  if (hours < 17) return "Good afternoon";
  return "Good evening";
};

const formatRelativeTime = (value?: string | null) => {
  if (!value) return "Recently";
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "Recently";
  const deltaMs = Date.now() - timestamp;
  if (deltaMs < 0) return "Just now";

  const minutes = Math.floor(deltaMs / (1000 * 60));
  const hours = Math.floor(deltaMs / (1000 * 60 * 60));
  const days = Math.floor(deltaMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 8) return `${days}d ago`;
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

const fallbackCourseDescription = (
  variant: ClassIconVariant,
  hasLessons: boolean
): string => {
  if (variant === "review") {
    return "Foundational algebra, trigonometry, vectors, and free-body diagram essentials for engineering courses.";
  }
  if (variant === "statics") {
    return "Force systems, particle and rigid-body equilibrium, structural analysis, internal forces, and moments of inertia.";
  }
  if (variant === "mechanics") {
    return "Stress, strain, axial loading, torsion, beam bending, combined loading, and deflection of deformable bodies.";
  }
  return hasLessons
    ? "Structured chapters, guided examples, and conceptual checks."
    : "Course modules and worked examples are currently being prepared.";
};

// ──────────────────────────────────────────────────────────────
// Atoms
// ──────────────────────────────────────────────────────────────

function ProgressBar({
  value,
  className,
  tone = "primary",
}: {
  value: number;
  className?: string;
  tone?: "primary" | "emerald";
}) {
  const width = Math.max(0, Math.min(100, Math.round(value)));
  const fill = tone === "emerald" ? "bg-emerald-600" : "bg-primary";
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted/80",
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={width}
    >
      <div
        className={cn(
          "h-1.5 rounded-full transition-[width] duration-300 ease-out",
          fill
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function ClassIcon({ variant }: { variant: ClassIconVariant }) {
  const common = {
    "aria-hidden": "true" as const,
    viewBox: "0 0 20 20",
    className: "h-4 w-4",
    fill: "none" as const,
  };
  if (variant === "statics") {
    return (
      <svg {...common}>
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
      <svg {...common}>
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
      <svg {...common}>
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
    <svg {...common}>
      <path
        d="M4 5h12M4 10h12M4 15h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// Course Card
// ──────────────────────────────────────────────────────────────

type ClassCardProps = {
  card: ClassDashboardCard;
  signedIn: boolean;
  isPrimaryAction: boolean;
  lastActivityLabel: string | null;
};

function ClassCard({
  card,
  signedIn,
  isPrimaryAction,
  lastActivityLabel,
}: ClassCardProps) {
  const {
    title,
    description,
    viewHref,
    continueHref,
    progressPercent,
    completedLessons,
    totalChapters,
    totalLessons,
    hasProgress,
    iconVariant,
  } = card;

  const isEmptyCourse = totalLessons === 0;
  const isComplete = signedIn && hasProgress && progressPercent >= 100;

  if (isEmptyCourse) {
    return (
      <article className="flex h-full flex-col justify-between rounded-xl border border-border/65 bg-muted/[0.16] p-5 dark:bg-muted/[0.08]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background/80 text-muted-foreground">
              <ClassIcon variant={iconVariant} />
            </span>
            <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              Coming soon
            </span>
          </div>

          <h3 className="mt-3.5 text-[17px] font-semibold tracking-tight text-foreground/90">
            {title}
          </h3>
          <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3.5 text-xs">
          <span className="text-muted-foreground">
            Curriculum in preparation
          </span>
          <Link
            href={viewHref}
            className="inline-flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Overview
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    );
  }

  const chapterText =
    totalChapters > 0
      ? `${totalChapters} ${totalChapters === 1 ? "chapter" : "chapters"}`
      : null;
  const lessonText = `${totalLessons} ${totalLessons === 1 ? "lesson" : "lessons"}`;
  const scopeLabel = chapterText ? `${chapterText} · ${lessonText}` : lessonText;

  const actionHref = signedIn && continueHref ? continueHref : viewHref;
  const actionLabel =
    signedIn && continueHref
      ? "Continue"
      : signedIn && hasProgress
        ? "Open course"
        : "Start course";

  return (
    <article
      className={cn(
        "group flex h-full flex-col justify-between rounded-xl border bg-card p-5 transition-[border-color,box-shadow] duration-150",
        "hover:border-primary/35 hover:shadow-[0_6px_20px_rgba(16,24,40,0.06)]",
        isPrimaryAction ? "border-primary/30" : "border-border/80"
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border text-primary",
              isPrimaryAction
                ? "border-primary/25 bg-primary/[0.07]"
                : "border-border/75 bg-muted/30"
            )}
          >
            <ClassIcon variant={iconVariant} />
          </span>

          {isComplete ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-600/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          ) : signedIn && hasProgress ? (
            <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-primary">
              In progress
            </span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              {scopeLabel}
            </span>
          )}
        </div>

        <h3 className="mt-3.5 text-[17px] font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3.5 border-t border-border/60 pt-3.5">
        {signedIn ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-muted-foreground">
                <span className="font-medium tabular-nums text-foreground">
                  {completedLessons}
                </span>{" "}
                of {totalLessons} lessons completed
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {progressPercent}%
              </span>
            </div>
            <ProgressBar
              value={progressPercent}
              tone={isComplete ? "emerald" : "primary"}
            />
            {lastActivityLabel ? (
              <p className="text-[11.5px] text-muted-foreground">
                Last active {lastActivityLabel}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant={isPrimaryAction ? "default" : "outline"}
            size="sm"
            className="flex-1 rounded-lg shadow-none"
          >
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </Button>
          {signedIn && continueHref ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Link href={viewHref}>Outline</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────

export function LearningPersonalization({
  lessonIndex,
  classSummaries,
  practiceSummary,
}: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [resolvedUser, setResolvedUser] = useState(false);
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

  const activeProgressDocs = useMemo(
    () => (user?.id ? progressDocs : []),
    [progressDocs, user?.id]
  );
  const activeBookmarkDocs = useMemo(
    () => (user?.id ? bookmarkDocs : []),
    [bookmarkDocs, user?.id]
  );

  const progressByActivity = useMemo(
    () =>
      [...activeProgressDocs].sort((a, b) => {
        const aStamp = toTimestamp(a.updatedAt ?? a.completedAt);
        const bStamp = toTimestamp(b.updatedAt ?? b.completedAt);
        return bStamp - aStamp;
      }),
    [activeProgressDocs]
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
        if (!controller.signal.aborted) setUser(null);
      } finally {
        if (!controller.signal.aborted) setResolvedUser(true);
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();
    const loadPersonalizationData = async () => {
      try {
        const [progressRes, bookmarksRes] = await Promise.all([
          fetch(
            `${PAYLOAD_URL}/api/lesson-progress?limit=500&sort=-updatedAt`,
            {
              credentials: "include",
              signal: controller.signal,
            }
          ),
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
      }
    };

    loadPersonalizationData();
    return () => controller.abort();
  }, [user?.id]);

  const completedLessonIds = useMemo(() => {
    const ids = new Set<string>();
    activeProgressDocs.forEach((doc) => {
      if (!doc.completed) return;
      const lessonId = getRelationId(doc.lesson);
      if (lessonId) ids.add(lessonId);
    });
    return ids;
  }, [activeProgressDocs]);

  const completedCount = completedLessonIds.size;

  const lastActivityByClassSlug = useMemo(() => {
    const map = new Map<string, string>();
    progressByActivity.forEach((doc) => {
      const lessonId = getRelationId(doc.lesson);
      if (!lessonId) return;
      const lesson = lessonsById.get(lessonId);
      if (!lesson) return;
      if (map.has(lesson.classSlug)) return;
      const stamp = doc.updatedAt ?? doc.completedAt;
      if (stamp) map.set(lesson.classSlug, stamp);
    });
    return map;
  }, [lessonsById, progressByActivity]);

  const classDashboardCards = useMemo<ClassDashboardCard[]>(() => {
    return classSummaries.map((classSummary) => {
      const lessonIdSet = new Set(
        classSummary.lessons.map((lesson) => lesson.id)
      );
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
      const inProgressId = inProgressDoc
        ? getRelationId(inProgressDoc.lesson)
        : null;
      const inProgressLesson = inProgressId
        ? lessonsById.get(inProgressId)
        : null;

      const firstLesson = classSummary.lessons[0];
      const iconVariant = pickClassIconVariant(classSummary.title);
      const trimmedDesc = classSummary.description?.trim();

      return {
        key: classSummary.id,
        classSlug: classSummary.slug,
        title: classSummary.title,
        description:
          trimmedDesc || fallbackCourseDescription(iconVariant, totalLessons > 0),
        viewHref: classSummary.slug
          ? `/classes/${classSummary.slug}`
          : "/learning",
        firstLessonHref: firstLesson
          ? `/classes/${firstLesson.classSlug}/lessons/${firstLesson.slug}`
          : undefined,
        continueHref: inProgressLesson
          ? `/classes/${inProgressLesson.classSlug}/lessons/${inProgressLesson.slug}`
          : undefined,
        progressPercent,
        completedLessons,
        totalChapters: classSummary.totalChapters,
        totalLessons,
        hasProgress: completedLessons > 0 || !!inProgressLesson,
        iconVariant,
        lastActivityAt: lastActivityByClassSlug.get(classSummary.slug) ?? null,
      };
    });
  }, [
    classSummaries,
    completedLessonIds,
    lastActivityByClassSlug,
    lessonsById,
    progressByActivity,
  ]);

  const classProgressBySlug = useMemo(() => {
    const map = new Map<string, number>();
    classDashboardCards.forEach((item) => {
      if (item.classSlug) map.set(item.classSlug, item.progressPercent);
    });
    return map;
  }, [classDashboardCards]);

  const resumeSelection = useMemo<ResumeSelection | null>(() => {
    if (!orderedLessons.length) return null;

    const findClassData = (lesson: LearningLessonIndexEntry) => {
      const classCard = classDashboardCards.find(
        (item) => item.classSlug === lesson.classSlug
      );
      const classProgressPercent =
        classProgressBySlug.get(lesson.classSlug) ??
        classCard?.progressPercent ??
        0;
      const lessonsRemainingInClass = classCard
        ? Math.max(classCard.totalLessons - classCard.completedLessons, 0)
        : 0;
      return { classProgressPercent, lessonsRemainingInClass };
    };

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
          const meta = findClassData(lesson);
          return {
            lesson,
            hint: "Continue where you paused",
            ...meta,
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
            const meta = findClassData(nextIncomplete);
            return {
              lesson: nextIncomplete,
              hint: "Next recommended lesson",
              ...meta,
            };
          }
          const current = orderedLessons[recentIndex];
          if (current) {
            const meta = findClassData(current);
            return {
              lesson: current,
              hint: "Most recently viewed lesson",
              ...meta,
            };
          }
        }
      }
    }

    return null;
  }, [
    classDashboardCards,
    classProgressBySlug,
    completedLessonIds,
    lessonsById,
    orderedLessons,
    progressByActivity,
  ]);

  const savedLessons = useMemo<SavedLessonItem[]>(() => {
    const dedupe = new Set<string>();
    const items: SavedLessonItem[] = [];
    [...activeBookmarkDocs]
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
        });
      });
    return items.slice(0, 5);
  }, [activeBookmarkDocs, lessonsById]);

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
        completed: !!doc.completed,
      });
    });
    return items;
  }, [lessonsById, progressByActivity]);

  const firstName = getFirstName(user);
  const greetingPrefix = useMemo(() => getGreetingPrefix(new Date()), []);
  const signedInEyebrow = firstName
    ? `${greetingPrefix}, ${firstName}`
    : greetingPrefix;

  const totalLessonCount = orderedLessons.length;
  const activeCourseCount = classDashboardCards.filter(
    (c) => c.totalLessons > 0
  ).length;
  const totalCourseCount = classDashboardCards.length;

  // Highlight the active resume course when signed in with progress;
  // otherwise all courses with published lessons share a consistent primary CTA.
  const featuredClassSlug =
    user && resumeSelection?.lesson.classSlug
      ? resumeSelection.lesson.classSlug
      : null;

  const showPersonalLists =
    !!user && (savedLessons.length > 0 || recentActivity.length > 0);
  const bothPersonalLists =
    !!user && savedLessons.length > 0 && recentActivity.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-border/70 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {user ? signedInEyebrow : "Summer Bridge Curriculum"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Learning Portal
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Explore engineering coursework, work through guided lessons, and check
          your understanding with interactive practice problems.
        </p>

        <dl className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
          {totalCourseCount > 0 ? (
            <div className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary/75" />
              <dt className="sr-only">Courses</dt>
              <dd>
                <span className="font-semibold tabular-nums text-foreground">
                  {totalCourseCount}
                </span>{" "}
                {totalCourseCount === 1 ? "course" : "courses"}
                {activeCourseCount > 0 && activeCourseCount < totalCourseCount
                  ? ` (${activeCourseCount} active)`
                  : ""}
              </dd>
            </div>
          ) : null}

          {totalLessonCount > 0 ? (
            <div className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary/75" />
              <dt className="sr-only">Lessons</dt>
              <dd>
                <span className="font-semibold tabular-nums text-foreground">
                  {totalLessonCount}
                </span>{" "}
                {totalLessonCount === 1 ? "lesson" : "lessons"}
              </dd>
            </div>
          ) : null}

          {practiceSummary?.enabled && practiceSummary.totalProblems > 0 ? (
            <div className="inline-flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5 text-primary/75" />
              <dt className="sr-only">Practice problems</dt>
              <dd>
                <span className="font-semibold tabular-nums text-foreground">
                  {practiceSummary.totalProblems}
                </span>{" "}
                practice problems
              </dd>
            </div>
          ) : null}

          {user && completedCount > 0 && totalLessonCount > 0 ? (
            <div className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary/75" />
              <dt className="sr-only">Completed</dt>
              <dd>
                <span className="font-semibold tabular-nums text-foreground">
                  {completedCount}/{totalLessonCount}
                </span>{" "}
                completed
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      {/* Signed-in Continue Card */}
      {user && resumeSelection ? (
        <section aria-label="Continue learning">
          <article className="flex flex-col justify-between gap-5 rounded-xl border border-primary/25 bg-primary/[0.03] p-5 sm:flex-row sm:items-center sm:px-6 dark:bg-primary/[0.06]">
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="font-semibold uppercase tracking-[0.12em] text-primary">
                  {resumeSelection.hint}
                </span>
                <span aria-hidden="true" className="text-muted-foreground/50">
                  ·
                </span>
                <span className="text-muted-foreground">
                  {resumeSelection.lesson.classTitle} ·{" "}
                  {resumeSelection.lesson.chapterTitle}
                </span>
              </div>

              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {resumeSelection.lesson.title}
              </h2>

              <div className="max-w-md space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {resumeSelection.classProgressPercent}% through{" "}
                    {resumeSelection.lesson.classTitle}
                  </span>
                  {resumeSelection.lessonsRemainingInClass > 0 ? (
                    <span>
                      {resumeSelection.lessonsRemainingInClass}{" "}
                      {resumeSelection.lessonsRemainingInClass === 1
                        ? "lesson"
                        : "lessons"}{" "}
                      remaining
                    </span>
                  ) : null}
                </div>
                <ProgressBar value={resumeSelection.classProgressPercent} />
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <Button asChild className="rounded-lg shadow-none">
                <Link
                  href={`/classes/${resumeSelection.lesson.classSlug}/lessons/${resumeSelection.lesson.slug}`}
                >
                  Resume lesson
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-lg bg-background/80 shadow-none"
              >
                <Link href={`/classes/${resumeSelection.lesson.classSlug}`}>
                  Course outline
                </Link>
              </Button>
            </div>
          </article>
        </section>
      ) : null}

      {/* Courses */}
      <section className="space-y-3.5" aria-labelledby="lp-courses-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="lp-courses-heading"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Courses
          </h2>
        </div>

        {classDashboardCards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {classDashboardCards.map((card) => {
              const lastActivityLabel =
                user && card.lastActivityAt
                  ? formatRelativeTime(card.lastActivityAt)
                  : null;
              return (
                <ClassCard
                  key={card.key}
                  card={card}
                  signedIn={!!user}
                  isPrimaryAction={
                    card.totalLessons > 0 &&
                    (featuredClassSlug
                      ? card.classSlug === featuredClassSlug
                      : true)
                  }
                  lastActivityLabel={lastActivityLabel}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No courses available yet.
          </p>
        )}
      </section>

      {/* Practice Problem Library */}
      {practiceSummary?.enabled ? (
        <section
          className="space-y-3.5"
          aria-labelledby="lp-practice-section-heading"
        >
          <div>
            <h2
              id="lp-practice-section-heading"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Engineering Practice
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Strengthen your engineering skills through interactive, randomized
              practice problems.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-xl border border-border/80 bg-card p-5 sm:flex-row sm:items-center sm:px-6">
            <div className="flex min-w-0 items-start gap-3.5">
              <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/75 bg-muted/35 text-primary">
                <Calculator className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[16px] font-semibold tracking-tight text-foreground">
                    Practice Problem Library
                  </h3>
                  {practiceSummary.totalProblems > 0 ? (
                    <span className="rounded-full border border-border/70 bg-muted/35 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                      {practiceSummary.totalProblems} problems
                    </span>
                  ) : null}
                </div>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                  Browse problems by subject and chapter, apply engineering
                  concepts, and check your solutions.
                </p>
              </div>
            </div>

            <div className="shrink-0 sm:pl-4">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full rounded-lg shadow-none sm:w-auto"
              >
                <Link href="/practice">
                  Browse Problems
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Signed-in Bookmarks & Recent Activity */}
      {showPersonalLists ? (
        <div
          className={cn(
            "grid gap-6",
            bothPersonalLists ? "lg:grid-cols-2" : "grid-cols-1"
          )}
        >
          {savedLessons.length > 0 ? (
            <section
              className="space-y-3"
              aria-labelledby="lp-saved-heading"
            >
              <div className="flex items-center justify-between gap-2">
                <h2
                  id="lp-saved-heading"
                  className="text-sm font-semibold tracking-tight text-foreground"
                >
                  Saved bookmarks
                </h2>
                <Link
                  href="/saved-lessons"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all
                </Link>
              </div>
              <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/80 bg-card">
                {savedLessons.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </p>
                      </div>
                      <Bookmark
                        className="h-3.5 w-3.5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {recentActivity.length > 0 ? (
            <section
              className="space-y-3"
              aria-labelledby="lp-recent-heading"
            >
              <h2
                id="lp-recent-heading"
                className="text-sm font-semibold tracking-tight text-foreground"
              >
                Recent activity
              </h2>
              <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/80 bg-card">
                {recentActivity.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        {item.completed ? (
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                        ) : (
                          <Clock
                            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.breadcrumb}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {item.timeLabel}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      {/* Single subtle Sign-in bar when signed out */}
      {resolvedUser && !user ? (
        <section aria-label="Account progress">
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border/75 bg-muted/20 px-5 py-3.5 sm:flex-row sm:items-center">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                Track your coursework.
              </span>{" "}
              Sign in to save bookmarked lessons and keep your progress synced
              across sessions.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full shrink-0 rounded-lg bg-background shadow-none sm:w-auto"
            >
              <LoginLink>
                Sign in
                <ArrowRight className="h-3.5 w-3.5" />
              </LoginLink>
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
