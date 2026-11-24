import { notFound } from "next/navigation";
import { LivePreviewBlocks } from "@/components/live-preview/LivePreviewBlocks";
import {
  getPageBySlug,
  isPageHiddenPublicly,
  type PageDoc,
} from "@/lib/payloadSdk/pages";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

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
  const visiblePage = isPageHiddenPublicly(page, { draft: isPreview })
    ? null
    : page;
  const title = visiblePage?.title ?? "Page";
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

  if (!page || isPageHiddenPublicly(page, { draft: isPreview })) {
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
