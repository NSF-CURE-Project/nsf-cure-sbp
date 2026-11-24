"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPayloadBaseUrl } from "@/lib/payloadSdk/payloadUrl";
import { practiceUuid, type PracticeAssignment } from "@/lib/practice/assignment";
import { getProblem, instantiate, matchesSignificantFigures, parseResponse, practiceEnabled, renderPracticeHtml } from "@/lib/practice/library";

export type PracticeResult = {
  parts: { response: string; correct: boolean; expected: string; invalid: boolean }[];
  solution: string;
  nextSubmissionId: string;
  tracking?: string;
  localProgress?: {
    problemId: string;
    status: "in-progress" | "completed";
    seed: string;
    score: number;
    maxScore: number;
  };
};

export async function gradePractice(id: string, seed: string, assignment: PracticeAssignment | null,
  _previous: PracticeResult | null, form: FormData): Promise<PracticeResult> {
  const problem = getProblem(id);
  if (!practiceEnabled() || !problem?.parts || !practiceUuid.test(seed)) notFound();
  const { data, values } = instantiate(problem, seed);
  const parts = problem.parts.map((part, index) => {
      const field = form.get(`part-${index}`);
      const response = typeof field === "string" ? field.slice(0, 100) : "";
      const parsed = parseResponse(response);
      const expected = values[index];
      return {
        response,
        correct: parsed !== null && matchesSignificantFigures(parsed, expected, part.digits),
        expected: expected.toPrecision(part.digits),
        invalid: parsed === null,
      };
    });
  const submissionId = form.get("submissionId");
  let tracking: string | undefined;
  const cookie = (await headers()).get("cookie") ?? "";
  const payload = assignment
    ? { ...assignment, action: "submit", seed, submissionId,
        version: problem.version, responses: parts.map((part) => part.response) }
    : { problemId: id, action: "submit", seed, submissionId,
        version: problem.version, responses: parts.map((part) => part.response) };
  const saved = await fetch(`${getPayloadBaseUrl()}/api/practice-attempts/record`, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(payload),
  }).catch(() => null);
  const result = await saved?.json().catch(() => null);
  if (saved?.ok && result?.persisted === false) {
    tracking = result?.completed
      ? "Completed on this device. Sign in to sync progress across devices."
      : "Attempt checked on this device. Sign in to sync progress across devices.";
  } else if (saved?.ok) {
    tracking = result?.completed
      ? "Practice completed. Your attempt was saved."
      : assignment
        ? "Attempt saved. Answer every part to complete this activity."
        : "Attempt saved. Correct every part to mark this problem complete.";
  } else if (saved) {
    tracking = result?.error ?? "Your attempt could not be saved. Check the connection and try again.";
  }
  if (saved && saved.status >= 500) {
    return { parts, solution: renderPracticeHtml(problem.solution, data), tracking,
      nextSubmissionId: typeof submissionId === "string" ? submissionId : randomUUID() };
  }
  return {
    parts,
    tracking,
    nextSubmissionId: randomUUID(),
    solution: renderPracticeHtml(problem.solution, data),
    localProgress: {
      problemId: id,
      status: parts.every((part) => part.correct) ? "completed" as const : "in-progress" as const,
      seed,
      score: parts.filter((part) => part.correct).length,
      maxScore: parts.length,
    },
  };
}
