import type { ProblemPart } from "../payloadSdk/types";

type SubmittedForce = {
  id: string;
  origin: [number, number];
  angle: number;
  magnitude: number;
  label: string;
};

type SubmittedMoment = {
  id: string;
  label: string;
  x: number;
  y: number;
  direction: "cw" | "ccw";
  magnitude: number;
};

type FbdSubmission = {
  forces?: SubmittedForce[];
  moments?: SubmittedMoment[];
};

export type FbdForceStatus = {
  id: string;
  label?: string;
  matched: boolean;
};

export type FbdMomentStatus = {
  id: string;
  label?: string;
  direction: "cw" | "ccw";
  matched: boolean;
};

export type FbdRubricFeedback = {
  requiredForceStatuses: FbdForceStatus[];
  requiredMomentStatuses: FbdMomentStatus[];
  matchedForceCount: number;
  matchedMomentCount: number;
  totalRequired: number;
  forbiddenForces: number;
  extraForcesCount: number;
  extraForcesPenalty: number;
};

const normalizeAngle = (angle: number) => {
  const next = angle % 360;
  return next < 0 ? next + 360 : next;
};

const angleDiff = (a: number, b: number) => {
  const normalizedA = normalizeAngle(a);
  const normalizedB = normalizeAngle(b);
  const delta = Math.abs(normalizedA - normalizedB) % 360;
  return delta > 180 ? 360 - delta : delta;
};

export function buildFbdRubricFeedback(
  rubric: ProblemPart["fbdRubric"],
  submission: FbdSubmission
): FbdRubricFeedback {
  const requiredForces = Array.isArray(rubric?.requiredForces)
    ? rubric.requiredForces
    : [];
  const requiredMoments = Array.isArray(rubric?.requiredMoments)
    ? rubric.requiredMoments
    : [];
  const submittedForces = Array.isArray(submission.forces) ? submission.forces : [];
  const submittedMoments = Array.isArray(submission.moments) ? submission.moments : [];
  const forbiddenForces = Math.max(0, Number(rubric?.forbiddenForces ?? 0));

  const usedForceIndexes = new Set<number>();
  const requiredForceStatuses = requiredForces.map((requiredForce) => {
    const angleTolerance = Math.abs(requiredForce.angleTolerance ?? 5);
    const magnitudeRequired = Boolean(requiredForce.magnitudeRequired);
    const magnitudeTolerance = Math.abs(requiredForce.magnitudeTolerance ?? 0.05);
    const correctMagnitude = requiredForce.correctMagnitude ?? 0;

    const matchIndex = submittedForces.findIndex((force, index) => {
      if (usedForceIndexes.has(index)) return false;
      if (angleDiff(force.angle, requiredForce.correctAngle ?? 0) > angleTolerance) {
        return false;
      }
      if (!magnitudeRequired) return true;
      return Math.abs(force.magnitude - correctMagnitude) <= magnitudeTolerance;
    });

    const matched = matchIndex >= 0;
    if (matched) usedForceIndexes.add(matchIndex);

    return {
      id: requiredForce.id,
      label: requiredForce.label,
      matched,
    };
  });

  const usedMomentIndexes = new Set<number>();
  const requiredMomentStatuses = requiredMoments.map((requiredMoment) => {
    const magnitudeRequired = Boolean(requiredMoment.magnitudeRequired);
    const magnitudeTolerance = Math.abs(requiredMoment.magnitudeTolerance ?? 0.05);
    const correctMagnitude = requiredMoment.correctMagnitude ?? 0;

    const matchIndex = submittedMoments.findIndex((moment, index) => {
      if (usedMomentIndexes.has(index)) return false;
      if (moment.direction !== requiredMoment.direction) return false;
      if (!magnitudeRequired) return true;
      return Math.abs(moment.magnitude - correctMagnitude) <= magnitudeTolerance;
    });

    const matched = matchIndex >= 0;
    if (matched) usedMomentIndexes.add(matchIndex);

    return {
      id: requiredMoment.id,
      label: requiredMoment.label,
      direction: requiredMoment.direction,
      matched,
    };
  });

  const matchedForceCount = requiredForceStatuses.filter((item) => item.matched).length;
  const matchedMomentCount = requiredMomentStatuses.filter((item) => item.matched).length;
  const totalRequired = requiredForceStatuses.length + requiredMomentStatuses.length;
  const extraForcesCount = Math.max(
    0,
    submittedForces.length - matchedForceCount - forbiddenForces
  );
  const extraForcesPenalty =
    totalRequired > 0 ? extraForcesCount / totalRequired : extraForcesCount > 0 ? 1 : 0;

  return {
    requiredForceStatuses,
    requiredMomentStatuses,
    matchedForceCount,
    matchedMomentCount,
    totalRequired,
    forbiddenForces,
    extraForcesCount,
    extraForcesPenalty,
  };
}
