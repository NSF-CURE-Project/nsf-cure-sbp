import { notFound } from "next/navigation";
import { LivePreviewLesson } from "@/components/live-preview/LivePreviewLesson";
import {
  getLessonBySlug,
  getLessonsForChapter,
} from "@/lib/payloadSdk/lessons";
import type { LessonDoc } from "@/lib/payloadSdk/types";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

type RouteParams = { lessonSlug: string };

export default async function PreviewLessonPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { lessonSlug } = await params;
  const isPreview = await resolvePreview(searchParams);

  const lesson: LessonDoc | null = await getLessonBySlug(lessonSlug, {
    draft: isPreview,
  }).catch(() => null);

  if (!lesson) return notFound();

  const chapterValue = lesson.chapter as
    | { id?: string }
    | string
    | null
    | undefined;
  const chapterId =
    typeof chapterValue === "object" && chapterValue !== null
      ? chapterValue.id
      : chapterValue;
  const chapterLessons = chapterId
    ? await getLessonsForChapter(chapterId, { draft: isPreview })
    : [];
  const lessonNav = {
    lessons: chapterLessons
      .map((item) => ({
        slug: item.slug ?? "",
        title: item.title ?? "Untitled lesson",
      }))
      .filter((item) => item.slug),
    currentSlug: lesson.slug ?? lessonSlug,
    hrefPrefix: "/preview/lesson",
  };

  return (
    <LivePreviewLesson
      initialData={lesson}
      className="mx-auto w-full max-w-[var(--content-max,100ch)] -mt-3 pt-2 pb-10 px-4 sm:-mt-4"
      lessonNav={lessonNav}
    />
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
