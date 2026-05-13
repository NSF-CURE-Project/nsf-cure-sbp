"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import { cn } from "@/lib/utils";

type LessonItem = {
  slug?: string;
  title?: string;
  name?: string;
  lessonSlug?: string;
  id?: string | number;
} & Record<string, unknown>;

type ChapterItem = {
  slug?: string;
  title?: string;
  name?: string;
  chapterSlug?: string;
  chapterNumber?: number | null;
  id?: string | number;
  lessons?: LessonItem[];
  items?: LessonItem[];
  children?: LessonItem[];
} & Record<string, unknown>;

type ClassItem = {
  slug?: string;
  title?: string;
  name?: string;
  classSlug?: string;
  id?: string | number;
  chapters?: ChapterItem[];
  modules?: ChapterItem[];
  children?: ChapterItem[];
} & Record<string, unknown>;

type Props = { classes: ClassItem[] };
const PAYLOAD_URL = getPayloadBaseUrl();

// ---------- Accessors ----------
const getClassSlug = (c: ClassItem) =>
  c.slug ?? c.classSlug ?? (c.id != null ? String(c.id) : "");
const getClassTitle = (c: ClassItem) => c.title ?? c.name ?? "Untitled Class";
const getChapters = (c: ClassItem): ChapterItem[] =>
  (c.chapters ?? c.modules ?? c.children ?? []) as ChapterItem[];

const getChapterSlug = (ch: ChapterItem) =>
  ch.slug ?? ch.chapterSlug ?? (ch.id != null ? String(ch.id) : "");
const getChapterTitle = (ch: ChapterItem) =>
  ch.title ?? ch.name ?? "Untitled Chapter";
const getChapterNumber = (ch: ChapterItem) =>
  typeof ch.chapterNumber === "number" ? ch.chapterNumber : null;
const getChapterLabel = (ch: ChapterItem) => {
  const number = getChapterNumber(ch);
  const title = getChapterTitle(ch);
  return number ? `Ch ${number} \u00b7 ${title}` : title;
};
const getLessons = (ch: ChapterItem): LessonItem[] =>
  (ch.lessons ?? ch.items ?? ch.children ?? []) as LessonItem[];

const getLessonSlug = (l: LessonItem) =>
  l.slug ?? l.lessonSlug ?? (l.id != null ? String(l.id) : "");
const getLessonId = (l: LessonItem) =>
  l.id != null ? String(l.id) : (l.slug ?? l.lessonSlug ?? "");
const getLessonTitle = (l: LessonItem) =>
  l.title ?? l.name ?? "Untitled Lesson";

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

const cleanTitle = (value: string, fallback: string) => {
  const t = value.trim();
  const normalized = t.toLowerCase();
  if (!t) return fallback;
  if (BAD_TITLE_EXACT.has(normalized)) return fallback;
  if (/^[a-z]{1,3}$/i.test(t)) return fallback;
  if (/^(.)\1{2,}$/i.test(t)) return fallback;
  return t;
};

