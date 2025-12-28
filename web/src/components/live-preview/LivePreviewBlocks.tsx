"use client";

import React from "react";
import { PageLayout } from "@/components/page-layout";
import type { PageLayoutBlock } from "@/lib/payloadSdk/types";
import { usePayloadLivePreview } from "./usePayloadLivePreview";

type LayoutData = {
  layout?: PageLayoutBlock[] | null;
};

type Props<T extends LayoutData> = {
  initialData: T | null;
  collectionSlug?: string;
  globalSlug?: string;
  className?: string;
  emptyMessage?: string;
  heroLogo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  };
};

export function LivePreviewBlocks<T extends LayoutData>({
  initialData,
  collectionSlug,
  globalSlug,
  className = "space-y-10",
  emptyMessage = "No content yet.",
  heroLogo,
}: Props<T>) {
  const data = usePayloadLivePreview(initialData, {
    collectionSlug,
    globalSlug,
  });
  const blocks = Array.isArray(data?.layout) ? data?.layout : [];

  if (!blocks.length) {
    return <p className="text-muted-foreground">{emptyMessage}</p>;
  }

  return <PageLayout blocks={blocks} className={className} heroLogo={heroLogo} />;
}
