// src/app/(public)/classes/[classSlug]/chapters/[chapterSlug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeHtml } from "@/components/ui/safeHtml";
import { resolveChapterForClass } from "@/lib/payloadSdk/resolvers";
import type { ChapterDoc } from "@/lib/payloadSdk/types";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

type RouteParams = { classSlug: string; chapterSlug: string };
type PageProps = {
  params: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getObjective = (chapter: ChapterDoc) => {
  const objective = (chapter as { objective?: unknown }).objective;
  return typeof objective === "string" ? objective : null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { classSlug, chapterSlug } = await params;
  const resolved = await resolveChapterForClass(classSlug, chapterSlug);
  if (!resolved) {
    return buildMetadata({
      title: "Chapter",
      description: "Chapter overview.",
      path: `/classes/${classSlug}/chapters/${chapterSlug}`,
    });
  }

  const title =
    typeof resolved.chapter.title === "string" && resolved.chapter.title.trim()
      ? resolved.chapter.title
      : "Untitled chapter";
  const canonicalSlug =
    typeof resolved.chapter.slug === "string"
      ? resolved.chapter.slug
      : chapterSlug;
  return buildMetadata({
    title,
    description: `Lessons and objectives for ${title}.`,
    path: `/classes/${classSlug}/chapters/${canonicalSlug}`,
  });
}

export default async function ChapterOverviewPage({
  params,
  searchParams,
}: PageProps) {
  const { classSlug, chapterSlug } = await params;
  const sp = (await searchParams) ?? {};
  const DEBUG = "debug" in sp;

  const resolved = await resolveChapterForClass(classSlug, chapterSlug);

  if (!resolved) {
    if (DEBUG) {
      return (
        <pre className="p-4 text-xs border rounded max-w-3xl mx-auto my-8 whitespace-pre-wrap">
          {`DEBUG: No chapter matched in class tree
classSlug: ${classSlug}
chapterSlug: ${chapterSlug}`}
        </pre>
      );
    }
    return notFound();
  }

  const title =
    typeof resolved.chapter.title === "string" && resolved.chapter.title.trim()
      ? resolved.chapter.title
      : "Untitled chapter";
  const objective = getObjective(resolved.chapter);

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 sm:px-6 lg:px-8 py-6">
        <article className="space-y-8">
          <h1 className="text-3xl font-bold">{title}</h1>

          {objective && (
            <section className="bg-muted/50 border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-2">
                Chapter Objectives
              </h2>
              <SafeHtml
                html={objective}
                className="prose dark:prose-invert max-w-none text-sm"
              />
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold mb-3">
              Lessons in this Chapter
            </h2>
            <ul className="space-y-2">
              {resolved.lessons.map((lesson) => (
                <li key={lesson.slug}>
                  <Link
                    href={`/classes/${classSlug}/lessons/${lesson.slug}`}
                    className="block rounded-lg border hover:border-foreground/30 p-3"
                  >
                    {lesson.title}
                  </Link>
                </li>
              ))}
              {resolved.lessons.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  No lessons yet.
                </li>
              )}
            </ul>
          </section>
        </article>
      </div>
    </main>
  );
}
