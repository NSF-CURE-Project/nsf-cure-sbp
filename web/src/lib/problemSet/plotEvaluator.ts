import { evaluate } from "mathjs";

export type PlotSegment = {
  xStart: string;
  xEnd: string;
  formula: string;
};

export type PlotPoint = {
  x: number;
  y: number;
  segmentIndex: number;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const numeric = Number.parseFloat(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
};

const evaluateNumeric = (expr: string, scope: Record<string, number>): number | null => {
  try {
    const value = evaluate(expr, scope);
    return toFiniteNumber(value);
  } catch {
    return null;
  }
};

export function evaluatePlot(
  segments: PlotSegment[],
  scope: Record<string, number>,
  numPoints = 200
): PlotPoint[] {
  if (!Array.isArray(segments) || !segments.length) return [];
  const pointsPerSegment = Math.max(2, Math.floor(numPoints / segments.length));
  const output: PlotPoint[] = [];

  segments.forEach((segment, segmentIndex) => {
    const xStart = evaluateNumeric(segment.xStart, scope);
    const xEnd = evaluateNumeric(segment.xEnd, scope);
    if (xStart == null || xEnd == null || xStart === xEnd) return;
    const minX = Math.min(xStart, xEnd);
    const maxX = Math.max(xStart, xEnd);

    for (let i = 0; i < pointsPerSegment; i += 1) {
      const t = pointsPerSegment === 1 ? 0 : i / (pointsPerSegment - 1);
      const x = minX + (maxX - minX) * t;
      const y = evaluateNumeric(segment.formula, { ...scope, x });
      if (y == null) continue;
      output.push({ x, y, segmentIndex });
    }
  });

  return output.sort((a, b) => a.x - b.x);
}
