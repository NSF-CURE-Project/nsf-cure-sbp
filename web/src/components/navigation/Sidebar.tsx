import { getClassesTree } from "@/lib/payloadSdk/classes";
import type { ClassDoc, ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";
import SidebarClient from "@/components/navigation/SidebarClient";

export default async function Sidebar() {
  const classes = await getClassesTree();
  const navClasses = normalizeClassesForSidebar(classes);
  return <SidebarClient classes={navClasses} />;
}

function normalizeClassesForSidebar(classes: ClassDoc[]) {
  return classes.map((cls) => {
    const title =
      typeof cls.title === "string" && cls.title.trim()
        ? cls.title
        : "Untitled class";

    const slug = typeof cls.slug === "string" ? cls.slug : "";

    const chapters: ChapterDoc[] = Array.isArray(cls.chapters)
      ? (cls.chapters as ChapterDoc[])
      : [];

    const modules = chapters.map((ch) => {
      const chapterTitle =
        typeof ch?.title === "string" && ch.title.trim()
          ? ch.title
          : "Untitled chapter";

      const chapterSlug = typeof ch?.slug === "string" ? ch.slug : "";

      const rawLessons: LessonDoc[] = Array.isArray(ch?.lessons)
        ? (ch.lessons as LessonDoc[])
        : [];

      const lessons = rawLessons
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
      };
    });

    return {
      title,
      slug,
      modules,
    };
  });
}
