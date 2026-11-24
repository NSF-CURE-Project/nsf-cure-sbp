import { notFound } from "next/navigation";
import { chapterHasReadableLessons, getClassBySlug } from "@/lib/payloadSdk/classes";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";
import type { ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClassProgressSummary } from "@/components/progress/ClassProgressSummary";
import { ClassChapterBrowser } from "@/components/classes/ClassChapterBrowser";
import ScrollToTopOnMount from "@/components/layout/ScrollToTopOnMount";
import { Button } from "@/components/ui/button";

type Params = Promise<{ classSlug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const byOrderThenTitle = (
  a: { order?: number | null; title?: string | null },
  b: { order?: number | null; title?: string | null }
) => {
  const orderA = typeof a.order === "number" ? a.order : Number(a.order ?? 0);
  const orderB = typeof b.order === "number" ? b.order : Number(b.order ?? 0);
  if (orderA !== orderB) return orderA - orderB;
  const titleA = typeof a.title === "string" ? a.title.toLowerCase() : "";
  const titleB = typeof b.title === "string" ? b.title.toLowerCase() : "";
  return titleA.localeCompare(titleB);
};

const byChapterNumberThenTitle = (
  a: { chapterNumber?: number | null; title?: string | null },
  b: { chapterNumber?: number | null; title?: string | null }
) => {
  const numA = typeof a.chapterNumber === "number" ? a.chapterNumber : null;
  const numB = typeof b.chapterNumber === "number" ? b.chapterNumber : null;
  if (numA != null && numB != null && numA !== numB) return numA - numB;
  if (numA != null && numB == null) return -1;
  if (numA == null && numB != null) return 1;
  const titleA = typeof a.title === "string" ? a.title.toLowerCase() : "";
  const titleB = typeof b.title === "string" ? b.title.toLowerCase() : "";
  return titleA.localeCompare(titleB);
};

export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { classSlug } = await props.params;
  const searchParams = await props.searchParams;
  const isPreview = await resolvePreview(searchParams);

  const c = await getClassBySlug(classSlug, { draft: isPreview });
  const title = c?.title ?? "Class";
  const description =
    typeof c?.description === "string" && c.description.trim()
      ? c.description
      : `Explore lessons and chapters in ${title}.`;

  return buildMetadata({
    title,
    description,
    path: `/classes/${classSlug}`,
  });
}

