import React from "react";
import { draftMode } from "next/headers";
import { LivePreviewBlocks } from "@/components/live-preview/LivePreviewBlocks";
import { getHomePage, type HomePageData } from "@/lib/payloadSdk/home";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default async function Landing() {
  const { isEnabled: isPreview } = await draftMode();
  const home: HomePageData | null = await getHomePage({ draft: isPreview }).catch(() => null);

  return (
    <div
      className="mx-auto w-full max-w-[var(--content-max)] px-6"
      style={{ "--content-max": "100%" } as React.CSSProperties}
    >
      <LivePreviewBlocks
        initialData={home}
        globalSlug="home-page"
        className="space-y-12 py-10"
        emptyMessage="No content yet. Add blocks in the Home Page layout."
      />
    </div>
  );
}
