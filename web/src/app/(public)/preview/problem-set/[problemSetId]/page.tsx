import { notFound } from "next/navigation";
import { ProblemSetBlock as ProblemSetBlockComponent } from "@/components/problemSet/ProblemSetBlock";
import { getProblemSetById } from "@/lib/payloadSdk/problemSets";
import type { ProblemSetBlock, ProblemSetDoc } from "@/lib/payloadSdk/types";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

type RouteParams = { problemSetId: string };

export default async function PreviewProblemSetPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { problemSetId } = await params;
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);

  const problemSet: ProblemSetDoc | null = await getProblemSetById(problemSetId, {
    draft: isPreview,
  }).catch(() => null);

  if (!problemSet) return notFound();

  const block: ProblemSetBlock = {
    blockType: "problemSetBlock",
    problemSet,
    showTitle: true,
    showAnswers: true,
  };

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 sm:px-6 lg:px-8 py-8">
        <ProblemSetBlockComponent block={block} />
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { problemSetId } = await params;
  return buildMetadata({
    title: "Problem Set Preview",
    description: "Preview problem set content.",
    path: `/preview/problem-set/${problemSetId}`,
    noIndex: true,
  });
}
