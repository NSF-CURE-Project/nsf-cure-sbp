import { notFound } from "next/navigation";
import { ProblemSetBlock as ProblemSetBlockComponent } from "@/components/problemSet/ProblemSetBlock";
import { getProblemSetsByTitlePrefix } from "@/lib/payloadSdk/problemSets";
import type { ProblemDoc, ProblemSetBlock, ProblemSetDoc } from "@/lib/payloadSdk/types";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

const LIBRARY_PREFIX = "Engineering Problem Library —";

const normalizeProblem = (value: unknown): ProblemDoc | null => {
  if (!value || typeof value !== "object") return null;
  if (!("id" in value)) return null;
  return value as ProblemDoc;
};

export default async function PreviewProblemLibraryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);
  const sets = await getProblemSetsByTitlePrefix(LIBRARY_PREFIX, {
    draft: isPreview,
    revalidate: 0,
    limit: 20,
  }).catch(() => []);

  if (!sets.length) return notFound();

  const byId = new Map<string, ProblemDoc>();
  for (const set of sets) {
    const problems = Array.isArray(set.problems) ? set.problems : [];
    for (const problem of problems) {
      const normalized = normalizeProblem(problem);
      if (!normalized) continue;
      byId.set(String(normalized.id), normalized);
    }
  }

  const allProblems = [...byId.values()];
  if (!allProblems.length) return notFound();

  const syntheticSet: ProblemSetDoc = {
    id: "engineering-problem-library-master-preview",
    title: "Engineering Problem Library — All Seeded Problems",
    description:
      "Combined preview of all seeded interactive statics and mechanics of materials problems.",
    problems: allProblems,
    showAnswers: true,
    maxAttempts: null,
    shuffleProblems: false,
  };

  const block: ProblemSetBlock = {
    blockType: "problemSetBlock",
    title: syntheticSet.title,
    problemSet: syntheticSet,
    showTitle: true,
    showAnswers: true,
  };

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 py-8 sm:px-6 lg:px-8 space-y-3">
        <p className="text-xs text-muted-foreground">
          Rendering {allProblems.length} problems aggregated from {sets.length} library problem sets.
        </p>
        <ProblemSetBlockComponent block={block} />
      </div>
    </main>
  );
}

export async function generateMetadata() {
  return buildMetadata({
    title: "Engineering Problem Library Preview",
    description: "Preview all seeded engineering problem library items.",
    path: "/preview/problem-library",
    noIndex: true,
  });
}
