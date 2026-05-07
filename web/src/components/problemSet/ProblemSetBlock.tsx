"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parse } from "mathjs";
import { ProblemCard } from "@/components/problemSet/ProblemCard";
import { Button } from "@/components/ui/button";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import type {
  ProblemDoc,
  ProblemSetBlock as ProblemSetBlockType,
  ProblemSetDoc,
} from "@/lib/payloadSdk/types";
import { cn } from "@/lib/utils";

const PAYLOAD_URL = getPayloadBaseUrl();

type Props = {
  block: ProblemSetBlockType;
  lessonId?: string | number;
};

type ProblemPartEval = {
  partIndex: number;
  studentAnswer?: number | null;
  studentExpression?: string | null;
  isCorrect?: boolean | null;
  score?: number | null;
};

type ProblemEval = {
  problem: string;
  parts: ProblemPartEval[];
};

type ProblemAttemptResponse = {
  doc?: {
    answers?: ProblemEval[];
    score?: number | null;
    maxScore?: number | null;
  };
  answers?: ProblemEval[];
  score?: number | null;
  maxScore?: number | null;
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

const normalizeProblem = (value: unknown): ProblemDoc | null => {
  if (!value || typeof value !== "object") return null;
  if (!("id" in value)) return null;
  return value as ProblemDoc;
};

const resolveProblemSet = (value: unknown): ProblemSetDoc | null => {
  if (!value || typeof value !== "object") return null;
  if (!("id" in value)) return null;
  return value as ProblemSetDoc;
};

const isSupportedPartType = (value: string | undefined) =>
  value === "numeric" || value === "symbolic" || value == null;

export function ProblemSetBlock({ block, lessonId }: Props) {
  const [problemSet, setProblemSet] = useState<ProblemSetDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  const [orderedProblemIds, setOrderedProblemIds] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<{
    answers: ProblemEval[];
    score: number;
    maxScore: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const problemSetKeyRef = useRef<string | number | null>(null);
  const problemRefs = useRef<Record<string, HTMLElement | null>>({});
  const variantSeedRef = useRef(
    `run-${Date.now()}-${Math.floor(getRandom() * 1_000_000)}`
  );

  useEffect(() => {
    const source = block.problemSet;
    if (!source) return;
    const resolved = resolveProblemSet(source);
    const id = resolved ? String(resolved.id) : String(source);
    if (!id) return;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          seed: variantSeedRef.current,
        });
        const res = await fetch(
          `${PAYLOAD_URL}/api/public/problem-sets/${encodeURIComponent(id)}?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { doc?: ProblemSetDoc };
        setProblemSet(data.doc ?? null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [block.problemSet]);

  const normalizedProblems = useMemo(() => {
    if (!problemSet?.problems) return [];
    return problemSet.problems
      .map((item) => normalizeProblem(item))
      .filter((item): item is ProblemDoc => Boolean(item));
  }, [problemSet]);

  useEffect(() => {
    if (!problemSet) return;
    if (problemSetKeyRef.current === problemSet.id) return;
    problemSetKeyRef.current = problemSet.id;

    const ids = normalizedProblems.map((problem) => String(problem.id));
    setOrderedProblemIds(problemSet.shuffleProblems ? shuffle(ids) : ids);
    setAnswers({});
    setStarted(false);
    setSubmitted(false);
    setSubmitting(false);
    setEvaluation(null);
    setSubmitError(null);
    startedAtRef.current = null;
  }, [normalizedProblems, problemSet]);

  const orderedProblems = useMemo(() => {
    const map = new Map(
      normalizedProblems.map((problem) => [String(problem.id), problem])
    );
    const sourceIds = orderedProblemIds.length
      ? orderedProblemIds
      : normalizedProblems.map((problem) => String(problem.id));
    return sourceIds
      .map((id) => map.get(id))
      .filter((problem): problem is ProblemDoc => Boolean(problem));
  }, [normalizedProblems, orderedProblemIds]);

  useEffect(() => {
    if (!orderedProblems.length) {
      setActiveProblemId(null);
      return;
    }
    setActiveProblemId((prev) => prev ?? String(orderedProblems[0]?.id ?? ""));
  }, [orderedProblems]);

  const maxAttempts =
    typeof block.maxAttempts === "number"
      ? block.maxAttempts
      : typeof problemSet?.maxAttempts === "number"
        ? problemSet.maxAttempts
        : null;
  const showAnswers =
    typeof block.showAnswers === "boolean"
      ? block.showAnswers
      : problemSet?.showAnswers !== false;
  const blockTitle =
    block.showTitle === false
      ? undefined
      : block.title || problemSet?.title || "Problem Set";

  useEffect(() => {
    if (!problemSet || maxAttempts == null) {
      setAttemptCount(null);
      setAttemptLoading(false);
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      setAttemptLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "1",
          depth: "0",
        });
        params.set("where[problemSet][equals]", String(problemSet.id));
        if (lessonId != null) {
          params.set("where[lesson][equals]", String(lessonId));
        }
        const res = await fetch(
          `${PAYLOAD_URL}/api/problem-attempts?${params.toString()}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          setAttemptCount(null);
          return;
        }
        const payload = (await res.json()) as { totalDocs?: number };
        setAttemptCount(
          typeof payload.totalDocs === "number" ? payload.totalDocs : null
        );
      } finally {
        if (!controller.signal.aborted) {
          setAttemptLoading(false);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [problemSet, lessonId, maxAttempts]);

  const attemptLimitReached =
    maxAttempts != null && attemptCount != null && attemptCount >= maxAttempts;
  const hasLegacyInteractiveParts = useMemo(
    () =>
      orderedProblems.some((problem) =>
        (Array.isArray(problem.parts) ? problem.parts : []).some(
          (part) => !isSupportedPartType(part.partType)
        )
      ),
    [orderedProblems]
  );

  const evaluationByProblem = useMemo(
    () =>
      new Map(
        (evaluation?.answers ?? []).map((answer) => [answer.problem, answer])
      ),
    [evaluation]
  );

  const isAnswerFilled = (value: string | undefined) =>
    typeof value === "string" && value.trim().length > 0;

  const partProgressByProblem = useMemo(() => {
    return new Map(
      orderedProblems.map((problem) => {
        const problemId = String(problem.id);
        const total = Array.isArray(problem.parts) ? problem.parts.length : 0;
        const answered = Array.from({ length: total }).filter((_, partIndex) =>
          isAnswerFilled(answers[problemId]?.[partIndex])
        ).length;
        return [problemId, { answered, total }] as const;
      })
    );
  }, [answers, orderedProblems]);

  const getProblemStatus = (problemId: string) => {
    const parts = evaluationByProblem.get(problemId)?.parts ?? [];
    if (submitted && parts.length) {
      const allCorrect = parts.every((part) => Boolean(part.isCorrect));
      return allCorrect ? "correct" : "review";
    }
    const progress = partProgressByProblem.get(problemId);
    const hasInput = Boolean(progress && progress.answered > 0);
    const isReady = Boolean(
      progress && progress.total > 0 && progress.answered >= progress.total
    );
    if (!started) return "locked";
    if (isReady) return "ready";
    return hasInput ? "progress" : "pending";
  };

  const completedCount = orderedProblems.filter((problem) =>
    ["correct", "review", "ready"].includes(
      getProblemStatus(String(problem.id))
    )
  ).length;
  const progressPercent = orderedProblems.length
    ? Math.round((completedCount / orderedProblems.length) * 100)
    : 0;
  const activeProblemIndex = orderedProblems.findIndex(
    (problem) => String(problem.id) === activeProblemId
  );
  const nextIncompleteProblemId = orderedProblems.find((problem) => {
    const problemId = String(problem.id);
    const progress = partProgressByProblem.get(problemId);
    if (!progress || progress.total === 0) return false;
    return progress.answered < progress.total;
  })?.id;

  const scrollToProblem = (problemId: string) => {
    const node = problemRefs.current[problemId];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveProblemId(problemId);
  };

  const hasInvalidSymbolicInput = useMemo(() => {
    for (const problem of orderedProblems) {
      const problemId = String(problem.id);
      const partValues = answers[problemId] ?? {};
      const parts = Array.isArray(problem.parts) ? problem.parts : [];
      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        if (part.partType !== "symbolic") continue;
        const rawValue = partValues[index];
        const expression = typeof rawValue === "string" ? rawValue.trim() : "";
        if (!expression) return true;
        try {
          parse(expression);
        } catch {
          return true;
        }
      }
    }
    return false;
  }, [answers, orderedProblems]);

  const handleAnswerChange = (
    problemId: string,
    partIndex: number,
    value: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [problemId]: {
        ...(prev[problemId] ?? {}),
        [partIndex]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!problemSet || submitting || attemptLimitReached || !started) return;
    if (hasLegacyInteractiveParts) {
      setSubmitError(
        "This problem set contains legacy interactive parts that are no longer supported in the frontend."
      );
      return;
    }
    if (hasInvalidSymbolicInput) {
      setSubmitError("Fix invalid symbolic expressions before submitting.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const startedAt = startedAtRef.current ?? Date.now();
    const completedAt = Date.now();
    const durationSec = Math.max(
      0,
      Math.round((completedAt - startedAt) / 1000)
    );

    const answersPayload = orderedProblems.map((problem) => {
      const problemId = String(problem.id);
      const partValues = answers[problemId] ?? {};
      const parts = Array.isArray(problem.parts) ? problem.parts : [];
      return {
        problem: problem.id,
        variantSeed:
          typeof problem.variant?.seed === "string"
            ? problem.variant.seed
            : null,
        variantSignature:
          typeof problem.variant?.signature === "string"
            ? problem.variant.signature
            : null,
        parts: parts.map((_, partIndex) => {
          const part = parts[partIndex];
          const raw = partValues[partIndex];
          if (part?.partType === "symbolic") {
            return {
              partIndex,
              studentExpression: typeof raw === "string" ? raw : "",
              studentAnswer: null,
            };
          }
          if (raw == null || raw === "") {
            return {
              partIndex,
              studentAnswer: null,
              studentExpression: null,
            };
          }
          const parsed = Number.parseFloat(typeof raw === "string" ? raw : "");
          return {
            partIndex,
            studentAnswer: Number.isFinite(parsed) ? parsed : null,
            studentExpression: null,
          };
        }),
      };
    });

    let didSucceed = false;
    try {
      const res = await fetch(`${PAYLOAD_URL}/api/problem-attempts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemSet: problemSet.id,
          lesson: lessonId,
          answers: answersPayload,
          startedAt: new Date(startedAt).toISOString(),
          completedAt: new Date(completedAt).toISOString(),
          durationSec,
        }),
      });

      const payload = (await res
        .json()
        .catch(() => null)) as ProblemAttemptResponse | null;

      if (res.ok) {
        const doc = payload?.doc ?? payload;
        setEvaluation({
          answers: Array.isArray(doc?.answers) ? doc.answers : [],
          score: Number(doc?.score ?? 0),
          maxScore: Number(doc?.maxScore ?? 0),
        });
        didSucceed = true;
      } else {
        setSubmitError("Could not submit this attempt. Please try again.");
      }
    } catch {
      setSubmitError("Could not submit this attempt. Please try again.");
    } finally {
      setSubmitting(false);
      if (didSucceed) {
        setSubmitted(true);
        setAttemptCount((prev) => (typeof prev === "number" ? prev + 1 : prev));
      }
    }
  };

  if (!block.problemSet) return null;

  return (
    <section className="mx-auto w-full max-w-6xl rounded-xl border border-primary/15 bg-primary/5 p-6 shadow-sm space-y-5">
      {blockTitle ? (
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold">{blockTitle}</h2>
          {problemSet?.description ? (
            <p className="text-sm text-muted-foreground">
              {problemSet.description}
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
        </header>
      ) : null}

      {loading ? (
        <div className="text-sm text-muted-foreground">
          Loading problem set…
        </div>
      ) : null}

      {!loading && orderedProblems.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No problems available yet.
        </div>
      ) : null}

      {!started ? (
        <div className="rounded-lg border border-border/60 bg-background/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {orderedProblems.length} problem
              {orderedProblems.length === 1 ? "" : "s"}
              {maxAttempts != null
                ? ` • ${maxAttempts} attempt${maxAttempts === 1 ? "" : "s"}`
                : ""}
            </p>
            {hasLegacyInteractiveParts ? (
              <p className="w-full text-sm text-amber-200">
                This set contains legacy interactive problems and cannot be attempted in the current frontend.
              </p>
            ) : null}
            <Button
              type="button"
              disabled={
                orderedProblems.length === 0 ||
                attemptLimitReached ||
                hasLegacyInteractiveParts
              }
              onClick={() => {
                setStarted(true);
                startedAtRef.current = Date.now();
                if (orderedProblems.length) {
                  setActiveProblemId(String(orderedProblems[0]?.id ?? ""));
                }
              }}
            >
              Start Problem Set
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="sticky top-2 z-20 rounded-lg border border-primary/20 bg-background/95 backdrop-blur px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Progress
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {completedCount}/{orderedProblems.length} complete
                </p>
                {activeProblemIndex >= 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Working on Problem {activeProblemIndex + 1}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden h-2 w-44 overflow-hidden rounded-full bg-muted/50 sm:block">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-primary">
                  {progressPercent}%
                </span>
              </div>
            </div>
            {orderedProblems.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {orderedProblems.map((problem, idx) => {
                  const problemId = String(problem.id);
                  const status = getProblemStatus(problemId);
                  return (
                    <button
                      key={problemId}
                      type="button"
                      onClick={() => scrollToProblem(problemId)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition",
                        problemId === activeProblemId
                          ? "border-primary bg-primary/10 text-primary"
                          : status === "correct"
                            ? "border-emerald-300 bg-emerald-500/10 text-emerald-500"
                            : status === "review"
                              ? "border-amber-300 bg-amber-500/10 text-amber-500"
                              : status === "ready"
                                ? "border-primary/30 bg-primary/5 text-foreground"
                                : status === "progress"
                                  ? "border-primary/25 bg-background text-foreground"
                                  : "border-border/60 bg-background/70 text-muted-foreground"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            {orderedProblems.map((problem) => {
              const problemId = String(problem.id);
              return (
                <div
                  key={problemId}
                  ref={(node) => {
                    problemRefs.current[problemId] = node;
                  }}
                >
                  <ProblemCard
                    problem={problem}
                    index={orderedProblems.findIndex(
                      (item) => String(item.id) === problemId
                    )}
                    partAnswers={answers[problemId] ?? {}}
                    onChange={(partIndex, value) =>
                      handleAnswerChange(problemId, partIndex, value)
                    }
                    submitted={submitted}
                    evaluation={evaluationByProblem.get(problemId)}
                    showAnswers={showAnswers}
                    isActive={problemId === activeProblemId}
                    onFocus={() => setActiveProblemId(problemId)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/70 p-4">
            <div className="space-y-1">
              {submitError ? (
                <p className="text-sm font-medium text-red-500">{submitError}</p>
              ) : submitted && evaluation ? (
                <p className="text-sm font-medium text-foreground">
                  Final score: {evaluation.score.toFixed(2)} /{" "}
                  {evaluation.maxScore.toFixed(2)}
                </p>
              ) : nextIncompleteProblemId ? (
                <p className="text-sm text-muted-foreground">
                  Next incomplete problem:{" "}
                  {orderedProblems.findIndex(
                    (problem) => problem.id === nextIncompleteProblemId
                  ) + 1}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All current parts are filled. Submit when ready.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {nextIncompleteProblemId && !submitted ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => scrollToProblem(String(nextIncompleteProblemId))}
                >
                  Jump to next incomplete
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={
                  submitting ||
                  submitted ||
                  attemptLimitReached ||
                  orderedProblems.length === 0 ||
                  hasLegacyInteractiveParts
                }
              >
                {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit Problem Set"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
