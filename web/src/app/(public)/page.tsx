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
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const isPreview = await resolvePreview(searchParams);
  const home: PageDoc | null = await getPageBySlug("home", {
    draft: isPreview,
  }).catch(() => null);

  return (
    <div
      className="mx-auto w-full max-w-[var(--content-max)] px-6"
      style={{ "--content-max": "100%" } as React.CSSProperties}
    >
      <LivePreviewBlocks
        initialData={home}
        collectionSlug="pages"
        className="space-y-12 py-10"
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
  );
}
