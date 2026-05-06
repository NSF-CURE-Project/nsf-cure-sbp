"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PayloadRichText } from "@/components/ui/payloadRichText";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import type { QuizDoc, QuizQuestionDoc } from "@/lib/payloadSdk/types";
import {
  gradeQuestionResponse,
  isQuestionAnswered,
  normalizeQuestion,
  type QuizResponseValue,
} from "@/lib/quiz";

type DemoFormat = {
  id: string;
  label: string;
  description: string;
  quiz: QuizDoc;
};

type DemoPayload = {
  formats: DemoFormat[];
};

const PAYLOAD_URL = getPayloadBaseUrl();

const EMPTY_RESPONSE: QuizResponseValue = {
  selectedOptionIds: [],
  textAnswer: "",
  numericAnswer: "",
};

const isLexicalState = (value: unknown): value is Parameters<typeof PayloadRichText>[0]["content"] =>
  Boolean(value && typeof value === "object" && "root" in (value as object));

const formatAnswerSummary = (question: QuizQuestionDoc) => {
  const normalized = normalizeQuestion(question);

  if (
    normalized.questionType === "single-select" ||
    normalized.questionType === "multi-select" ||
    normalized.questionType === "true-false"
  ) {
    return normalized.options.filter((option) => option.isCorrect).map((option) => option.label).join(", ");
  }

  if (normalized.questionType === "short-text") {
    return normalized.acceptedAnswers.join(", ");
  }

  if (normalized.numericCorrectValue == null) {
    return "No numeric answer configured";
  }

  const unit = normalized.numericUnit ? ` ${normalized.numericUnit}` : "";
  const tolerance =
    normalized.numericTolerance != null && normalized.numericTolerance > 0
      ? ` (±${normalized.numericTolerance}${unit})`
      : "";
  return `${normalized.numericCorrectValue}${unit}${tolerance}`;
};

const renderPrompt = (prompt: unknown) => {
  if (typeof prompt === "string" && prompt.trim()) {
    return <p className="text-sm leading-6 text-muted-foreground">{prompt}</p>;
  }

  if (isLexicalState(prompt)) {
    return <PayloadRichText content={prompt} className="prose prose-slate max-w-none text-sm" />;
  }

  return null;
};

