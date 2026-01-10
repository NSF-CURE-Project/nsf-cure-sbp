"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";

const PAYLOAD_URL = getPayloadBaseUrl();

type Props = {
  classId: string | number;
  classTitle: string;
  totalLessons: number;
};

type AccountUser = {
  id: string;
};

type ProgressDoc = {
  id: string;
  completed?: boolean;
};

export function ClassProgressSummary({
  classId,
  classTitle,
  totalLessons,
}: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadUser = async () => {
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/accounts/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = (await res.json()) as { user?: AccountUser };
        setUser(data?.user ?? null);
      } catch {
        if (!controller.signal.aborted) {
          setUser(null);
        }
      }
    };
    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!user?.id || !classId) return;
    const controller = new AbortController();
    const loadProgress = async () => {
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/lesson-progress?limit=200&where[class][equals]=${classId}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setCompletedCount(0);
          return;
        }
        const data = (await res.json()) as { docs?: ProgressDoc[] };
        const completed = (data.docs ?? []).filter(
          (doc) => doc.completed
        ).length;
        setCompletedCount(completed);
      } catch {
        if (!controller.signal.aborted) {
          setCompletedCount(0);
        }
      }
    };
    loadProgress();
    return () => controller.abort();
  }, [user?.id, classId]);

  const percent = useMemo(() => {
    if (!totalLessons) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  }, [completedCount, totalLessons]);

  if (!user || totalLessons === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
      You’re <span className="font-semibold text-foreground">{percent}%</span>{" "}
      through{" "}
      <span className="font-semibold text-foreground">{classTitle}</span>.
    </div>
  );
}
