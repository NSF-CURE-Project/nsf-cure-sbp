export type PartGradingConfig = {
  correctAnswer: number;
  tolerance: number;
  toleranceType: "absolute" | "relative";
  significantFigures?: number | null;
  scoringMode?: "threshold" | "linear-decay" | "stepped";
  scoringSteps?: { errorBound: number; score: number }[] | null;
};

const roundToSigFigs = (value: number, sigFigs: number): number => {
  if (!Number.isFinite(value) || value === 0) return value;
  const sig = Math.max(1, Math.trunc(sigFigs));
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = 10 ** (sig - magnitude - 1);
  return Math.round(value * factor) / factor;
};

const clampScore = (value: number) => Math.max(0, Math.min(1, value));

const getNormalizedError = (studentRaw: number, config: PartGradingConfig): number => {
  let student = studentRaw;
  if (config.significantFigures && config.significantFigures > 0) {
    student = roundToSigFigs(student, config.significantFigures);
  }

  const diff = Math.abs(student - config.correctAnswer);
  if (config.toleranceType === "relative") {
    const denominator = Math.abs(config.correctAnswer);
    if (denominator === 0) return diff;
    return diff / denominator;
  }
  return diff;
};

export function gradePart(
  studentRaw: number,
  config: PartGradingConfig
): { score: number; isCorrect: boolean } {
  const tolerance = Math.abs(config.tolerance);
  const normalizedError = getNormalizedError(studentRaw, config);
  const scoringMode = config.scoringMode ?? "threshold";

  if (scoringMode === "linear-decay") {
    const score =
      tolerance <= 0
        ? normalizedError === 0
          ? 1
          : 0
        : clampScore(1 - normalizedError / tolerance);
    return { score, isCorrect: score === 1 };
  }

  if (scoringMode === "stepped") {
    const steps = Array.isArray(config.scoringSteps) ? config.scoringSteps : [];
    const sorted = [...steps]
      .filter(
        (step) =>
          Number.isFinite(step.errorBound) &&
          typeof step.score === "number" &&
          Number.isFinite(step.score)
      )
      .sort((a, b) => a.errorBound - b.errorBound);
    const bounded = [...sorted, { errorBound: Number.POSITIVE_INFINITY, score: 0 }];
    const matched = bounded.find((step) => normalizedError <= step.errorBound);
    const score = clampScore(matched?.score ?? 0);
    return { score, isCorrect: score === 1 };
  }

  const score = normalizedError <= tolerance ? 1 : 0;
  return { score, isCorrect: score === 1 };
}
