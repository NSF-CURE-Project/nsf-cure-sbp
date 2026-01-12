"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PayloadRichText } from "@/components/ui/payloadRichText";
import { cn } from "@/lib/utils";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import type {
  QuizBlock as QuizBlockType,
  QuizDoc,
  QuizQuestionDoc,
  QuizQuestionOption,
} from "@/lib/payloadSdk/types";

const PAYLOAD_URL = getPayloadBaseUrl();

type Props = {
  block: QuizBlockType;
  lessonId?: string | number;
};

type NormalizedOption = {
  id: string;
  label: string;
  isCorrect?: boolean;
};

type NormalizedQuestion = {
  id: string;
  title?: string;
  prompt?: unknown;
  options: NormalizedOption[];
  explanation?: unknown;
  attachments?: unknown;
};

const resolveMediaUrl = (media?: unknown): string | null => {
  if (!media) return null;
  if (typeof media === "string") {
    return media.startsWith("http") ? media : `${PAYLOAD_URL}${media}`;
  }
  if (typeof media === "object" && "url" in media) {
    const url = (media as { url?: string }).url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${PAYLOAD_URL}${url}`;
  }
  return null;
};

const getRandom = () => {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 2 ** 32;
  }
  return Math.random();
};

const shuffle = <T,>(items: T[]) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(getRandom() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const scoreQuestion = (
  scoring: NonNullable<QuizDoc["scoring"]>,
  correctIds: string[],
  selectedIds: string[]
) => {
  const correctSet = new Set(correctIds);
  const selectedSet = new Set(selectedIds);
  const exactMatch =
    correctIds.length > 0 &&
    correctIds.length === selectedSet.size &&
    correctIds.every((id) => selectedSet.has(id));

  if (scoring !== "partial") {
    return { score: exactMatch ? 1 : 0, isCorrect: exactMatch };
  }

  if (correctIds.length === 0) {
    return { score: 0, isCorrect: false };
  }

  const correctSelected = selectedIds.filter((id) => correctSet.has(id)).length;
  const incorrectSelected = selectedIds.filter((id) => !correctSet.has(id))
    .length;
  const raw = (correctSelected - incorrectSelected) / correctIds.length;
  const score = Math.max(0, Math.min(1, raw));
  return { score, isCorrect: score === 1 };
};

const normalizeQuestion = (question: QuizQuestionDoc): NormalizedQuestion => {
  const options = Array.isArray(question.options) ? question.options : [];
  return {
    id: String(question.id),
    title: question.title,
    prompt: question.prompt,
    explanation: question.explanation,
    attachments: question.attachments,
    options: options
      .map((opt, index) => {
        const option = opt as QuizQuestionOption;
        const id = option.id ? String(option.id) : `${question.id}-${index}`;
        return {
          id,
          label:
            typeof option.label === "string" && option.label.trim()
              ? option.label
              : "Untitled option",
          isCorrect: option.isCorrect,
        };
      })
      .filter((opt) => opt.id),
  };
};

export function QuizBlock({ block, lessonId }: Props) {
  const [quiz, setQuiz] = useState<QuizDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [optionOrder, setOptionOrder] = useState<Record<string, string[]>>({});
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState<number | null>(null);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [expandedExplanations, setExpandedExplanations] = useState<
    Record<string, boolean>
  >({});
  const [focusMode, setFocusMode] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const quizKeyRef = useRef<string | number | null>(null);

  useEffect(() => {
    const quizValue = block.quiz;
    if (!quizValue) return;
    if (typeof quizValue === "object" && quizValue !== null) {
      setQuiz(quizValue as QuizDoc);
      return;
    }
    const quizId = String(quizValue);
    const controller = new AbortController();
    const loadQuiz = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${PAYLOAD_URL}/api/quizzes/${quizId}?depth=2`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { doc?: QuizDoc };
        setQuiz(data.doc ?? null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    loadQuiz();
    return () => controller.abort();
  }, [block.quiz]);

  const normalizedQuestions = useMemo(() => {
    const rawQuestions = quiz?.questions ?? [];
    return rawQuestions
      .map((item) =>
        typeof item === "object" && item !== null
          ? normalizeQuestion(item as QuizQuestionDoc)
          : null
      )
      .filter((item): item is NormalizedQuestion => Boolean(item));
  }, [quiz]);

  useEffect(() => {
    if (!quiz) return;
    if (quizKeyRef.current === quiz.id) return;
    quizKeyRef.current = quiz.id;
    const questionIds = normalizedQuestions.map((q) => q.id);
    const orderedQuestions = quiz.shuffleQuestions
      ? shuffle(questionIds)
      : questionIds;
    const nextOptionOrder: Record<string, string[]> = {};
    normalizedQuestions.forEach((question) => {
      const optionIds = question.options.map((opt) => opt.id);
      nextOptionOrder[question.id] = quiz.shuffleOptions
        ? shuffle(optionIds)
        : optionIds;
    });
    setQuestionOrder(orderedQuestions);
    setOptionOrder(nextOptionOrder);
    setAnswers({});
    setSubmitted(false);
    setStarted(false);
    setTimeRemaining(null);
    setPageIndex(0);
    setExpandedExplanations({});
    setFocusMode(false);
    startedAtRef.current = null;
  }, [normalizedQuestions, quiz]);

  const orderedQuestions = useMemo(() => {
    if (!normalizedQuestions.length) return [];
    const map = new Map(normalizedQuestions.map((q) => [q.id, q]));
    const ids = questionOrder.length
      ? questionOrder
      : normalizedQuestions.map((q) => q.id);
    return ids.map((id) => map.get(id)).filter(Boolean) as NormalizedQuestion[];
  }, [normalizedQuestions, questionOrder]);

  const scoring = quiz?.scoring ?? "per-question";
  const quizTitle =
    block.title ||
    (block.showTitle === false ? undefined : quiz?.title ?? "Quiz");
  const quizDescription = quiz?.description ?? null;
  const showAnswers = block.showAnswers !== false;
  const maxAttempts =
    typeof block.maxAttempts === "number" ? block.maxAttempts : null;
  const effectiveTimeLimit =
    typeof block.timeLimitSec === "number"
      ? block.timeLimitSec
      : quiz?.timeLimitSec ?? null;
  const questionsPerPage = 3;
  const totalQuestions = orderedQuestions.length;
  const pageCount = Math.max(1, Math.ceil(totalQuestions / questionsPerPage));
  const pageStart = pageIndex * questionsPerPage;
  const pageQuestions = orderedQuestions.slice(
    pageStart,
    pageStart + questionsPerPage
  );
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex >= pageCount - 1;

  useEffect(() => {
    if (!started || !effectiveTimeLimit) return;
    const tick = () => {
      if (!startedAtRef.current) return;
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const remaining = Math.max(0, effectiveTimeLimit - elapsed);
      setTimeRemaining(remaining);
    };
    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [started, effectiveTimeLimit]);

  useEffect(() => {
    if (!focusMode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [focusMode]);

  useEffect(() => {
    if (!focusMode) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusMode]);

  useEffect(() => {
    if (!quiz || maxAttempts == null) {
      setAttemptCount(null);
      setAttemptLoading(false);
      return;
    }
    const controller = new AbortController();
    const loadAttempts = async () => {
      setAttemptLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "1",
          depth: "0",
        });
        params.set("where[quiz][equals]", String(quiz.id));
        if (lessonId != null) {
          params.set("where[lesson][equals]", String(lessonId));
        }
        const res = await fetch(
          `${PAYLOAD_URL}/api/quiz-attempts?${params.toString()}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setAttemptCount(null);
          return;
        }
        const data = (await res.json()) as { totalDocs?: number };
        setAttemptCount(
          typeof data.totalDocs === "number" ? data.totalDocs : null
        );
      } finally {
        if (!controller.signal.aborted) {
          setAttemptLoading(false);
        }
      }
    };
    loadAttempts();
    return () => controller.abort();
  }, [quiz, lessonId, maxAttempts]);

  const evaluation = useMemo(() => {
    if (!submitted) return null;
    let totalScore = 0;
    const perQuestion = orderedQuestions.reduce<Record<string, number>>(
      (acc, question) => {
        const selected = answers[question.id] ?? [];
        const correctIds = question.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.id);
        const { score } = scoreQuestion(scoring, correctIds, selected);
        acc[question.id] = score;
        totalScore += score;
        return acc;
      },
      {}
    );
    return {
      perQuestion,
      totalScore,
      maxScore: orderedQuestions.length,
    };
  }, [answers, orderedQuestions, scoring, submitted]);

  const handleSelect = (questionId: string, optionId: string, multi: boolean) => {
    setAnswers((prev) => {
      const existing = prev[questionId] ?? [];
      if (multi) {
        const next = existing.includes(optionId)
          ? existing.filter((id) => id !== optionId)
          : [...existing, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    const attemptLimitReached =
      maxAttempts != null &&
      attemptCount != null &&
      attemptCount >= maxAttempts;
    if (attemptLimitReached) return;
    setSubmitting(true);
    const startedAt = startedAtRef.current ?? Date.now();
    const completedAt = Date.now();
    const durationSec = Math.max(0, Math.round((completedAt - startedAt) / 1000));

    const questionOrderPayload = orderedQuestions.map((question) => ({
      question: question.id,
    }));
    const answersPayload = orderedQuestions.map((question) => ({
      question: question.id,
      selectedOptionIds: (answers[question.id] ?? []).map((id) => ({
        optionId: id,
      })),
      optionOrder: (optionOrder[question.id] ?? []).map((id) => ({
        optionId: id,
      })),
    }));

    try {
      await fetch(`${PAYLOAD_URL}/api/quiz-attempts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz: quiz.id,
          lesson: lessonId,
          questionOrder: questionOrderPayload,
          answers: answersPayload,
          startedAt: new Date(startedAt).toISOString(),
          completedAt: new Date(completedAt).toISOString(),
          durationSec,
        }),
      });
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      setAttemptCount((prev) =>
        typeof prev === "number" ? prev + 1 : prev
      );
    }
  };

  if (!block.quiz) return null;

  const questionsContainerClass = cn(
    "space-y-6 overflow-y-auto pr-2",
    focusMode ? "max-h-[75vh]" : "max-h-[70vh]"
  );

  const quizContent = (
    <section
      className={cn(
        "mx-auto w-full rounded-2xl border border-primary/15 bg-primary/5 p-6 shadow-sm space-y-6",
        focusMode ? "max-w-4xl" : "max-w-2xl"
      )}
    >
      {quizTitle ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{quizTitle}</h2>
            {quizDescription ? (
              <p className="text-sm text-muted-foreground">{quizDescription}</p>
            ) : null}
            {effectiveTimeLimit ? (
              <p className="text-xs text-muted-foreground">
                Time limit: {effectiveTimeLimit} seconds
                {started && timeRemaining != null
                  ? ` • ${timeRemaining}s remaining`
                  : ""}
              </p>
            ) : null}
            {maxAttempts != null ? (
              <p className="text-xs text-muted-foreground">
                {attemptLoading
                  ? "Checking attempts..."
                  : `Attempts remaining: ${Math.max(
                      0,
                      maxAttempts - (attemptCount ?? 0)
                    )}`}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFocusMode((prev) => !prev)}
          >
            {focusMode ? "Exit Focus (Esc)" : "Focus Mode"}
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading quiz…</div>
      ) : null}

      {!loading && orderedQuestions.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No questions available yet.
        </div>
      ) : null}

      {!started ? (
        <div className="rounded-xl border border-border/60 bg-background/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Quiz Overview</p>
              <p className="text-xs text-muted-foreground">
                {totalQuestions} question{totalQuestions === 1 ? "" : "s"}
                {effectiveTimeLimit
                  ? ` • ${effectiveTimeLimit}s time limit`
                  : ""}
                {maxAttempts != null
                  ? ` • ${maxAttempts} attempt${
                      maxAttempts === 1 ? "" : "s"
                    }`
                  : ""}
              </p>
            </div>
            <Button
              type="button"
              disabled={
                orderedQuestions.length === 0 ||
                (maxAttempts != null &&
                  attemptCount != null &&
                  attemptCount >= maxAttempts)
              }
              onClick={() => {
                setStarted(true);
                startedAtRef.current = Date.now();
                setPageIndex(0);
                setExpandedExplanations({});
                if (effectiveTimeLimit) {
                  setTimeRemaining(effectiveTimeLimit);
                }
              }}
            >
              Start Quiz
            </Button>
          </div>
        </div>
      ) : (
        <div className={questionsContainerClass}>
          <div className="sticky top-0 z-10 rounded-lg border border-border/60 bg-background/90 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
            {totalQuestions > 0
              ? `Questions ${pageStart + 1}–${Math.min(
                  pageStart + pageQuestions.length,
                  totalQuestions
                )} of ${totalQuestions}`
              : "No questions yet"}
            {effectiveTimeLimit && timeRemaining != null
              ? ` • ${timeRemaining}s remaining`
              : ""}
          </div>
          {pageQuestions.map((question, index) => {
            const optionIds = optionOrder[question.id] ?? [];
            const orderedOptions = optionIds.length
              ? optionIds
                  .map((id) => question.options.find((opt) => opt.id === id))
                  .filter(Boolean)
              : question.options;
            const selected = answers[question.id] ?? [];
            const correctIds = question.options
              .filter((opt) => opt.isCorrect)
              .map((opt) => opt.id);
            const multi = correctIds.length > 1;
            const questionScore = evaluation?.perQuestion[question.id] ?? 0;
            const isCorrect =
              submitted && showAnswers ? questionScore === 1 : null;
            const explanationOpen = Boolean(
              expandedExplanations[question.id]
            );
            const showExplanation =
              submitted && showAnswers && question.explanation && explanationOpen;
            const questionNumber = pageStart + index + 1;

          const attachments = Array.isArray(question.attachments)
            ? question.attachments
            : question.attachments
            ? [question.attachments]
            : [];

            return (
              <fieldset
                key={question.id}
                className="rounded-xl border border-border/60 bg-card/50 p-5 space-y-4"
              >
                <legend className="text-base font-semibold text-foreground">
                  {`${questionNumber}.`}
                </legend>

              {question.prompt ? (
                <PayloadRichText
                  content={
                    question.prompt as unknown as Parameters<
                      typeof PayloadRichText
                    >[0]["content"]
                  }
                  className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
                />
              ) : null}

              {attachments.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {attachments.map((item, attachmentIndex) => {
                    const url = resolveMediaUrl(item);
                    if (!url) return null;
                    return (
                      <div
                        key={`${question.id}-media-${attachmentIndex}`}
                        className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60"
                      >
                        <Image
                          src={url}
                          alt="Question attachment"
                          fill
                          className="object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="space-y-2">
                {orderedOptions.map((option) => {
                  if (!option) return null;
                  const isSelected = selected.includes(option.id);
                  const showResult =
                    submitted && showAnswers && option.isCorrect;
                  const isIncorrectSelected =
                    submitted && showAnswers && isSelected && !option.isCorrect;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border border-border/50 px-4 py-3 text-sm transition",
                        isSelected
                          ? "border-primary/60 bg-primary/10"
                          : "bg-background/60",
                        showResult && "border-emerald-500/70 bg-emerald-500/10",
                        isIncorrectSelected &&
                          "border-red-400/70 bg-red-500/10"
                      )}
                    >
                      <input
                        type={multi ? "checkbox" : "radio"}
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={() =>
                          handleSelect(question.id, option.id, multi)
                        }
                        className="mt-1"
                        disabled={submitted}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>

              {submitted && showAnswers ? (
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                  {isCorrect ? (
                    <span className="text-emerald-500">Correct</span>
                  ) : (
                    <span className="text-red-400">Incorrect</span>
                  )}
                  {question.explanation ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                      onClick={() =>
                        setExpandedExplanations((prev) => ({
                          ...prev,
                          [question.id]: !prev[question.id],
                        }))
                      }
                    >
                      {explanationOpen ? "Hide explanation" : "Show explanation"}
                    </button>
                  ) : null}
                </div>
              ) : null}

              {showExplanation ? (
                <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Explanation
                  </div>
                  <PayloadRichText
                    content={
                      question.explanation as unknown as Parameters<
                        typeof PayloadRichText
                      >[0]["content"]
                    }
                    className="prose dark:prose-invert prose-invert leading-7 max-w-none text-foreground"
                  />
                </div>
              ) : null}
              </fieldset>
            );
          })}
        </div>
      )}

      {started ? (
        <div className="flex flex-wrap items-center gap-3">
          {pageCount > 1 && !submitted ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isFirstPage}
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              >
                Previous
              </Button>
              {!isLastPage ? (
                <Button
                  type="button"
                  onClick={() =>
                    setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))
                  }
                >
                  Next
                </Button>
              ) : null}
            </>
          ) : null}
          {(!pageCount || isLastPage || submitted) && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                submitted ||
                orderedQuestions.length === 0 ||
                (maxAttempts != null &&
                  attemptCount != null &&
                  attemptCount >= maxAttempts)
              }
            >
              {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit"}
            </Button>
          )}
          {submitted && evaluation && showAnswers ? (
            <span className="text-sm text-muted-foreground">
              Score: {evaluation.totalScore.toFixed(2)} / {evaluation.maxScore}
            </span>
          ) : null}
          {submitted && !showAnswers ? (
            <span className="text-sm text-muted-foreground">Submitted.</span>
          ) : null}
          {maxAttempts != null &&
          attemptCount != null &&
          attemptCount >= maxAttempts ? (
            <span className="text-sm text-muted-foreground">
              Attempt limit reached.
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );

  if (!focusMode) {
    return quizContent;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-40 bg-background/95 backdrop-blur-lg px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto flex h-full w-full max-w-5xl items-start justify-center overflow-auto">
        <div className="pt-[calc(var(--nav-h,4rem)+0.75rem)] w-full flex justify-center">
          {quizContent}
        </div>
      </div>
    </div>
  );
}
