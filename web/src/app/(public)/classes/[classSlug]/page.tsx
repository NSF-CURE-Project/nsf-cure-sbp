import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getClassBySlug } from "@/lib/payloadSdk/classes";
import { buildMetadata } from "@/lib/seo";
import type { ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { ClassProgressSummary } from "@/components/progress/ClassProgressSummary";

type Params = Promise<{ classSlug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// --- Metadata ---
export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { classSlug } = await props.params;
  const { isEnabled: isPreview } = await draftMode();

  const c = await getClassBySlug(classSlug, { draft: isPreview });
  const title = c?.title ?? "Class";
  const description =
    typeof c?.description === "string" && c.description.trim()
      ? c.description
      : `Explore lessons and chapters in ${title}.`;

  return buildMetadata({
    title,
    description,
    path: `/classes/${classSlug}`,
  });
}

// --- Page ---
export default async function ClassPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { classSlug } = await props.params;
  const { isEnabled: isPreview } = await draftMode();

  const c = await getClassBySlug(classSlug, { draft: isPreview });

  if (!c) return notFound();

  const chapters: ChapterDoc[] = Array.isArray(c.chapters)
    ? (c.chapters as ChapterDoc[])
    : [];
  const totalLessons = chapters.reduce((count, chapter) => {
    const lessons = (chapter as ChapterDoc & { lessons?: LessonDoc[] }).lessons;
    return count + (Array.isArray(lessons) ? lessons.length : 0);
  }, 0);

  return (
    <article>
      <h1 className="text-3xl font-bold">{c.title}</h1>
      <ClassProgressSummary
        classId={c.id}
        classTitle={c.title}
        totalLessons={totalLessons}
      />
    </article>
  );
}

// ISR (revalidate every 60s)
export const revalidate = 60;
