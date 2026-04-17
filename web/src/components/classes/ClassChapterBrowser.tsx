"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  CirclePlay,
  Search,
} from "lucide-react";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import { cn } from "@/lib/utils";

const PAYLOAD_URL = getPayloadBaseUrl();

type LessonType = "Reading" | "Video" | "Quiz" | "Problem";
type LessonStatus = "not-started" | "in-progress" | "completed";
type FilterKey =
  | "all"
  | "not-started"
  | "in-progress"
  | "completed"
  | "has-quiz"
  | "has-problems";

type ChapterLesson = {
  id: string;
  slug: string;
  title: string;
  hasQuiz: boolean;
  hasProblemSet: boolean;
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
  if (lesson.hasProblemSet) return "Problem";
  if (lesson.hasQuiz) return "Quiz";
  if (lesson.hasVideo) return "Video";
  return "Reading";
};

const estimateMinutes = (lesson: ChapterLesson) => {
  if (lesson.hasProblemSet && lesson.hasQuiz) return 20;
  if (lesson.hasProblemSet) return 18;
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
  { key: "has-problems", label: "Has Problems" },
];

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

  const filteredChapters = useMemo(() => {
    const query = chapterQuery.trim().toLowerCase();
    const matchLesson = (lesson: ChapterLesson) => {
      const status = progressByLesson[lesson.id] ?? "not-started";
      if (filter === "all") return true;
      if (filter === "not-started") return status === "not-started";
      if (filter === "in-progress") return status === "in-progress";
      if (filter === "completed") return status === "completed";
      if (filter === "has-quiz") return lesson.hasQuiz;
      if (filter === "has-problems") return lesson.hasProblemSet;
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
    <div className="space-y-5">
      <div className="sticky top-[3.75rem] z-20 rounded-xl border border-border/60 bg-background/95 px-3 py-3 backdrop-blur">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={chapterQuery}
            onChange={(event) => setChapterQuery(event.target.value)}
            placeholder="Search chapters or lessons..."
            className="h-10 w-full rounded-lg border border-border/60 bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filterLabels.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                filter === item.key
                  ? "border-primary/45 bg-primary/15 text-primary"
                  : "border-border/60 bg-background text-muted-foreground hover:border-primary/35 hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
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
          const problemCount = baseLessons.filter(
            (lesson) => lesson.hasProblemSet
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

          return (
            <section
              key={chapter.id}
              className="group/chapter rounded-2xl border border-border/60 bg-card/70 shadow-sm transition-colors duration-200 hover:border-primary/25 hover:bg-muted/35"
            >
              <header className="rounded-t-2xl border-b border-border/60 bg-background/95 px-4 py-3 transition-colors duration-200 group-hover/chapter:bg-muted/35">
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedChapters((prev) => ({
                        ...prev,
                        [chapter.id]: !prev[chapter.id],
                      }))
                    }
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-left hover:bg-transparent focus-visible:bg-transparent"
                    aria-expanded={chapterOpen}
                  >
                    <ChevronDown
                      className={cn(
                        "mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                        chapterOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                    <div className="min-w-0 space-y-1">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {chapter.chapterNumber
                          ? `Ch ${chapter.chapterNumber} · `
                          : ""}
                        {cleanTitle(chapter.title, "Untitled chapter")}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                          {baseLessons.length} lessons
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">
                          {completedCount} completed
                        </span>
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">
                          {inProgressCount} in progress
                        </span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">
                          {quizCount} quizzes
                        </span>
                        <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-cyan-700">
                          {problemCount} problem sets
                        </span>
                        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-primary">
                          ~{avgMins} min / lesson
                        </span>
                      </div>
                    </div>
                  </button>
                  {chapter.slug ? (
                    <Link
                      href={`/classes/${classSlug}/chapters/${chapter.slug}`}
                      className="shrink-0 pt-1 text-sm font-medium text-muted-foreground transition-colors group-hover/chapter:text-foreground hover:text-foreground"
                    >
                      View chapter
                    </Link>
                  ) : null}
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </header>

              {chapterOpen ? (
                <ul className="grid gap-3 p-4 md:grid-cols-1 xl:grid-cols-2">
                  {baseLessons.map((lesson) => {
                    const status = progressByLesson[lesson.id] ?? "not-started";
                    const type = inferLessonType(lesson);
                    const eta = estimateMinutes(lesson);
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
                          className="block rounded-lg border border-border/60 bg-background/70 px-4 py-3 transition hover:border-primary/45 hover:bg-primary/5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">
                              {cleanTitle(lesson.title, "Untitled lesson")}
                            </p>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
                                status === "completed" &&
                                  "bg-emerald-100 text-emerald-700",
                                status === "in-progress" &&
                                  "bg-blue-100 text-blue-700",
                                status === "not-started" &&
                                  "bg-muted text-muted-foreground"
                              )}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-muted-foreground">
                              {type}
                            </span>
                            <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-muted-foreground">
                              ~{eta} min
                            </span>
                            {status === "completed" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            ) : status === "in-progress" ? (
                              <CirclePlay className="h-3.5 w-3.5 text-blue-600" />
                            ) : (
                              <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </section>
          );
        })}

        {filteredChapters.length > visibleCount ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 8)}
              className="rounded-lg border border-border/60 bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
            >
              Show more chapters
            </button>
          </div>
        ) : null}

        {filteredChapters.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No chapters match your current filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}
