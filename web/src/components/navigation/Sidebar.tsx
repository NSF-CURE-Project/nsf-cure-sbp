import { getClassesTree } from "@/lib/payloadSdk/classes";
import type { ClassDoc, ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";
import SidebarClient from "@/components/navigation/SidebarClient";

export default async function Sidebar() {
  const classes = await getClassesTree();
  const navClasses = normalizeClassesForSidebar(classes);
  return <SidebarClient classes={navClasses} />;
}

function normalizeClassesForSidebar(classes: ClassDoc[]) {
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

  return [...classes].sort(byOrderThenTitle).map((cls) => {
    const title =
      typeof cls.title === "string" && cls.title.trim()
        ? cls.title
        : "Untitled class";

    const slug = typeof cls.slug === "string" ? cls.slug : "";

    const chapters: ChapterDoc[] = Array.isArray(cls.chapters)
      ? (cls.chapters as ChapterDoc[])
      : [];

    const modules = [...chapters].sort(byChapterNumberThenTitle).map((ch) => {
      const chapterTitle =
        typeof ch?.title === "string" && ch.title.trim()
          ? ch.title
          : "Untitled chapter";

      const chapterSlug = typeof ch?.slug === "string" ? ch.slug : "";

      const rawLessons: LessonDoc[] = Array.isArray(ch?.lessons)
        ? (ch.lessons as LessonDoc[])
        : [];

      const lessons = [...rawLessons]
        .sort(byOrderThenTitle)
        .map((l) => ({
          title:
            typeof l?.title === "string" && l.title.trim()
              ? l.title
              : "Untitled lesson",
          slug: typeof l?.slug === "string" ? l.slug : "",
        }))
        .filter((l) => l.slug);

      return {
        title: chapterTitle,
        slug: chapterSlug,
        lessons,
        chapterNumber:
          typeof ch?.chapterNumber === "number" ? ch.chapterNumber : null,
      };
    });

    return {
      title,
      slug,
      modules,
    };
  });
}
