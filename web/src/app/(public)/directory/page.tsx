import React from "react";
import { draftMode } from "next/headers";
import type { ChapterDoc, ClassDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { getClassesTree } from "@/lib/payloadSdk/classes";
import { getPages, type PageDoc } from "@/lib/payloadSdk/pages";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Site Directory",
  description: "Directory of all public pages for NSF CURE SBP.",
  path: "/directory",
});

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

type ChapterLike = ChapterDoc & { lessons?: LessonDoc[] };

const isChapterDoc = (value: ChapterDoc | string): value is ChapterDoc =>
  typeof value === "object" && value !== null && "slug" in value;

const isLessonDoc = (value: LessonDoc | string): value is LessonDoc =>
  typeof value === "object" && value !== null && "slug" in value;

const staticPages = [
  { title: "Home", href: "/" },
  { title: "Search", href: "/search" },
];

export default async function DirectoryPage() {
  const { isEnabled: isPreview } = await draftMode();
  const classes: ClassDoc[] = await getClassesTree({ draft: isPreview }).catch(
    () => []
  );
  const pages: PageDoc[] = await getPages({ draft: isPreview }).catch(() => []);
  const mainPages = pages.filter((page) => page.slug && page.slug !== "home");

  return (
    <div
      className="mx-auto w-full max-w-[var(--content-max)] px-6"
      style={{ "--content-max": "100%" } as React.CSSProperties}
    >
      <header>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Site Directory
        </h1>
        <p className="mt-3 text-muted-foreground leading-7">
          All public pages, organized by section.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-3">Main Pages</h2>
        <ul className="space-y-2 text-base">
          {staticPages.map((page) => (
            <li key={page.href}>
              <a
                className="text-foreground hover:text-primary transition-colors"
                href={page.href}
              >
                {page.title}
              </a>
            </li>
          ))}
          {mainPages.map((page) => (
            <li key={page.id}>
              <a
                className="text-foreground hover:text-primary transition-colors"
                href={`/${page.slug}`}
              >
                {page.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-3">Classes</h2>
        {classes.length ? (
          <ul className="space-y-5">
            {classes.map((cls) => {
              const chapters = (cls.chapters ?? []).filter(
                isChapterDoc
              ) as ChapterLike[];
              return (
                <li key={cls.id}>
                  <a
                    className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                    href={`/classes/${cls.slug}`}
                  >
                    {cls.title}
                  </a>

                  {chapters.length ? (
                    <ul className="mt-2 space-y-2 pl-5 text-sm text-muted-foreground">
                      {chapters.map((chapter) => {
                        const lessons = (chapter.lessons ?? []).filter(
                          isLessonDoc
                        );
                        return (
                          <li key={chapter.id}>
                            <a
                              className="text-foreground hover:text-primary transition-colors"
                              href={`/classes/${cls.slug}/chapters/${chapter.slug}`}
                            >
                              {chapter.title}
                            </a>

                            {lessons.length ? (
                              <ul className="mt-1 space-y-1 pl-5 text-sm text-muted-foreground">
                                {lessons.map((lesson) => (
                                  <li key={lesson.id}>
                                    <a
                                      className="hover:text-primary transition-colors"
                                      href={`/classes/${cls.slug}/lessons/${lesson.slug}`}
                                    >
                                      {lesson.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No chapters available yet.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">No classes available yet.</p>
        )}
      </section>
    </div>
  );
}
