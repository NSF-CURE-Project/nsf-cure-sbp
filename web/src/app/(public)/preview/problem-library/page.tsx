import { notFound } from "next/navigation";
import Link from "next/link";
import { ProblemSetBlock as ProblemSetBlockComponent } from "@/components/problemSet/ProblemSetBlock";
import { getProblemSets, getProblemSetsByTitlePrefix } from "@/lib/payloadSdk/problemSets";
import type { ProblemDoc, ProblemSetBlock, ProblemSetDoc } from "@/lib/payloadSdk/types";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

const LIBRARY_PREFIX = "Engineering Problem Library —";

const normalizeProblem = (value: unknown): ProblemDoc | null => {
  if (!value || typeof value !== "object") return null;
  if (!("id" in value)) return null;
  return value as ProblemDoc;
};

const stripLibraryPrefix = (title?: string) =>
  (title ?? "Untitled problem set").replace(LIBRARY_PREFIX, "").trim();

const toPreviewHref = (id: string | number) => `/preview/problem-set/${encodeURIComponent(String(id))}`;

export default async function PreviewProblemLibraryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);
  let sets = await getProblemSetsByTitlePrefix(LIBRARY_PREFIX, {
    draft: isPreview,
    revalidate: 0,
    limit: 20,
  }).catch(() => []);

  if (!sets.length) {
    sets = await getProblemSets({
      draft: isPreview,
      revalidate: 0,
      limit: 20,
      sort: "-updatedAt",
    }).catch(() => []);
  }

  // Preview routes should remain useful even when only drafts exist.
  if (!sets.length && !isPreview) {
    sets = await getProblemSets({
      draft: true,
      revalidate: 0,
      limit: 20,
      sort: "-updatedAt",
    }).catch(() => []);
  }

  if (!sets.length) return notFound();

  const setsWithProblems = sets
    .map((set) => {
      const normalizedProblems = (Array.isArray(set.problems) ? set.problems : [])
        .map(normalizeProblem)
        .filter((problem): problem is ProblemDoc => Boolean(problem));
      return { set, normalizedProblems };
    })
    .filter(({ normalizedProblems }) => normalizedProblems.length > 0);

  if (!setsWithProblems.length) return notFound();

  const byId = new Map<string, ProblemDoc>();
  for (const { normalizedProblems } of setsWithProblems) {
    for (const problem of normalizedProblems) {
      byId.set(String(problem.id), problem);
    }
  }

  const allProblems = [...byId.values()];
  if (!allProblems.length) return notFound();

  const totalSets = setsWithProblems.length;
  const totalProblems = allProblems.length;
  const totalParts = allProblems.reduce((sum, problem) => sum + (problem.parts?.length ?? 0), 0);

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
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Preview Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Interactive Problem Library</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Showcase page for all interactive engineering problems currently available in Payload. Open any set for
            focused preview, or launch the combined run to exercise everything in one place.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{totalSets} sets</Badge>
            <Badge variant="secondary">{totalProblems} unique problems</Badge>
            <Badge variant="secondary">{totalParts} parts</Badge>
            <Button asChild size="sm" className="ml-auto">
              <Link href="#combined-runner">Open Combined Runner</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Problem Set Showcase</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {setsWithProblems.map(({ set, normalizedProblems }) => {
              const setTitle = stripLibraryPrefix(set.title);
              const setDescription = set.description?.trim() || "Interactive engineering practice set.";
              const totalSetParts = normalizedProblems.reduce(
                (sum, problem) => sum + (problem.parts?.length ?? 0),
                0
              );
              return (
                <Card key={String(set.id)} className="gap-0">
                  <CardHeader className="pb-4">
                    <CardTitle>{setTitle}</CardTitle>
                    <CardDescription>{setDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{normalizedProblems.length} problems</Badge>
                      <Badge variant="outline">{totalSetParts} parts</Badge>
                      <Badge variant="outline">ID: {String(set.id)}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end border-t pt-4">
                    <Button asChild size="sm">
                      <Link href={toPreviewHref(set.id)}>Preview Set</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="combined-runner" className="space-y-3">
          <h2 className="text-lg font-semibold">Combined Interactive Runner</h2>
          <p className="text-xs text-muted-foreground">
            Rendering {allProblems.length} problems aggregated from {totalSets} library problem sets.
          </p>
          <ProblemSetBlockComponent block={block} />
        </section>
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
