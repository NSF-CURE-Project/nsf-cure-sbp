"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

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
const getLessons = (ch: ChapterItem): LessonItem[] =>
  (ch.lessons ?? ch.items ?? ch.children ?? []) as LessonItem[];

const getLessonSlug = (l: LessonItem) =>
  l.slug ?? l.lessonSlug ?? (l.id != null ? String(l.id) : "");
const getLessonTitle = (l: LessonItem) =>
  l.title ?? l.name ?? "Untitled Lesson";

export default function SidebarClient({ classes }: Props) {
  const pathname = usePathname();

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

  const showOnlyTopLevel = !currentLessonSlug && !currentChapterSlug;

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
      hMap = JSON.parse(localStorage.getItem(STORAGE_CHAPTERS) || "{}") || {};
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
    if (defaultChapter && hMap[defaultChapter] !== true)
      hMap[defaultChapter] = true;
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
    setOpenClasses((m) => ({ ...m, [slug]: !m[slug] }));

  const toggleChapter = (classSlug: string, chapterSlug: string) => {
    const key = `${classSlug}/${chapterSlug}`;
    setOpenChapters((m) => ({ ...m, [key]: !m[key] }));
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
                <button
                  type="button"
                  aria-expanded={classOpen}
                  aria-controls={`panel-class-${cSlug}`}
                  onClick={() => toggleClass(cSlug)}
                  className={[
                    "group flex w-full items-center justify-between gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors",
                    "text-muted-foreground/80 hover:text-foreground",
                  ].join(" ")}
                >
                  <span className="flex-1 text-left">{classTitle}</span>
                  <ChevronRight
                    className={[
                      "h-3 w-3 shrink-0 transition-transform text-muted-foreground/60",
                      classOpen ? "rotate-90 -translate-x-1" : "",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </button>
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
                          {/* Chapter header */}
                          <button
                            type="button"
                            aria-expanded={chOpen}
                            aria-controls={`panel-ch-${chKey}`}
                            onClick={() => toggleChapter(cSlug, chSlug)}
                            className={[
                              "group flex w-full items-center justify-between gap-2 px-2 py-1 pr-2 rounded-md transition-colors text-left border-l-2",
                              chapterBarActive
                                ? "bg-muted/30 text-foreground border-[#FFB81C] pl-1"
                                : "text-muted-foreground border-transparent",
                              "hover:text-foreground hover:bg-muted/30",
                            ].join(" ")}
                          >
                            <span className="flex-1 text-left">
                              {getChapterTitle(ch)}
                            </span>
                            <ChevronRight
                              className={[
                                "h-3 w-3 shrink-0 transition-transform text-muted-foreground/60",
                                chOpen ? "rotate-90 -translate-x-1" : "",
                              ].join(" ")}
                              aria-hidden="true"
                            />
                          </button>

                          {/* Chapter Overview — only when open */}
                          {chOpen && (
                            <div className="pl-5 mt-1">
                              <Link
                                href={`/classes/${cSlug}/chapters/${chSlug}`}
                                className={[
                                  "inline-flex w-fit items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors border-l-2",
                                  chapterOverviewActive
                                    ? "bg-muted/40 text-foreground border-[#FFB81C]"
                                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30",
                                ].join(" ")}
                              >
                                Chapter Overview
                              </Link>
                            </div>
                          )}

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
                                if (!lsSlug) return null;
                                const active = lsSlug === currentLessonSlug;
                                return (
                                  <li key={lsSlug}>
                                    <Link
                                      href={`/classes/${cSlug}/lessons/${lsSlug}`}
                                      className={[
                                        "block rounded-md px-2 py-1 transition-colors",
                                        active
                                          ? "bg-muted/40 text-foreground"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                                      ].join(" ")}
                                    >
                                      <span
                                        className={[
                                          "relative block pl-2",
                                          active ? "border-l-2 border-[#FFB81C]" : "",
                                        ].join(" ")}
                                      >
                                        {getLessonTitle(ls)}
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
