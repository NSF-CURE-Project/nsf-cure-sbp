"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";

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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000"}/api/accounts/me`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setUserId(null);
          return;
        }
        const data = (await res.json()) as { user?: { id?: string } };
        setUserId(data?.user?.id ?? null);
      } catch (error) {
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
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000"}/api/lesson-progress?limit=500&where[completed][equals]=true`,
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
      } catch (error) {
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
    <nav className="text-sm">
      <ul className="space-y-3">
        {(classes ?? []).map((cls) => {
          const cSlug = getClassSlug(cls);
          if (!cSlug) return null;
          const classOpen = !!openClasses[cSlug];
          const classTitle = getClassTitle(cls);

          return (
            <li key={cSlug}>
              {/* Class header */}
              {showOnlyTopLevel ? (
                <Link
                  href={`/classes/${cSlug}`}
                  className="block px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 transition-colors hover:text-foreground"
                >
                  {classTitle}
                </Link>
              ) : (
                <div
                  className={[
                    "group flex w-full items-center justify-between gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors",
                    "text-muted-foreground/80 hover:text-foreground",
                  ].join(" ")}
                >
                  <Link
                    href={`/classes/${cSlug}`}
                    className="flex-1 text-left text-inherit"
                  >
                    {classTitle}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={classOpen}
                    aria-controls={`panel-class-${cSlug}`}
                    onClick={() => toggleClass(cSlug)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/60 transition hover:bg-muted/20 hover:text-foreground"
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
                  <ul className="min-h-0 overflow-hidden pl-6 pr-2 space-y-1">
                    {getChapters(cls).map((ch) => {
                      const chSlug = getChapterSlug(ch);
                      if (!chSlug) return null;
                      const chKey = `${cSlug}/${chSlug}`;
                      const chOpen = !!openChapters[chKey];

                      const lessons = getLessons(ch);

                      const chapterOverviewActive =
                        currentClassSlug === cSlug &&
                        currentChapterSlug === chSlug;

                      const chapterHasActiveLesson = lessons.some(
                        (ls) => getLessonSlug(ls) === currentLessonSlug
                      );

                      const chapterBarActive =
                        chapterOverviewActive || chapterHasActiveLesson;

                      return (
                        <li key={chSlug}>
                          <div className="relative pl-3">
                            <div
                              className={[
                                "group flex w-full items-center justify-between gap-2 px-2 py-1 pr-2 rounded-md transition-colors text-left border-l-2",
                                chapterBarActive
                                  ? "bg-muted/10 text-foreground/85 border-foreground/20 pl-1"
                                  : "text-muted-foreground/60 border-transparent",
                                "hover:text-foreground/85 hover:bg-muted/10",
                              ].join(" ")}
                            >
                              <Link
                                href={`/classes/${cSlug}/chapters/${chSlug}`}
                                className="flex-1 text-left text-inherit"
                              >
                                {getChapterLabel(ch)}
                              </Link>
                              <button
                                type="button"
                                aria-expanded={chOpen}
                                aria-controls={`panel-ch-${chKey}`}
                                onClick={() => toggleChapter(cSlug, chSlug)}
                                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/60 transition hover:bg-muted/20 hover:text-foreground"
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
                              <ul className="min-h-0 overflow-hidden py-0.5 space-y-1">
                                {lessons.map((ls) => {
                                  const lsSlug = getLessonSlug(ls);
                                  const lsId = getLessonId(ls);
                                  if (!lsSlug) return null;
                                  const active = lsSlug === currentLessonSlug;
                                  return (
                                    <li key={lsSlug}>
                                      <Link
                                        href={`/classes/${cSlug}/lessons/${lsSlug}`}
                                        className={[
                                          "block rounded-md px-2 py-1 transition-colors",
                                          active
                                            ? "bg-muted/10 text-foreground/85"
                                            : "text-muted-foreground/60 hover:text-foreground/85 hover:bg-muted/10",
                                        ].join(" ")}
                                      >
                                        <span
                                          className={[
                                            "relative flex items-center gap-2 pl-2",
                                            active
                                              ? "border-l-2 border-foreground/20"
                                              : "",
                                          ].join(" ")}
                                        >
                                          {getLessonTitle(ls)}
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
