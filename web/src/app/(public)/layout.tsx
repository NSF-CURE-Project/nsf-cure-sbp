// src/app/(public)/layout.tsx
import React from "react";
import { cookies, draftMode } from "next/headers";

import PublicLayoutShell from "@/components/layout/PublicLayoutShell";

import { getClassesTree } from "@/lib/payloadSdk/classes";
import type {
  ClassDoc,
  ChapterDoc,
  LessonDoc,
} from "@/lib/payloadSdk/types";

// Ensure this layout is always rendered on the server with fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SidebarLesson = { title: string; slug: string };
type SidebarModule = { title: string; slug: string; lessons: SidebarLesson[] };
type SidebarClass = { title: string; slug: string; modules: SidebarModule[] };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // restore open/closed state if you want
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const { isEnabled: isPreview } = await draftMode();

  const payloadClasses = await getClassesTree({ draft: isPreview });

  // ------ NORMALIZE FOR SIDEBAR (Strapi-style shape) ------
  const sidebarClasses = normalizeClassesForSidebar(payloadClasses);

  return (
    <PublicLayoutShell defaultOpen={defaultOpen} sidebarClasses={sidebarClasses}>
      {children}
    </PublicLayoutShell>
  );
}

/**
 * Map Payload classes → old sidebar ClassItem shape:
 * {
 *   slug, title,
 *   modules: [
 *     { slug, title, lessons: [{ slug, title }] }
 *   ]
 * }
 */
function normalizeClassesForSidebar(classes: ClassDoc[]): SidebarClass[] {
  return classes.map((cls: ClassDoc) => {
    const c = cls as ClassDoc & { chapters?: ChapterDoc[] };

    const title =
      typeof c.title === "string" && c.title.trim()
        ? c.title
        : "Untitled class";

    const slug = typeof c.slug === "string" ? c.slug : "";

    const chapters: ChapterDoc[] = Array.isArray(c.chapters) ? c.chapters : [];

    const modules = chapters.map((chapter) => {
      const ch = chapter as ChapterDoc & { lessons?: LessonDoc[] };
      const chapterTitle =
        typeof ch.title === "string" && ch.title.trim()
          ? ch.title
          : "Untitled chapter";

      const chapterSlug = typeof ch.slug === "string" ? ch.slug : "";

      const rawLessons: LessonDoc[] = Array.isArray(ch.lessons)
        ? ch.lessons
        : [];

      const lessons = rawLessons
        .map((lesson) => {
          const l = lesson as LessonDoc;
          return {
            title:
              typeof l.title === "string" && l.title.trim()
                ? l.title
                : "Untitled lesson",
            slug: typeof l.slug === "string" ? l.slug : "",
          };
        })
        .filter((l) => l.slug); // drop invalid entries

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
