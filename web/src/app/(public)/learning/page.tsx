import Link from "next/link";
import {
  chapterHasReadableLessons,
  getClassesTree,
} from "@/lib/payloadSdk/classes";
import type { ChapterDoc, ClassDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";
import {
  LearningPersonalization,
  type LearningClassSummary,
  type LearningLessonIndexEntry,
} from "@/components/learning/LearningPersonalization";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Learning",
  description:
    "Continue coursework, explore classes, and track your learning progress.",
  path: "/learning",
});

type ChapterWithLessons = ChapterDoc & { lessons?: LessonDoc[] };

export default async function LearningPage() {
  const isPreview = await resolvePreview();
  const classes: ClassDoc[] = await getClassesTree({ draft: isPreview }).catch(
    () => []
  );
  const lessonIndex: LearningLessonIndexEntry[] = [];
  const classSummaries: LearningClassSummary[] = [];
  let lessonOrder = 0;

  classes.forEach((cls) => {
    const classSlug = cls.slug ?? "";
    const classTitle = cls.title ?? "Untitled class";
    const classLessons: LearningLessonIndexEntry[] = [];
    const chapters: ChapterWithLessons[] = Array.isArray(cls.chapters)
      ? (cls.chapters as ChapterWithLessons[]).filter(chapterHasReadableLessons)
      : [];

    chapters.forEach((chapter) => {
      const chapterSlug = chapter.slug ?? "";
      const chapterTitle = chapter.title ?? "Untitled chapter";
      const lessons = Array.isArray(chapter.lessons)
        ? (chapter.lessons as LessonDoc[])
        : [];

      lessons.forEach((lesson) => {
        if (!classSlug || !chapterSlug || !lesson?.slug || !lesson?.id) return;
        const entry: LearningLessonIndexEntry = {
          id: String(lesson.id),
          title: lesson.title ?? "Untitled lesson",
          slug: lesson.slug,
          classSlug,
          classTitle,
          chapterSlug,
          chapterTitle,
          order: lessonOrder,
        };
        lessonIndex.push(entry);
        classLessons.push(entry);
        lessonOrder += 1;
      });
    });

    classSummaries.push({
      id: String(cls.id),
      slug: classSlug,
      title: classTitle,
      description: cls.description ?? null,
      totalChapters: chapters.length,
      lessons: classLessons,
    });
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] pb-14 pt-2 sm:pt-4 lg:pb-20">
      <header className="relative isolate mb-4 overflow-hidden pb-1 sm:mb-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-8 -z-10 hidden h-28 w-[min(52vw,620px)] text-primary/[0.075] sm:block"
        >
          <svg
            viewBox="0 0 640 150"
            fill="none"
            className="size-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <g stroke="currentColor" strokeWidth="1.25">
              <path d="M4 126H636M20 96H622M72 66H596M168 36H548" />
              <path
                d="M36 22V142M126 18V142M216 14V142M306 10V142M396 14V142M486 18V142M576 22V142"
                strokeDasharray="5 7"
              />
              <path d="M76 126V96M166 126V66M256 126V96M346 126V66M436 126V96M526 126V66M616 126V96" />
              <path d="M76 96L166 66L256 96L346 66L436 96L526 66L616 96" />
              <path d="M76 96H256M256 96H436M436 96H616" />
              <path d="M166 66H346M346 66H526" />
            </g>
          </svg>
        </div>
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[38px] lg:text-[40px]">
          Learning Portal
        </h1>
      </header>

      {process.env.ENABLE_PRACTICE_LIBRARY === "true" || process.env.NODE_ENV === "development" ? (
        <Link href="/practice" className="mb-5 inline-block text-primary underline underline-offset-4">
          Engineering Practice
        </Link>
      ) : null}
      <LearningPersonalization
        lessonIndex={lessonIndex}
        classSummaries={classSummaries}
      />
    </div>
  );
}
