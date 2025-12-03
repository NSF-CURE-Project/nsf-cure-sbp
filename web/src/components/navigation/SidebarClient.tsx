"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

type LessonItem = {
  slug?: string;
  title?: string;
  name?: string;
} & Record<string, any>;

type ChapterItem = {
  slug?: string;
  title?: string;
  name?: string;
  lessons?: LessonItem[];
  items?: LessonItem[];
  children?: LessonItem[];
} & Record<string, any>;

type ClassItem = {
  slug?: string;
  title?: string;
  name?: string;
  chapters?: ChapterItem[];
  modules?: ChapterItem[];
  children?: ChapterItem[];
} & Record<string, any>;

type Props = { classes: ClassItem[] };

// ---------- Accessors ----------
const getClassSlug = (c: ClassItem) =>
  c.slug ?? (c as any).classSlug ?? (c as any).id ?? "";
const getClassTitle = (c: ClassItem) => c.title ?? c.name ?? "Untitled Class";
const getChapters = (c: ClassItem): ChapterItem[] =>
  (c.chapters ?? c.modules ?? c.children ?? []) as ChapterItem[];

const getChapterSlug = (ch: ChapterItem) =>
  ch.slug ?? (ch as any).chapterSlug ?? (ch as any).id ?? "";
const getChapterTitle = (ch: ChapterItem) =>
  ch.title ?? ch.name ?? "Untitled Chapter";
const getLessons = (ch: ChapterItem): LessonItem[] =>
  (ch.lessons ?? ch.items ?? ch.children ?? []) as LessonItem[];

const getLessonSlug = (l: LessonItem) =>
  l.slug ?? (l as any).lessonSlug ?? (l as any).id ?? "";
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

          return (
            <li key={cSlug}>
              {/* Class header */}
              <button
                type="button"
                aria-expanded={classOpen}
                aria-controls={`panel-class-${cSlug}`}
                onClick={() => toggleClass(cSlug)}
                className="group flex w-full items-start justify-between gap-2 px-4 py-2 text-base font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <span>{getClassTitle(cls)}</span>
                <ChevronRight
                  className={[
                    "h-3 w-3 transition-transform",
                    classOpen ? "rotate-90" : "",
                  ].join(" ")}
                  aria-hidden="true"
                />
              </button>

              {/* Chapters (collapsible) */}
              <div
                id={`panel-class-${cSlug}`}
                className={[
                  "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                  classOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-70",
                ].join(" ")}
              >
                <ul className="min-h-0 overflow-hidden pl-5 pr-2 space-y-1">
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
                        <div
                          className={[
                            "relative pl-2 border-l",
                            chapterBarActive
                              ? "border-l-2 border-[#FFB81C]"
                              : "border-border/30",
                          ].join(" ")}
                        >
                          {/* Chapter header */}
                          <button
                            type="button"
                            aria-expanded={chOpen}
                            aria-controls={`panel-ch-${chKey}`}
                            onClick={() => toggleChapter(cSlug, chSlug)}
                            className={[
                              "group flex w-full items-start justify-between gap-2 px-2 py-1 font-medium rounded-md transition-colors text-left",
                              "hover:bg-accent/25 hover:text-accent-foreground",
                            ].join(" ")}
                          >
                            <span>{getChapterTitle(ch)}</span>
                            <ChevronRight
                              className={[
                                "h-3 w-3 transition-transform",
                                chOpen ? "rotate-90" : "",
                              ].join(" ")}
                              aria-hidden="true"
                            />
                          </button>

                          {/* Chapter Overview — only when open */}
                          {chOpen && (
                            <div className="pl-4 mt-1">
                              <Link
                                href={`/classes/${cSlug}/chapters/${chSlug}`}
                                className={[
                                  "inline-block w-fit px-3 py-0.5 text-sm rounded-md border transition-colors",
                                  chapterOverviewActive
                                    ? "bg-accent text-accent-foreground border-accent"
                                    : "text-muted-foreground border-border hover:bg-accent/10 hover:text-accent-foreground",
                                ].join(" ")}
                              >
                                Chapter Overview
                              </Link>

                              <div className="mt-2 h-px w-full bg-border" />
                            </div>
                          )}

                          {/* Lessons */}
                          <div
                            id={`panel-ch-${chKey}`}
                            className={[
                              "grid transition-[grid-template-rows,opacity] duration-200 ease-out pl-4",
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
                                          ? "bg-accent text-accent-foreground font-semibold"
                                          : "text-muted-foreground hover:bg-accent/20 hover:text-accent-foreground",
                                      ].join(" ")}
                                    >
                                      {getLessonTitle(ls)}
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
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
