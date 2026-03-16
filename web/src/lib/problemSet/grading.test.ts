import test from "node:test";
import assert from "node:assert/strict";

import { gradePart } from "./grading";

test("gradePart: absolute tolerance", () => {
  const config = {
    correctAnswer: 10,
    tolerance: 0.05,
    toleranceType: "absolute" as const,
  };

  assert.equal(gradePart(10.04, config).isCorrect, true);
  assert.equal(gradePart(10.051, config).isCorrect, false);
});

test("gradePart: relative tolerance", () => {
  const config = {
    correctAnswer: 200,
    tolerance: 0.01,
    toleranceType: "relative" as const,
  };

  assert.equal(gradePart(198.1, config).isCorrect, true);
  assert.equal(gradePart(197.9, config).isCorrect, false);
});

test("gradePart: significant figures applied before comparison", () => {
  const config = {
    correctAnswer: 12.3,
    tolerance: 0.01,
    toleranceType: "absolute" as const,
    significantFigures: 3,
  };

  assert.equal(gradePart(12.299, config).isCorrect, true);
  assert.equal(gradePart(12.36, config).isCorrect, false);
});