export function QuizFormatsDemoClient() {
  const [formats, setFormats] = useState<DemoFormat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, QuizResponseValue>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${PAYLOAD_URL}/api/demo/quiz-formats`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load demo quizzes.");
        }

        const data = (await response.json()) as DemoPayload;
        const nextFormats = Array.isArray(data.formats) ? data.formats : [];
        setFormats(nextFormats);
        setActiveId((current) => current ?? nextFormats[0]?.id ?? null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unable to load demo quizzes.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const activeFormat = useMemo(
    () => formats.find((format) => format.id === activeId) ?? formats[0] ?? null,
    [activeId, formats]
  );

  const activeQuestion = useMemo(() => {
    const firstQuestion = activeFormat?.quiz?.questions?.[0];
    return typeof firstQuestion === "object" && firstQuestion !== null
      ? (firstQuestion as QuizQuestionDoc)
      : null;
  }, [activeFormat]);

  const normalizedQuestion = useMemo(
    () => (activeQuestion ? normalizeQuestion(activeQuestion) : null),
    [activeQuestion]
  );

  const currentResponse =
    (normalizedQuestion && responses[normalizedQuestion.id]) ?? EMPTY_RESPONSE;

  const evaluation = useMemo(() => {
    if (!normalizedQuestion || !revealed[normalizedQuestion.id]) return null;
    return gradeQuestionResponse(
      activeFormat?.quiz?.scoring ?? "per-question",
      normalizedQuestion,
      currentResponse
    );
  }, [activeFormat?.quiz?.scoring, currentResponse, normalizedQuestion, revealed]);

  const setChoiceResponse = (optionId: string, checked: boolean) => {
    if (!normalizedQuestion) return;
    const existing = responses[normalizedQuestion.id] ?? EMPTY_RESPONSE;

    const nextSelected =
      normalizedQuestion.questionType === "multi-select"
        ? checked
          ? [...new Set([...existing.selectedOptionIds, optionId])]
          : existing.selectedOptionIds.filter((id) => id !== optionId)
        : [optionId];

    setResponses((current) => ({
      ...current,
      [normalizedQuestion.id]: {
        ...existing,
        selectedOptionIds: nextSelected,
      },
    }));
  };

  const setTextResponse = (value: string) => {
    if (!normalizedQuestion) return;
    const existing = responses[normalizedQuestion.id] ?? EMPTY_RESPONSE;
    setResponses((current) => ({
      ...current,
      [normalizedQuestion.id]: {
        ...existing,
        textAnswer: value,
      },
    }));
  };

  const setNumericResponse = (value: string) => {
    if (!normalizedQuestion) return;
    const existing = responses[normalizedQuestion.id] ?? EMPTY_RESPONSE;
    setResponses((current) => ({
      ...current,
      [normalizedQuestion.id]: {
        ...existing,
        numericAnswer: value,
      },
    }));
  };

  const revealAnswer = () => {
    if (!normalizedQuestion) return;
    setRevealed((current) => ({ ...current, [normalizedQuestion.id]: true }));
  };

  const resetActive = () => {
    if (!normalizedQuestion) return;
    setResponses((current) => ({
      ...current,
      [normalizedQuestion.id]: EMPTY_RESPONSE,
    }));
    setRevealed((current) => ({ ...current, [normalizedQuestion.id]: false }));
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="space-y-3">
        <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
          Staff Demo
        </Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Quiz format demo
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            This page shows one frontend example for each supported quiz answer type.
            It uses the same question normalization and grading logic as the live quiz
            experience, but it does not create attempts or write any data.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm shadow-black/5">
          <div className="mb-3 text-sm font-semibold text-foreground">Formats</div>
          <div className="grid gap-2">
            {loading ? (
              <div className="rounded-xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
                Loading demo quizzes…
              </div>
            ) : null}

            {!loading && error ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {!loading && !error
              ? formats.map((format) => {
                  const isActive = activeFormat?.id === format.id;
                  return (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => setActiveId(format.id)}
                      className={[
                        "rounded-xl border px-4 py-3 text-left transition-colors",
                        isActive
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/60 bg-background hover:bg-accent/30",
                      ].join(" ")}
                    >
                      <div className="text-sm font-semibold text-foreground">{format.label}</div>
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">
                        {format.description}
                      </div>
                    </button>
                  );
                })
              : null}
          </div>
        </aside>

        <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm shadow-black/5">
          {!activeFormat || !activeQuestion || !normalizedQuestion ? (
            <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-sm text-muted-foreground">
              Select a demo quiz format to preview it.
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{activeFormat.label}</Badge>
                    <Badge variant="outline">
                      {normalizedQuestion.questionType}
                    </Badge>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {activeFormat.quiz.title ?? activeFormat.label}
                    </h2>
                    {activeFormat.quiz.description ? (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {activeFormat.quiz.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-sm">
                  <div className="font-semibold text-foreground">Correct answer</div>
                  <div className="mt-1 text-muted-foreground">
                    {formatAnswerSummary(activeQuestion)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="space-y-3">
                  {activeQuestion.title ? (
                    <h3 className="text-lg font-semibold text-foreground">
                      {activeQuestion.title}
                    </h3>
                  ) : null}
                  {renderPrompt(activeQuestion.prompt)}
                </div>

                <div className="mt-5 grid gap-3">
                  {(normalizedQuestion.questionType === "single-select" ||
                    normalizedQuestion.questionType === "multi-select" ||
                    normalizedQuestion.questionType === "true-false") &&
                    normalizedQuestion.options.map((option) => {
                      const checked = currentResponse.selectedOptionIds.includes(option.id);
                      return (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-card/90 px-4 py-3 text-sm shadow-sm shadow-black/5"
                        >
                          <input
                            type={normalizedQuestion.questionType === "multi-select" ? "checkbox" : "radio"}
                            name={normalizedQuestion.id}
                            checked={checked}
                            onChange={(event) => setChoiceResponse(option.id, event.target.checked)}
                            className="mt-1 size-4"
                          />
                          <span className="leading-6 text-foreground">{option.label}</span>
                        </label>
                      );
                    })}

                  {normalizedQuestion.questionType === "short-text" ? (
                    <Input
                      value={currentResponse.textAnswer}
                      onChange={(event) => setTextResponse(event.target.value)}
                      placeholder="Type a short response"
                    />
                  ) : null}

                  {normalizedQuestion.questionType === "numeric" ? (
                    <div className="max-w-xs space-y-2">
                      <Input
                        inputMode="decimal"
                        value={currentResponse.numericAnswer}
                        onChange={(event) => setNumericResponse(event.target.value)}
                        placeholder={
                          normalizedQuestion.numericUnit
                            ? `Enter value in ${normalizedQuestion.numericUnit}`
                            : "Enter a numeric answer"
                        }
                      />
                      {normalizedQuestion.numericUnit ? (
                        <p className="text-xs text-muted-foreground">
                          Expected unit: {normalizedQuestion.numericUnit}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={revealAnswer}
                    disabled={!isQuestionAnswered(normalizedQuestion, currentResponse)}
                  >
                    Check answer
                  </Button>
                  <Button type="button" variant="outline" onClick={resetActive}>
                    Reset
                  </Button>
                </div>

                {evaluation ? (
                  <div
                    className={[
                      "mt-5 rounded-xl border px-4 py-3 text-sm",
                      evaluation.isCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-amber-200 bg-amber-50 text-amber-900",
                    ].join(" ")}
                  >
                    <div className="font-semibold">
                      {evaluation.isCorrect ? "Correct" : "Not quite"}
                    </div>
                    <div className="mt-1 leading-6">
                      Score: {Math.round(evaluation.score * 100)}%
                    </div>
                    {typeof activeQuestion.explanation === "string" && activeQuestion.explanation.trim() ? (
                      <p className="mt-2 leading-6">{activeQuestion.explanation}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
