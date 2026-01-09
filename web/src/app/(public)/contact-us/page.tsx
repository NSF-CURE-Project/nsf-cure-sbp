import { LivePreviewBlocks } from "@/components/live-preview/LivePreviewBlocks";
import { getPageBySlug, type PageDoc } from "@/lib/payloadSdk/pages";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export const metadata = buildMetadata({
  title: "Contact Us",
  description: "Contact the NSF CURE SBP team.",
  path: "/contact-us",
});

export default async function ContactUsPage() {
  const isPreview = await resolvePreview();
  const page: PageDoc | null = await getPageBySlug("contact-us", {
    draft: isPreview,
  }).catch(() => null);

  return (
    <main className="max-w-6xl mx-auto pt-6 pb-10 px-6">
      <LivePreviewBlocks
        initialData={page}
        collectionSlug="pages"
        className="space-y-10"
        emptyMessage="No contact information available."
      />
    </main>
  );
}
