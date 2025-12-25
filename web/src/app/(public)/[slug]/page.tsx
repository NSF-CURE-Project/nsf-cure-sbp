import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { LivePreviewBlocks } from "@/components/live-preview/LivePreviewBlocks";
import { getPageBySlug, type PageData } from "@/lib/payloadSdk/pages";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default async function PageBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const page: PageData | null = await getPageBySlug(slug, {
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
