"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  CirclePlay,
  Clock,
  FileQuestion,
  Layers,
  Sparkles,
  Video,
  Search,
} from "lucide-react";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import { cn } from "@/lib/utils";

const PAYLOAD_URL = getPayloadBaseUrl();

type LessonType = "Reading" | "Video" | "Quiz";
type LessonStatus = "not-started" | "in-progress" | "completed";
type FilterKey =
  | "all"
  | "not-started"
  | "in-progress"
  | "completed"
  | "has-quiz";

type ChapterLesson = {
  id: string;
  slug: string;
  title: string;
  hasQuiz: boolean;
  hasVideo: boolean;
};

type ChapterCard = {
  id: string;
  title: string;
  slug: string;
  chapterNumber?: number | null;
  lessons: ChapterLesson[];
};

type Props = {
  classSlug: string;
  classId: string;
  chapters: ChapterCard[];
};

type ProgressDoc = {
  lesson?: string | { id?: string | number } | null;
  completed?: boolean;
};

const BAD_TITLE_EXACT = new Set([
  "test",
  "todo",
  "temp",
  "draft",
  "untitled",
  "asas",
  "dsd",
  "asd",
  "qwe",
  "zxc",
]);

const isLowQualityTitle = (value: string) => {
  const t = value.trim();
  if (!t) return true;
  const normalized = t.toLowerCase();
  if (BAD_TITLE_EXACT.has(normalized)) return true;
  if (/^[a-z]{1,3}$/i.test(t)) return true;
  if (/^(.)\1{2,}$/i.test(t)) return true;
  return false;
};

const cleanTitle = (value: string, fallback: string) =>
  isLowQualityTitle(value) ? fallback : value.trim();

const inferLessonType = (lesson: ChapterLesson): LessonType => {
  if (lesson.hasQuiz) return "Quiz";
  if (lesson.hasVideo) return "Video";
  return "Reading";
};

const estimateMinutes = (lesson: ChapterLesson) => {
  if (lesson.hasQuiz) return 12;
  if (lesson.hasVideo) return 10;
  return 8;
};

const filterLabels: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "not-started", label: "Not Started" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "has-quiz", label: "Has Quiz" },
];

