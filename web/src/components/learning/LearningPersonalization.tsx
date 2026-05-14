"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
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
  classProgressPercent: number;
  lessonsRemainingInClass: number;
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
  completed: boolean;
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
  lastActivityAt?: string | null;
};

// Day-of-week pip data for the weekly-goal mini visualization.
type WeeklyPip = {
  label: string;
  active: boolean;
  isToday: boolean;
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

const getRelationId = (value: RelationValue): string | null => {
  if (typeof value === "string" || typeof value === "number") return String(value);
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
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return local.toISOString().slice(0, 10);
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
  return raw.split(/\s+/).find(Boolean) ?? null;
};

const getGreetingPrefix = (now: Date): string => {
  const hours = now.getHours();
  if (hours < 5) return "Still going";
  if (hours < 12) return "Good morning";
  if (hours < 17) return "Good afternoon";
  if (hours < 21) return "Good evening";
  return "Late night session";
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

// ──────────────────────────────────────────────────────────────
// Atoms
// ──────────────────────────────────────────────────────────────

function ProgressBar({
  value,
  className,
  tone = "primary",
  size = "md",
}: {
  value: number;
  className?: string;
  tone?: "primary" | "emerald";
  size?: "sm" | "md";
}) {
  const width = Math.max(0, Math.min(100, Math.round(value)));
  const height = size === "sm" ? "h-1" : "h-1.5";
  const fill =
    tone === "emerald"
      ? "bg-emerald-500/90"
      : "bg-gradient-to-r from-primary via-primary to-primary/80";
  return (
    <div
      className={cn(
        height,
        "w-full overflow-hidden rounded-full bg-muted/70",
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={width}
    >
      <div
        className={cn(height, "rounded-full transition-[width] duration-500 ease-out", fill)}
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
// Cards
// ──────────────────────────────────────────────────────────────

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
  lastActivityLabel: string | null;
  featured?: boolean;
};

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
  lastActivityLabel,
  featured = false,
}: ClassCardProps) {
  const isComplete = hasProgress && progressPercent >= 100;
  const accentColor = featured
    ? "bg-primary"
    : isComplete
      ? "bg-emerald-500"
      : hasProgress
        ? "bg-primary/70"
        : "bg-muted-foreground/25";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm transition-all duration-200 sm:p-5",
        "hover:-translate-y-[2px] hover:border-primary/55 hover:shadow-md focus-within:border-primary/65 focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2 focus-within:ring-offset-background",
        featured && "border-primary/45 bg-gradient-to-br from-primary/8 via-card/80 to-card/90",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] transition-colors",
          accentColor,
        )}
      />

      <header className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border",
              featured
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border/60 bg-muted/30 text-primary/85",
            )}
          >
            <ClassIcon variant={iconVariant} />
          </span>
          <h3 className="truncate text-base font-semibold text-foreground">{title}</h3>
        </div>
        {featured ? (
          <span className="inline-flex shrink-0 items-center rounded-full border border-primary/35 bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
            Up next
          </span>
        ) : null}
      </header>

      {description ? (
        <p
          className={cn(
            "mb-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}

      <div className="mt-auto space-y-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {progressPercent}
            <span className="ml-0.5 text-base font-semibold text-muted-foreground">%</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {hasProgress
              ? `${completedLessons}/${totalLessons} lessons`
              : totalLessons > 0
                ? `${totalLessons} lessons`
                : "No lessons yet"}
          </span>
        </div>
        <ProgressBar
          value={progressPercent}
          tone={isComplete ? "emerald" : "primary"}
        />

        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
          <span>
            {lastActivityLabel
              ? `Last active ${lastActivityLabel}`
              : hasProgress
                ? "Keep up the momentum"
                : "Ready when you are"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1.5">
          {continueHref ? (
            <Link
              href={continueHref}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              href={viewHref}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {hasProgress ? "Open class" : "Start learning"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {continueHref ? (
            <Link
              href={viewHref}
              className="inline-flex items-center justify-center rounded-lg border border-border/65 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-muted/30"
            >
              Outline
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ──────────────────────────────────────────────────────────────
// Metric cards (snapshot row)
// ──────────────────────────────────────────────────────────────

function MetricShell({
  icon: Icon,
  title,
  tone = "default",
  compact = false,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tone?: "default" | "accent" | "amber" | "emerald";
  // Compact: drop internal gap and inner vertical padding so empty/loading
  // states don't take three lines worth of space.
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm",
        compact ? "gap-1.5 px-3.5 py-2.5" : "gap-2.5 p-3.5",
        tone === "accent" && "border-primary/35 bg-primary/8",
        tone === "amber" && "border-amber-500/30 bg-amber-500/8",
        tone === "emerald" && "border-emerald-500/30 bg-emerald-500/8",
        tone === "default" && "border-border/65 bg-card/60",
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-foreground/75">
          {title}
        </h3>
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "accent" && "text-primary",
            tone === "amber" && "text-amber-500",
            tone === "emerald" && "text-emerald-500",
            tone === "default" && "text-muted-foreground",
          )}
        />
      </div>
      {children}
    </div>
  );
}

function MetricLoading() {
  return (
    <div className="space-y-2">
      <div className="h-7 w-16 rounded-md bg-muted/60 animate-pulse" />
      <div className="h-3 w-32 rounded-md bg-muted/40 animate-pulse" />
    </div>
  );
}

function MetricEmpty({ copy }: { copy: string }) {
  return <p className="text-[11.5px] leading-snug text-muted-foreground">{copy}</p>;
}

function WeeklyGoalCard({
  loading,
  signedIn,
  completed,
  pips,
}: {
  loading: boolean;
  signedIn: boolean;
  completed: number;
  pips: WeeklyPip[];
}) {
  const remaining = Math.max(WEEKLY_GOAL_TARGET - completed, 0);
  const reached = completed >= WEEKLY_GOAL_TARGET;
  const isEmpty = !loading && !signedIn;
  return (
    <MetricShell icon={Target} title="Weekly Goal" tone="accent" compact={isEmpty}>
      {loading ? (
        <MetricLoading />
      ) : !signedIn ? (
        <MetricEmpty copy="Sign in to track weekly lessons." />
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold leading-none tabular-nums tracking-tight text-foreground">
              {completed}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              / {WEEKLY_GOAL_TARGET}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            {pips.map((pip, idx) => (
              <span
                key={`${pip.label}-${idx}`}
                aria-hidden="true"
                title={pip.label}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  pip.active
                    ? "bg-primary"
                    : pip.isToday
                      ? "bg-primary/30 ring-1 ring-primary/40"
                      : "bg-muted",
                )}
              />
            ))}
          </div>
          <p className="text-[11.5px] leading-snug text-muted-foreground">
            {reached
              ? "🎯 Goal reached. Nice run."
              : remaining === 1
                ? "One lesson to hit this week's goal."
                : `${remaining} lessons to this week's goal.`}
          </p>
        </>
      )}
    </MetricShell>
  );
}

function StreakCard({
  loading,
  signedIn,
  count,
  activeToday,
}: {
  loading: boolean;
  signedIn: boolean;
  count: number;
  activeToday: boolean;
}) {
  const isEmpty = !loading && !signedIn;
  return (
    <MetricShell
      icon={Flame}
      title="Streak"
      tone={activeToday ? "amber" : "default"}
      compact={isEmpty}
    >
      {loading ? (
        <MetricLoading />
      ) : !signedIn ? (
        <MetricEmpty copy="Sign in to track your daily streak." />
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-[28px] font-bold leading-none tabular-nums tracking-tight",
                activeToday ? "text-amber-600 dark:text-amber-400" : "text-foreground",
              )}
            >
              {count}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {count === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex h-1.5 w-1.5 rounded-full",
                activeToday
                  ? "bg-amber-500 ring-2 ring-amber-500/30 lp-pulse"
                  : "bg-muted-foreground/40",
              )}
            />
            <span className="text-[11px] font-medium text-muted-foreground">
              {activeToday ? "Active today" : "Inactive today"}
            </span>
          </div>
          <p className="text-[11.5px] leading-snug text-muted-foreground">
            {count === 0
              ? "Complete one lesson to start a streak."
              : activeToday
                ? count >= 3
                  ? "Consistency pays — keep it going."
                  : "Nice. Same time tomorrow keeps it alive."
                : "One short lesson today keeps it alive."}
          </p>
        </>
      )}
    </MetricShell>
  );
}

function MilestonesCard({
  loading,
  signedIn,
  earned,
  total,
  completedLessons,
  tiers,
}: {
  loading: boolean;
  signedIn: boolean;
  earned: number;
  total: number;
  completedLessons: number;
  tiers: { tier: number; earned: boolean }[];
}) {
  const isEmpty = !loading && !signedIn;
  return (
    <MetricShell icon={Award} title="Milestones" compact={isEmpty}>
      {loading ? (
        <MetricLoading />
      ) : !signedIn ? (
        <MetricEmpty copy="Sign in to unlock milestones." />
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold leading-none tabular-nums tracking-tight text-foreground">
              {earned}
            </span>
            <span className="text-sm font-medium text-muted-foreground">/ {total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {tiers.map((tier) => (
              <span
                key={tier.tier}
                aria-hidden="true"
                title={`${tier.tier} lessons`}
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-bold transition-colors",
                  tier.earned
                    ? "border-primary/35 bg-primary/15 text-primary"
                    : "border-border/60 bg-background text-muted-foreground/70",
                )}
              >
                {tier.tier}
              </span>
            ))}
          </div>
          <p className="text-[11.5px] leading-snug text-muted-foreground">
            {completedLessons} lesson{completedLessons === 1 ? "" : "s"} completed overall
          </p>
        </>
      )}
    </MetricShell>
  );
}

function SavedCard({
  loading,
  signedIn,
  count,
  latest,
}: {
  loading: boolean;
  signedIn: boolean;
  count: number;
  latest: SavedLessonItem | null;
}) {
  const isEmpty = !loading && !signedIn;
  return (
    <MetricShell
      icon={count > 0 ? BookmarkCheck : Bookmark}
      title="Saved"
      compact={isEmpty}
    >
      {loading ? (
        <MetricLoading />
      ) : !signedIn ? (
        <MetricEmpty copy="Sign in to view bookmarks." />
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold leading-none tabular-nums tracking-tight text-foreground">
              {count}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {count === 1 ? "lesson" : "lessons"}
            </span>
          </div>
          {latest ? (
            <Link
              href={latest.href}
              className="block truncate text-[12px] font-medium text-foreground/85 hover:text-primary"
            >
              Latest: {latest.title}
            </Link>
          ) : (
            <span className="text-[12px] font-medium text-muted-foreground">
              Bookmark lessons to revisit faster.
            </span>
          )}
          <p className="text-[11.5px] leading-snug text-muted-foreground">
            {count === 0
              ? "Tap the bookmark icon on any lesson."
              : "Pinned for quick access from anywhere."}
          </p>
        </>
      )}
    </MetricShell>
  );
}

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────

export function LearningPersonalization({ lessonIndex, classSummaries }: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [resolvedUser, setResolvedUser] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [progressDocs, setProgressDocs] = useState<ProgressDoc[]>([]);
  const [bookmarkDocs, setBookmarkDocs] = useState<BookmarkDoc[]>([]);

  const orderedLessons = useMemo(
    () => [...lessonIndex].sort((a, b) => a.order - b.order),
    [lessonIndex],
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
    [progressDocs],
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
            },
          ),
        ]);

        if (progressRes.ok) {
          const progressData = (await progressRes.json()) as { docs?: ProgressDoc[] };
          setProgressDocs(progressData.docs ?? []);
        } else {
          setProgressDocs([]);
        }

        if (bookmarksRes.ok) {
          const bookmarkData = (await bookmarksRes.json()) as { docs?: BookmarkDoc[] };
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
        if (!controller.signal.aborted) setLoadingData(false);
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

  // Latest activity per class — drives "Last active 3d ago" on class cards.
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

  // Weekly pip set: one entry per day of the current week (Sun → Sat).
  const weeklyPips = useMemo<WeeklyPip[]>(() => {
    const weekStart = getWeekStart(new Date());
    const today = new Date();
    const todayKey = toLocalDayKey(today.toISOString());

    const activeDays = new Set<string>();
    progressDocs.forEach((doc) => {
      if (!doc.completed) return;
      const stamp = doc.completedAt ?? doc.updatedAt;
      if (!stamp) return;
      const date = new Date(stamp);
      if (Number.isNaN(date.getTime())) return;
      if (date < weekStart) return;
      const key = toLocalDayKey(stamp);
      if (key) activeDays.add(key);
    });

    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return labels.map((label, idx) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + idx);
      const key = toLocalDayKey(day.toISOString());
      return {
        label,
        active: !!key && activeDays.has(key),
        isToday: !!todayKey && key === todayKey,
      };
    });
  }, [progressDocs]);

  const weeklyCompleted = weeklyPips.filter((pip) => pip.active).length;

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
    return { count, activeToday: !!todayKey && daySet.has(todayKey) };
  }, [progressDocs]);

  const milestoneBadges = useMemo(() => {
    const tiers = [1, 3, 5, 10, 20];
    return tiers.map((tier) => ({ tier, earned: completedCount >= tier }));
  }, [completedCount]);

  // Class progress is built first so the resume hero can reference it.
  const classDashboardCards = useMemo<ClassDashboardCard[]>(() => {
    return classSummaries.map((classSummary) => {
      const lessonIdSet = new Set(classSummary.lessons.map((lesson) => lesson.id));
      const completedLessons = classSummary.lessons.filter((lesson) =>
        completedLessonIds.has(lesson.id),
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
        (item) => item.classSlug === lesson.classSlug,
      );
      const classProgressPercent =
        classProgressBySlug.get(lesson.classSlug) ?? classCard?.progressPercent ?? 0;
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
            hint: "Pick up where you paused.",
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
          (lesson) => lesson.id === recentId,
        );
        if (recentIndex >= 0) {
          const nextIncomplete = orderedLessons
            .slice(recentIndex + 1)
            .find((lesson) => !completedLessonIds.has(lesson.id));
          if (nextIncomplete) {
            const meta = findClassData(nextIncomplete);
            return {
              lesson: nextIncomplete,
              hint: "Recommended next lesson.",
              ...meta,
            };
          }
          const current = orderedLessons[recentIndex];
          if (current) {
            const meta = findClassData(current);
            return {
              lesson: current,
              hint: "Pick up your most recently viewed lesson.",
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
  const greeting = firstName ? `${greetingPrefix}, ${firstName}` : greetingPrefix;

  const totalLessonCount = orderedLessons.length;
  const overallProgramProgress = totalLessonCount
    ? Math.round((completedCount / totalLessonCount) * 100)
    : 0;

  const loadingState = !resolvedUser || loadingData;
  const earnedBadgeCount = milestoneBadges.filter((badge) => badge.earned).length;
  const firstClassHref = classDashboardCards[0]?.viewHref ?? "/learning";
  const latestSaved = savedLessons[0] ?? null;
  const featuredClassSlug = resumeSelection?.lesson.classSlug ?? null;

  // Hero collapses to a slim compact bar when there's nothing rich to show
  // (signed-out, or signed-in but no resume target yet). Avoids burning a
  // half-screen of vertical space on what's essentially a CTA.
  const heroIsCompact = !user || !resumeSelection;
  return (
    <section className="lp-shell space-y-5">
      <style>{`
        @keyframes lp-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45); }
          50% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
        }
        .lp-pulse { animation: lp-pulse 1.8s ease-out infinite; }
        @keyframes lp-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lp-fade-in { animation: lp-fade-in 320ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .lp-pulse, .lp-fade-in { animation: none !important; }
        }
      `}</style>

      {/* Greeting — only render the subtitle when we have real momentum
          to talk about. Signed-out / no-progress states are already covered
          by the hero CTA right below, so the subtitle was redundant. */}
      <div className="space-y-0.5">
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground sm:text-2xl">
          {greeting}
        </h2>
        {user && resumeSelection ? (
          <p className="text-[13px] text-muted-foreground">
            Pick up your next lesson and check your momentum below.
          </p>
        ) : null}
      </div>

      {/* Hero — Resume learning. Two layouts:
          1. Compact bar: signed-out OR signed-in with no resume target.
             Single row, short height, single CTA.
          2. Rich card: signed-in with an active lesson to resume.
             Larger layout with progress bar + momentum rail. */}
      <section className="lp-fade-in">
        {heroIsCompact ? (
          <article
            className={cn(
              "flex flex-col items-start justify-between gap-3 rounded-xl border border-primary/30",
              "bg-gradient-to-r from-primary/10 via-card to-card px-4 py-3.5 shadow-sm",
              "sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-4",
            )}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
                <PlayCircle className="h-3 w-3" />
                Resume learning
              </span>
              {loadingState ? (
                <div className="h-5 w-3/5 rounded-md bg-muted/60 animate-pulse" />
              ) : user ? (
                <p className="text-[15px] font-semibold leading-snug text-foreground sm:text-base">
                  You haven't started a lesson yet.{" "}
                  <span className="font-normal text-muted-foreground">
                    Pick a class to get your first recommendation.
                  </span>
                </p>
              ) : (
                <p className="text-[15px] font-semibold leading-snug text-foreground sm:text-base">
                  Sign in to continue your coursework.{" "}
                  <span className="font-normal text-muted-foreground">
                    Progress and bookmarks are tied to your account.
                  </span>
                </p>
              )}
            </div>
            <div className="shrink-0">
              {loadingState ? (
                <div className="h-9 w-28 rounded-lg bg-muted/60 animate-pulse" />
              ) : user ? (
                <Button asChild className="rounded-lg">
                  <Link href={firstClassHref}>
                    Browse classes
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="rounded-lg">
                  <LoginLink>
                    Sign in
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </LoginLink>
                </Button>
              )}
            </div>
          </article>
        ) : (
          <article
            className={cn(
              "relative overflow-hidden rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/15 via-card to-card shadow-md",
              "p-4 sm:p-5",
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
            />

            <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_210px]">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
                    <PlayCircle className="h-3 w-3" />
                    Resume learning
                  </span>
                  {resumeSelection ? (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {resumeSelection.lesson.classTitle} ·{" "}
                      {resumeSelection.lesson.chapterTitle}
                    </span>
                  ) : null}
                </div>

                {resumeSelection ? (
                  <>
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-foreground sm:text-[26px]">
                      {resumeSelection.lesson.title}
                    </h2>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                        <span className="font-medium text-foreground/80">
                          {resumeSelection.classProgressPercent}% through{" "}
                          {resumeSelection.lesson.classTitle}
                        </span>
                        {resumeSelection.lessonsRemainingInClass > 0 ? (
                          <span className="text-muted-foreground">
                            {resumeSelection.lessonsRemainingInClass} lesson
                            {resumeSelection.lessonsRemainingInClass === 1 ? "" : "s"} left
                          </span>
                        ) : null}
                      </div>
                      <ProgressBar value={resumeSelection.classProgressPercent} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        asChild
                        className="rounded-lg shadow-sm hover:-translate-y-[1px] hover:shadow-md transition-all duration-200"
                      >
                        <Link
                          href={`/classes/${resumeSelection.lesson.classSlug}/lessons/${resumeSelection.lesson.slug}`}
                        >
                          Resume lesson
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                      <Link
                        href={`/classes/${resumeSelection.lesson.classSlug}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background/40 px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-background/70"
                      >
                        View outline
                      </Link>
                      <span className="text-[11.5px] text-muted-foreground">
                        {resumeSelection.hint}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Right rail: momentum at a glance */}
              <aside
                aria-label="Momentum"
                className="grid gap-2 self-start rounded-xl border border-border/55 bg-background/55 p-3 backdrop-blur-sm lg:min-w-[200px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    Program
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-foreground">
                    {overallProgramProgress}%
                  </span>
                </div>
                <ProgressBar value={overallProgramProgress} size="sm" />

                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <div className="rounded-lg border border-border/55 bg-background/60 px-2 py-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      <Flame
                        className={cn(
                          "h-3 w-3",
                          streak.activeToday
                            ? "text-amber-500"
                            : "text-muted-foreground",
                        )}
                      />
                      Streak
                    </div>
                    <div className="mt-0.5 text-base font-bold leading-none tabular-nums text-foreground">
                      {streak.count}
                      <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
                        d
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/55 bg-background/60 px-2 py-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      <Target className="h-3 w-3 text-primary/85" />
                      Week
                    </div>
                    <div className="mt-0.5 text-base font-bold leading-none tabular-nums text-foreground">
                      {weeklyCompleted}
                      <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
                        /{WEEKLY_GOAL_TARGET}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </article>
        )}
      </section>

      {/* Program snapshot */}
      <section className="space-y-2">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-foreground/80">
          Program snapshot
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <WeeklyGoalCard
            loading={loadingState}
            signedIn={!!user}
            completed={weeklyCompleted}
            pips={weeklyPips}
          />
          <StreakCard
            loading={loadingState}
            signedIn={!!user}
            count={streak.count}
            activeToday={streak.activeToday}
          />
          <MilestonesCard
            loading={loadingState}
            signedIn={!!user}
            earned={earnedBadgeCount}
            total={milestoneBadges.length}
            completedLessons={completedCount}
            tiers={milestoneBadges}
          />
          <SavedCard
            loading={loadingState}
            signedIn={!!user}
            count={savedLessons.length}
            latest={latestSaved}
          />
        </div>
      </section>

      {/* Your classes */}
      <section className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Your classes
          </h2>
          {user ? (
            <span className="text-[11.5px] text-muted-foreground">
              Pick up where you left off
            </span>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {classDashboardCards.map((classCard) => {
            const featured = !!featuredClassSlug && classCard.classSlug === featuredClassSlug;
            const lastActivityLabel =
              user && classCard.lastActivityAt
                ? formatRelativeTime(classCard.lastActivityAt)
                : null;
            return (
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
                lastActivityLabel={lastActivityLabel}
                featured={featured}
              />
            );
          })}
        </div>

        {classDashboardCards.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes available yet.</p>
        ) : null}
      </section>

      {/* Recent lesson activity */}
      <section className="space-y-2">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-foreground/80">
          Recent activity
        </h2>

        {loadingState ? (
          <ul className="space-y-2">
            {[0, 1, 2].map((idx) => (
              <li
                key={idx}
                className="h-14 rounded-lg border border-border/55 bg-muted/30 animate-pulse"
              />
            ))}
          </ul>
        ) : recentActivity.length ? (
          <ol className="relative space-y-2 border-l border-border/55 pl-5">
            {recentActivity.map((item) => (
              <li key={item.key} className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-[26px] top-3 inline-flex h-2.5 w-2.5 rounded-full ring-4",
                    item.completed
                      ? "bg-emerald-500 ring-emerald-500/15"
                      : "bg-primary ring-primary/15",
                  )}
                />
                <Link
                  href={item.href}
                  className="block rounded-lg border border-border/55 bg-card/60 px-3 py-2.5 transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/45 hover:bg-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {item.timeLabel}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                    {item.completed ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-emerald-600 dark:text-emerald-400">
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-primary">
                        In&nbsp;progress
                      </span>
                    )}
                    <span>{item.breadcrumb}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-lg border border-dashed border-border/55 bg-muted/15 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground/80">
              {user
                ? "No recent activity yet."
                : "Sign in to see your lesson activity."}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {user
                ? "Start a class above to build your timeline."
                : "Your timeline appears here once you sign in."}
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
