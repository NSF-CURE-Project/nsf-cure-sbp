"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, CircleDashed, CirclePlay } from "lucide-react";
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
      .filter((chapter) => chapter.lessons.length > 0 || filter === "all");
  }, [chapters, filter, progressByLesson]);

  return (
    <div className="space-y-5">
      <div className="sticky top-[3.75rem] z-20 rounded-xl border border-border/60 bg-background/95 px-3 py-3 backdrop-blur">
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

          return (
            <section
              key={chapter.id}
              className="rounded-2xl border border-border/60 bg-card/70 shadow-sm"
            >
              <header className="sticky top-[7.25rem] z-10 rounded-t-2xl border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
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
                  {chapter.slug ? (
                    <Link
                      href={`/classes/${classSlug}/chapters/${chapter.slug}`}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
