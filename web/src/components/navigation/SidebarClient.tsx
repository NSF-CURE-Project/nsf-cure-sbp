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

/** Title-case nav labels; softens ALL-CAPS CMS titles like "MECHANICS OF MATERIALS". */
const toNavLabel = (value: string) => {
  const cleaned = cleanTitle(value, value).trim();
  const letters = cleaned.replace(/[^A-Za-z]/g, "");
  const mostlyUpper =
    letters.length > 0 &&
    letters === letters.toUpperCase() &&
    /[A-Z]/.test(letters);
  if (!mostlyUpper) return cleaned;
  return cleaned
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(Of|And|The|For|To|In|On)\b/g, (m) => m.toLowerCase());
};

/**
 * Custom engineering subject icons (24×24 stroke).
 * Lucide covers general UI; these give the curriculum its own identity.
 */
function StudyTopicIcon({ title }: { title: string }) {
  const normalized = title.toLowerCase();
  const common = {
    "aria-hidden": true as const,
    className: "size-6 shrink-0",
    viewBox: "0 0 24 24",
    fill: "none" as const,
  };
  const stroke = {
    stroke: "currentColor" as const,
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (normalized.includes("statics")) {
    // Simply supported beam with a central applied force
    return (
      <svg {...common}>
        <path d="M4 11h16" {...stroke} />
        <path d="M12 4v6" {...stroke} />
        <path d="M9.75 8.5 12 11l2.25-2.5" {...stroke} />
        <path d="M6.5 11 5 14.5h3L6.5 11Z" {...stroke} />
        <path d="M17.5 11 16 14.5h3L17.5 11Z" {...stroke} />
      </svg>
    );
  }

  if (normalized.includes("mechanics")) {
    // Refined I-beam cross-section with light stress markers
    return (
      <svg {...common}>
        <path
          d="M5.5 4.25h13v2.75h-4.75v9.5H18.5v2.75h-13v-2.75h4.75v-9.5H5.5z"
          {...stroke}
        />
        <path d="M8.25 12h2.5M13.25 12h2.5" {...stroke} />
      </svg>
    );
  }

  // Review: clipboard with checklist
  return (
    <svg {...common}>
      <path
        d="M8.25 4.5h7.5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7.5a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z"
        {...stroke}
      />
      <path d="M9.5 4.5h5V6a1.25 1.25 0 0 1-1.25 1.25h-2.5A1.25 1.25 0 0 1 9.5 6z" {...stroke} />
      <path d="M9.5 11.25h5M9.5 14.75h5" {...stroke} />
      <path d="M9.5 17.75 10.85 19l3.15-3.25" {...stroke} />
    </svg>
  );
}

export default function SidebarClient({ classes }: Props) {
  const pathname = usePathname();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [hashChapterSlug, setHashChapterSlug] = useState<string | null>(null);

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      setHashChapterSlug(
        hash.startsWith("chapter-") ? hash.slice("chapter-".length) : null
      );
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [pathname]);

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

  const [openClasses, setOpenClasses] = useState<Record<string, boolean>>({});

  // Initial open state + auto-open current class
  useEffect(() => {
    let cMap: Record<string, boolean> = {};
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

    if (defaultClass && cMap[defaultClass] !== true) cMap[defaultClass] = true;
    if (!Object.keys(cMap).length && defaultClass) cMap[defaultClass] = true;

    setOpenClasses(cMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, JSON.stringify(lessonOwner), classes?.length]);

  // Persist open state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLASSES, JSON.stringify(openClasses));
    } catch {}
  }, [openClasses]);

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
          const classLabel = toNavLabel(classTitle);
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
                    "flex min-h-11 items-center gap-2.5 border-l-[3px] py-2 pl-3 pr-3 text-[13px] font-semibold leading-5 tracking-[-0.01em]",
                    "transition-[background-color,border-color,color] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    classSelfActive
                      ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-foreground"
                      : "border-transparent text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  aria-current={classSelfActive ? "page" : undefined}
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center text-primary">
                    <StudyTopicIcon title={classTitle} />
                  </span>
                  <span className="min-w-0 break-words">{classLabel}</span>
                </Link>
              ) : (
                <div
                  className={cn(
                    "grid min-h-9 w-full grid-cols-[1.75rem_minmax(0,1fr)_2rem] items-center gap-2 border-l-[3px] py-0 pl-3 pr-0 text-[13px] font-semibold leading-5 tracking-[-0.01em]",
                    "transition-[background-color,border-color,color] duration-150",
                    classSelfActive
                      ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-foreground"
                      : classIsActive
                        ? "border-transparent text-sidebar-foreground hover:bg-sidebar-accent"
                        : "border-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center text-primary">
                    <StudyTopicIcon title={classTitle} />
                  </span>
                  <Link
                    href={`/classes/${cSlug}`}
                    className="min-w-0 py-1.5 text-left text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
                    aria-current={classSelfActive ? "page" : undefined}
                  >
                    <span className="block break-words">{classLabel}</span>
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
                      const lessons = getLessons(ch);
                      const chapterCompleted = lessons.filter((ls) =>
                        completedLessons.has(getLessonId(ls))
                      ).length;
                      const chapterNumber = getChapterNumber(ch);
                      const chapterOwnsActiveLesson = !!(
                        currentLessonSlug &&
                        lessonOwner[currentLessonSlug]?.classSlug === cSlug &&
                        lessonOwner[currentLessonSlug]?.chapterSlug === chSlug
                      );
                      const chapterPageActive =
                        currentClassSlug === cSlug &&
                        currentChapterSlug === chSlug;
                      const chapterSelfActive =
                        chapterPageActive || chapterOwnsActiveLesson;
                      const chapterHashFocus =
                        !chapterSelfActive &&
                        currentClassSlug === cSlug &&
                        !currentLessonSlug &&
                        !currentChapterSlug &&
                        hashChapterSlug === chSlug;
                      const showLessonRail = chapterOwnsActiveLesson;

                      return (
                        <li key={chSlug}>
                          <div className="relative">
                            <Link
                              href={`/classes/${cSlug}#chapter-${chSlug}`}
                              className={cn(
                                "flex min-h-8 items-start gap-2 border-l-[3px] py-1.5 pl-4 pr-3 text-left transition-[background-color,border-color,color] duration-150",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
                                chapterSelfActive
                                  ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-foreground"
                                  : chapterHashFocus
                                    ? "border-transparent bg-sidebar-accent/60 font-medium text-sidebar-foreground"
                                    : "border-transparent text-sidebar-foreground hover:bg-sidebar-accent"
                              )}
                              aria-current={
                                chapterSelfActive && !currentLessonSlug
                                  ? "page"
                                  : undefined
                              }
                            >
                              {chapterNumber != null ? (
                                <span className="mt-px shrink-0 text-[12px] font-medium tabular-nums text-sidebar-foreground/65">
                                  {String(chapterNumber).padStart(2, "0")}
                                </span>
                              ) : null}
                              <span
                                className={cn(
                                  "min-w-0 flex-1 break-words text-[14px] leading-[18px]",
                                  chapterSelfActive
                                    ? "font-semibold"
                                    : "font-medium"
                                )}
                              >
                                {cleanTitle(
                                  getChapterTitle(ch),
                                  "Untitled chapter"
                                )}
                              </span>
                              {chapterCompleted > 0 ? (
                                <span className="shrink-0 text-[11px] tabular-nums text-sidebar-foreground/55">
                                  {chapterCompleted}/{lessons.length || 0}
                                </span>
                              ) : null}
                            </Link>

                            {showLessonRail && lessons.length > 0 ? (
                              <ul className="ml-4 min-h-0 space-y-0.5 overflow-hidden pt-1">
                                {lessons.map((ls) => {
                                  const lsSlug = getLessonSlug(ls);
                                  const lsId = getLessonId(ls);
                                  if (!lsSlug) return null;
                                  const active = lsSlug === currentLessonSlug;
                                  const completed =
                                    completedLessons.has(lsId);
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
                              </ul>
                            ) : null}
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
