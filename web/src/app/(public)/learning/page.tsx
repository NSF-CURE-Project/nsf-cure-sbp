import {
  chapterHasReadableLessons,
  getClassesTree,
} from "@/lib/payloadSdk/classes";
import type { ChapterDoc, ClassDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { practiceEnabled, problems } from "@/lib/practice/library";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";
import {
  LearningPersonalization,
  type LearningClassSummary,
  type LearningLessonIndexEntry,
  type LearningPracticeSummary,
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

  const isPracticeEnabled = practiceEnabled();
  const practiceSummary: LearningPracticeSummary = {
    enabled: isPracticeEnabled,
    totalProblems: isPracticeEnabled ? problems.length : 0,
  };

  return (
    <div className="mx-auto w-full pb-12 pt-2 sm:pt-3 lg:pb-16">
      <LearningPersonalization
        lessonIndex={lessonIndex}
        classSummaries={classSummaries}
        practiceSummary={practiceSummary}
      />
    </div>
  );
}
