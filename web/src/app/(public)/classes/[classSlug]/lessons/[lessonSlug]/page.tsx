// src/app/(public)/classes/[classSlug]/lessons/[lessonSlug]/page.tsx
import { notFound } from "next/navigation";
import { LivePreviewLesson } from "@/components/live-preview/LivePreviewLesson";
import { resolveLessonForClass } from "@/lib/payloadSdk/resolvers";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

type RouteParams = { classSlug: string; lessonSlug: string };
type PageProps = {
  params: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LessonPage({ params, searchParams }: PageProps) {
  const { classSlug, lessonSlug } = await params;
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);

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
            hrefPrefix: `/classes/${classSlug}/lessons`,
          }}
          breadcrumb={{
            classTitle:
              typeof resolved.class.title === "string"
                ? resolved.class.title
                : null,
            classSlug,
            chapterTitle:
              typeof resolved.chapter.title === "string"
                ? resolved.chapter.title
                : null,
            chapterSlug:
              typeof resolved.chapter.slug === "string"
                ? resolved.chapter.slug
                : null,
            chapterNumber:
              typeof resolved.chapter.chapterNumber === "number"
                ? resolved.chapter.chapterNumber
                : null,
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
  const { classSlug, lessonSlug } = await params;
  const isPreview = await resolvePreview();
  const resolved = await resolveLessonForClass(classSlug, lessonSlug, {
    draft: isPreview,
    revalidate: 0,
  });
  if (!resolved) {
    return buildMetadata({
      title: "Lesson",
      description: "Lesson content.",
      path: `/classes/${classSlug}/lessons/${lessonSlug}`,
    });
  }

  const title = resolved.lesson.title ?? "Lesson";
  const canonicalSlug =
    typeof resolved.lesson.slug === "string" ? resolved.lesson.slug : lessonSlug;
  return buildMetadata({
    title,
    description: `Lesson content for ${title}.`,
    path: `/classes/${classSlug}/lessons/${canonicalSlug}`,
  });
}
