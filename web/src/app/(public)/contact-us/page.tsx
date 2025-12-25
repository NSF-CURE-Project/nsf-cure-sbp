import { draftMode } from "next/headers";
import { LivePreviewBlocks } from "@/components/live-preview/LivePreviewBlocks";
import { getContactPage, type ContactPageData } from "@/lib/payloadSdk/contacts";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default async function ContactUsPage() {
  const { isEnabled: isPreview } = await draftMode();
  const data: ContactPageData | null = await getContactPage({
    draft: isPreview,
  }).catch(() => null);

  return (
    <main className="max-w-6xl mx-auto pt-6 pb-10 px-6">
      <LivePreviewBlocks
        initialData={data}
        globalSlug="contact-page"
        className="space-y-10"
        emptyMessage="No contact information available."
      />
    </main>
  );
}
