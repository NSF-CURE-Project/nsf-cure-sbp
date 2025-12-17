"use client";

import React, { useEffect, useMemo, useState } from "react";

export function SafeHtml({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  const [purify, setPurify] = useState<typeof import("isomorphic-dompurify")>();

  // Load DOMPurify only in the browser to avoid jsdom file lookups during SSR
  useEffect(() => {
    let active = true;
    import("isomorphic-dompurify").then((mod) => {
      if (active) setPurify(mod.default || (mod as any));
    });
    return () => {
      active = false;
    };
  }, []);

  const safe = useMemo(() => {
    if (!purify) return html ?? "";
    return purify.sanitize(html ?? "");
  }, [purify, html]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
