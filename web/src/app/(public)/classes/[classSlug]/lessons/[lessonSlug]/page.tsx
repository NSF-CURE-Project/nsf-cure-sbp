// src/app/(public)/classes/[classSlug]/lessons/[lessonSlug]/page.tsx
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

type RouteParams = { classSlug: string; lessonSlug: string };
type PageProps = {
  params: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** Try to recover the class.slug from the lesson document (handles a few shapes). */
function getLessonClassSlug(lesson: LessonDoc): string | null {
  const l = lesson as LessonDoc & {
    class?: { slug?: string } | null;
    chapter?: { class?: { slug?: string } | null } | null;
  };

  // Direct class relationship on lesson
  if (l.class && typeof l.class === "object" && "slug" in l.class) {
    return l.class.slug as string;
  }

  // Class via chapter → class
  if (
    l.chapter &&
    typeof l.chapter === "object" &&
    "class" in l.chapter &&
    l.chapter.class &&
    typeof l.chapter.class === "object" &&
    "slug" in l.chapter.class
  ) {
    return l.chapter.class.slug as string;
  }

  return null;
}

async function fetchLessonForClass(
  classSlug: string,
  lessonSlug: string,
  options?: { draft?: boolean }
): Promise<LessonDoc | null> {
  const lesson = await getLessonBySlug(lessonSlug, options);
  if (!lesson) return null;

  const lessonClassSlug = getLessonClassSlug(lesson);

  // If we can detect a class slug and it doesn't match the route, treat as not found
  if (
    lessonClassSlug &&
    lessonClassSlug.toLowerCase() !== classSlug.toLowerCase()
  ) {
    return null;
  }

  return lesson;
}

export default async function LessonPage({ params, searchParams }: PageProps) {
  const { classSlug, lessonSlug } = await params;
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);

  const lesson = await fetchLessonForClass(classSlug, lessonSlug, {
    draft: isPreview,
  });
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
    hrefPrefix: `/classes/${classSlug}/lessons`,
  };

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 sm:px-6 lg:px-8 py-6">
        <LivePreviewLesson
          initialData={lesson}
          className="w-full -mt-3 pt-2 pb-10 sm:-mt-4"
          lessonNav={lessonNav}
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
  const lesson = await fetchLessonForClass(classSlug, lessonSlug, {
    draft: isPreview,
  });
  if (!lesson) {
    return buildMetadata({
      title: "Lesson",
      description: "Lesson content.",
      path: `/classes/${classSlug}/lessons/${lessonSlug}`,
    });
  }

  const title = lesson.title ?? "Lesson";
  return buildMetadata({
    title,
    description: `Lesson content for ${title}.`,
    path: `/classes/${classSlug}/lessons/${lesson.slug ?? lessonSlug}`,
  });
}
