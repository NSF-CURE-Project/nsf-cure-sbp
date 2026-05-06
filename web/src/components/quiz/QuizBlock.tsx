"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PayloadRichText } from "@/components/ui/payloadRichText";
import { cn } from "@/lib/utils";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import type { QuizBlock as QuizBlockType, QuizDoc, QuizQuestionDoc } from "@/lib/payloadSdk/types";
import {
  gradeQuestionResponse,
  isQuestionAnswered,
  normalizeQuestion,
  type NormalizedQuestion,
  type QuizResponseValue,
} from "@/lib/quiz";

const PAYLOAD_URL = getPayloadBaseUrl();

type Props = {
  block: QuizBlockType;
  lessonId?: string | number;
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

const EMPTY_RESPONSE: QuizResponseValue = {
  selectedOptionIds: [],
  textAnswer: "",
  numericAnswer: "",
};

export function QuizBlock({ block, lessonId }: Props) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [optionOrder, setOptionOrder] = useState<Record<string, string[]>>({});
  const [answers, setAnswers] = useState<Record<string, QuizResponseValue>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState<number | null>(null);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
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
    const orderedQuestions = quiz.shuffleQuestions ? shuffle(questionIds) : questionIds;
    const nextOptionOrder: Record<string, string[]> = {};
    normalizedQuestions.forEach((question) => {
      const optionIds = question.options.map((opt) => opt.id);
      nextOptionOrder[question.id] =
        quiz.shuffleOptions && optionIds.length > 1 ? shuffle(optionIds) : optionIds;
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
    const ids = questionOrder.length ? questionOrder : normalizedQuestions.map((q) => q.id);
    return ids.map((id) => map.get(id)).filter(Boolean) as NormalizedQuestion[];
  }, [normalizedQuestions, questionOrder]);

  const scoring = quiz?.scoring ?? "per-question";
  const quizTitle = block.title || (block.showTitle === false ? undefined : quiz?.title ?? "Quiz");
  const quizDescription = quiz?.description ?? null;
  const showAnswers = block.showAnswers !== false;
  const maxAttempts = typeof block.maxAttempts === "number" ? block.maxAttempts : null;
  const effectiveTimeLimit =
    typeof block.timeLimitSec === "number" ? block.timeLimitSec : quiz?.timeLimitSec ?? null;
  const questionsPerPage = 3;
  const totalQuestions = orderedQuestions.length;
  const pageCount = Math.max(1, Math.ceil(totalQuestions / questionsPerPage));
  const pageStart = pageIndex * questionsPerPage;
  const pageQuestions = orderedQuestions.slice(pageStart, pageStart + questionsPerPage);
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex >= pageCount - 1;
  const answeredQuestionCount = useMemo(
    () =>
      orderedQuestions.filter((question) =>
        isQuestionAnswered(question, answers[question.id] ?? EMPTY_RESPONSE)
      ).length,
    [answers, orderedQuestions]
  );
  const completionPercent = totalQuestions
    ? Math.round((answeredQuestionCount / totalQuestions) * 100)
    : 0;
  const nextUnansweredQuestionIndex = orderedQuestions.findIndex(
    (question) => !isQuestionAnswered(question, answers[question.id] ?? EMPTY_RESPONSE)
  );

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
        const res = await fetch(`${PAYLOAD_URL}/api/quiz-attempts?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setAttemptCount(null);
          return;
        }
        const data = (await res.json()) as { totalDocs?: number };
        setAttemptCount(typeof data.totalDocs === "number" ? data.totalDocs : null);
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
    const perQuestion = orderedQuestions.reduce<Record<string, number>>((acc, question) => {
      const { score } = gradeQuestionResponse(scoring, question, answers[question.id]);
      acc[question.id] = score;
      totalScore += score;
      return acc;
    }, {});
    return {
      perQuestion,
      totalScore,
      maxScore: orderedQuestions.length,
    };
  }, [answers, orderedQuestions, scoring, submitted]);

  const updateResponse = (questionId: string, updater: (current: QuizResponseValue) => QuizResponseValue) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? EMPTY_RESPONSE;
      return { ...prev, [questionId]: updater(current) };
    });
  };

  const handleChoiceSelect = (question: NormalizedQuestion, optionId: string) => {
    updateResponse(question.id, (current) => {
      if (question.questionType === "multi-select") {
        const next = current.selectedOptionIds.includes(optionId)
          ? current.selectedOptionIds.filter((id) => id !== optionId)
          : [...current.selectedOptionIds, optionId];
        return { ...current, selectedOptionIds: next };
      }
      return { ...current, selectedOptionIds: [optionId] };
    });
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    const attemptLimitReached =
      maxAttempts != null && attemptCount != null && attemptCount >= maxAttempts;
    if (attemptLimitReached) return;
    setSubmitting(true);
    const startedAt = startedAtRef.current ?? Date.now();
    const completedAt = Date.now();
    const durationSec = Math.max(0, Math.round((completedAt - startedAt) / 1000));

    const questionOrderPayload = orderedQuestions.map((question) => ({
      question: question.id,
    }));
    const answersPayload = orderedQuestions.map((question) => {
      const response = answers[question.id] ?? EMPTY_RESPONSE;
      return {
        question: question.id,
        selectedOptionIds: response.selectedOptionIds.map((id) => ({ optionId: id })),
        textAnswer: response.textAnswer.trim() || undefined,
        numericAnswer:
          response.numericAnswer.trim().length > 0
            ? Number(response.numericAnswer)
            : undefined,
        optionOrder: (optionOrder[question.id] ?? []).map((id) => ({ optionId: id })),
      };
    });

    let redirectedToReview = false;
    try {
      const response = await fetch(`${PAYLOAD_URL}/api/quiz-attempts`, {
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

      if (response.ok) {
        const attempt = (await response.json().catch(() => null)) as { id?: string | number } | null;
        if (attempt?.id != null) {
          redirectedToReview = true;
          router.push(`/quiz-attempts/${attempt.id}`);
        }
      }
    } finally {
      setSubmitting(false);
      if (!redirectedToReview) {
        setSubmitted(true);
        setAttemptCount((prev) => (typeof prev === "number" ? prev + 1 : prev));
      }
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
            {quizDescription ? <p className="text-sm text-muted-foreground">{quizDescription}</p> : null}
            {effectiveTimeLimit ? (
              <p className="text-xs text-muted-foreground">
                Time limit: {effectiveTimeLimit} seconds
                {started && timeRemaining != null ? ` • ${timeRemaining}s remaining` : ""}
              </p>
            ) : null}
            {maxAttempts != null ? (
              <p className="text-xs text-muted-foreground">
                {attemptLoading
                  ? "Checking attempts..."
                  : `Attempts remaining: ${Math.max(0, maxAttempts - (attemptCount ?? 0))}`}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="outline" onClick={() => setFocusMode((prev) => !prev)}>
            {focusMode ? "Exit Focus (Esc)" : "Focus Mode"}
          </Button>
        </div>
      ) : null}

      {loading ? <div className="text-sm text-muted-foreground">Loading quiz…</div> : null}

      {!loading && orderedQuestions.length === 0 ? (
        <div className="text-sm text-muted-foreground">No questions available yet.</div>
      ) : null}

      {!started ? (
        <div className="rounded-xl border border-border/60 bg-background/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Quiz Overview</p>
              <p className="text-xs text-muted-foreground">
                {totalQuestions} question{totalQuestions === 1 ? "" : "s"}
                {effectiveTimeLimit ? ` • ${effectiveTimeLimit}s time limit` : ""}
                {maxAttempts != null
                  ? ` • ${maxAttempts} attempt${maxAttempts === 1 ? "" : "s"}`
                  : ""}
              </p>
            </div>
            <Button
              type="button"
              disabled={
                orderedQuestions.length === 0 ||
                (maxAttempts != null && attemptCount != null && attemptCount >= maxAttempts)
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
          <div className="sticky top-0 z-20 rounded-xl border border-primary/20 bg-background/95 px-4 py-3 backdrop-blur space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Completion</p>
                <p className="text-sm font-semibold">
                  {answeredQuestionCount}/{totalQuestions} questions answered
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={nextUnansweredQuestionIndex < 0 || submitted}
                  onClick={() => setPageIndex(Math.floor(nextUnansweredQuestionIndex / questionsPerPage))}
                >
                  Next Unanswered
                </Button>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          <div className="sticky top-[5.5rem] z-10 rounded-lg border border-border/60 bg-background/90 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
            {totalQuestions > 0
              ? `Questions ${pageStart + 1}–${Math.min(pageStart + pageQuestions.length, totalQuestions)} of ${totalQuestions}`
              : "No questions yet"}
            {effectiveTimeLimit && timeRemaining != null ? ` • ${timeRemaining}s remaining` : ""}
          </div>
          {pageQuestions.map((question, index) => {
            const selected = answers[question.id] ?? EMPTY_RESPONSE;
            const orderedOptions = question.options.length
              ? (optionOrder[question.id] ?? question.options.map((option) => option.id))
                  .map((id) => question.options.find((opt) => opt.id === id))
                  .filter(Boolean)
              : [];
            const questionScore = evaluation?.perQuestion[question.id] ?? 0;
            const isCorrect = submitted && showAnswers ? questionScore === 1 : null;
            const explanationOpen = Boolean(expandedExplanations[question.id]);
            const showExplanation =
              submitted && showAnswers && question.explanation && explanationOpen;
            const questionNumber = pageStart + index + 1;
            const attachments = Array.isArray(question.attachments)
              ? question.attachments
              : question.attachments
                ? [question.attachments]
                : [];
            const isAnswered = isQuestionAnswered(question, selected);

            return (
              <fieldset
                key={question.id}
                className="rounded-xl border border-border/60 bg-card/50 p-5 space-y-4"
              >
                <legend className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <span>{`${questionNumber}.`}</span>
                  {submitted && showAnswers ? (
                    isCorrect ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-700">
                        Correct
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-700">
                        Review
                      </span>
                    )
                  ) : isAnswered ? (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-blue-700">
                      Answered
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Not Answered
                    </span>
                  )}
                  <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {question.questionType}
                  </span>
                </legend>

                {question.prompt ? (
                  <PayloadRichText
                    content={
                      question.prompt as unknown as Parameters<typeof PayloadRichText>[0]["content"]
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
                          <Image src={url} alt="Question attachment" fill className="object-cover" />
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {(question.questionType === "single-select" ||
                  question.questionType === "multi-select" ||
                  question.questionType === "true-false") && (
                  <div className="space-y-2">
                    {orderedOptions.map((option) => {
                      if (!option) return null;
                      const isSelected = selected.selectedOptionIds.includes(option.id);
                      const showResult = submitted && showAnswers && option.isCorrect;
                      const isIncorrectSelected =
                        submitted && showAnswers && isSelected && !option.isCorrect;
                      return (
                        <label
                          key={option.id}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border border-border/50 px-4 py-3 text-sm transition",
                            isSelected ? "border-primary/60 bg-primary/10" : "bg-background/60",
                            showResult && "border-emerald-500/70 bg-emerald-500/10",
                            isIncorrectSelected && "border-red-400/70 bg-red-500/10"
                          )}
                        >
                          <input
                            type={question.questionType === "multi-select" ? "checkbox" : "radio"}
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={isSelected}
                            onChange={() => handleChoiceSelect(question, option.id)}
                            className="mt-1"
                            disabled={submitted}
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {question.questionType === "short-text" ? (
                  <div className="space-y-2">
                    <textarea
                      value={selected.textAnswer}
                      onChange={(event) =>
                        updateResponse(question.id, (current) => ({
                          ...current,
                          textAnswer: event.target.value,
                        }))
                      }
                      disabled={submitted}
                      rows={3}
                      className="w-full rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm"
                      placeholder="Type your answer"
                    />
                    {submitted && showAnswers ? (
                      <div className="text-xs text-muted-foreground">
                        Accepted answers: {question.acceptedAnswers.join(", ") || "Not available"}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {question.questionType === "numeric" ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={selected.numericAnswer}
                        onChange={(event) =>
                          updateResponse(question.id, (current) => ({
                            ...current,
                            numericAnswer: event.target.value,
                          }))
                        }
                        disabled={submitted}
                        className="w-full rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm"
                        placeholder="Enter a numeric answer"
                      />
                      {question.numericUnit ? (
                        <span className="text-sm text-muted-foreground">{question.numericUnit}</span>
                      ) : null}
                    </div>
                    {submitted && showAnswers && question.numericCorrectValue != null ? (
                      <div className="text-xs text-muted-foreground">
                        Correct value: {question.numericCorrectValue}
                        {question.numericUnit ? ` ${question.numericUnit}` : ""}
                        {question.numericTolerance != null
                          ? ` (tolerance ±${question.numericTolerance})`
                          : ""}
                      </div>
                    ) : null}
                  </div>
                ) : null}

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
                        question.explanation as unknown as Parameters<typeof PayloadRichText>[0]["content"]
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
                  onClick={() => setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))}
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
                (maxAttempts != null && attemptCount != null && attemptCount >= maxAttempts)
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
          {maxAttempts != null && attemptCount != null && attemptCount >= maxAttempts ? (
            <span className="text-sm text-muted-foreground">Attempt limit reached.</span>
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
