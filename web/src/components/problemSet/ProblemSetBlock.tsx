"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parse } from "mathjs";
import {
  type FBDPlacedAnswer,
  type PlacedForce,
  type PlacedMoment,
} from "@/components/problemSet/FBDCanvas";
import { ProblemCard } from "@/components/problemSet/ProblemCard";
import { Button } from "@/components/ui/button";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import type {
  ProblemDoc,
  ProblemSetBlock as ProblemSetBlockType,
  ProblemSetDoc,
} from "@/lib/payloadSdk/types";

const PAYLOAD_URL = getPayloadBaseUrl();

type Props = {
  block: ProblemSetBlockType;
  lessonId?: string | number;
};

type ProblemPartEval = {
  partIndex: number;
  studentAnswer?: number | null;
  studentExpression?: string | null;
  placedForces?: { forces?: PlacedForce[]; moments?: PlacedMoment[] } | null;
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

export function ProblemSetBlock({ block, lessonId }: Props) {
  const [problemSet, setProblemSet] = useState<ProblemSetDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState<number | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, Record<number, string | FBDPlacedAnswer>>
  >({});
  const [orderedProblemIds, setOrderedProblemIds] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<{
    answers: ProblemEval[];
    score: number;
    maxScore: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const problemSetKeyRef = useRef<string | number | null>(null);

  useEffect(() => {
    const source = block.problemSet;
    if (!source) return;

    const resolved = resolveProblemSet(source);
    if (resolved) {
      setProblemSet(resolved);
      return;
    }

    const id = String(source);
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${PAYLOAD_URL}/api/problem-sets/${encodeURIComponent(id)}?depth=3`,
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
    const map = new Map(normalizedProblems.map((problem) => [String(problem.id), problem]));
    const sourceIds = orderedProblemIds.length
      ? orderedProblemIds
      : normalizedProblems.map((problem) => String(problem.id));
    return sourceIds
      .map((id) => map.get(id))
      .filter((problem): problem is ProblemDoc => Boolean(problem));
  }, [normalizedProblems, orderedProblemIds]);

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

  const evaluationByProblem = useMemo(
    () => new Map((evaluation?.answers ?? []).map((answer) => [answer.problem, answer])),
    [evaluation]
  );
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
    value: string | FBDPlacedAnswer
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
    if (hasInvalidSymbolicInput) {
      setSubmitError("Fix invalid symbolic expressions before submitting.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const startedAt = startedAtRef.current ?? Date.now();
    const completedAt = Date.now();
    const durationSec = Math.max(0, Math.round((completedAt - startedAt) / 1000));

    const answersPayload = orderedProblems.map((problem) => {
      const problemId = String(problem.id);
      const partValues = answers[problemId] ?? {};
      const parts = Array.isArray(problem.parts) ? problem.parts : [];
      return {
        problem: problem.id,
        parts: parts.map((_, partIndex) => {
          const part = parts[partIndex];
          const raw = partValues[partIndex];
          if (part?.partType === "symbolic") {
            return {
              partIndex,
              studentExpression: typeof raw === "string" ? raw : "",
              studentAnswer: null,
              placedForces: null,
            };
          }
          if (part?.partType === "fbd-draw") {
            const fbdValue: FBDPlacedAnswer =
              raw && typeof raw === "object" && !Array.isArray(raw)
                ? ({
                    forces: Array.isArray((raw as FBDPlacedAnswer).forces)
                      ? (raw as FBDPlacedAnswer).forces
                      : [],
                    moments: Array.isArray((raw as FBDPlacedAnswer).moments)
                      ? (raw as FBDPlacedAnswer).moments
                      : [],
                  } as FBDPlacedAnswer)
                : {
                    forces: Array.isArray(raw) ? raw : [],
                    moments: [],
                  };
            return {
              partIndex,
              studentAnswer: null,
              studentExpression: null,
              placedForces: {
                forces: fbdValue.forces,
                moments: fbdValue.moments,
              },
            };
          }
          if (raw == null || raw === "") {
            return {
              partIndex,
              studentAnswer: null,
              studentExpression: null,
              placedForces: null,
            };
          }
          const parsed = Number.parseFloat(typeof raw === "string" ? raw : "");
          return {
            partIndex,
            studentAnswer: Number.isFinite(parsed) ? parsed : null,
            studentExpression: null,
            placedForces: null,
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

      const payload = (await res.json().catch(() => null)) as
        | ProblemAttemptResponse
        | null;

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
    <section className="mx-auto w-full max-w-4xl rounded-2xl border border-primary/15 bg-primary/5 p-6 shadow-sm space-y-5">
      {blockTitle ? (
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold">{blockTitle}</h2>
          {problemSet?.description ? (
            <p className="text-sm text-muted-foreground">{problemSet.description}</p>
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

      {loading ? <div className="text-sm text-muted-foreground">Loading problem set…</div> : null}

      {!loading && orderedProblems.length === 0 ? (
        <div className="text-sm text-muted-foreground">No problems available yet.</div>
      ) : null}

      {!started ? (
        <div className="rounded-xl border border-border/60 bg-background/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {orderedProblems.length} problem{orderedProblems.length === 1 ? "" : "s"}
              {maxAttempts != null
                ? ` • ${maxAttempts} attempt${maxAttempts === 1 ? "" : "s"}`
                : ""}
            </p>
            <Button
              type="button"
              disabled={orderedProblems.length === 0 || attemptLimitReached}
              onClick={() => {
                setStarted(true);
                startedAtRef.current = Date.now();
              }}
            >
              Start Problem Set
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orderedProblems.map((problem, index) => {
            const problemId = String(problem.id);
            return (
              <ProblemCard
                key={problemId}
                problem={problem}
                index={index}
                partAnswers={answers[problemId] ?? {}}
                onChange={(partIndex, value) =>
                  handleAnswerChange(problemId, partIndex, value)
                }
                submitted={submitted}
                evaluation={evaluationByProblem.get(problemId)}
                showAnswers={showAnswers}
              />
            );
          })}
        </div>
      )}

      {started ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              submitted ||
              orderedProblems.length === 0 ||
              attemptLimitReached ||
              hasInvalidSymbolicInput
            }
          >
            {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit"}
          </Button>
          {submitted && showAnswers && evaluation ? (
            <span className="text-sm text-muted-foreground">
              Score: {evaluation.score} / {evaluation.maxScore}
            </span>
          ) : null}
          {submitted && !showAnswers ? (
            <span className="text-sm text-muted-foreground">Submitted.</span>
          ) : null}
          {attemptLimitReached ? (
            <span className="text-sm text-muted-foreground">Attempt limit reached.</span>
          ) : null}
        </div>
      ) : null}
      {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
    </section>
  );
}
