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
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  label?: string;
}) {
  const theta = Math.atan2(y2 - y1, x2 - x1);
  const size = 8;
  const ax = x2 - size * Math.cos(theta - Math.PI / 6);
  const ay = y2 - size * Math.sin(theta - Math.PI / 6);
  const bx = x2 - size * Math.cos(theta + Math.PI / 6);
  const by = y2 - size * Math.sin(theta + Math.PI / 6);

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} fill={color} />
      {label ? (
        <text x={x2 + 6} y={y2 - 6} fill={color} fontSize={12}>
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
      <circle cx={body.x} cy={body.y} r={body.radius ?? 28} fill="#f8fafc" stroke="#334155" />
    ) : body.shape === "polygon" ? (
      <polygon
        points={(body.points ?? [])
          .map((point) => `${point[0]},${point[1]}`)
          .join(" ")}
        fill="#f8fafc"
        stroke="#334155"
      />
    ) : (
      <rect
        x={body.x}
        y={body.y}
        width={body.width ?? 100}
        height={body.height ?? 60}
        fill="#f8fafc"
        stroke="#334155"
      />
    );

  return (
    <>
      {bodyShape}
      {body.label ? (
        <text x={body.x + 8} y={body.y + 20} fill="#0f172a" fontSize={12}>
          {body.label}
        </text>
      ) : null}
      {data.forces.map((force) => {
        const end = arrowEnd(force.origin[0], force.origin[1], force.angle, force.magnitude);
        return (
          <Arrow
            key={force.id}
            x1={force.origin[0]}
            y1={force.origin[1]}
            x2={end.x}
            y2={end.y}
            color={force.color}
            label={force.label}
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
          />
          <text
            x={(dimension.from[0] + dimension.to[0]) / 2}
            y={(dimension.from[1] + dimension.to[1]) / 2 - 4}
            fill="#64748b"
            fontSize={11}
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
            strokeWidth={2}
          />
        );
      })}
      {data.nodes.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={4} fill="#1d4ed8" />
          <text x={node.x + 6} y={node.y - 6} fontSize={12} fill="#0f172a">
            {node.id}
          </text>
        </g>
      ))}
      {data.loads.map((load, idx) => {
        const node = nodes.get(load.node);
        if (!node) return null;
        const end = arrowEnd(node.x, node.y, load.angle, Math.max(0.3, load.magnitude / 10));
        return (
          <Arrow
            key={`load-${idx}`}
            x1={node.x}
            y1={node.y}
            x2={end.x}
            y2={end.y}
            color="#ef4444"
            label={load.label}
          />
        );
      })}
    </>
  );
}

function renderBeam(figure: EngineeringFigureDoc) {
  const data = figure.figureData;
  if (data.type !== "beam") return null;
  const left = 60;
  const y = 180;
  const right = left + data.length * data.scale;

  return (
    <>
      <line x1={left} y1={y} x2={right} y2={y} stroke="#334155" strokeWidth={4} />
      {data.supports.map((support, idx) => {
        const x = left + support.x * data.scale;
        return (
          <g key={`support-${idx}`}>
            <polygon
              points={`${x - 12},${y + 26} ${x + 12},${y + 26} ${x},${y + 6}`}
              fill="#94a3b8"
              stroke="#334155"
            />
          </g>
        );
      })}
      {(data.pointLoads ?? []).map((load, idx) => {
        const x = left + load.x * data.scale;
        const end = arrowEnd(x, y - 60, load.angle, Math.max(0.3, load.magnitude / 20));
        return (
          <Arrow key={`point-load-${idx}`} x1={x} y1={y - 60} x2={end.x} y2={end.y} label={load.label} />
        );
      })}
      {(data.distributedLoads ?? []).map((load, idx) => {
        const xStart = left + load.xStart * data.scale;
        const xEnd = left + load.xEnd * data.scale;
        const arrowCount = Math.max(2, Math.round((xEnd - xStart) / 20));
        const arrowY = y - 50;
        return (
          <g key={`dist-${idx}`}>
            <line
              x1={xStart}
              y1={arrowY - 20}
              x2={xEnd}
              y2={arrowY - 20}
              stroke="#ef4444"
              strokeWidth={1.5}
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
                />
              );
            })}
            {load.label ? (
              <text
                x={(xStart + xEnd) / 2}
                y={arrowY - 26}
                textAnchor="middle"
                fontSize={11}
                fill="#ef4444"
              >
                {load.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {(data.moments ?? []).map((moment, idx) => {
        const x = left + moment.x * data.scale;
        return (
          <g key={`moment-${idx}`}>
            <path d={`M ${x - 16} ${y - 26} A 16 16 0 1 1 ${x + 16} ${y - 26}`} fill="none" stroke="#7c3aed" strokeWidth={2} />
            <text x={x + 18} y={y - 28} fill="#7c3aed" fontSize={11}>
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
      <text x={x + length + 4} y={y + 4} fontSize={11} fill="#0f172a">
        {xLabel}
      </text>
      <Arrow x1={x} y1={y} x2={x} y2={y - length} color="#0f172a" />
      <text x={x - 4} y={y - length - 4} fontSize={11} fill="#0f172a" textAnchor="middle">
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
      <line x1={left} y1={baseY} x2={left + data.length * data.scale} y2={baseY} stroke="#334155" />
      <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#1d4ed8" strokeWidth={2} />
      <polygon points={polygon} fill="rgba(59,130,246,0.15)" />
      {(data.labels ?? []).map((label, idx) => (
        <text key={`label-${idx}`} x={left + label.x * data.scale + 6} y={baseY - 8} fontSize={11} fill="#0f172a">
          {label.label}
        </text>
      ))}
    </>
  );
}

export function EngineeringFigure({ figure }: EngineeringFigureProps) {
  const width = figure.width ?? 600;
  const height = figure.height ?? 400;
  const ariaLabel = figure.description?.trim() || figure.title || "Engineering figure";

  return (
    <figure className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
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
      {figure.description ? (
        <figcaption className="mt-2 text-xs text-muted-foreground">
          <InlineMath text={figure.description} />
        </figcaption>
      ) : null}
    </figure>
  );
}
