"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 60_000;

// Pings /api/accounts/heartbeat every minute while the tab is visible so the
// server can accumulate active-time and last-seen timestamps for the signed-in
// account. Silently no-ops if the user isn't signed in (endpoint returns 401).
export default function AccountHeartbeat() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const ping = async () => {
      if (cancelled || stopped) return;
      if (typeof document !== "undefined" && document.hidden) {
        scheduleNext();
        return;
      }
      try {
        const res = await fetch("/api/accounts/heartbeat", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        if (res.status === 401) {
          // Not signed in as an account — stop pinging until next page load.
          stopped = true;
          return;
        }
      } catch {
        // Swallow — we'll retry on the next interval.
      }
      scheduleNext();
    };

    const scheduleNext = () => {
      if (cancelled || stopped) return;
      timeoutId = setTimeout(ping, HEARTBEAT_INTERVAL_MS);
    };

    const handleVisibility = () => {
      if (
        typeof document !== "undefined" &&
        !document.hidden &&
        !stopped &&
        !timeoutId
      ) {
        ping();
      }
    };

    // Fire one heartbeat shortly after mount so login bumps last-seen quickly.
    timeoutId = setTimeout(ping, 5_000);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
