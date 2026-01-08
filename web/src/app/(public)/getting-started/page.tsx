import { draftMode } from "next/headers";
import { LivePreviewBlocks } from "@/components/live-preview/LivePreviewBlocks";
import { getPageBySlug, type PageDoc } from "@/lib/payloadSdk/pages";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export const metadata = buildMetadata({
  title: "Getting Started",
  description: "How to get started with NSF CURE SBP.",
  path: "/getting-started",
});

export default async function GettingStartedPage() {
  const { isEnabled: isPreview } = await draftMode();
  const page: PageDoc | null = await getPageBySlug("getting-started", {
    draft: isPreview,
  }).catch(() => null);

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
