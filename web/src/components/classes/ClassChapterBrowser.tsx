"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CirclePlay,
  Clock,
  FileQuestion,
  Search,
  Video,
} from "lucide-react";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import { cn } from "@/lib/utils";

const PAYLOAD_URL = getPayloadBaseUrl();

type LessonType = "Reading" | "Video" | "Quiz";
type LessonStatus = "not-started" | "in-progress" | "completed";
type FilterKey = "all" | "in-progress" | "completed";

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

const formatChapterTime = (mins: number) => {
  if (mins <= 0) return null;
  if (mins < 60) return `Approximately ${mins} minutes`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (remainder === 0) {
    return `Approximately ${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return `Approximately ${hours} hr ${remainder} min`;
};

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

export function ClassChapterBrowser({ classSlug, classId, chapters }: Props) {
  const [signedIn, setSignedIn] = useState(false);
  const [progressByLesson, setProgressByLesson] = useState<
    Record<string, LessonStatus>
  >({});
  const [filter, setFilter] = useState<FilterKey>("all");
  const [chapterQuery, setChapterQuery] = useState("");
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >(() => {
    const firstOpenChapter =
      chapters.find((chapter) => chapter.lessons.length > 0) ?? chapters[0];
    return firstOpenChapter ? { [firstOpenChapter.id]: true } : {};
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.startsWith("chapter-")) return;
    const slug = hash.slice("chapter-".length);
    const match = chapters.find((chapter) => chapter.slug === slug);
    if (!match) return;
    setExpandedChapters((prev) => ({ ...prev, [match.id]: true }));
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [chapters]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const meRes = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!meRes.ok) {
          setSignedIn(false);
          setProgressByLesson({});
          return;
        }
        setSignedIn(true);
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
        if (!controller.signal.aborted) {
          setSignedIn(false);
          setProgressByLesson({});
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [classId]);

  useEffect(() => {
    if (!signedIn && (filter === "in-progress" || filter === "completed")) {
      setFilter("all");
    }
  }, [filter, signedIn]);

  const filterCounts = useMemo(() => {
    const counts = { all: 0, "in-progress": 0, completed: 0 };
    chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        counts.all += 1;
        const status = progressByLesson[lesson.id] ?? "not-started";
        if (status === "in-progress") counts["in-progress"] += 1;
        if (status === "completed") counts.completed += 1;
      });
    });
    return counts;
  }, [chapters, progressByLesson]);

  const filterLabels = useMemo(() => {
    const items: { key: FilterKey; label: string }[] = [
      { key: "all", label: "All lessons" },
    ];
    if (signedIn) {
      items.push(
        { key: "in-progress", label: "In progress" },
        { key: "completed", label: "Completed" }
      );
    }
    return items;
  }, [signedIn]);

  const lessonSequenceById = useMemo(() => {
    const sequence: Record<string, string> = {};
    chapters.forEach((chapter, chapterIndex) => {
      const chapterLabel = chapter.chapterNumber ?? chapterIndex + 1;
      chapter.lessons.forEach((lesson, lessonIndex) => {
        sequence[lesson.id] = `${chapterLabel}.${lessonIndex + 1}`;
      });
    });
    return sequence;
  }, [chapters]);

  const filteredChapters = useMemo(() => {
    const query = chapterQuery.trim().toLowerCase();
    const matchLesson = (lesson: ChapterLesson) => {
      const status = progressByLesson[lesson.id] ?? "not-started";
      if (filter === "all") return true;
      if (filter === "in-progress") return status === "in-progress";
      if (filter === "completed") return status === "completed";
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

  const showFilters = signedIn || filterLabels.length > 1;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Course curriculum
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {signedIn
              ? "Browse chapters and continue where you left off."
              : "Browse the full syllabus and open any lesson."}
          </p>
        </div>

        <div className="sticky top-[3.75rem] z-20 space-y-2 border-b border-border/50 bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={chapterQuery}
              onChange={(event) => setChapterQuery(event.target.value)}
              placeholder="Find a lesson…"
              className="h-9 w-full rounded-lg border border-border/60 bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            />
          </div>
          {showFilters ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {filterLabels.map((item) => {
                const active = filter === item.key;
                const count = filterCounts[item.key];
                const disabled = item.key !== "all" && count === 0 && !active;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilter(item.key)}
                    disabled={disabled}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors duration-150",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      disabled &&
                        "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-muted-foreground"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.key !== "all" || signedIn ? (
                      <span
                        className={cn(
                          "tabular-nums text-[11px]",
                          active
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {filteredChapters.map((chapter) => {
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
          const chapterMinutes = baseLessons.reduce(
            (sum, lesson) => sum + estimateMinutes(lesson),
            0
          );
          const chapterTimeLabel = formatChapterTime(chapterMinutes);
          const chapterOpen = Boolean(expandedChapters[chapter.id]);
          const chapterIsComplete =
            baseLessons.length > 0 && completedCount === baseLessons.length;
          const showProgress =
            signedIn && (completedCount > 0 || inProgressCount > 0);

          return (
            <section
              key={chapter.id}
              id={chapter.slug ? `chapter-${chapter.slug}` : undefined}
              className={cn(
                "overflow-hidden rounded-lg border border-border/55 bg-background",
                chapterIsComplete && "border-primary/25 bg-primary/[0.02]"
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedChapters((prev) => ({
                    ...prev,
                    [chapter.id]: !prev[chapter.id],
                  }))
                }
                className={cn(
                  "flex w-full items-start gap-3 px-3.5 py-3.5 text-left transition-colors duration-150",
                  "hover:bg-muted/25",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                  chapterOpen && "border-b border-border/45"
                )}
                aria-expanded={chapterOpen}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                    chapterIsComplete
                      ? "border-primary/35 bg-primary/10 text-primary"
                      : "border-border/55 bg-background text-muted-foreground"
                  )}
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      chapterOpen ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {chapter.chapterNumber != null ? (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Chapter {chapter.chapterNumber}
                      </span>
                    ) : null}
                    {chapterIsComplete ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    ) : inProgressCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-600 dark:text-blue-400">
                        <CirclePlay className="h-3 w-3" />
                        In progress
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
                    {cleanTitle(chapter.title, "Untitled chapter")}
                  </h3>
                  <p className="text-[13px] text-muted-foreground">
                    {baseLessons.length}{" "}
                    {baseLessons.length === 1 ? "lesson" : "lessons"}
                    {chapterTimeLabel ? (
                      <>
                        <span className="mx-1.5 text-border">·</span>
                        {chapterTimeLabel}
                      </>
                    ) : null}
                  </p>
                  {showProgress ? (
                    <div className="pt-1.5">
                      <div className="mb-1 flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
                        <span>
                          {completedCount} of {baseLessons.length} complete
                        </span>
                        <span className="tabular-nums">{percent}%</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                          style={{
                            width: `${Math.max(percent, percent > 0 ? 4 : 0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </button>

              {chapterOpen ? (
                baseLessons.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No lessons in this chapter yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {baseLessons.map((lesson, lessonIndex) => {
                      const status =
                        progressByLesson[lesson.id] ?? "not-started";
                      const type = inferLessonType(lesson);
                      const eta = estimateMinutes(lesson);
                      const sequence =
                        lessonSequenceById[lesson.id] ??
                        `${chapter.chapterNumber ?? ""}${
                          chapter.chapterNumber ? "." : ""
                        }${lessonIndex + 1}`;

                      return (
                        <li key={lesson.id}>
                          <Link
                            href={`/classes/${classSlug}/lessons/${lesson.slug}`}
                            aria-label={`Open lesson ${sequence}: ${cleanTitle(
                              lesson.title,
                              "Untitled lesson"
                            )}`}
                            className={cn(
                              "group/lesson flex items-start gap-3 px-3.5 py-3.5 transition-colors duration-150",
                              "hover:bg-muted/30",
                              "focus-visible:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35",
                              status === "completed" && "bg-primary/[0.02]",
                              status === "in-progress" && "bg-blue-500/[0.03]"
                            )}
                          >
                            <span className="mt-0.5 w-8 shrink-0 text-[12px] font-medium tabular-nums text-muted-foreground">
                              {sequence}
                            </span>
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover/lesson:text-primary">
                                {cleanTitle(lesson.title, "Untitled lesson")}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <LessonTypeIcon
                                    type={type}
                                    className="h-3 w-3"
                                  />
                                  {type}
                                </span>
                                <span className="text-border">·</span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" />~{eta} min
                                </span>
                                {status === "completed" ? (
                                  <>
                                    <span className="text-border">·</span>
                                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Completed
                                    </span>
                                  </>
                                ) : status === "in-progress" ? (
                                  <>
                                    <span className="text-border">·</span>
                                    <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                                      <CirclePlay className="h-3 w-3" />
                                      In progress
                                    </span>
                                  </>
                                ) : null}
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

        {filteredChapters.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No lessons match your filters
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Try clearing search or switching back to{" "}
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setChapterQuery("");
                }}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                All lessons
              </button>
              .
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
