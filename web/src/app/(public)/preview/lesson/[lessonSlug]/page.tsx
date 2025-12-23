import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { LivePreviewLesson } from "@/components/live-preview/LivePreviewLesson";
import { getLessonBySlug } from "@/lib/payloadSdk/lessons";
import type { LessonDoc } from "@/lib/payloadSdk/types";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

type RouteParams = { lessonSlug: string };

export default async function PreviewLessonPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { lessonSlug } = await params;
  const { isEnabled: isPreview } = await draftMode();

  const lesson: LessonDoc | null = await getLessonBySlug(lessonSlug, {
    draft: isPreview,
  }).catch(() => null);

  if (!lesson) return notFound();

  return (
    <LivePreviewLesson
      initialData={lesson}
      className="mx-auto w-full max-w-[var(--content-max,100ch)] py-10 px-4"
    />
  );
}
