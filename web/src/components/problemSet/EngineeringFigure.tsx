"use client";

import { InlineMath } from "@/components/problemSet/InlineMath";
import type { EngineeringFigureDoc } from "@/lib/payloadSdk/types";

type EngineeringFigureProps = {
  figure: EngineeringFigureDoc;
};

const ARROW_BASE = 60;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const arrowEnd = (x: number, y: number, angleDeg: number, magnitude = 1) => {
  const length = ARROW_BASE * magnitude;
  const radians = toRadians(angleDeg);
  return {
    x: x + Math.cos(radians) * length,
    y: y - Math.sin(radians) * length,
  };
};

function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = "#ef4444",
  label,
  strokeWidth = 2.5,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
}) {
  const theta = Math.atan2(y2 - y1, x2 - x1);
  const size = 10;
  const ax = x2 - size * Math.cos(theta - Math.PI / 6);
  const ay = y2 - size * Math.sin(theta - Math.PI / 6);
  const bx = x2 - size * Math.cos(theta + Math.PI / 6);
  const by = y2 - size * Math.sin(theta + Math.PI / 6);

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} fill={color} />
      {label ? (
        <text
          x={x2 + 8}
          y={y2 - 8}
          fill={color}
          fontSize={14}
          fontWeight={700}
          paintOrder="stroke"
          stroke="#f8fafc"
          strokeWidth={2}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

function renderFbd(figure: EngineeringFigureDoc) {
  const data = figure.figureData;
  if (data.type !== "fbd") return null;
  const body = data.body;
  const bodyShape =
    body.shape === "circle" ? (
      <circle
        cx={body.x}
        cy={body.y}
        r={body.radius ?? 28}
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth={2}
      />
    ) : body.shape === "polygon" ? (
      <polygon
        points={(body.points ?? [])
          .map((point) => `${point[0]},${point[1]}`)
          .join(" ")}
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth={2}
      />
    ) : (
      <rect
        x={body.x}
        y={body.y}
        width={body.width ?? 100}
        height={body.height ?? 60}
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth={2}
      />
    );

  return (
    <>
      {bodyShape}
      {body.label ? (
        <text
          x={body.x + 10}
          y={body.y + 22}
          fill="#0f172a"
          fontSize={14}
          fontWeight={600}
        >
          {body.label}
        </text>
      ) : null}
      {data.forces.map((force) => {
        const end = arrowEnd(
          force.origin[0],
          force.origin[1],
          force.angle,
          force.magnitude
        );
        return (
          <Arrow
            key={force.id}
            x1={force.origin[0]}
            y1={force.origin[1]}
            x2={end.x}
            y2={end.y}
            color={force.color}
            label={force.label}
            strokeWidth={3}
          />
        );
      })}
      {(data.dimensions ?? []).map((dimension, idx) => (
        <g key={`dim-${idx}`}>
          <line
            x1={dimension.from[0]}
            y1={dimension.from[1]}
            x2={dimension.to[0]}
            y2={dimension.to[1]}
            stroke="#64748b"
            strokeDasharray="3 3"
            strokeWidth={1.5}
          />
          <text
            x={(dimension.from[0] + dimension.to[0]) / 2}
            y={(dimension.from[1] + dimension.to[1]) / 2 - 4}
            fill="#64748b"
            fontSize={13}
            fontWeight={600}
            textAnchor="middle"
          >
            {dimension.label}
          </text>
        </g>
      ))}
    </>
  );
}

function renderTruss(figure: EngineeringFigureDoc) {
  const data = figure.figureData;
  if (data.type !== "truss") return null;
  const nodes = new Map(data.nodes.map((node) => [node.id, node]));

  return (
    <>
      {data.members.map((member, idx) => {
        const start = nodes.get(member.from);
        const end = nodes.get(member.to);
        if (!start || !end) return null;
        return (
          <line
            key={`member-${idx}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#334155"
            strokeWidth={2.5}
          />
        );
      })}
      {data.nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={5} fill="#1d4ed8" />
          <text
            x={node.x + 8}
            y={node.y - 8}
            fontSize={13}
            fontWeight={600}
            fill="#0f172a"
          >
            {node.id}
          </text>
        </g>
      ))}
      {data.loads.map((load, idx) => {
        const node = nodes.get(load.node);
        if (!node) return null;
        const end = arrowEnd(
          node.x,
          node.y,
          load.angle,
          Math.max(0.3, load.magnitude / 10)
        );
        return (
          <Arrow
            key={`load-${idx}`}
            x1={node.x}
            y1={node.y}
            x2={end.x}
            y2={end.y}
            color="#ef4444"
            label={load.label}
            strokeWidth={3}
          />
        );
      })}
    </>
  );
}

function renderBeam(figure: EngineeringFigureDoc) {
  const data = figure.figureData;
  if (data.type !== "beam") return null;
  const width = figure.width ?? 760;
  const height = figure.height ?? 420;
  const left = 80;
  const y = Math.round(height * 0.52);
  const available = Math.max(120, width - left * 2);
  const readableScale = (available / Math.max(data.length, 1)) * 0.92;
  const scale = Math.max(data.scale, readableScale);
  const right = left + data.length * scale;

  return (
    <>
      <line
        x1={left}
        y1={y}
        x2={right}
        y2={y}
        stroke="#1e3a5f"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {data.supports.map((support, idx) => {
        const x = left + support.x * scale;
        return (
          <g key={`support-${idx}`}>
            <line
              x1={x - 14}
              y1={y + 30}
              x2={x + 14}
              y2={y + 30}
              stroke="#334155"
              strokeWidth={2}
            />
            <polygon
              points={`${x - 13},${y + 30} ${x + 13},${y + 30} ${x},${y + 7}`}
              fill="#94a3b8"
              stroke="#334155"
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={y + 47}
              textAnchor="middle"
              fill="#334155"
              fontSize={11}
              fontWeight={600}
            >
              {support.type.toUpperCase()}
            </text>
          </g>
        );
      })}
      {(data.pointLoads ?? []).map((load, idx) => {
        const x = left + load.x * scale;
        const end = arrowEnd(
          x,
          y - 74,
          load.angle,
          Math.max(0.35, load.magnitude / 18)
        );
        return (
          <Arrow
            key={`point-load-${idx}`}
            x1={x}
            y1={y - 74}
            x2={end.x}
            y2={end.y}
            label={load.label}
            strokeWidth={3}
          />
        );
      })}
      {(data.distributedLoads ?? []).map((load, idx) => {
        const xStart = left + load.xStart * scale;
        const xEnd = left + load.xEnd * scale;
        const arrowCount = Math.max(2, Math.round((xEnd - xStart) / 20));
        const arrowY = y - 64;
        return (
          <g key={`dist-${idx}`}>
            <line
              x1={xStart}
              y1={arrowY - 20}
              x2={xEnd}
              y2={arrowY - 20}
              stroke="#ef4444"
              strokeWidth={2}
            />
            {Array.from({ length: arrowCount }, (_, i) => {
              const x = xStart + (i / (arrowCount - 1)) * (xEnd - xStart);
              return (
                <Arrow
                  key={`dist-arrow-${idx}-${i}`}
                  x1={x}
                  y1={arrowY - 20}
                  x2={x}
                  y2={arrowY}
                  color="#ef4444"
                  strokeWidth={2.5}
                />
              );
            })}
            {load.label ? (
              <text
                x={(xStart + xEnd) / 2}
                y={arrowY - 26}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill="#ef4444"
              >
                {load.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {(data.moments ?? []).map((moment, idx) => {
        const x = left + moment.x * scale;
        return (
          <g key={`moment-${idx}`}>
            <path
              d={`M ${x - 18} ${y - 28} A 18 18 0 1 1 ${x + 18} ${y - 28}`}
              fill="none"
              stroke="#d97706"
              strokeWidth={2.5}
            />
            <text
              x={x + 20}
              y={y - 30}
              fill="#d97706"
              fontSize={13}
              fontWeight={700}
            >
              {moment.label ?? moment.value}
            </text>
          </g>
        );
      })}
    </>
  );
}

function AxesOverlay({
  x,
  y,
  length,
  xLabel,
  yLabel,
}: {
  x: number;
  y: number;
  length: number;
  xLabel: string;
  yLabel: string;
}) {
  return (
    <g>
      <Arrow x1={x} y1={y} x2={x + length} y2={y} color="#0f172a" />
      <text
        x={x + length + 4}
        y={y + 4}
        fontSize={12}
        fontWeight={600}
        fill="#0f172a"
      >
        {xLabel}
      </text>
      <Arrow x1={x} y1={y} x2={x} y2={y - length} color="#0f172a" />
      <text
        x={x - 4}
        y={y - length - 4}
        fontSize={12}
        fontWeight={600}
        fill="#0f172a"
        textAnchor="middle"
      >
        {yLabel}
      </text>
    </g>
  );
}

function renderMomentDiagram(figure: EngineeringFigureDoc) {
  const data = figure.figureData;
  if (data.type !== "moment-diagram") return null;
  const left = 60;
  const baseY = 280;
  const points = data.points.map((point) => ({
    x: left + point.x * data.scale,
    y: baseY - point.M * data.yScale,
  }));
  const polygon = [
    `${left},${baseY}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${left + data.length * data.scale},${baseY}`,
  ].join(" ");

  return (
    <>
      <line
        x1={left}
        y1={baseY}
        x2={left + data.length * data.scale}
        y2={baseY}
        stroke="#334155"
      />
      <polyline
        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        fill="none"
        stroke="#1d4ed8"
        strokeWidth={2}
      />
      <polygon points={polygon} fill="rgba(59,130,246,0.15)" />
      {(data.labels ?? []).map((label, idx) => (
        <text
          key={`label-${idx}`}
          x={left + label.x * data.scale + 6}
          y={baseY - 8}
          fontSize={11}
          fill="#0f172a"
        >
          {label.label}
        </text>
      ))}
    </>
  );
}

export function EngineeringFigure({ figure }: EngineeringFigureProps) {
  const width = figure.width ?? 760;
  const height = figure.height ?? 420;
  const ariaLabel =
    figure.description?.trim() || figure.title || "Engineering figure";

  return (
    <figure className="overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-background to-muted/20 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <div className="text-sm font-semibold text-foreground">
          {figure.title || "Engineering Diagram"}
        </div>
        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          {figure.type.replace("-", " ")}
        </span>
      </div>
      <div className="relative overflow-hidden px-2 py-3 sm:px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(100,116,139,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.14) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox={`0 0 ${width} ${height}`}
          className="relative z-10 h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {renderFbd(figure)}
          {renderTruss(figure)}
          {renderBeam(figure)}
          {renderMomentDiagram(figure)}
          {figure.axes?.show ? (
            <AxesOverlay
              x={figure.axes.x ?? 40}
              y={figure.axes.y ?? 360}
              length={figure.axes.length ?? 50}
              xLabel={figure.axes.xLabel ?? "x"}
              yLabel={figure.axes.yLabel ?? "y"}
            />
          ) : null}
        </svg>
      </div>
      {figure.description ? (
        <figcaption className="border-t border-border/50 px-4 py-2.5 text-xs text-muted-foreground">
          <InlineMath text={figure.description} />
        </figcaption>
      ) : null}
    </figure>
  );
}
