import { getClassBySlug } from "./classes";
import type { ChapterDoc, ClassDoc, LessonDoc } from "./types";

type ResolverOptions = { draft?: boolean; revalidate?: number };

type ChapterWithLessons = ChapterDoc & { lessons?: LessonDoc[] | string[] };

type ClassWithChapters = ClassDoc & { chapters?: ChapterWithLessons[] | string[] };

const isObject = <T extends object>(value: unknown): value is T =>
  typeof value === "object" && value !== null;

const normalize = (value: string) => value.trim().toLowerCase();

const populatedChapters = (
  classDoc: ClassWithChapters
): ChapterWithLessons[] => {
  const chapters = classDoc.chapters;
  if (!Array.isArray(chapters)) return [];
  const result: ChapterWithLessons[] = [];
  for (const entry of chapters as unknown[]) {
    if (isObject<ChapterWithLessons>(entry)) result.push(entry);
  }
  return result;
};

const populatedLessons = (chapter: ChapterWithLessons): LessonDoc[] => {
  const lessons = chapter.lessons;
  if (!Array.isArray(lessons)) return [];
  const result: LessonDoc[] = [];
  for (const entry of lessons as unknown[]) {
    if (isObject<LessonDoc>(entry)) result.push(entry);
  }
  return result;
};

const orderedLessons = (chapter: ChapterWithLessons): LessonDoc[] => {
  const lessons = populatedLessons(chapter);
  const hasOrder = lessons.some(
    (lesson) => typeof lesson.order === "number"
  );
  if (!hasOrder) return lessons;
  return [...lessons].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : Number(a.order ?? 0);
    const orderB = typeof b.order === "number" ? b.order : Number(b.order ?? 0);
    if (orderA !== orderB) return orderA - orderB;
    const titleA = typeof a.title === "string" ? a.title.toLowerCase() : "";
    const titleB = typeof b.title === "string" ? b.title.toLowerCase() : "";
    return titleA.localeCompare(titleB);
  });
};

export type ResolvedLesson = {
  class: ClassDoc;
  chapter: ChapterDoc;
  lesson: LessonDoc;
  siblingLessons: { slug: string; title: string }[];
};

/**
 * Look up a lesson by walking the class's chapter tree top-down.
 * Returns null unless the lesson is actually reachable from the class.
 * This is the single source of truth for "is this lesson part of this class?".
 */
export async function resolveLessonForClass(
  classSlug: string,
  lessonSlug: string,
  options?: ResolverOptions
): Promise<ResolvedLesson | null> {
  if (!classSlug || !lessonSlug) return null;
  const classDoc = (await getClassBySlug(
    classSlug,
    options
  )) as ClassWithChapters | null;
  if (!classDoc) return null;

  const targetSlug = normalize(lessonSlug);

  for (const chapter of populatedChapters(classDoc)) {
    const lessons = orderedLessons(chapter);
    const match = lessons.find(
      (lesson) =>
        typeof lesson.slug === "string" && normalize(lesson.slug) === targetSlug
    );
    if (!match) continue;

    const siblingLessons = lessons
      .flatMap((lesson) => {
        const slug = typeof lesson.slug === "string" ? lesson.slug : "";
        if (!slug) return [];
        const title =
          typeof lesson.title === "string" && lesson.title.trim()
            ? lesson.title
            : "Untitled lesson";
        return [{ slug, title }];
      });

    return {
      class: classDoc,
      chapter,
      lesson: match,
      siblingLessons,
    };
  }

  return null;
}

export type ResolvedChapter = {
  class: ClassDoc;
  chapter: ChapterDoc;
  lessons: { slug: string; title: string }[];
};

/**
 * Look up a chapter by walking the class tree. Orphans are impossible to return.
 */
export async function resolveChapterForClass(
  classSlug: string,
  chapterSlug: string,
  options?: ResolverOptions
): Promise<ResolvedChapter | null> {
  if (!classSlug || !chapterSlug) return null;
  const classDoc = (await getClassBySlug(
    classSlug,
    options
  )) as ClassWithChapters | null;
  if (!classDoc) return null;

  const targetSlug = normalize(chapterSlug);
  const chapter = populatedChapters(classDoc).find(
    (entry) =>
      typeof entry.slug === "string" && normalize(entry.slug) === targetSlug
  );
  if (!chapter) return null;

  const lessons = orderedLessons(chapter).flatMap((lesson) => {
    const slug = typeof lesson.slug === "string" ? lesson.slug : "";
    if (!slug) return [];
    const title =
      typeof lesson.title === "string" && lesson.title.trim()
        ? lesson.title
        : "Untitled lesson";
    return [{ slug, title }];
  });

  return { class: classDoc, chapter, lessons };
}
