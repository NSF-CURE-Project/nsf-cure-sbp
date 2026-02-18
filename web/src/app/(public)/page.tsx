import React from "react";
import { LivePreviewBlocks } from "@/components/live-preview/LivePreviewBlocks";
import { getPageBySlug, type PageDoc } from "@/lib/payloadSdk/pages";
import { resolvePreview } from "@/lib/preview";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export const metadata = buildMetadata({
  title: "Home",
  description:
    "NSF CURE Summer Bridge Program for engineering students studying Statics and Mechanics of Materials.",
  path: "/",
});

export default async function Landing({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const isPreview = await resolvePreview(sp);
  const home: PageDoc | null = await getPageBySlug("home", {
    draft: isPreview,
  }).catch(() => null);

  return (
    <main className="min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[var(--content-max,110ch)] px-4 sm:px-6 lg:px-8 pt-1 pb-6">
        <LivePreviewBlocks
          initialData={home}
          collectionSlug="pages"
          className="space-y-12 pt-2 pb-8"
          emptyMessage="No content yet. Add blocks to the page layout."
          heroLogo={{
            src: "/assets/logos/sbp_logo_transparent.png",
            alt: "SBP logo",
            width: 64,
            height: 64,
            className: "h-16 w-auto",
          }}
        />
      </div>
    </main>
  );
}
