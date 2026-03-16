"use client";

import { useMemo } from "react";
import { evaluate } from "mathjs";
import {
  type ProblemResultPlot,
  type ProblemResultPlotCriticalPoint,
} from "@/lib/payloadSdk/types";
import { evaluatePlot } from "@/lib/problemSet/plotEvaluator";

type ResultPlotProps = {
  plot: ProblemResultPlot;
  scope: Record<string, number>;
};

type Point = { x: number; y: number };

const toFinite = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const numeric = Number.parseFloat(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
};

const evaluateValue = (expr: string | undefined, scope: Record<string, number>): number | null => {
  if (!expr) return null;
  try {
    const result = evaluate(expr, scope);
    return toFinite(result);
  } catch {
    return null;
  }
};

const interpolateY = (points: Point[], x: number): number | null => {
  if (!points.length) return null;
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    if (Math.abs(point.x - x) < 1e-9) return point.y;
    const next = points[i + 1];
    if (!next) break;
    if ((point.x <= x && x <= next.x) || (next.x <= x && x <= point.x)) {
      const span = next.x - point.x;
      if (Math.abs(span) < 1e-9) return point.y;
      const ratio = (x - point.x) / span;
      return point.y + (next.y - point.y) * ratio;
    }
  }
  return null;
};

const buildZeroCrossings = (points: Point[]) => {
  const zeros: Point[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (a.y === 0) zeros.push(a);
    if ((a.y < 0 && b.y > 0) || (a.y > 0 && b.y < 0)) {
      const ratio = Math.abs(a.y) / (Math.abs(a.y) + Math.abs(b.y));
      const x = a.x + (b.x - a.x) * ratio;
      zeros.push({ x, y: 0 });
    }
  }
  if (points[points.length - 1]?.y === 0) zeros.push(points[points.length - 1]);
  return zeros;
};

export function ResultPlot({ plot, scope }: ResultPlotProps) {
  const points = useMemo(() => {
    const segments = Array.isArray(plot.segments) ? plot.segments : [];
    return evaluatePlot(
      segments.map((segment) => ({
        xStart: segment.xStart,
        xEnd: segment.xEnd,
        formula: segment.formula,
      })),
      scope,
      220
    ).map((point) => ({ x: point.x, y: point.y }));
  }, [plot.segments, scope]);

  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (!points.length) return { minX: 0, maxX: 1, minY: -1, maxY: 1 };
    const xValues = points.map((point) => point.x);
    const yValues = points.map((point) => point.y);
    const minXBase = Math.min(...xValues);
    const maxXBase = Math.max(...xValues);
    const minYBase = Math.min(...yValues);
    const maxYBase = Math.max(...yValues);
    const spanY = Math.max(1, maxYBase - minYBase);
    return {
      minX: minXBase,
      maxX: maxXBase,
      minY: minYBase - spanY * 0.08,
      maxY: maxYBase + spanY * 0.08,
    };
  }, [points]);

  const width = 620;
  const height = 260;
  const padding = { left: 56, right: 24, top: 16, bottom: 44 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const xSpan = maxX - minX || 1;
  const ySpan = maxY - minY || 1;

  const toSvgX = (x: number) => padding.left + ((x - minX) / xSpan) * innerWidth;
  const toSvgY = (y: number) => padding.top + innerHeight - ((y - minY) / ySpan) * innerHeight;
  const zeroY = toSvgY(0);

  const polylinePoints = points.map((point) => `${toSvgX(point.x)},${toSvgY(point.y)}`).join(" ");
  const zeroCrossings = buildZeroCrossings(points);
  const criticalPoints = (plot.criticalPoints ?? [])
    .map((point): { point: ProblemResultPlotCriticalPoint; x: number; y: number } | null => {
      const x = evaluateValue(point.x, scope);
      if (x == null) return null;
      const y = interpolateY(points, x);
      if (y == null) return null;
      return { point, x, y };
    })
    .filter((point): point is { point: ProblemResultPlotCriticalPoint; x: number; y: number } => Boolean(point));

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 p-4">
      <div className="mb-2 text-sm font-semibold text-foreground">
        {plot.title || "Result Plot"}
      </div>
      {!points.length ? (
        <div className="text-xs text-muted-foreground">
          Plot could not be generated from the current answer scope.
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Engineering result plot">
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerHeight} stroke="#94a3b8" />
          <line
            x1={padding.left}
            y1={zeroY}
            x2={padding.left + innerWidth}
            y2={zeroY}
            stroke="#94a3b8"
            strokeDasharray="4 4"
          />

          {points.slice(0, -1).map((point, index) => {
            const next = points[index + 1];
            const midY = (point.y + next.y) / 2;
            const fill = midY >= 0 ? "rgba(37,99,235,0.12)" : "rgba(220,38,38,0.12)";
            return (
              <polygon
                key={`area-${index}`}
                points={`${toSvgX(point.x)},${zeroY} ${toSvgX(point.x)},${toSvgY(point.y)} ${toSvgX(next.x)},${toSvgY(next.y)} ${toSvgX(next.x)},${zeroY}`}
                fill={fill}
              />
            );
          })}

          <polyline points={polylinePoints} fill="none" stroke="#2563eb" strokeWidth={2.25} />

          {criticalPoints.map(({ point, x, y }, index) => (
            <g key={`cp-${index}`}>
              <circle cx={toSvgX(x)} cy={toSvgY(y)} r={3.2} fill="#0f172a" />
              <text x={toSvgX(x) + 6} y={toSvgY(y) - 6} fontSize={11} fill="#0f172a">
                {point.label || `CP${index + 1}`}
              </text>
            </g>
          ))}

          {zeroCrossings.map((point, index) => (
            <circle key={`zero-${index}`} cx={toSvgX(point.x)} cy={toSvgY(point.y)} r={2.4} fill="#16a34a" />
          ))}

          <text x={padding.left + innerWidth / 2} y={height - 10} textAnchor="middle" fontSize={12} fill="#475569">
            {plot.xLabel || "x (m)"}
          </text>
          <text
            x={14}
            y={padding.top + innerHeight / 2}
            textAnchor="middle"
            fontSize={12}
            fill="#475569"
            transform={`rotate(-90 14 ${padding.top + innerHeight / 2})`}
          >
            {plot.yLabel || plot.plotType}
          </text>
        </svg>
      )}
    </div>
  );
}
