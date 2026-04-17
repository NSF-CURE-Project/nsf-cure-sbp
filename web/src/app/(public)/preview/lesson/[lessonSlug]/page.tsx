import { notFound } from "next/navigation";
import { LivePreviewLesson } from "@/components/live-preview/LivePreviewLesson";
import { getLessonBySlug } from "@/lib/payloadSdk/lessons";
import { resolveLessonForClass } from "@/lib/payloadSdk/resolvers";
import type { LessonDoc } from "@/lib/payloadSdk/types";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

type RouteParams = { lessonSlug: string };

/**
 * Dig the class slug out of a lesson's populated relationships, without trusting
 * any single shape. Returns null if the lesson has no reachable class.
 */
const findClassSlug = (lesson: LessonDoc): string | null => {
  const direct = (lesson as { class?: unknown }).class;
  if (
    typeof direct === "object" &&
    direct !== null &&
    "slug" in direct &&
    typeof (direct as { slug?: unknown }).slug === "string"
  ) {
    return (direct as { slug: string }).slug;
  }

  const chapter = (lesson as { chapter?: unknown }).chapter;
  if (typeof chapter === "object" && chapter !== null && "class" in chapter) {
    const chapterClass = (chapter as { class?: unknown }).class;
    if (
      typeof chapterClass === "object" &&
      chapterClass !== null &&
      "slug" in chapterClass &&
      typeof (chapterClass as { slug?: unknown }).slug === "string"
    ) {
      return (chapterClass as { slug: string }).slug;
    }
  }

  return null;
};

export default async function PreviewLessonPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lessonSlug } = await params;
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);

  const lesson: LessonDoc | null = await getLessonBySlug(lessonSlug, {
    draft: isPreview,
  }).catch(() => null);
  if (!lesson) return notFound();

  const classSlug = findClassSlug(lesson);
  if (!classSlug) return notFound();

  // Re-resolve via the class tree so orphans can't render even in preview.
  const resolved = await resolveLessonForClass(classSlug, lessonSlug, {
    draft: isPreview,
    revalidate: 0,
  });
  if (!resolved) return notFound();

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 sm:px-6 lg:px-8 py-6">
        <LivePreviewLesson
          initialData={resolved.lesson}
          className="w-full -mt-3 pt-2 pb-10 sm:-mt-4"
          lessonNav={{
            lessons: resolved.siblingLessons,
            currentSlug:
              typeof resolved.lesson.slug === "string"
                ? resolved.lesson.slug
                : lessonSlug,
            hrefPrefix: "/preview/lesson",
          }}
        />
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { lessonSlug } = await params;
  return buildMetadata({
    title: "Lesson Preview",
    description: "Preview lesson content.",
    path: `/preview/lesson/${lessonSlug}`,
    noIndex: true,
  });
}
