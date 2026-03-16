"use client";

import katex from "katex";

type InlineMathProps = {
  text: string;
};

const MATH_PATTERN = /\$([^$]+)\$/g;

export function InlineMath({ text }: InlineMathProps) {
  const parts: Array<{ type: "text" | "math"; value: string }> = [];
  let cursor = 0;
  for (const match of text.matchAll(MATH_PATTERN)) {
    const raw = match[0];
    const expression = match[1];
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push({ type: "text", value: text.slice(cursor, index) });
    }
    parts.push({ type: "math", value: expression });
    cursor = index + raw.length;
  }
  if (cursor < text.length) {
    parts.push({ type: "text", value: text.slice(cursor) });
  }

  return (
    <span>
      {parts.map((part, idx) => {
        if (part.type === "text") return <span key={idx}>{part.value}</span>;
        const html = katex.renderToString(part.value, {
          throwOnError: false,
          displayMode: false,
        });
        return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </span>
  );
}
