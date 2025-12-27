"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useField } from "@payloadcms/ui";
import LessonOrderList from "./LessonOrderList";

type IdValue = string | number | null | undefined;

export default function ChapterLessonOrderField() {
  const { value: idValue } = useField<IdValue>({ path: "id" });
  const { value: legacyIdValue } = useField<IdValue>({ path: "_id" });
  const [pathId, setPathId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pathname = window.location.pathname;
    const match = pathname.match(/chapters\/([^/]+)/);
    if (match?.[1]) {
      setPathId(match[1]);
    }
  }, []);

  const chapterId = useMemo(() => {
    if (typeof idValue === "string") return idValue;
    if (typeof idValue === "number") return String(idValue);
    if (typeof legacyIdValue === "string") return legacyIdValue;
    if (typeof legacyIdValue === "number") return String(legacyIdValue);
    return pathId;
  }, [idValue, legacyIdValue, pathId]);

  return (
    <div style={{ margin: "6px 0 20px" }}>
      <LessonOrderList
        title="Reorder lessons for this chapter"
        showEditLinks
        chapterId={chapterId ?? undefined}
      />
    </div>
  );
}