export default function SidebarClient({ classes }: Props) {
  const pathname = usePathname();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadUser = async () => {
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setUserId(null);
          return;
        }
        const data = (await res.json()) as { user?: { id?: string } };
        setUserId(data?.user?.id ?? null);
      } catch {
        if (!controller.signal.aborted) {
          setUserId(null);
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const loadProgress = async () => {
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/lesson-progress?limit=500&where[completed][equals]=true`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setCompletedLessons(new Set());
          return;
        }
        const data = (await res.json()) as {
          docs?: { lesson?: string | { id?: string | number } }[];
        };
        const next = new Set<string>();
        (data.docs ?? []).forEach((doc) => {
          const lessonValue = doc.lesson;
          if (typeof lessonValue === "string") {
            next.add(lessonValue);
          } else if (
            typeof lessonValue === "object" &&
            lessonValue &&
            "id" in lessonValue &&
            lessonValue.id != null
          ) {
            next.add(String(lessonValue.id));
          }
        });
        setCompletedLessons(next);
      } catch {
        if (!controller.signal.aborted) {
          setCompletedLessons(new Set());
        }
      }
    };
    loadProgress();
    return () => controller.abort();
  }, [userId]);

  // Parse /classes/[classSlug]/(chapters|lessons)/[slug]
  const { currentClassSlug, currentLessonSlug, currentChapterSlug } =
    useMemo(() => {
      const parts = pathname.split("/").filter(Boolean);
      const iClass = parts.indexOf("classes");
      const iLesson = parts.indexOf("lessons");
      const iChapter = parts.indexOf("chapters");
      return {
        currentClassSlug: iClass >= 0 ? parts[iClass + 1] : null,
        currentLessonSlug: iLesson >= 0 ? parts[iLesson + 1] : null,
        currentChapterSlug: iChapter >= 0 ? parts[iChapter + 1] : null,
      };
    }, [pathname]);

  const showOnlyTopLevel =
    !currentClassSlug && !currentLessonSlug && !currentChapterSlug;

  // lessonSlug -> { classSlug, chapterSlug }
  const lessonOwner = useMemo(() => {
    const map: Record<string, { classSlug: string; chapterSlug: string }> = {};
    for (const cls of classes ?? []) {
      const cSlug = getClassSlug(cls);
      if (!cSlug) continue;
      for (const ch of getChapters(cls)) {
        const chSlug = getChapterSlug(ch);
        if (!chSlug) continue;
        for (const ls of getLessons(ch)) {
          const lSlug = getLessonSlug(ls);
          if (lSlug) {
            map[lSlug] = { classSlug: cSlug, chapterSlug: chSlug };
          }
        }
      }
    }
    return map;
  }, [classes]);

  const STORAGE_CLASSES = "sidebar:open-classes";
  const STORAGE_CHAPTERS = "sidebar:open-chapters";

  const [openClasses, setOpenClasses] = useState<Record<string, boolean>>({});
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  // Initial open state + auto-open current class/chapter
  useEffect(() => {
    let cMap: Record<string, boolean> = {};
    let hMap: Record<string, boolean> = {};
    try {
      cMap = JSON.parse(localStorage.getItem(STORAGE_CLASSES) || "{}") || {};
    } catch {}

    const ownerFromLesson = currentLessonSlug
      ? lessonOwner[currentLessonSlug]
      : null;
    const firstClassSlug = classes[0] ? getClassSlug(classes[0]) : null;

    const fallbackClassFromChapter =
      currentClassSlug && currentChapterSlug ? currentClassSlug : null;

    const defaultClass =
      currentClassSlug ||
      ownerFromLesson?.classSlug ||
      fallbackClassFromChapter ||
      firstClassSlug;

    const defaultChapter = ownerFromLesson
      ? `${ownerFromLesson.classSlug}/${ownerFromLesson.chapterSlug}`
      : currentClassSlug && currentChapterSlug
        ? `${currentClassSlug}/${currentChapterSlug}`
        : null;

    if (defaultClass && cMap[defaultClass] !== true) cMap[defaultClass] = true;
    if (defaultChapter) {
      hMap = { [defaultChapter]: true };
    } else {
      hMap = {};
    }
    if (!Object.keys(cMap).length && defaultClass) cMap[defaultClass] = true;

    setOpenClasses(cMap);
    setOpenChapters(hMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, JSON.stringify(lessonOwner), classes?.length]);

  // Persist open state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLASSES, JSON.stringify(openClasses));
      localStorage.setItem(STORAGE_CHAPTERS, JSON.stringify(openChapters));
    } catch {}
  }, [openClasses, openChapters]);

  const toggleClass = (slug: string) =>
    setOpenClasses((m) => {
      const isOpen = !!m[slug];
      if (isOpen) {
        return { ...m, [slug]: false };
      }
      const next: Record<string, boolean> = {};
      for (const key of Object.keys(m)) next[key] = false;
      next[slug] = true;
      return next;
    });

  const toggleChapter = (classSlug: string, chapterSlug: string) => {
    const key = `${classSlug}/${chapterSlug}`;
    setOpenChapters((m) => {
      const isOpen = !!m[key];
      if (isOpen) {
        return { ...m, [key]: false };
      }
      return { [key]: true };
    });
  };

  return (
    <nav className="text-[13px]">
      <ul className="space-y-1.5">
        {(classes ?? []).map((cls) => {
          const cSlug = getClassSlug(cls);
          if (!cSlug) return null;
          const classOpen = !!openClasses[cSlug];
          const classTitle = getClassTitle(cls);
          const classHasActiveLesson = !!(
            currentLessonSlug &&
            lessonOwner[currentLessonSlug]?.classSlug === cSlug
          );
          const classIsActive =
            currentClassSlug === cSlug || classHasActiveLesson;

          return (
            <li key={cSlug}>
              {/* Class header */}
              {showOnlyTopLevel ? (
                <Link
                  href={`/classes/${cSlug}`}
                  className={cn(
                    "relative block rounded-md border-l-[3px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
                    "transition-[background-color,border-color,color,transform,box-shadow] duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "hover:-translate-y-[1px] hover:border-primary/60 hover:bg-muted/30 hover:text-foreground",
                    classIsActive
                      ? "border-primary bg-primary/25 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]"
                      : "border-transparent text-muted-foreground/90"
                  )}
                >
                  {classTitle}
                </Link>
              ) : (
                <div
                  className={cn(
                    "group flex w-full items-center justify-between gap-2 rounded-md border-l-[3px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
                    "transition-[background-color,border-color,color,transform,box-shadow] duration-200",
                    "hover:-translate-y-[1px] hover:border-primary/60 hover:bg-muted/30 hover:text-foreground",
                    classIsActive
                      ? "border-primary bg-primary/25 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]"
                      : "border-transparent text-muted-foreground/90"
                  )}
                >
                  <Link
                    href={`/classes/${cSlug}`}
                    className="flex-1 text-left text-inherit focus-visible:outline-none"
                  >
                    {classTitle}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={classOpen}
                    aria-controls={`panel-class-${cSlug}`}
                    onClick={() => toggleClass(cSlug)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                      classIsActive
                        ? "text-foreground/80 hover:bg-primary/20"
                        : "text-muted-foreground/70 hover:bg-muted/25 hover:text-foreground"
                    )}
                    aria-label={
                      classOpen ? "Collapse chapters" : "Expand chapters"
                    }
                  >
                    <ChevronRight
                      className={[
                        "h-3 w-3 shrink-0 transition-transform",
                        classOpen ? "rotate-90 -translate-x-1" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              )}

              {/* Chapters (collapsible) */}
              {!showOnlyTopLevel && (
                <div
                  id={`panel-class-${cSlug}`}
                  className={[
                    "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                    classOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-70",
                  ].join(" ")}
                >
                  <ul className="min-h-0 overflow-hidden pl-5 pr-1.5 space-y-0.5">
                    {getChapters(cls).map((ch) => {
                      const chSlug = getChapterSlug(ch);
                      if (!chSlug) return null;
                      const chKey = `${cSlug}/${chSlug}`;
                      const chOpen = !!openChapters[chKey];

                      const lessons = getLessons(ch);
                      const chapterCompleted = lessons.filter((ls) =>
                        completedLessons.has(getLessonId(ls))
                      ).length;

                      const chapterOverviewActive =
                        currentClassSlug === cSlug &&
                        currentChapterSlug === chSlug;

                      const chapterHasActiveLesson = lessons.some(
                        (ls) => getLessonSlug(ls) === currentLessonSlug
                      );

                      const chapterBarActive =
                        chapterOverviewActive || chapterHasActiveLesson;

                      const chapterPercent = lessons.length
                        ? Math.round(
                            (chapterCompleted / lessons.length) * 100
                          )
                        : 0;
                      const chapterIsComplete =
                        lessons.length > 0 &&
                        chapterCompleted === lessons.length;

                      return (
                        <li key={chSlug}>
                          <div className="relative pl-3">
                            <div
                              className={cn(
                                "group -ml-3 flex w-[calc(100%+0.75rem)] flex-col gap-0.5 rounded-md border-l-[3px] py-1 pl-3 pr-1.5 text-left",
                                "transition-[background-color,border-color,color,transform,box-shadow] duration-200",
                                "hover:-translate-y-[1px]",
                                chapterBarActive
                                  ? "border-primary bg-primary/25 text-foreground pl-1 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]"
                                  : "border-transparent text-muted-foreground/85 hover:border-primary/45 hover:bg-muted/25 hover:text-foreground"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <Link
                                  href={`/classes/${cSlug}/chapters/${chSlug}`}
                                  className="flex flex-1 items-center justify-between gap-2 text-left text-inherit focus-visible:outline-none"
                                >
                                  <span className="truncate">
                                    {cleanTitle(
                                      getChapterLabel(ch),
                                      "Untitled chapter"
                                    )}
                                  </span>
                                  <span
                                    className={cn(
                                      "shrink-0 rounded-full px-1.5 py-0 text-[10px] font-semibold tabular-nums uppercase tracking-wide",
                                      chapterIsComplete
                                        ? "bg-primary/20 text-primary"
                                        : chapterCompleted > 0
                                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                          : "bg-muted/60 text-muted-foreground"
                                    )}
                                  >
                                    {chapterCompleted}/{lessons.length || 0}
                                  </span>
                                </Link>
                              <button
                                type="button"
                                aria-expanded={chOpen}
                                aria-controls={`panel-ch-${chKey}`}
                                onClick={() => toggleChapter(cSlug, chSlug)}
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-md transition-colors",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                                  chapterBarActive
                                    ? "text-foreground/80 hover:bg-primary/20"
                                    : "text-muted-foreground/70 hover:bg-muted/25 hover:text-foreground"
                                )}
                                aria-label={
                                  chOpen ? "Collapse lessons" : "Expand lessons"
                                }
                              >
                                <ChevronRight
                                  className={[
                                    "h-3 w-3 shrink-0 transition-transform",
                                    chOpen ? "rotate-90 -translate-x-1" : "",
                                  ].join(" ")}
                                  aria-hidden="true"
                                />
                              </button>
                              </div>
                              {lessons.length > 0 ? (
                                <div
                                  className="ml-1 h-1 overflow-hidden rounded-full bg-muted/70"
                                  aria-hidden="true"
                                >
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-[width] duration-500 ease-out",
                                      chapterIsComplete
                                        ? "bg-primary"
                                        : chapterCompleted > 0
                                          ? "bg-gradient-to-r from-primary/60 to-primary"
                                          : "bg-primary/35"
                                    )}
                                    style={{
                                      width: `${Math.max(chapterPercent, chapterPercent > 0 ? 6 : 0)}%`,
                                    }}
                                  />
                                </div>
                              ) : null}
                            </div>

                            {/* Lessons */}
                            <div
                              id={`panel-ch-${chKey}`}
                              className={[
                                "grid transition-[grid-template-rows,opacity] duration-200 ease-out pl-5",
                                chOpen
                                  ? "grid-rows-[1fr] opacity-100"
                                  : "grid-rows-[0fr] opacity-70",
                              ].join(" ")}
                            >
                              <ul className="min-h-0 overflow-hidden py-0.5 space-y-0">
                                {lessons.map((ls) => {
                                  const lsSlug = getLessonSlug(ls);
                                  const lsId = getLessonId(ls);
                                  if (!lsSlug) return null;
                                  const active = lsSlug === currentLessonSlug;
                                  return (
                                    <li key={lsSlug}>
                                      <Link
                                        href={`/classes/${cSlug}/lessons/${lsSlug}`}
                                        className={cn(
                                          "block rounded-md border-l-2 px-2 py-0.5 text-[13px] transition-[background-color,border-color,color,transform] duration-200",
                                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                          "hover:-translate-y-[1px]",
                                          active
                                            ? "border-primary bg-primary/20 text-foreground ring-1 ring-inset ring-primary/25"
                                            : "border-transparent text-muted-foreground/70 hover:border-primary/40 hover:bg-muted/20 hover:text-foreground"
                                        )}
                                      >
                                        <span className="relative flex items-center gap-2 pl-2">
                                          {cleanTitle(
                                            getLessonTitle(ls),
                                            "Untitled lesson"
                                          )}
                                          {completedLessons.has(lsId) ? (
                                            <Check className="h-3 w-3 text-emerald-500" />
                                          ) : null}
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                })}
                                {lessons.length === 0 && (
                                  <li className="text-xs text-muted-foreground px-2 py-1">
                                    No lessons yet.
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
