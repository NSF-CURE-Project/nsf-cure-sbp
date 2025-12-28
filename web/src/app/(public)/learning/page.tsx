import Link from "next/link";
import { draftMode } from "next/headers";
import { getClassesTree } from "@/lib/payloadSdk/classes";
import type { ChapterDoc, ClassDoc, LessonDoc } from "@/lib/payloadSdk/types";
import { buildMetadata } from "@/lib/seo";
import { ClassProgressSummary } from "@/components/progress/ClassProgressSummary";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export const metadata = buildMetadata({
  title: "Learning",
  description: "Browse all classes and track your learning progress.",
  path: "/learning",
});

type ChapterWithLessons = ChapterDoc & { lessons?: LessonDoc[] };

export default async function LearningPage() {
  const { isEnabled: isPreview } = await draftMode();
  const classes: ClassDoc[] = await getClassesTree({ draft: isPreview }).catch(
    () => [],
  );

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,110ch)] px-6 pt-6 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Learning Portal</h1>
        <p className="text-muted-foreground">
          Jump back into your topics and track completion at a glance.
        </p>
      </header>

      <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => {
          const chapters: ChapterWithLessons[] = Array.isArray(cls.chapters)
            ? (cls.chapters as ChapterWithLessons[])
            : [];
          const totalLessons = chapters.reduce((count, chapter) => {
            return count + (Array.isArray(chapter.lessons) ? chapter.lessons.length : 0);
          }, 0);
          return (
            <div
              key={String(cls.id)}
              className="flex h-full flex-col rounded-xl border border-border/60 bg-muted/10 p-5 shadow-sm"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">
                  {cls.title}
                </h2>
                {cls.description ? (
                  <p className="text-sm text-muted-foreground">
                    {cls.description}
                  </p>
                ) : null}
              </div>

              <ClassProgressSummary
                classId={cls.id}
                classTitle={cls.title}
                totalLessons={totalLessons}
              />

              <div className="mt-auto pt-4">
                <Link
                  href={`/classes/${cls.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-transparent px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-border/90 hover:bg-muted/30"
                >
                  View class
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          );
        })}
        {classes.length === 0 ? (
          <p className="text-muted-foreground">No classes available yet.</p>
        ) : null}
      </section>
    </main>
  );
}
