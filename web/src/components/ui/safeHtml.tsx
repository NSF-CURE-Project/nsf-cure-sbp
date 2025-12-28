"use client";

import React, { useEffect, useMemo, useState } from "react";

export function SafeHtml({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  type Sanitizer = { sanitize: (input: string) => string };
  const [purify, setPurify] = useState<Sanitizer | null>(null);

  // Load DOMPurify only in the browser to avoid jsdom file lookups during SSR
  useEffect(() => {
    let active = true;
    import("isomorphic-dompurify").then((mod) => {
      const candidate: unknown =
        "default" in mod ? (mod.default as unknown) : (mod as unknown);
      const instance =
        typeof candidate === "function"
          ? (candidate as (win: Window) => Sanitizer)(window)
          : (candidate as Sanitizer);
      if (active && typeof instance?.sanitize === "function") {
        setPurify(instance);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const safe = useMemo(() => {
    if (!purify || typeof purify.sanitize !== "function") return html ?? "";
    return purify.sanitize(html ?? "");
  }, [purify, html]);

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />
  );
}
