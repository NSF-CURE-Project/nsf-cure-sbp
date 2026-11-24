"use client";

import { useEffect } from "react";

// Forces window scroll to (0, 0) once on mount. Next's App Router usually
// handles this on `<Link>` navigation, but pages that share a route segment
// (or are reached via prefetched in-page anchors) sometimes inherit a
// scrolled position from the previous view. Drop this at the top of any
// page where landing scrolled-down is jarring.
export default function ScrollToTopOnMount() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Cancel any pending scroll restoration the browser is about to apply,
    // then force the top. `instant` avoids the smooth scroll on first paint.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);
  return null;
}
