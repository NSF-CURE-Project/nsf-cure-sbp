"use client";

import DOMPurify from "isomorphic-dompurify";
import React from "react";

export function SafeHtml({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  const safe =
    typeof window === "undefined" ? html ?? "" : DOMPurify.sanitize(html ?? "");
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
