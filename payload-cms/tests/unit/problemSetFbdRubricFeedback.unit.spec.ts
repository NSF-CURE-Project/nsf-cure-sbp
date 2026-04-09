import { describe, expect, it } from "vitest";

import { buildFbdRubricFeedback } from "../../../web/src/lib/problemSet/fbdRubricFeedback";

describe("web FBD rubric feedback helper", () => {
  it("matches each submitted force at most once", () => {
    const feedback = buildFbdRubricFeedback(
      {
        requiredForces: [
          { id: "N1", correctAngle: 90, angleTolerance: 5 },
          { id: "N2", correctAngle: 90, angleTolerance: 5 },
        ],
      },
      {
        forces: [{ id: "f1", origin: [0, 0], angle: 90, magnitude: 1, label: "N" }],
      }
    );

    expect(feedback.requiredForceStatuses).toHaveLength(2);
    expect(feedback.requiredForceStatuses[0]?.matched).toBe(true);
    expect(feedback.requiredForceStatuses[1]?.matched).toBe(false);
    expect(feedback.matchedForceCount).toBe(1);
  });

  it("computes extra-force penalty beyond forbidden allowance", () => {
    const feedback = buildFbdRubricFeedback(
      {
        requiredForces: [
          { id: "N", correctAngle: 90, angleTolerance: 5 },
          {
            id: "F",
            correctAngle: 180,
            angleTolerance: 5,
            magnitudeRequired: true,
            correctMagnitude: 1,
            magnitudeTolerance: 0.1,
          },
        ],
        requiredMoments: [
          {
            id: "M",
            direction: "cw",
            magnitudeRequired: true,
            correctMagnitude: 2,
            magnitudeTolerance: 0.2,
          },
        ],
        forbiddenForces: 0,
      },
      {
        forces: [
          { id: "s1", origin: [0, 0], angle: 90, magnitude: 1, label: "N" },
          { id: "s2", origin: [0, 0], angle: 180, magnitude: 1.05, label: "F" },
          { id: "x", origin: [0, 0], angle: 20, magnitude: 1, label: "X" },
        ],
        moments: [
          { id: "m1", label: "M", x: 1, y: 1, direction: "cw", magnitude: 2.1 },
        ],
      }
    );

    expect(feedback.matchedForceCount).toBe(2);
    expect(feedback.matchedMomentCount).toBe(1);
    expect(feedback.totalRequired).toBe(3);
    expect(feedback.extraForcesCount).toBe(1);
    expect(feedback.extraForcesPenalty).toBeCloseTo(1 / 3, 6);
  });

  it("does not apply penalty when extra forces are within allowed forbiddenForces", () => {
    const feedback = buildFbdRubricFeedback(
      {
        requiredForces: [{ id: "N", correctAngle: 90, angleTolerance: 5 }],
        forbiddenForces: 1,
      },
      {
        forces: [
          { id: "s1", origin: [0, 0], angle: 90, magnitude: 1, label: "N" },
          { id: "s2", origin: [0, 0], angle: 0, magnitude: 1, label: "X" },
        ],
      }
    );

    expect(feedback.extraForcesCount).toBe(0);
    expect(feedback.extraForcesPenalty).toBe(0);
  });
});
