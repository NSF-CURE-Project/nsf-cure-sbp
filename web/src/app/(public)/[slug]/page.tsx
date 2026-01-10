import { notFound } from "next/navigation";
import { LivePreviewBlocks } from "@/components/live-preview/LivePreviewBlocks";
import { getPageBySlug, type PageDoc } from "@/lib/payloadSdk/pages";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const isPreview = await resolvePreview();
  const page = await getPageBySlug(slug, { draft: isPreview }).catch(
    () => null
  );
  const title = page?.title ?? "Page";
  return buildMetadata({
    title,
    description: `${title} — NSF CURE SBP.`,
    path: `/${slug}`,
  });
}

export default async function PageBySlug({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);
  const page: PageDoc | null = await getPageBySlug(slug, {
    draft: isPreview,
  }).catch(() => null);

  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,110ch)] px-6 pt-6 pb-12 space-y-10">
      <LivePreviewBlocks
        initialData={page}
        collectionSlug="pages"
        className="space-y-10"
        emptyMessage="No content yet."
      />
    </main>
  );
}
