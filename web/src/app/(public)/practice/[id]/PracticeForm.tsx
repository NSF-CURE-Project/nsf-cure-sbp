"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { writeLocalPracticeProgress } from "@/lib/practice/localProgress";
import type { PracticeResult } from "./actions";
import { splitPracticePrompt } from "./splitPracticePrompt";

type Piece = { html: string } | { index: number; label: string; digits: number };

const proseClass =
  "break-words leading-relaxed text-[15px] text-foreground [&_.katex-display]:overflow-x-auto [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6";

/** Failed checks before a soft hint; expected values stay hidden until later. */
const HINT_AFTER_FAILED = 3;
/** Failed checks before revealing the expected numeric answer. */
const REVEAL_AFTER_FAILED = 4;

function incorrectMessage(expected: string, failedChecks: number) {
  if (failedChecks >= REVEAL_AFTER_FAILED) {
    return `Incorrect. Expected ${expected}.`;
  }
  if (failedChecks >= HINT_AFTER_FAILED) {
    return "Incorrect. Hint: recheck your setup and significant figures, or open Show solution if you are stuck.";
  }
  return "Incorrect. Try again.";
}

export function PracticeForm({
  action,
  pieces,
  initialSubmissionId,
}: {
  action: (previous: PracticeResult | null, form: FormData) => Promise<PracticeResult>;
  pieces: Piece[];
  initialSubmissionId: string;
}) {
  const failedChecksRef = useRef(0);
  const wrappedAction = async (
    previous: PracticeResult | null,
    form: FormData,
  ): Promise<PracticeResult & { failedChecks: number }> => {
    const next = await action(previous, form);
    const allCorrect = next.parts.every((part) => part.correct);
    if (!allCorrect) failedChecksRef.current += 1;
    return { ...next, failedChecks: failedChecksRef.current };
  };
  const [result, submit, pending] = useActionState(wrappedAction, null);
  const formId = useId();
  const { diagramHtml, statementHtml, fields } = splitPracticePrompt(pieces);
  const correctCount = result?.parts.filter((part) => part.correct).length;
  const multiColumn = fields.length > 1;
  const failedChecks = result?.failedChecks ?? 0;

  useEffect(() => {
    if (!result?.localProgress) return;
    writeLocalPracticeProgress(result.localProgress.problemId, {
      status: result.localProgress.status,
      seed: result.localProgress.seed,
      score: result.localProgress.score,
      maxScore: result.localProgress.maxScore,
    });
  }, [result]);

  return (
    <form action={submit} className="min-w-0">
      <input
        type="hidden"
        name="submissionId"
        value={result?.nextSubmissionId ?? initialSubmissionId}
      />

      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(260px,35%)_minmax(0,1fr)] lg:items-start">
        {diagramHtml ? (
          <aside
            aria-label="Problem reference"
            className="sticky top-[calc(var(--nav-h,4rem)+0.5rem)] rounded-md border border-border/80 bg-background p-3 sm:p-4"
          >
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Given
            </p>
            <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-white px-2 py-3 dark:bg-background">
              <div
                className="w-full [&_img]:mx-auto [&_img]:max-h-[min(42vh,360px)] [&_img]:w-full [&_img]:object-contain"
                dangerouslySetInnerHTML={{ __html: diagramHtml }}
              />
            </div>
          </aside>
        ) : null}

        <div
          className={`flex min-w-0 flex-col gap-3 rounded-md border border-border/80 bg-background p-3 sm:p-4 ${
            diagramHtml ? "" : "lg:col-span-2"
          }`}
        >
          {statementHtml ? (
            <div className={proseClass} dangerouslySetInnerHTML={{ __html: statementHtml }} />
          ) : null}

          <div
            className={`grid gap-3 ${multiColumn ? "sm:grid-cols-2" : "grid-cols-1"}`}
          >
            {fields.map((field) => {
              const feedback = result?.parts[field.index];
              const inputId = `${formId}-part-${field.index}`;
              const ok = feedback?.correct === true;
              const bad = feedback != null && !feedback.correct;
              return (
                <div
                  key={field.index}
                  className={`relative flex flex-col gap-1 rounded-[10px] border px-2.5 py-2 transition-colors ${
                    ok
                      ? "border-emerald-700/35 bg-emerald-700/[0.06]"
                      : bad
                        ? "border-red-700/35 bg-red-700/[0.06]"
                        : "border-transparent focus-within:border-primary/30 focus-within:bg-primary/[0.04]"
                  }`}
                >
                  {ok ? (
                    <span
                      aria-hidden
                      className="absolute right-2.5 top-2 inline-flex size-[1.1rem] items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white"
                    >
                      ✓
                    </span>
                  ) : null}
                  <label
                    htmlFor={inputId}
                    className="pr-5 text-[12.5px] font-semibold leading-snug"
                  >
                    <span dangerouslySetInnerHTML={{ __html: field.title }} />
                  </label>
                  <div
                    className={`flex overflow-hidden rounded-lg border-[1.5px] bg-background ${
                      ok
                        ? "border-emerald-700"
                        : bad
                          ? "border-red-700"
                          : "border-border/80 focus-within:border-primary focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.16)]"
                    }`}
                  >
                    <input
                      id={inputId}
                      name={`part-${field.index}`}
                      type="text"
                      inputMode="decimal"
                      maxLength={100}
                      defaultValue={feedback?.response}
                      aria-describedby={`${inputId}-feedback`}
                      className="min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 text-[14.5px] tabular-nums outline-none"
                    />
                    {field.unit ? (
                      <span className="inline-flex items-center border-l border-border/80 bg-foreground/[0.03] px-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        {field.unit}
                      </span>
                    ) : null}
                  </div>
                  <p
                    id={`${inputId}-feedback`}
                    className={`text-[11.5px] leading-snug ${
                      ok
                        ? "text-emerald-700 dark:text-emerald-400"
                        : bad
                          ? "text-red-700 dark:text-red-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {feedback
                      ? feedback.correct
                        ? "Correct."
                        : feedback.invalid
                          ? "Enter a valid number."
                          : incorrectMessage(feedback.expected, failedChecks)
                      : `Use ${field.digits} significant figures.`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-0 z-[1] mt-auto flex flex-wrap items-center gap-2 border-t border-border/80 bg-gradient-to-t from-background via-background to-transparent pt-3 pb-0.5">
            <Button type="submit" disabled={pending} className="rounded-lg">
              {pending ? "Checking…" : "Check answers"}
            </Button>
            {result?.solution ? (
              <details className="min-w-0 flex-1 basis-full sm:basis-auto">
                <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground">
                  Show solution
                </summary>
                <div
                  className={`mt-3 ${proseClass} [&_img]:mx-auto [&_img]:max-h-[32rem] [&_img]:max-w-full`}
                  dangerouslySetInnerHTML={{ __html: result.solution }}
                />
              </details>
            ) : null}
            {result ? (
              <p role="status" className="w-full text-sm font-semibold sm:ml-auto sm:w-auto">
                {correctCount} of {result.parts.length} correct
                {result.tracking ? (
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground sm:mt-0 sm:ml-2 sm:inline">
                    {result.tracking}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
