import { describe, expect, it } from "vitest";

import { getQuestionIssues, gradeQuizAnswer } from "@/lib/quiz";

describe("quiz multi-format support", () => {
  it("infers legacy multi-select questions and applies partial scoring", () => {
    const graded = gradeQuizAnswer(
      {
        options: [
          { id: "a", label: "A", isCorrect: true },
          { id: "b", label: "B", isCorrect: true },
          { id: "c", label: "C", isCorrect: false },
        ],
      },
      {
        selectedOptionIds: [{ optionId: "a" }, { optionId: "c" }],
      },
      "partial"
    );

    expect(graded.responseKind).toBe("option-selection");
    expect(graded.score).toBe(0);
    expect(graded.isCorrect).toBe(false);
  });

  it("grades short-text answers with normalized matching", () => {
    const graded = gradeQuizAnswer(
      {
        questionType: "short-text",
        acceptedAnswers: ["Normal Stress", "stress"],
        textMatchMode: "normalized",
      },
      {
        textAnswer: "  normal   stress ",
      },
      "per-question"
    );

    expect(graded.responseKind).toBe("text");
    expect(graded.normalizedAnswer).toBe("normal stress");
    expect(graded.isCorrect).toBe(true);
  });

  it("grades numeric answers within tolerance", () => {
    const graded = gradeQuizAnswer(
      {
        questionType: "numeric",
        numericCorrectValue: 12.5,
        numericTolerance: 0.1,
      },
      {
        numericAnswer: 12.58,
      },
      "per-question"
    );

    expect(graded.responseKind).toBe("numeric");
    expect(graded.isCorrect).toBe(true);
  });

  it("reports validation issues for unsupported question configuration", () => {
    expect(
      getQuestionIssues({
        questionType: "short-text",
        acceptedAnswers: [],
      })
    ).toContain("needs at least 1 accepted answer");

    expect(
      getQuestionIssues({
        questionType: "numeric",
        numericCorrectValue: undefined,
      })
    ).toContain("needs a numeric correct value");
  });
});
