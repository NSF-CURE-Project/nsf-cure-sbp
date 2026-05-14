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

export const metadata = buildMetadata({
  title: "Resources",
  description: "Resources and materials for NSF CURE SBP learners.",
  path: "/resources",
});

export default async function ResourcesPage() {
  const isPreview = await resolvePreview();
  const page: PageDoc | null = await getPageBySlug("resources", {
    draft: isPreview,
  }).catch(() => null);

  if (isPageHiddenPublicly(page, { draft: isPreview })) {
    notFound();
  }

  return (
    <main className="min-w-0 overflow-x-hidden p-6 lg:px-8">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] space-y-6">
        <LivePreviewBlocks
          initialData={page}
          collectionSlug="pages"
          className="space-y-10"
          emptyMessage="No resources published yet."
        />
      </div>
    </main>
  );
}