export default async function ClassPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { classSlug } = await props.params;
  const searchParams = await props.searchParams;
  const isPreview = await resolvePreview(searchParams);

  const c = await getClassBySlug(classSlug, { draft: isPreview });

  if (!c) return notFound();

  const cleanTitle = (value?: string | null, fallback = "Untitled lesson") => {
    const raw = (value ?? "").trim();
    const lowered = raw.toLowerCase();
    const bad = new Set([
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
    if (
      !raw ||
      bad.has(lowered) ||
      /^[a-z]{1,3}$/i.test(raw) ||
      /^(.)\1{2,}$/i.test(raw)
    ) {
      return fallback;
    }
    return raw;
  };

  const chapters: ChapterDoc[] = Array.isArray(c.chapters)
    ? (c.chapters as ChapterDoc[])
    : [];
  const visibleChapters = chapters
    .filter(chapterHasReadableLessons)
    .sort(byChapterNumberThenTitle);
  const totalLessons = visibleChapters.reduce((count, chapter) => {
    const lessons = (chapter as ChapterDoc & { lessons?: LessonDoc[] }).lessons;
    return count + (Array.isArray(lessons) ? lessons.length : 0);
  }, 0);
  const chapterCards = visibleChapters.map((chapter) => {
    const rawLessons =
      (chapter as ChapterDoc & { lessons?: LessonDoc[] }).lessons ?? [];
    const hasLessonOrder = rawLessons.some(
      (lesson) => typeof (lesson as LessonDoc).order === "number"
    );
    const lessons = hasLessonOrder
      ? [...rawLessons].sort(byOrderThenTitle)
      : rawLessons;
    return {
      id: String(chapter.id),
      title: cleanTitle(chapter.title, "Untitled chapter"),
      slug: chapter.slug ?? "",
      chapterNumber: chapter.chapterNumber ?? null,
      lessons: lessons
        .filter((lesson) => Boolean(lesson.slug))
        .map((lesson) => {
          const layout = Array.isArray(lesson.layout) ? lesson.layout : [];
          const hasQuizBlock = layout.some(
            (block) => block.blockType === "quizBlock"
          );
          const hasVideoBlock = layout.some(
            (block) => block.blockType === "videoBlock"
          );
          return {
            id: String(lesson.id),
            slug: lesson.slug ?? "",
            title: cleanTitle(lesson.title, "Untitled lesson"),
            hasQuiz: hasQuizBlock || Boolean(lesson.assessment?.quiz),
            hasVideo: hasVideoBlock,
          };
        }),
    };
  });

  const estimateMinutes = (lesson: {
    hasQuiz: boolean;
    hasVideo: boolean;
  }) => {
    if (lesson.hasQuiz) return 12;
    if (lesson.hasVideo) return 10;
    return 8;
  };

  const lessonTimeSum = chapterCards.reduce((sum, chapter) => {
    return (
      sum +
      chapter.lessons.reduce(
        (chapterSum, lesson) => chapterSum + estimateMinutes(lesson),
        0
      )
    );
  }, 0);

  const firstAvailableChapter = chapterCards.find(
    (chapter) => chapter.lessons.length > 0
  );
  const firstAvailableLesson = firstAvailableChapter?.lessons[0] ?? null;
  const firstLessonHref =
    firstAvailableLesson && firstAvailableLesson.slug
      ? `/classes/${classSlug}/lessons/${firstAvailableLesson.slug}`
      : null;

  const firstLessonType = firstAvailableLesson
    ? firstAvailableLesson.hasQuiz
      ? "Quiz"
      : firstAvailableLesson.hasVideo
        ? "Video"
        : "Reading"
    : null;

  const firstLessonSequence =
    firstAvailableChapter && firstAvailableLesson
      ? `${firstAvailableChapter.chapterNumber ?? 1}.1`
      : null;

  const formatTotalTime = (mins: number) => {
    if (mins <= 0) return null;
    if (mins < 60) return `~${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    if (remainder === 0) return `~${hours} hr`;
    return `~${hours} hr ${remainder} min`;
  };

  const totalTimeLabel = formatTotalTime(lessonTimeSum);

  const flatLessons = chapterCards.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      href: `/classes/${classSlug}/lessons/${lesson.slug}`,
    }))
  );

  return (
    <main className="min-w-0 overflow-x-hidden">
      <ScrollToTopOnMount />
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <article className="space-y-6">
          <header className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Course
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {c.title}
              </h1>
              {c.description ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              ) : null}
            </div>

            {visibleChapters.length > 0 ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {visibleChapters.length}
                  </span>{" "}
                  {visibleChapters.length === 1 ? "chapter" : "chapters"}
                  <span className="mx-1.5 text-border">·</span>
                  <span className="font-medium text-foreground">
                    {totalLessons}
                  </span>{" "}
                  {totalLessons === 1 ? "lesson" : "lessons"}
                  {totalTimeLabel ? (
                    <>
                      <span className="mx-1.5 text-border">·</span>
                      <span className="font-medium text-foreground">
                        {totalTimeLabel}
                      </span>
                    </>
                  ) : null}
                </p>

                {firstLessonHref ? (
                  <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                    <Button asChild>
                      <Link href={firstLessonHref}>
                        Start course
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    {firstAvailableLesson ? (
                      <div className="max-w-[18rem] text-left sm:text-right">
                        <p className="text-[13px] font-medium text-foreground">
                          Start with {firstAvailableLesson.title}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {[
                            firstAvailableChapter?.chapterNumber
                              ? `Chapter ${firstAvailableChapter.chapterNumber}`
                              : null,
                            firstLessonSequence
                              ? `Lesson ${firstLessonSequence}`
                              : null,
                            firstLessonType,
                            firstAvailableLesson
                              ? `~${estimateMinutes(firstAvailableLesson)} min`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <ClassProgressSummary
              classId={c.id}
              classTitle={c.title}
              totalLessons={totalLessons}
              lessons={flatLessons}
              firstLessonHref={firstLessonHref}
            />
          </header>

          <ClassChapterBrowser
            classSlug={classSlug}
            classId={String(c.id)}
            chapters={chapterCards}
          />

          {visibleChapters.length === 0 ? (
            <p className="text-muted-foreground">No chapters available yet.</p>
          ) : null}
        </article>
      </div>
    </main>
  );
}

export const revalidate = 60;
