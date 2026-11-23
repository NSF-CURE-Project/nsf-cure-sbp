"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import type { PracticeResult } from "./actions";

type Piece = { html: string } | { index: number; label: string; digits: number };

export function PracticeForm({ action, pieces, initialSubmissionId }: {
  action: (previous: PracticeResult | null, form: FormData) => Promise<PracticeResult>;
  pieces: Piece[];
  initialSubmissionId: string;
}) {
  const [result, submit, pending] = useActionState(action, null);
  const formId = useId();
  const correctCount = result?.parts.filter((part) => part.correct).length;
  return (
    <form action={submit} className="min-w-0 space-y-5">
      <input type="hidden" name="submissionId" value={result?.nextSubmissionId ?? initialSubmissionId} />
      {pieces.map((piece, position) => {
        if ("html" in piece) return piece.html.trim() ? (
          <div key={position} className="space-y-3 break-words leading-relaxed [&_.katex-display]:overflow-x-auto [&_img]:mx-auto [&_img]:max-h-[28rem] [&_img]:max-w-full [&_img]:rounded-lg [&_img]:bg-white [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: piece.html }} />
        ) : null;
        const feedback = result?.parts[piece.index];
        const inputId = `${formId}-part-${piece.index}`;
        return (
          <div key={position} className="space-y-2 border-t pt-4">
            <label htmlFor={inputId} className="block font-medium" dangerouslySetInnerHTML={{ __html: piece.label }} />
            <input id={inputId} name={`part-${piece.index}`} type="text" maxLength={100}
              defaultValue={feedback?.response} aria-describedby={`${inputId}-feedback`}
              className="w-full rounded-md border bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs" />
            <p id={`${inputId}-feedback`} className="text-sm text-muted-foreground">
              {feedback
                ? feedback.correct ? "Correct." : `${feedback.invalid ? "Enter a valid number." : "Incorrect."} Expected ${feedback.expected}.`
                : `Use ${piece.digits} significant figures.`}
            </p>
          </div>
        );
      })}
      <Button type="submit" disabled={pending}>{pending ? "Checking…" : "Check answers"}</Button>
      {result ? (
        <div role="status" className="space-y-3">
          <p className="font-semibold">{correctCount} of {result.parts.length} correct</p>
          {result.tracking ? <p className="text-sm text-muted-foreground">{result.tracking}</p> : null}
          {result.solution ? (
            <details>
              <summary className="cursor-pointer font-medium">Solution and hints</summary>
              <div className="mt-3 space-y-3 [&_img]:max-h-[32rem] [&_img]:max-w-full [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: result.solution }} />
            </details>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
