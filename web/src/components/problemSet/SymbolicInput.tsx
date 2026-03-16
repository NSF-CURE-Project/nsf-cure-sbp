"use client";

import { useEffect, useState } from "react";
import katex from "katex";
import { parse } from "mathjs";

type SymbolicVariable = {
  variable: string;
  testMin?: number;
  testMax?: number;
};

type SymbolicInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  variables?: SymbolicVariable[];
};

export function SymbolicInput({
  value,
  onChange,
  disabled,
  variables,
}: SymbolicInputProps) {
  const [debounced, setDebounced] = useState(value);
  const [previewHtml, setPreviewHtml] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), 300);
    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    if (!debounced.trim()) {
      setPreviewHtml("");
      setParseError(null);
      return;
    }
    try {
      const tex = parse(debounced).toTex();
      setPreviewHtml(
        katex.renderToString(tex, { throwOnError: false, displayMode: false })
      );
      setParseError(null);
    } catch (error) {
      setPreviewHtml("");
      setParseError(error instanceof Error ? error.message : "Invalid expression");
    }
  }, [debounced]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          if (!value.trim()) return;
          try {
            parse(value);
            setParseError(null);
          } catch (error) {
            setParseError(error instanceof Error ? error.message : "Invalid expression");
          }
        }}
        disabled={disabled}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        placeholder="Enter expression (e.g. sqrt(3)*F/2)"
      />
      {Array.isArray(variables) && variables.length ? (
        <div className="text-xs text-muted-foreground">
          Variables:{" "}
          {variables.map((variable) => variable.variable).filter(Boolean).join(", ")}
          {" • functions: sqrt, sin, cos, tan, pi"}
        </div>
      ) : null}
      {parseError ? <div className="text-xs text-red-500">{parseError}</div> : null}
      {!parseError && previewHtml ? (
        <div
          className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : null}
    </div>
  );
}

