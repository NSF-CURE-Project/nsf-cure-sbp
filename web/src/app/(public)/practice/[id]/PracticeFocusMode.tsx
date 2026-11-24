"use client";

import { useEffect } from "react";
import { useSidebar } from "@/hooks/use-sidebar";

/** Practice Mode: widen the workspace and collapse Study Topics for the session. */
export function PracticeFocusMode() {
  useEffect(() => {
    const content = document.getElementById("content");
    const previousMax = content?.style.maxWidth ?? "";
    const previousVar = content?.style.getPropertyValue("--content-max") ?? "";
    const previousSidebar = useSidebar.getState().isOpen;

    content?.style.setProperty("--content-max", "1680px");
    if (content) content.style.maxWidth = "min(1680px, 100%)";
    document.body.dataset.practiceMode = "1";
    useSidebar.getState().setIsOpen(false);

    return () => {
      document.body.removeAttribute("data-practice-mode");
      if (content) {
        if (previousVar) content.style.setProperty("--content-max", previousVar);
        else content.style.removeProperty("--content-max");
        content.style.maxWidth = previousMax;
      }
      useSidebar.getState().setIsOpen(previousSidebar);
    };
  }, []);

  return null;
}
