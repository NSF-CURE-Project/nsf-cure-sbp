import { describe, expect, it } from "vitest";

import {
  gradePart,
  gradeProblemAttemptAnswers,
  roundToSigFigs,
} from "@/utils/problemGrading";

describe("problemGrading", () => {
  it("roundToSigFigs rounds values to requested significant figures", () => {
    expect(roundToSigFigs(1234.567, 3)).toBe(1230);
    expect(roundToSigFigs(0.0123456, 2)).toBe(0.012);
  });

  it("gradePart supports absolute and relative tolerances", () => {
    expect(
      gradePart(9.96, {
        correctAnswer: 10,
        tolerance: 0.05,
        toleranceType: "absolute",
      }).isCorrect
    ).toBe(true);
    expect(
      gradePart(9.9, {
        correctAnswer: 10,
        tolerance: 0.005,
        toleranceType: "relative",
      }).isCorrect
    ).toBe(false);
    expect(
      gradePart(9.96, {
        correctAnswer: 10,
        tolerance: 0.005,
        toleranceType: "relative",
      }).isCorrect
    ).toBe(true);
  });

  it("gradePart supports linear-decay and stepped modes", () => {
    const linear = gradePart(97, {
      correctAnswer: 100,
      tolerance: 0.1,
      toleranceType: "relative",
      scoringMode: "linear-decay",
    });
    expect(linear.score).toBeCloseTo(0.7, 6);
    expect(linear.isCorrect).toBe(false);

    const steppedPerfect = gradePart(101, {
      correctAnswer: 100,
      tolerance: 0.1,
      toleranceType: "relative",
      scoringMode: "stepped",
      scoringSteps: [
        { errorBound: 0.02, score: 1.0 },
        { errorBound: 0.05, score: 0.75 },
        { errorBound: 0.1, score: 0.5 },
      ],
    });
    expect(steppedPerfect.score).toBe(1);

    const steppedMid = gradePart(103, {
      correctAnswer: 100,
      tolerance: 0.1,
      toleranceType: "relative",
      scoringMode: "stepped",
      scoringSteps: [
        { errorBound: 0.02, score: 1.0 },
        { errorBound: 0.05, score: 0.75 },
        { errorBound: 0.1, score: 0.5 },
      ],
    });
    expect(steppedMid.score).toBe(0.75);

    const steppedOut = gradePart(112, {
      correctAnswer: 100,
      tolerance: 0.1,
      toleranceType: "relative",
      scoringMode: "stepped",
      scoringSteps: [
        { errorBound: 0.02, score: 1.0 },
        { errorBound: 0.05, score: 0.75 },
        { errorBound: 0.1, score: 0.5 },
      ],
    });
    expect(steppedOut.score).toBe(0);
  });

  it("gradeProblemAttemptAnswers normalizes and scores all parts", async () => {
    const graded = await gradeProblemAttemptAnswers(
      [
        {
          problem: "p1",
          parts: [
            { partIndex: 0, studentAnswer: 100.04 },
            { partIndex: 1, studentAnswer: 4.8 },
          ],
        },
        {
          problem: "p2",
          parts: [{ partIndex: 0, studentAnswer: 0.199 }],
        },
      ],
      [
        {
          id: "p1",
          parts: [
            {
              correctAnswer: 100,
              tolerance: 0.05,
              toleranceType: "absolute",
            },
            {
              correctAnswer: 5,
              tolerance: 0.01,
              toleranceType: "relative",
            },
          ],
        },
        {
          id: "p2",
          parts: [
            {
              correctAnswer: 0.2,
              tolerance: 0.005,
              toleranceType: "absolute",
              significantFigures: 2,
            },
          ],
        },
      ]
    );

    expect(graded.score).toBe(2);
    expect(graded.maxScore).toBe(3);
    expect(graded.correctCount).toBe(2);
    expect(graded.answers).toEqual([
      {
        problem: "p1",
        parts: [
          {
            partIndex: 0,
            studentAnswer: 100.04,
            studentExpression: null,
            placedForces: null,
            isCorrect: true,
            score: 1,
          },
          {
            partIndex: 1,
            studentAnswer: 4.8,
            studentExpression: null,
            placedForces: null,
            isCorrect: false,
            score: 0,
          },
        ],
      },
      {
        problem: "p2",
        parts: [
          {
            partIndex: 0,
            studentAnswer: 0.199,
            studentExpression: null,
            placedForces: null,
            isCorrect: true,
            score: 1,
          },
        ],
      },
    ]);
  });

});
