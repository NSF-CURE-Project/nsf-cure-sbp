import { getClassesTree } from "@/lib/payloadSdk/classes";
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
  description: "Browse all classes and track your learning progress.",
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
      ? (cls.chapters as ChapterWithLessons[])
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
    <main className="mx-auto w-full max-w-[var(--content-max,110ch)] px-6 pt-6 pb-12">
      <header className="mb-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Learning Portal
        </h1>
      </header>

      <LearningPersonalization
        lessonIndex={lessonIndex}
        classSummaries={classSummaries}
      />
    </main>
  );
}