const LessonTypeIcon = ({
  type,
  className,
}: {
  type: LessonType;
  className?: string;
}) => {
  switch (type) {
    case "Video":
      return <Video className={className} />;
    case "Quiz":
      return <FileQuestion className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

const lessonTypeAccent: Record<
  LessonType,
  { ring: string; iconBg: string; iconText: string }
> = {
  Reading: {
    ring: "ring-primary/15",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
  },
  Video: {
    ring: "ring-blue-500/15",
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
  },
  Quiz: {
    ring: "ring-amber-500/15",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600 dark:text-amber-400",
  },
};

export function ClassChapterBrowser({ classSlug, classId, chapters }: Props) {
  const [progressByLesson, setProgressByLesson] = useState<
    Record<string, LessonStatus>
  >({});
  const [filter, setFilter] = useState<FilterKey>("all");
  const [chapterQuery, setChapterQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const meRes = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!meRes.ok) {
          setProgressByLesson({});
          return;
        }
        const progressRes = await fetch(
          `${PAYLOAD_URL}/api/lesson-progress?limit=1000&where[class][equals]=${encodeURIComponent(
            classId
          )}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!progressRes.ok) {
          setProgressByLesson({});
          return;
        }
        const payload = (await progressRes.json()) as { docs?: ProgressDoc[] };
        const next: Record<string, LessonStatus> = {};
        (payload.docs ?? []).forEach((doc) => {
          const lesson = doc.lesson;
          const lessonId =
            typeof lesson === "string"
              ? lesson
              : lesson && typeof lesson === "object" && lesson.id != null
                ? String(lesson.id)
                : null;
          if (!lessonId) return;
          next[lessonId] = doc.completed ? "completed" : "in-progress";
        });
        setProgressByLesson(next);
      } catch {
        if (!controller.signal.aborted) setProgressByLesson({});
      }
    };
    void load();
    return () => controller.abort();
  }, [classId]);

  const filterCounts = useMemo<Record<FilterKey, number>>(() => {
    const counts: Record<FilterKey, number> = {
      all: 0,
      "not-started": 0,
      "in-progress": 0,
      completed: 0,
      "has-quiz": 0,
    };
    chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        counts.all += 1;
        const status = progressByLesson[lesson.id] ?? "not-started";
        counts[status] += 1;
        if (lesson.hasQuiz) counts["has-quiz"] += 1;
      });
    });
    return counts;
  }, [chapters, progressByLesson]);

  const filteredChapters = useMemo(() => {
    const query = chapterQuery.trim().toLowerCase();
    const matchLesson = (lesson: ChapterLesson) => {
      const status = progressByLesson[lesson.id] ?? "not-started";
      if (filter === "all") return true;
      if (filter === "not-started") return status === "not-started";
      if (filter === "in-progress") return status === "in-progress";
      if (filter === "completed") return status === "completed";
      if (filter === "has-quiz") return lesson.hasQuiz;
      return true;
    };

    return chapters
      .map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.filter(matchLesson),
      }))
      .filter((chapter) => chapter.lessons.length > 0 || filter === "all")
      .filter((chapter) => {
        if (!query) return true;
        const chapterTitle = cleanTitle(chapter.title, "").toLowerCase();
        if (chapterTitle.includes(query)) return true;
        return chapter.lessons.some((lesson) =>
          cleanTitle(lesson.title, "").toLowerCase().includes(query)
        );
      });
  }, [chapterQuery, chapters, filter, progressByLesson]);

  useEffect(() => {
    setVisibleCount(8);
  }, [filter, chapterQuery]);

  useEffect(() => {
    if (!filteredChapters.length) {
      setExpandedChapters({});
      return;
    }
    setExpandedChapters((prev) => {
      const next: Record<string, boolean> = {};
      let hasExpanded = false;
      filteredChapters.forEach((chapter) => {
        const isOpen = Boolean(prev[chapter.id]);
        next[chapter.id] = isOpen;
        if (isOpen) hasExpanded = true;
      });
      if (!hasExpanded) {
        const preferred =
          filteredChapters.find((chapter) =>
            chapter.lessons.some(
              (lesson) =>
                (progressByLesson[lesson.id] ?? "not-started") === "in-progress"
            )
          ) ?? filteredChapters[0];
        if (preferred) next[preferred.id] = true;
      }
      return next;
    });
  }, [filteredChapters, progressByLesson]);

  const visibleChapters = filteredChapters.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="sticky top-[3.75rem] z-20 rounded-2xl border border-border/60 bg-background/95 px-3.5 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={chapterQuery}
            onChange={(event) => setChapterQuery(event.target.value)}
            placeholder="Search chapters or lessons..."
            className="h-10 w-full rounded-xl border border-border/60 bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filterLabels.map((item) => {
            const active = filter === item.key;
            const count = filterCounts[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={cn(
                  "group/chip inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-150",
                  active
                    ? "border-primary/60 bg-primary text-primary-foreground shadow-sm"
                    : "border-border/60 bg-background text-muted-foreground hover:-translate-y-[1px] hover:border-primary/40 hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    active
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover/chip:bg-background"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        {visibleChapters.map((chapter) => {
          const baseLessons = chapter.lessons;
          const completedCount = baseLessons.filter(
            (lesson) =>
              (progressByLesson[lesson.id] ?? "not-started") === "completed"
          ).length;
          const inProgressCount = baseLessons.filter(
            (lesson) =>
              (progressByLesson[lesson.id] ?? "not-started") === "in-progress"
          ).length;
          const percent = baseLessons.length
            ? Math.round((completedCount / baseLessons.length) * 100)
            : 0;
          const quizCount = baseLessons.filter(
            (lesson) => lesson.hasQuiz
          ).length;
          const avgMins = baseLessons.length
            ? Math.round(
                baseLessons.reduce(
                  (sum, lesson) => sum + estimateMinutes(lesson),
                  0
                ) / baseLessons.length
              )
            : 0;
          const chapterOpen = Boolean(expandedChapters[chapter.id]);
          const chapterIsComplete =
            baseLessons.length > 0 && completedCount === baseLessons.length;

          return (
            <section
              key={chapter.id}
              className={cn(
                "group/chapter overflow-hidden rounded-2xl border bg-card/80 shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-200",
                "hover:-translate-y-[1px] hover:bg-muted/25 hover:shadow-md",
                chapterIsComplete
                  ? "border-primary/40 hover:border-primary/55"
                  : "border-border/60 hover:border-primary/35"
              )}
            >
              <header
                className={cn(
                  "bg-gradient-to-b from-background to-background/70 px-5 py-4 transition-colors duration-200 group-hover/chapter:bg-muted/25 group-hover/chapter:bg-none",
                  chapterOpen ? "border-b border-border/55" : ""
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedChapters((prev) => ({
                        ...prev,
                        [chapter.id]: !prev[chapter.id],
                      }))
                    }
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-expanded={chapterOpen}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        chapterIsComplete
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border/60 bg-background text-muted-foreground group-hover/chapter:border-primary/35 group-hover/chapter:text-foreground"
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          chapterOpen ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </span>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {chapter.chapterNumber ? (
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Chapter {chapter.chapterNumber}
                          </span>
                        ) : null}
                        {chapterIsComplete ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        ) : inProgressCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            <CirclePlay className="h-3 w-3" />
                            In progress
                          </span>
                        ) : null}
                      </div>
                      <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
                        {cleanTitle(chapter.title, "Untitled chapter")}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5" />
                          {baseLessons.length}{" "}
                          {baseLessons.length === 1 ? "lesson" : "lessons"}
                        </span>
                        {baseLessons.length > 0 ? (
                          <>
                            <span className="text-border">·</span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />~{avgMins} min /
                              lesson
                            </span>
                          </>
                        ) : null}
                        {quizCount > 0 ? (
                          <>
                            <span className="text-border">·</span>
                            <span className="inline-flex items-center gap-1.5">
                              <FileQuestion className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                              {quizCount} {quizCount === 1 ? "quiz" : "quizzes"}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </button>
                  {chapter.slug ? (
                    <Link
                      href={`/classes/${classSlug}/chapters/${chapter.slug}`}
                      className="shrink-0 self-start rounded-lg border border-transparent px-2.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-border/60 hover:bg-background hover:text-foreground"
                    >
                      View chapter →
                    </Link>
                  ) : null}
                </div>
                {baseLessons.length > 0 ? (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-500 ease-out",
                          chapterIsComplete
                            ? "bg-primary"
                            : inProgressCount > 0
                              ? "bg-gradient-to-r from-primary/70 to-primary"
                              : "bg-primary/60"
                        )}
                        style={{ width: `${Math.max(percent, percent > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                      {completedCount}/{baseLessons.length}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                      {percent}%
                    </span>
                  </div>
                ) : null}
              </header>

              {chapterOpen ? (
                baseLessons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      No lessons added yet
                    </p>
                    <p className="max-w-sm text-xs text-muted-foreground">
                      Start building this chapter by adding your first lesson.
                      Lessons appear here as soon as staff publish them.
                    </p>
                  </div>
                ) : (
                  <ul className="grid gap-3 p-4 md:grid-cols-2 2xl:grid-cols-3">
                    {baseLessons.map((lesson) => {
                      const status =
                        progressByLesson[lesson.id] ?? "not-started";
                      const type = inferLessonType(lesson);
                      const eta = estimateMinutes(lesson);
                      const accent = lessonTypeAccent[type];
                      const statusLabel =
                        status === "completed"
                          ? "Completed"
                          : status === "in-progress"
                            ? "In Progress"
                            : "Not Started";

                      return (
                        <li key={lesson.id}>
                          <Link
                            href={`/classes/${classSlug}/lessons/${lesson.slug}`}
                            className={cn(
                              "group/lesson relative flex h-full items-start gap-3 rounded-xl border border-border/60 bg-background/70 px-4 py-3.5 shadow-sm",
                              "transition-[transform,box-shadow,border-color,background-color] duration-150 ease-out",
                              "hover:-translate-y-[2px] hover:border-primary/50 hover:bg-card hover:shadow-md",
                              "focus-visible:-translate-y-[2px] focus-visible:border-primary/60 focus-visible:bg-card focus-visible:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              status === "completed"
                                ? "border-primary/30 bg-primary/[0.04]"
                                : status === "in-progress"
                                  ? "border-blue-500/35 bg-blue-500/[0.04]"
                                  : ""
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform duration-150",
                                accent.iconBg,
                                accent.ring,
                                "group-hover/lesson:scale-105"
                              )}
                            >
                              <LessonTypeIcon
                                type={type}
                                className={cn("h-4 w-4", accent.iconText)}
                              />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold leading-snug text-foreground">
                                  {cleanTitle(lesson.title, "Untitled lesson")}
                                </p>
                                {status === "completed" ? (
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                ) : status === "in-progress" ? (
                                  <CirclePlay className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                                )}
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
                                <span className="font-medium uppercase tracking-wide">
                                  {type}
                                </span>
                                <span className="text-border">·</span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" />~{eta} min
                                </span>
                                <span className="text-border">·</span>
                                <span
                                  className={cn(
                                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                    status === "completed" &&
                                      "bg-primary/15 text-primary",
                                    status === "in-progress" &&
                                      "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                                    status === "not-started" &&
                                      "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {statusLabel}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : null}
            </section>
          );
        })}

        {filteredChapters.length > visibleCount ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 8)}
              className="rounded-xl border border-border/60 bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:border-primary/40 hover:text-foreground hover:shadow-md"
            >
              Show more chapters
            </button>
          </div>
        ) : null}

        {filteredChapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
              <Search className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-foreground">
              No chapters match your filters
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Try clearing the search or switching back to the{" "}
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setChapterQuery("");
                }}
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                All
              </button>{" "}
              filter.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
