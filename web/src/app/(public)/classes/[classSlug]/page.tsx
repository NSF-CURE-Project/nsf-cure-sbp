import { notFound } from "next/navigation";
import { getClassBySlug } from "@/lib/payloadSdk/classes";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";
import type { ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { ClassProgressSummary } from "@/components/progress/ClassProgressSummary";
import { ClassChapterBrowser } from "@/components/classes/ClassChapterBrowser";

type Params = Promise<{ classSlug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const byOrderThenTitle = (
  a: { order?: number | null; title?: string | null },
  b: { order?: number | null; title?: string | null }
) => {
  const orderA = typeof a.order === "number" ? a.order : Number(a.order ?? 0);
  const orderB = typeof b.order === "number" ? b.order : Number(b.order ?? 0);
  if (orderA !== orderB) return orderA - orderB;
  const titleA = typeof a.title === "string" ? a.title.toLowerCase() : "";
  const titleB = typeof b.title === "string" ? b.title.toLowerCase() : "";
  return titleA.localeCompare(titleB);
};

const byChapterNumberThenTitle = (
  a: { chapterNumber?: number | null; title?: string | null },
  b: { chapterNumber?: number | null; title?: string | null }
) => {
  const numA = typeof a.chapterNumber === "number" ? a.chapterNumber : null;
  const numB = typeof b.chapterNumber === "number" ? b.chapterNumber : null;
  if (numA != null && numB != null && numA !== numB) return numA - numB;
  if (numA != null && numB == null) return -1;
  if (numA == null && numB != null) return 1;
  const titleA = typeof a.title === "string" ? a.title.toLowerCase() : "";
  const titleB = typeof b.title === "string" ? b.title.toLowerCase() : "";
  return titleA.localeCompare(titleB);
};

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

  const cleanTitle = (value?: string | null, fallback = "Untitled lesson") => {
    const raw = (value ?? "").trim();
    const lowered = raw.toLowerCase();
    const bad = new Set([
      "test",
      "todo",
      "temp",
      "draft",
      "untitled",
      "asas",
      "dsd",
      "asd",
      "qwe",
      "zxc",
    ]);
    if (
      !raw ||
      bad.has(lowered) ||
      /^[a-z]{1,3}$/i.test(raw) ||
      /^(.)\1{2,}$/i.test(raw)
    ) {
      return fallback;
    }
    return raw;
  };

  const chapters: ChapterDoc[] = Array.isArray(c.chapters)
    ? (c.chapters as ChapterDoc[])
    : [];
  const sortedChapters = [...chapters].sort(byChapterNumberThenTitle);
  const totalLessons = chapters.reduce((count, chapter) => {
    const lessons = (chapter as ChapterDoc & { lessons?: LessonDoc[] }).lessons;
    return count + (Array.isArray(lessons) ? lessons.length : 0);
  }, 0);
  const chapterCards = sortedChapters.map((chapter) => {
    const rawLessons =
      (chapter as ChapterDoc & { lessons?: LessonDoc[] }).lessons ?? [];
    const hasLessonOrder = rawLessons.some(
      (lesson) => typeof (lesson as LessonDoc).order === "number"
    );
    const lessons = hasLessonOrder
      ? [...rawLessons].sort(byOrderThenTitle)
      : rawLessons;
    return {
      id: String(chapter.id),
      title: cleanTitle(chapter.title, "Untitled chapter"),
      slug: chapter.slug ?? "",
      chapterNumber: chapter.chapterNumber ?? null,
      lessons: lessons
        .filter((lesson) => Boolean(lesson.slug))
        .map((lesson) => {
          const layout = Array.isArray(lesson.layout) ? lesson.layout : [];
          const hasQuizBlock = layout.some(
            (block) => block.blockType === "quizBlock"
          );
          const hasProblemBlock = layout.some(
            (block) => block.blockType === "problemSetBlock"
          );
          const hasVideoBlock = layout.some(
            (block) => block.blockType === "videoBlock"
          );
          return {
            id: String(lesson.id),
            slug: lesson.slug ?? "",
            title: cleanTitle(lesson.title, "Untitled lesson"),
            hasQuiz: hasQuizBlock || Boolean(lesson.assessment?.quiz),
            hasProblemSet: hasProblemBlock,
            hasVideo: hasVideoBlock,
          };
        }),
    };
  });

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 sm:px-6 lg:px-8 py-6">
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
            <ClassChapterBrowser
              classSlug={classSlug}
              classId={String(c.id)}
              chapters={chapterCards}
            />
            {chapters.length === 0 ? (
              <p className="text-muted-foreground">
                No chapters available yet.
              </p>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}

// ISR (revalidate every 60s)
export const revalidate = 60;
