// src/app/(public)/classes/[classSlug]/lessons/[lessonSlug]/page.tsx
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { LivePreviewLesson } from "@/components/live-preview/LivePreviewLesson";
import { getLessonBySlug } from "@/lib/payloadSdk/lessons";
import type { LessonDoc } from "@/lib/payloadSdk/types";

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
  options?: { draft?: boolean },
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

export default async function LessonPage({ params }: PageProps) {
  const { classSlug, lessonSlug } = await params;
  const { isEnabled: isPreview } = await draftMode();

  const lesson = await fetchLessonForClass(classSlug, lessonSlug, {
    draft: isPreview,
  });
  if (!lesson) return notFound();

  return (
    <LivePreviewLesson
      initialData={lesson}
      className="mx-auto w-full max-w-[var(--content-max,100ch)] py-10 px-4"
    />
  );
}
