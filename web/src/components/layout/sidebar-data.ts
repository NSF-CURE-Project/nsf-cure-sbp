import { cache } from "react";

import { getClassesTree } from "@/lib/payloadSdk/classes";
import type { ClassDoc, ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";

type SidebarLesson = { id: string | number; title: string; slug: string };
type SidebarModule = {
  title: string;
  slug: string;
  lessons: SidebarLesson[];
  chapterNumber?: number | null;
};
export type SidebarClass = { title: string; slug: string; modules: SidebarModule[] };

const normalizeClassesForSidebar = (classes: ClassDoc[]): SidebarClass[] => {
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

  return [...classes].sort(byOrderThenTitle).map((cls: ClassDoc) => {
    const c = cls as ClassDoc & { chapters?: ChapterDoc[] };

    const title =
      typeof c.title === "string" && c.title.trim()
        ? c.title
        : "Untitled class";

    const slug = typeof c.slug === "string" ? c.slug : "";

    const chapters: ChapterDoc[] = Array.isArray(c.chapters) ? c.chapters : [];

    const modules = [...chapters]
      .sort(byChapterNumberThenTitle)
      .map((chapter) => {
        const ch = chapter as ChapterDoc & { lessons?: LessonDoc[] };
        const chapterTitle =
          typeof ch.title === "string" && ch.title.trim()
            ? ch.title
            : "Untitled chapter";

        const chapterSlug = typeof ch.slug === "string" ? ch.slug : "";
        const chapterNumber =
          typeof ch.chapterNumber === "number" ? ch.chapterNumber : null;

        const rawLessons: LessonDoc[] = Array.isArray(ch.lessons)
          ? ch.lessons
          : [];

        const hasLessonOrder = rawLessons.some(
          (lesson) => typeof (lesson as LessonDoc).order === "number"
        );

        const lessons = (hasLessonOrder ? [...rawLessons].sort(byOrderThenTitle) : rawLessons)
          .map((lesson) => {
            const l = lesson as LessonDoc;
            return {
              id: l.id,
              title:
                typeof l.title === "string" && l.title.trim()
                  ? l.title
                  : "Untitled lesson",
              slug: typeof l.slug === "string" ? l.slug : "",
            };
          })
          .filter((l) => l.slug);

        return {
          title: chapterTitle,
          slug: chapterSlug,
          lessons,
          chapterNumber,
        };
      });

    return {
      title,
      slug,
      modules,
    };
  });
};

export const getSidebarClasses = cache(async (draft: boolean) => {
  const payloadClasses = await getClassesTree({ draft });
  return normalizeClassesForSidebar(payloadClasses);
});
