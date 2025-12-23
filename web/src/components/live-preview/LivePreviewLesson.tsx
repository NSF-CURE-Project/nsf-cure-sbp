"use client";

import React from "react";
import { PageLayout } from "@/components/page-layout";
import type { LessonDoc, PageLayoutBlock } from "@/lib/payloadSdk/types";
import { usePayloadLivePreview } from "./usePayloadLivePreview";

type Props = {
  initialData: LessonDoc | null;
  className?: string;
};

export function LivePreviewLesson({ initialData, className }: Props) {
  const data = usePayloadLivePreview(initialData, {
    collectionSlug: "lessons",
  });
  const title = data?.title ?? "Untitled lesson";
  const updatedAt = data?.updatedAt || data?.createdAt || null;
  const blocks = Array.isArray(data?.layout)
    ? (data?.layout as PageLayoutBlock[])
    : [];

  return (
    <article className={className}>
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {updatedAt && (
        <p className="text-sm text-muted-foreground mb-6">
          Last updated {formatDate(updatedAt)}
        </p>
      )}
      {blocks.length > 0 ? (
        <PageLayout blocks={blocks} className="space-y-10" />
      ) : (
        <p className="text-sm text-muted-foreground">
          No content yet. Add blocks to this lesson.
        </p>
      )}
    </article>
  );
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
