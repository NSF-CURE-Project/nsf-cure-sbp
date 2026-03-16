import { describe, expect, it } from "vitest";

import { gradePart } from "../../../web/src/lib/problemSet/grading";

describe("web problem set gradePart", () => {
  it("grades absolute tolerance correctly", () => {
    const config = {
      correctAnswer: 10,
      tolerance: 0.05,
      toleranceType: "absolute" as const,
    };

    expect(gradePart(10.04, config).isCorrect).toBe(true);
    expect(gradePart(10.051, config).isCorrect).toBe(false);
  });

  it("grades relative tolerance correctly", () => {
    const config = {
      correctAnswer: 200,
      tolerance: 0.01,
      toleranceType: "relative" as const,
    };

    expect(gradePart(198.1, config).isCorrect).toBe(true);
    expect(gradePart(197.9, config).isCorrect).toBe(false);
  });

  it("applies significant figures before comparison", () => {
    const config = {
      correctAnswer: 12.3,
      tolerance: 0.01,
      toleranceType: "absolute" as const,
      significantFigures: 3,
    };

    expect(gradePart(12.299, config).isCorrect).toBe(true);
    expect(gradePart(12.36, config).isCorrect).toBe(false);
  });

  it("supports linear-decay and stepped scoring modes", () => {
    const linear = gradePart(97, {
      correctAnswer: 100,
      tolerance: 0.1,
      toleranceType: "relative",
      scoringMode: "linear-decay",
    });
    expect(linear.score).toBeCloseTo(0.7, 6);
    expect(linear.isCorrect).toBe(false);

    const steppedExact = gradePart(101, {
      correctAnswer: 100,
      tolerance: 0.1,
      toleranceType: "relative",
      scoringMode: "stepped",
      scoringSteps: [
        { errorBound: 0.02, score: 1 },
        { errorBound: 0.05, score: 0.75 },
        { errorBound: 0.1, score: 0.5 },
      ],
    });
    expect(steppedExact.score).toBe(1);

    const steppedMid = gradePart(104, {
      correctAnswer: 100,
      tolerance: 0.1,
      toleranceType: "relative",
      scoringMode: "stepped",
      scoringSteps: [
        { errorBound: 0.02, score: 1 },
        { errorBound: 0.05, score: 0.75 },
        { errorBound: 0.1, score: 0.5 },
      ],
    });
    expect(steppedMid.score).toBe(0.75);

    const steppedOut = gradePart(113, {
      correctAnswer: 100,
      tolerance: 0.1,
      toleranceType: "relative",
      scoringMode: "stepped",
      scoringSteps: [
        { errorBound: 0.02, score: 1 },
        { errorBound: 0.05, score: 0.75 },
        { errorBound: 0.1, score: 0.5 },
      ],
    });
    expect(steppedOut.score).toBe(0);
  });
});
