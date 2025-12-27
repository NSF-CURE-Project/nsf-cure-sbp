"use client";

import React, { useMemo } from "react";
import { useField } from "@payloadcms/ui";
import LessonOrderList from "./LessonOrderList";

type ChapterValue = string | { id?: string } | null | undefined;

function getChapterId(value: ChapterValue) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.id) return value.id;
  return null;
}

export default function LessonOrderField() {
  const { value: titleValue } = useField<string>({ path: "title" });
  const { setValue: setOrderValue, value: orderValue } = useField<number>({
    path: "order",
  });
  const { value: chapterValue } = useField<ChapterValue>({ path: "chapter" });

  const chapterId = useMemo(() => getChapterId(chapterValue), [chapterValue]);

  const pendingTitle =
    typeof titleValue === "string" && titleValue.trim().length > 0
      ? titleValue.trim()
      : "Untitled lesson";

  return (
    <div style={{ margin: "6px 0 20px" }}>
      <LessonOrderList
        title="Reorder lessons"
        showEditLinks
        chapterId={chapterId ?? undefined}
        pendingTitle={pendingTitle}
        pendingOrder={typeof orderValue === "number" ? orderValue : null}
        onPendingOrderChange={(order) => {
          if (orderValue !== order) {
            setOrderValue(order);
          }
        }}
      />
    </div>
  );
}
