// src/app/(public)/classes/[classSlug]/chapters/[chapterSlug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeHtml } from "@/components/ui/safeHtml";
import { getChapterBySlug } from "@/lib/payloadSdk/chapters";
import type { ChapterDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

type RouteParams = { classSlug: string; chapterSlug: string };
type PageProps = {
  params: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type NormalizedLesson = { title: string; slug: string };
type NormalizedChapter = {
  title: string;
  slug: string;
  classSlug: string | null;
  objective?: string | null;
  lessons: NormalizedLesson[];
};

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

function getChapterClassSlug(chapter: ChapterDoc | null): string | null {
  if (!chapter) return null;
  const c = chapter as ChapterDoc & { class?: { slug?: string } | null };

  if (c.class && typeof c.class === "object" && "slug" in c.class) {
    return c.class.slug as string;
  }

  return null;
}

function normalizeChapter(
  chapter: ChapterDoc | null
): NormalizedChapter | null {
  if (!chapter) return null;

  const c = chapter as ChapterDoc & {
    objective?: string;
    lessons?: LessonDoc[];
  };

  const title =
    typeof c.title === "string" && c.title.trim()
      ? c.title
      : "Untitled chapter";
  const slug = typeof c.slug === "string" ? c.slug : "";

  const objective =
    typeof c.objective === "string" ? (c.objective as string) : null;

  const classSlug = getChapterClassSlug(chapter);

  const rawLessons = Array.isArray(c.lessons) ? c.lessons : [];
  const hasLessonOrder = rawLessons.some(
    (lesson) => typeof (lesson as LessonDoc).order === "number"
  );
  const lessons: NormalizedLesson[] = (hasLessonOrder
    ? [...rawLessons].sort(byOrderThenTitle)
    : rawLessons
  )
    .map((lesson) => {
      const l = lesson as LessonDoc;
      return {
        title:
          typeof l?.title === "string" && l.title.trim()
            ? l.title
            : "Untitled lesson",
        slug: typeof l?.slug === "string" ? l.slug : "",
      };
    })
    .filter((l) => l.slug); // drop empty slugs

  return {
    title,
    slug,
    classSlug,
    objective,
    lessons,
  };
}

async function fetchChapterForClass(classSlug: string, chapterSlug: string) {
  const chapter = await getChapterBySlug(chapterSlug);
  const normalized = normalizeChapter(chapter);

  if (!normalized)
    return { mod: null as NormalizedChapter | null, raw: chapter };

  const matchesClass =
    normalized.classSlug &&
    normalized.classSlug.toLowerCase() === classSlug.toLowerCase();

  return {
    mod: matchesClass ? normalized : null,
    raw: chapter,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { classSlug, chapterSlug } = await params;
  const { mod } = await fetchChapterForClass(classSlug, chapterSlug);
  if (!mod) {
    return buildMetadata({
      title: "Chapter",
      description: "Chapter overview.",
      path: `/classes/${classSlug}/chapters/${chapterSlug}`,
    });
  }

  return buildMetadata({
    title: mod.title,
    description: `Lessons and objectives for ${mod.title}.`,
    path: `/classes/${classSlug}/chapters/${mod.slug}`,
  });
}

export default async function ChapterOverviewPage({
  params,
  searchParams,
}: PageProps) {
  const { classSlug, chapterSlug } = await params;
  const sp = (await searchParams) ?? {};
  const DEBUG = "debug" in sp;

  const { mod, raw } = await fetchChapterForClass(classSlug, chapterSlug);

  if (!mod) {
    if (DEBUG) {
      return (
        <pre className="p-4 text-xs border rounded max-w-3xl mx-auto my-8 whitespace-pre-wrap">
          {`DEBUG: No chapter matched
classSlug: ${classSlug}
chapterSlug: ${chapterSlug}

Raw chapter doc from Payload:
${JSON.stringify(raw, null, 2).slice(0, 4000)}`}
        </pre>
      );
    }
    return notFound();
  }

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 sm:px-6 lg:px-8 py-6">
        <article className="space-y-8">
          <h1 className="text-3xl font-bold">{mod.title}</h1>

          {mod.objective && (
            <section className="bg-muted/50 border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-2">
                Chapter Objectives
              </h2>
              <SafeHtml
                html={mod.objective}
                className="prose dark:prose-invert max-w-none text-sm"
              />
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold mb-3">
              Lessons in this Chapter
            </h2>
            <ul className="space-y-2">
              {mod.lessons.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/classes/${classSlug}/lessons/${l.slug}`}
                    className="block rounded-lg border hover:border-foreground/30 p-3"
                  >
                    {l.title}
                  </Link>
                </li>
              ))}
              {mod.lessons.length === 0 && (
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
