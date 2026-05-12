// src/app/(public)/classes/[classSlug]/chapters/[chapterSlug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  Clock,
  FileQuestion,
  Layers,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SafeHtml } from "@/components/ui/safeHtml";
import { resolveChapterForClass } from "@/lib/payloadSdk/resolvers";
import type { ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

type RouteParams = { classSlug: string; chapterSlug: string };
type PageProps = {
  params: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getObjective = (chapter: ChapterDoc) => {
  const objective = (chapter as { objective?: unknown }).objective;
  return typeof objective === "string" ? objective : null;
};

type LessonType = "Reading" | "Video" | "Quiz";

const inferLessonType = (lesson: LessonDoc): LessonType => {
  const layout = Array.isArray(lesson.layout) ? lesson.layout : [];
  if (
    layout.some((block) => block.blockType === "quizBlock") ||
    Boolean(lesson.assessment?.quiz)
  ) {
    return "Quiz";
  }
  if (layout.some((block) => block.blockType === "videoBlock")) {
    return "Video";
  }
  return "Reading";
};

const estimateMinutes = (type: LessonType) => {
  if (type === "Quiz") return 12;
  if (type === "Video") return 10;
  return 8;
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

const formatTotalTime = (mins: number) => {
  if (mins <= 0) return "—";
  if (mins < 60) return `~${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (remainder === 0) return `~${hours}h`;
  return `~${hours}h ${remainder}m`;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { classSlug, chapterSlug } = await params;
  const resolved = await resolveChapterForClass(classSlug, chapterSlug);
  if (!resolved) {
    return buildMetadata({
      title: "Chapter",
      description: "Chapter overview.",
      path: `/classes/${classSlug}/chapters/${chapterSlug}`,
    });
  }

  const title =
    typeof resolved.chapter.title === "string" && resolved.chapter.title.trim()
      ? resolved.chapter.title
      : "Untitled chapter";
  const canonicalSlug =
    typeof resolved.chapter.slug === "string"
      ? resolved.chapter.slug
      : chapterSlug;
  return buildMetadata({
    title,
    description: `Lessons and objectives for ${title}.`,
    path: `/classes/${classSlug}/chapters/${canonicalSlug}`,
  });
}

export default async function ChapterOverviewPage({
  params,
  searchParams,
}: PageProps) {
  const { classSlug, chapterSlug } = await params;
  const sp = (await searchParams) ?? {};
  const DEBUG = "debug" in sp;

  const resolved = await resolveChapterForClass(classSlug, chapterSlug);

  if (!resolved) {
    if (DEBUG) {
      return (
        <pre className="p-4 text-xs border rounded max-w-3xl mx-auto my-8 whitespace-pre-wrap">
          {`DEBUG: No chapter matched in class tree
classSlug: ${classSlug}
chapterSlug: ${chapterSlug}`}
        </pre>
      );
    }
    return notFound();
  }

  const chapterTitle =
    typeof resolved.chapter.title === "string" && resolved.chapter.title.trim()
      ? resolved.chapter.title
      : "Untitled chapter";
  const chapterNumber = resolved.chapter.chapterNumber ?? null;
  const classTitle = resolved.class.title ?? "Course";
  const objective = getObjective(resolved.chapter);

  const lessonDocs = (resolved.chapter as ChapterDoc & {
    lessons?: LessonDoc[];
  }).lessons;
  const populatedLessons = Array.isArray(lessonDocs)
    ? lessonDocs.filter(
        (lesson): lesson is LessonDoc =>
          typeof lesson === "object" && lesson !== null && Boolean(lesson.slug)
      )
    : [];

  const lessonCards = (
    populatedLessons.length > 0
      ? populatedLessons.map((lesson) => {
          const type = inferLessonType(lesson);
          return {
            slug: lesson.slug as string,
            title:
              typeof lesson.title === "string" && lesson.title.trim()
                ? lesson.title
                : "Untitled lesson",
            type,
            minutes: estimateMinutes(type),
          };
        })
      : resolved.lessons.map((entry) => ({
          slug: entry.slug,
          title: entry.title,
          type: "Reading" as LessonType,
          minutes: 8,
        }))
  ).filter((entry) => Boolean(entry.slug));

  const totalMins = lessonCards.reduce(
    (sum, lesson) => sum + lesson.minutes,
    0
  );

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 sm:px-6 lg:px-8 py-6">
        <article className="space-y-8">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link
                href={`/classes/${classSlug}`}
                className="rounded-md px-1 py-0.5 font-medium transition-colors hover:text-foreground"
              >
                {classTitle}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="font-medium text-foreground/80">Chapter</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {chapterNumber ? `Chapter ${chapterNumber}` : "Chapter"}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {chapterTitle}
            </h1>
            <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Layers className="h-4 w-4 text-primary/70" />
                <dt className="sr-only">Lessons</dt>
                <dd>
                  <span className="font-semibold tabular-nums text-foreground">
                    {lessonCards.length}
                  </span>{" "}
                  {lessonCards.length === 1 ? "lesson" : "lessons"}
                </dd>
              </div>
              {totalMins > 0 ? (
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary/70" />
                  <dt className="sr-only">Estimated time</dt>
                  <dd>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatTotalTime(totalMins)}
                    </span>{" "}
                    total
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          {objective ? (
            <section className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Chapter objectives
              </h2>
              <SafeHtml
                html={objective}
                className="prose dark:prose-invert mt-3 max-w-none text-sm"
              />
            </section>
          ) : null}

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                Lessons in this chapter
              </h2>
              <Link
                href={`/classes/${classSlug}`}
                className="rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Back to {classTitle}
              </Link>
            </div>

            {lessonCards.length > 0 ? (
              <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {lessonCards.map((lesson) => {
                  const accent = lessonTypeAccent[lesson.type];
                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={`/classes/${classSlug}/lessons/${lesson.slug}`}
                        className={cn(
                          "group/lesson relative flex h-full items-start gap-3 rounded-xl border border-border/60 bg-background/70 px-4 py-3.5 shadow-sm",
                          "transition-[transform,box-shadow,border-color,background-color] duration-150 ease-out",
                          "hover:-translate-y-[2px] hover:border-primary/50 hover:bg-card hover:shadow-md",
                          "focus-visible:-translate-y-[2px] focus-visible:border-primary/60 focus-visible:bg-card focus-visible:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                            type={lesson.type}
                            className={cn("h-4 w-4", accent.iconText)}
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug text-foreground">
                            {lesson.title}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="font-medium uppercase tracking-wide">
                              {lesson.type}
                            </span>
                            <span className="text-border">·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />~{lesson.minutes} min
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-foreground">
                  No lessons in this chapter yet
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Lessons will appear here as soon as staff publish them.
                </p>
              </div>
            )}
          </section>
        </article>
      </div>
    </main>
  );
}
