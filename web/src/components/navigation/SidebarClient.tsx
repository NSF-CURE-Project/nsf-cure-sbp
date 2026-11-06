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

function StudyTopicIcon({ title }: { title: string }) {
  const normalized = title.toLowerCase();
  const common = {
    "aria-hidden": true as const,
    className: "size-5",
    viewBox: "0 0 20 20",
    fill: "none" as const,
  };

  if (normalized.includes("statics")) {
    return (
      <svg {...common}>
        <path
          d="M3 15h14M5.5 15v-2.5L10 6l4.5 6.5V15M7.2 10h5.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 17h3M13 17h3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalized.includes("mechanics")) {
    return (
      <svg {...common}>
        <path
          d="M4.5 4.5h11v11h-11zM2.5 7h2M2.5 13h2M15.5 7h2M15.5 13h2M7 2.5v2M13 2.5v2M7 15.5v2M13 15.5v2M7 8h6M7 11h6"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M4 3.5h12v13H4zM7 7h6M7 10h6M7 13h4"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
    <nav className="text-sidebar-foreground" aria-label="Study topics">
      <ul className="flex flex-col gap-1.5">
        {(classes ?? []).map((cls) => {
          const cSlug = getClassSlug(cls);
          if (!cSlug) return null;
          const chapters = getChapters(cls);
          const hasChapters = chapters.length > 0;
          const classOpen = !!openClasses[cSlug];
          const classTitle = getClassTitle(cls);
          const classHasActiveLesson = !!(
            currentLessonSlug &&
            lessonOwner[currentLessonSlug]?.classSlug === cSlug
          );
          const classIsActive =
            currentClassSlug === cSlug || classHasActiveLesson;
          const classSelfActive =
            currentClassSlug === cSlug &&
            !currentChapterSlug &&
            !currentLessonSlug;

          return (
            <li key={cSlug}>
              {/* Class header */}
              {showOnlyTopLevel ? (
                <Link
                  href={`/classes/${cSlug}`}
                  className={cn(
                    "flex min-h-12 items-center gap-3 border-l-[3px] py-2 pl-3 pr-3 text-[12px] font-semibold uppercase leading-4 tracking-[0.075em]",
                    "transition-[background-color,border-color,color] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    classSelfActive
                      ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-foreground"
                      : "border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  aria-current={classSelfActive ? "page" : undefined}
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center text-primary">
                    <StudyTopicIcon title={classTitle} />
                  </span>
                  <span className="min-w-0 break-words">{classTitle}</span>
                </Link>
              ) : (
                <div
                  className={cn(
                    "grid min-h-8 w-full grid-cols-[minmax(0,1fr)_2rem] items-center border-l-[3px] py-0 pl-3 pr-0 text-[12px] font-semibold uppercase leading-4 tracking-[0.08em]",
                    "transition-[background-color,border-color,color] duration-150",
                    classSelfActive
                      ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-foreground"
                      : classIsActive
                        ? "border-transparent text-sidebar-foreground hover:bg-sidebar-accent"
                        : "border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Link
                    href={`/classes/${cSlug}`}
                    className="min-w-0 py-1 text-left text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
                    aria-current={classSelfActive ? "page" : undefined}
                  >
                    <span className="block break-words">{classTitle}</span>
                  </Link>
                  {hasChapters ? (
                    <button
                      type="button"
                      aria-expanded={classOpen}
                      aria-controls={`panel-class-${cSlug}`}
                      onClick={() => toggleClass(cSlug)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                        classSelfActive
                          ? "text-sidebar-foreground hover:bg-sidebar-primary/15"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      aria-label={
                        classOpen ? "Collapse chapters" : "Expand chapters"
                      }
                    >
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform",
                          classOpen && "rotate-90"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    <span aria-hidden="true" className="h-8 w-8" />
                  )}
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
                  <ul className="mt-1 min-h-0 space-y-0.5 overflow-hidden">
                    {chapters.map((ch) => {
                      const chSlug = getChapterSlug(ch);
                      if (!chSlug) return null;
                      const chKey = `${cSlug}/${chSlug}`;
                      const chOpen = !!openChapters[chKey];

                      const lessons = getLessons(ch);
                      const hasLessons = lessons.length > 0;
                      const chapterCompleted = lessons.filter((ls) =>
                        completedLessons.has(getLessonId(ls))
                      ).length;

                      const chapterOverviewActive =
                        currentClassSlug === cSlug &&
                        currentChapterSlug === chSlug;

                      const chapterSelfActive = chapterOverviewActive;

                      const chapterPercent = lessons.length
                        ? Math.round((chapterCompleted / lessons.length) * 100)
                        : 0;
                      const chapterIsComplete =
                        lessons.length > 0 &&
                        chapterCompleted === lessons.length;

                      return (
                        <li key={chSlug}>
                          <div className="relative">
                            <div
                              className={cn(
                                "border-l-[3px] py-0 pl-4 pr-0 text-left transition-[background-color,border-color,color] duration-150",
                                chapterSelfActive
                                  ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-foreground"
                                  : "border-transparent text-sidebar-foreground hover:bg-sidebar-accent"
                              )}
                            >
                              <div className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto_1.75rem] items-center gap-x-1">
                                <Link
                                  href={`/classes/${cSlug}/chapters/${chSlug}`}
                                  className={cn(
                                    "min-w-0 py-1 text-left text-[14px] font-medium leading-[18px] text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                                    chapterSelfActive && "font-semibold"
                                  )}
                                  aria-current={
                                    chapterSelfActive ? "page" : undefined
                                  }
                                >
                                  <span className="flex min-w-0 items-start gap-2">
                                    {getChapterNumber(ch) != null ? (
                                      <span className="mt-px shrink-0 text-[12px] font-medium tabular-nums text-sidebar-foreground/65">
                                        {getChapterNumber(ch)}
                                      </span>
                                    ) : null}
                                    <span className="min-w-0 break-words">
                                      {cleanTitle(
                                        getChapterTitle(ch),
                                        "Untitled chapter"
                                      )}
                                    </span>
                                  </span>
                                </Link>
                                <span className="whitespace-nowrap text-right text-[12px] font-medium leading-4 tabular-nums text-sidebar-foreground/65">
                                  {chapterCompleted} of {lessons.length || 0}
                                </span>
                                {hasLessons ? (
                                  <button
                                    type="button"
                                    aria-expanded={chOpen}
                                    aria-controls={`panel-ch-${chKey}`}
                                    onClick={() => toggleChapter(cSlug, chSlug)}
                                    className={cn(
                                      "flex h-8 w-7 items-center justify-center rounded-sm transition-colors",
                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                                      chapterSelfActive
                                        ? "text-sidebar-foreground hover:bg-sidebar-primary/15"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                    aria-label={
                                      chOpen
                                        ? "Collapse lessons"
                                        : "Expand lessons"
                                    }
                                  >
                                    <ChevronRight
                                      className={cn(
                                        "h-4 w-4 shrink-0 transition-transform",
                                        chOpen && "rotate-90"
                                      )}
                                      aria-hidden="true"
                                    />
                                  </button>
                                ) : (
                                  <span
                                    aria-hidden="true"
                                    className="h-8 w-7"
                                  />
                                )}
                              </div>
                              {lessons.length > 0 ? (
                                <div
                                  className="mr-[4rem] h-[3px] overflow-hidden bg-sidebar-border"
                                  aria-hidden="true"
                                >
                                  <div
                                    className={cn(
                                      "h-full transition-[width] duration-500 ease-out",
                                      chapterIsComplete
                                        ? "bg-sidebar-primary"
                                        : chapterCompleted > 0
                                          ? "bg-sidebar-primary/75"
                                          : "bg-transparent"
                                    )}
                                    style={{
                                      width: `${chapterPercent}%`,
                                    }}
                                  />
                                </div>
                              ) : null}
                            </div>

                            {/* Lessons */}
                            <div
                              id={`panel-ch-${chKey}`}
                              className={[
                                "ml-4 grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                                chOpen
                                  ? "grid-rows-[1fr] opacity-100"
                                  : "grid-rows-[0fr] opacity-70",
                              ].join(" ")}
                            >
                              <ul className="min-h-0 space-y-0.5 overflow-hidden pt-1">
                                {lessons.map((ls) => {
                                  const lsSlug = getLessonSlug(ls);
                                  const lsId = getLessonId(ls);
                                  if (!lsSlug) return null;
                                  const active = lsSlug === currentLessonSlug;
                                  const completed = completedLessons.has(lsId);
                                  return (
                                    <li key={lsSlug}>
                                      <Link
                                        href={`/classes/${cSlug}/lessons/${lsSlug}`}
                                        className={cn(
                                          "grid min-h-8 grid-cols-[1.1rem_minmax(0,1fr)] items-start gap-1.5 border-l-[3px] py-1.5 pl-3 pr-2 text-[14px] leading-[18px]",
                                          "transition-[background-color,border-color,color] duration-150",
                                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                          active
                                            ? "border-sidebar-primary bg-sidebar-primary/10 font-semibold text-sidebar-foreground"
                                            : "border-transparent text-sidebar-foreground hover:bg-sidebar-accent"
                                        )}
                                        aria-current={
                                          active ? "page" : undefined
                                        }
                                      >
                                        <span
                                          aria-hidden="true"
                                          className="mt-[3px] flex h-4 w-4 items-center justify-center"
                                        >
                                          {completed ? (
                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                                              <Check className="h-3 w-3" />
                                            </span>
                                          ) : active ? (
                                            <span className="h-3 w-3 rounded-full border border-sidebar-primary bg-sidebar-primary" />
                                          ) : (
                                            <span className="h-3 w-3 rounded-full border border-sidebar-foreground/45 bg-sidebar" />
                                          )}
                                        </span>
                                        <span className="min-w-0 whitespace-normal break-words">
                                          {cleanTitle(
                                            getLessonTitle(ls),
                                            "Untitled lesson"
                                          )}
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                })}
                                {lessons.length === 0 && (
                                  <li className="px-3 py-2 text-[13px] leading-5 text-sidebar-foreground/55">
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
