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
  if (assignment) {
    const cookie = (await headers()).get("cookie") ?? "";
    const saved = await fetch(`${getPayloadBaseUrl()}/api/practice-attempts/record`, {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ ...assignment, action: "submit", seed, submissionId,
        version: problem.version, responses: parts.map((part) => part.response) }),
    }).catch(() => null);
    const result = await saved?.json().catch(() => null);
    tracking = saved?.ok
      ? result?.completed ? "Practice completed. Your attempt was saved." : "Attempt saved. Answer every part to complete this activity."
      : result?.error ?? "Your attempt could not be saved. Check the connection and try again.";
    if (!saved || saved.status >= 500) {
      return { parts, solution: renderPracticeHtml(problem.solution, data), tracking,
        nextSubmissionId: typeof submissionId === "string" ? submissionId : randomUUID() };
    }
  }
  return {
    parts,
    tracking,
    nextSubmissionId: randomUUID(),
    solution: renderPracticeHtml(problem.solution, data),
  };
}
