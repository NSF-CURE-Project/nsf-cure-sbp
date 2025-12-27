import { draftMode } from "next/headers";
import { LivePreviewBlocks } from "@/components/live-preview/LivePreviewBlocks";
import { getResourcesPage, type ResourcesPageData } from "@/lib/payloadSdk/resources";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export const metadata = buildMetadata({
  title: "Resources",
  description: "Resources and materials for NSF CURE SBP learners.",
  path: "/resources",
});

export default async function ResourcesPage() {
  const { isEnabled: isPreview } = await draftMode();
  const data: ResourcesPageData | null = await getResourcesPage({
    draft: isPreview,
  }).catch(() => null);

  return (
    <main className="min-w-0 overflow-x-hidden p-6 lg:px-8">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] space-y-6">
        <LivePreviewBlocks
          initialData={data}
          globalSlug="resources-page"
          className="space-y-10"
          emptyMessage="No resources published yet."
        />
      </div>
    </main>
  );
}
