"use client";

import { useEffect } from "react";
import type { PracticeAssignment } from "@/lib/practice/assignment";

export function PracticeOpened({ lessonId, assignmentKey, problemId }: PracticeAssignment) {
  useEffect(() => {
    void fetch("/api/practice-attempts/record", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "open", lessonId, assignmentKey, problemId }),
    }).catch(() => undefined);
  }, [lessonId, assignmentKey, problemId]);
  return null;
}
