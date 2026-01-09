import { notFound } from "next/navigation";
import { getClassBySlug } from "@/lib/payloadSdk/classes";
import Link from "next/link";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";
import type { ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { ClassProgressSummary } from "@/components/progress/ClassProgressSummary";

type Params = Promise<{ classSlug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// --- Metadata ---
export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { classSlug } = await props.params;
  const searchParams = await props.searchParams;
  const isPreview = await resolvePreview(searchParams);

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
  const searchParams = await props.searchParams;
  const isPreview = await resolvePreview(searchParams);

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
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{c.title}</h1>
        {c.description ? (
          <p className="mt-2 text-muted-foreground">{c.description}</p>
        ) : null}
        <ClassProgressSummary
          classId={c.id}
          classTitle={c.title}
          totalLessons={totalLessons}
        />
      </div>

      <div className="space-y-6">
        {chapters.map((chapter) => {
          const lessons =
            (chapter as ChapterDoc & { lessons?: LessonDoc[] }).lessons ?? [];
          const chapterSlug = chapter.slug ?? "";
          return (
            <section key={String(chapter.id)} className="space-y-3">
              <div className="flex items-center justify-between">
                <Link
                  href={`/classes/${classSlug}/chapters/${chapterSlug}`}
                  className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {chapter.title}
                </Link>
                {chapterSlug ? (
                  <Link
                    href={`/classes/${classSlug}/chapters/${chapterSlug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    View chapter
                  </Link>
                ) : null}
              </div>
              {lessons.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {lessons.map((lesson) => (
                    <li key={String(lesson.id)}>
                      <Link
                        href={`/classes/${classSlug}/lessons/${lesson.slug}`}
                        className="block rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground transition hover:border-primary/60 hover:bg-muted/30"
                      >
                        {lesson.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No lessons yet.</p>
              )}
            </section>
          );
        })}
        {chapters.length === 0 ? (
          <p className="text-muted-foreground">No chapters available yet.</p>
        ) : null}
      </div>
    </article>
  );
}

// ISR (revalidate every 60s)
export const revalidate = 60;
