"use client";

import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { EngineeringFigure } from "@/components/problemSet/EngineeringFigure";
import type { EngineeringFigureDoc } from "@/lib/payloadSdk/types";
import { cn } from "@/lib/utils";

export type PlacedForce = {
  id: string;
  origin: [number, number];
  angle: number;
  magnitude: number;
  label: string;
};

export type PlacedMoment = {
  id: string;
  label: string;
  x: number;
  y: number;
  direction: "cw" | "ccw";
  magnitude: number;
};

export type FBDPlacedAnswer = {
  forces: PlacedForce[];
  moments: PlacedMoment[];
};

type Props = {
  figure: EngineeringFigureDoc;
  value: FBDPlacedAnswer;
  onChange: (value: FBDPlacedAnswer) => void;
  disabled?: boolean;
};

const ARROW_BASE = 80;
const SNAP_INCREMENT = 15;

const normalizeAngle = (angle: number) => {
  const next = angle % 360;
  return next < 0 ? next + 360 : next;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const snapAngle = (angleDeg: number, snap: boolean): number => {
  if (!snap) return angleDeg;
  return Math.round(angleDeg / SNAP_INCREMENT) * SNAP_INCREMENT;
};

const rotateByKeyboard = (current: number, direction: 1 | -1, snap: boolean) => {
  if (!snap) return normalizeAngle(current + direction);
  const normalized = normalizeAngle(current);
  if (direction > 0) {
    return normalizeAngle(Math.floor(normalized / SNAP_INCREMENT + 1) * SNAP_INCREMENT);
  }
  return normalizeAngle(Math.ceil(normalized / SNAP_INCREMENT - 1) * SNAP_INCREMENT);
};

const arrowEnd = (force: PlacedForce) => {
  const radians = toRadians(force.angle);
  const length = Math.max(20, force.magnitude * ARROW_BASE);
  return {
    x: force.origin[0] + Math.cos(radians) * length,
    y: force.origin[1] - Math.sin(radians) * length,
  };
};

const formatComponent = (value: number) => {
  const absValue = Math.abs(value);
  if (!Number.isFinite(absValue)) return "";
  return absValue.toFixed(2).replace(/\.?0+$/, "");
};

const renderMomentPath = (x: number, y: number, direction: "cw" | "ccw") => {
  if (direction === "ccw") {
    return `M ${x - 16} ${y - 20} A 16 16 0 1 0 ${x + 16} ${y - 20}`;
  }
  return `M ${x - 16} ${y - 20} A 16 16 0 1 1 ${x + 16} ${y - 20}`;
};

const renderMomentArrowHead = (x: number, y: number, direction: "cw" | "ccw") => {
  const headX = direction === "ccw" ? x + 16 : x - 16;
  const headY = y - 20;
  const theta = direction === "ccw" ? -Math.PI / 4 : -Math.PI + Math.PI / 4;
  const size = 6;
  const ax = headX - size * Math.cos(theta - Math.PI / 6);
  const ay = headY - size * Math.sin(theta - Math.PI / 6);
  const bx = headX - size * Math.cos(theta + Math.PI / 6);
  const by = headY - size * Math.sin(theta + Math.PI / 6);
  return `${headX},${headY} ${ax},${ay} ${bx},${by}`;
};

export function FBDCanvas({ figure, value, onChange, disabled }: Props) {
  const width = figure.width ?? 600;
  const height = figure.height ?? 400;
  const overlayRef = useRef<SVGSVGElement | null>(null);
  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [dragCurrent, setDragCurrent] = useState<[number, number] | null>(null);
  const [selection, setSelection] = useState<{ kind: "force" | "moment"; index: number } | null>(
    null
  );
  const [placeMode, setPlaceMode] = useState<"force" | "moment">("force");
  const [momentDirection, setMomentDirection] = useState<"cw" | "ccw">("cw");
  const [showComponents, setShowComponents] = useState(false);
  const [isShiftSnapping, setIsShiftSnapping] = useState(false);

  const forces = value.forces ?? [];
  const moments = value.moments ?? [];
  const selectedForce =
    selection?.kind === "force" && selection.index >= 0 ? forces[selection.index] : null;
  const selectedMoment =
    selection?.kind === "moment" && selection.index >= 0 ? moments[selection.index] : null;

  const toPoint = (event: ReactPointerEvent<SVGSVGElement>): [number, number] => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return [0, 0];
    const x = ((event.clientX - rect.left) / rect.width) * width;
    const y = ((event.clientY - rect.top) / rect.height) * height;
    return [x, y];
  };

  const draftForce = useMemo(() => {
    if (!dragStart || !dragCurrent) return null;
    const [sx, sy] = dragStart;
    const [cx, cy] = dragCurrent;
    const dx = cx - sx;
    const dy = sy - cy;
    const rawAngle = normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);
    const angle = normalizeAngle(snapAngle(rawAngle, isShiftSnapping));
    const magnitude = Math.max(0.1, Math.min(2.5, Math.hypot(dx, cy - sy) / ARROW_BASE));
    return { id: "draft", origin: dragStart, angle, magnitude, label: "" } satisfies PlacedForce;
  }, [dragCurrent, dragStart, isShiftSnapping]);

  const selectNextForce = () => {
    if (!forces.length) return;
    setSelection((prev) => {
      if (!prev || prev.kind !== "force") {
        return { kind: "force", index: 0 };
      }
      return { kind: "force", index: (prev.index + 1) % forces.length };
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <button
          type="button"
          className={cn(
            "rounded-md border px-2 py-1",
            placeMode === "force" ? "border-primary bg-primary/10 text-primary" : "border-border"
          )}
          onClick={() => setPlaceMode("force")}
          disabled={disabled}
        >
          Place Force
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md border px-2 py-1",
            placeMode === "moment" ? "border-primary bg-primary/10 text-primary" : "border-border"
          )}
          onClick={() => setPlaceMode("moment")}
          disabled={disabled}
        >
          Place Moment
        </button>
        {placeMode === "moment" ? (
          <button
            type="button"
            className="rounded-md border border-border px-2 py-1"
            onClick={() => setMomentDirection((prev) => (prev === "cw" ? "ccw" : "cw"))}
            disabled={disabled}
          >
            Direction: {momentDirection.toUpperCase()}
          </button>
        ) : null}
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={showComponents}
            onChange={(event) => setShowComponents(event.target.checked)}
            disabled={disabled}
          />
          <span>Show x/y components</span>
        </label>
      </div>

      <div className="relative">
        <EngineeringFigure figure={figure} />
        <svg
          ref={overlayRef}
          viewBox={`0 0 ${width} ${height}`}
          className={cn(
            "absolute inset-0 h-full w-full rounded-lg",
            disabled ? "cursor-not-allowed" : placeMode === "moment" ? "cursor-cell" : "cursor-crosshair"
          )}
          role="application"
          aria-label="Free body force placement canvas"
          tabIndex={disabled ? -1 : 0}
          onPointerDown={(event) => {
            if (disabled) return;
            if (placeMode === "moment") {
              if (moments.length >= 20) return;
              const [x, y] = toPoint(event);
              const nextMoment: PlacedMoment = {
                id: `M${Date.now()}-${Math.round(Math.random() * 9999)}`,
                label: `M${moments.length + 1}`,
                x,
                y,
                direction: momentDirection,
                magnitude: 1,
              };
              onChange({
                forces,
                moments: [...moments, nextMoment],
              });
              setSelection({ kind: "moment", index: moments.length });
              return;
            }

            if (forces.length >= 20) return;
            const point = toPoint(event);
            setDragStart(point);
            setDragCurrent(point);
            setIsShiftSnapping(event.shiftKey);
            setSelection(null);
          }}
          onPointerMove={(event) => {
            if (disabled || !dragStart || placeMode !== "force") return;
            setDragCurrent(toPoint(event));
            setIsShiftSnapping(event.shiftKey);
          }}
          onPointerUp={() => {
            if (disabled || placeMode !== "force" || !draftForce) {
              setDragStart(null);
              setDragCurrent(null);
              setIsShiftSnapping(false);
              return;
            }
            const nextForce: PlacedForce = {
              ...draftForce,
              id: `F${Date.now()}-${Math.round(Math.random() * 9999)}`,
              label: `F${forces.length + 1}`,
            };
            const nextForces = [...forces, nextForce];
            onChange({ forces: nextForces, moments });
            setSelection({ kind: "force", index: nextForces.length - 1 });
            setDragStart(null);
            setDragCurrent(null);
            setIsShiftSnapping(false);
          }}
          onKeyDown={(event) => {
            if (disabled) return;

            if (!selectedForce || selection?.kind !== "force") {
              if (event.key === "Tab" && forces.length) {
                event.preventDefault();
                selectNextForce();
              }
              if (selection?.kind === "moment" && (event.key === "Delete" || event.key === "Backspace")) {
                event.preventDefault();
                onChange({
                  forces,
                  moments: moments.filter((_, index) => index !== selection.index),
                });
                setSelection(null);
              }
              return;
            }

            if (event.key === "Delete" || event.key === "Backspace") {
              event.preventDefault();
              onChange({ forces: forces.filter((_, index) => index !== selection.index), moments });
              setSelection(null);
              return;
            }

            if (event.key === "Tab") {
              event.preventDefault();
              selectNextForce();
              return;
            }

            const direction =
              event.key === "ArrowLeft" || event.key === "ArrowDown"
                ? -1
                : event.key === "ArrowRight" || event.key === "ArrowUp"
                ? 1
                : 0;
            if (direction !== 0) {
              event.preventDefault();
              const deltaDirection = direction > 0 ? 1 : -1;
              onChange({
                forces: forces.map((force, index) =>
                  index !== selection.index
                    ? force
                    : {
                        ...force,
                        angle: rotateByKeyboard(force.angle, deltaDirection, event.shiftKey),
                      }
                ),
                moments,
              });
              return;
            }

            if (event.key === "+" || event.key === "=" || event.key === "-") {
              event.preventDefault();
              const sizeDirection = event.key === "-" ? -1 : 1;
              onChange({
                forces: forces.map((force, index) =>
                  index !== selection.index
                    ? force
                    : {
                        ...force,
                        magnitude: Math.max(0.1, Math.min(3, force.magnitude + sizeDirection * 0.05)),
                      }
                ),
                moments,
              });
            }
          }}
        >
          {forces.map((force, index) => {
            const end = arrowEnd(force);
            const active = selection?.kind === "force" && index === selection.index;
            const fx = force.magnitude * Math.cos(toRadians(force.angle));
            const fy = force.magnitude * Math.sin(toRadians(force.angle));
            const xEnd = force.origin[0] + fx * ARROW_BASE;
            const yEnd = force.origin[1] - fy * ARROW_BASE;
            return (
              <g
                key={force.id}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  if (disabled) return;
                  setSelection({ kind: "force", index });
                }}
              >
                <line
                  x1={force.origin[0]}
                  y1={force.origin[1]}
                  x2={end.x}
                  y2={end.y}
                  stroke={active ? "#2563eb" : "#dc2626"}
                  strokeWidth={active ? 2.8 : 2.2}
                />
                <circle cx={force.origin[0]} cy={force.origin[1]} r={4} fill={active ? "#1d4ed8" : "#ef4444"} />
                <text x={end.x + 6} y={end.y - 6} fontSize={11} fill={active ? "#1d4ed8" : "#991b1b"}>
                  {force.label || `F${index + 1}`}
                </text>
                {showComponents ? (
                  <>
                    <line
                      x1={force.origin[0]}
                      y1={force.origin[1]}
                      x2={xEnd}
                      y2={force.origin[1]}
                      stroke="#94a3b8"
                      strokeWidth={1.6}
                      strokeDasharray="4 2"
                    />
                    <line
                      x1={force.origin[0]}
                      y1={force.origin[1]}
                      x2={force.origin[0]}
                      y2={yEnd}
                      stroke="#94a3b8"
                      strokeWidth={1.6}
                      strokeDasharray="4 2"
                    />
                    <text x={xEnd + 6} y={force.origin[1] - 4} fontSize={10} fill="#64748b">
                      {force.magnitude ? `Fₓ = ${formatComponent(fx)}` : "Fₓ"}
                    </text>
                    <text x={force.origin[0] + 6} y={yEnd - 4} fontSize={10} fill="#64748b">
                      {force.magnitude ? `Fᵧ = ${formatComponent(fy)}` : "Fᵧ"}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}

          {moments.map((moment, index) => {
            const active = selection?.kind === "moment" && index === selection.index;
            return (
              <g
                key={moment.id}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  if (disabled) return;
                  setSelection({ kind: "moment", index });
                }}
              >
                <path
                  d={renderMomentPath(moment.x, moment.y, moment.direction)}
                  fill="none"
                  stroke={active ? "#5b21b6" : "#7c3aed"}
                  strokeWidth={2.5}
                />
                <polygon
                  points={renderMomentArrowHead(moment.x, moment.y, moment.direction)}
                  fill={active ? "#5b21b6" : "#7c3aed"}
                />
                <text x={moment.x + 18} y={moment.y - 24} fontSize={11} fill={active ? "#5b21b6" : "#7c3aed"}>
                  {moment.label || `M${index + 1}`}
                </text>
              </g>
            );
          })}

          {isShiftSnapping && draftForce ? (
            <g>
              <circle
                cx={draftForce.origin[0]}
                cy={draftForce.origin[1]}
                r={ARROW_BASE}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 3"
                fill="none"
              />
              {Array.from({ length: 24 }, (_, idx) => {
                const angle = idx * SNAP_INCREMENT;
                const radians = toRadians(angle);
                const inner = ARROW_BASE - 5;
                const outer = ARROW_BASE + 5;
                return (
                  <line
                    key={`snap-tick-${idx}`}
                    x1={draftForce.origin[0] + Math.cos(radians) * inner}
                    y1={draftForce.origin[1] - Math.sin(radians) * inner}
                    x2={draftForce.origin[0] + Math.cos(radians) * outer}
                    y2={draftForce.origin[1] - Math.sin(radians) * outer}
                    stroke="#94a3b8"
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          ) : null}

          {draftForce ? (
            <g>
              <line
                x1={draftForce.origin[0]}
                y1={draftForce.origin[1]}
                x2={arrowEnd(draftForce).x}
                y2={arrowEnd(draftForce).y}
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            </g>
          ) : null}
        </svg>
      </div>

      <div className="text-xs text-muted-foreground">
        Click and drag to place a force. Tab cycles forces. Arrow keys rotate by 1°. Shift + arrows snap by 15°.
        Hold Shift while dragging to snap to 15° increments. + / - adjusts magnitude.
      </div>

      {selectedForce ? (
        <div className="grid gap-2 rounded-md border border-border/60 bg-muted/30 p-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs">
            <span>Label</span>
            <input
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={selectedForce.label}
              disabled={disabled}
              onChange={(event) => {
                const nextLabel = event.target.value;
                onChange({
                  forces: forces.map((force, index) =>
                    selection?.kind === "force" && index === selection.index ? { ...force, label: nextLabel } : force
                  ),
                  moments,
                });
              }}
            />
          </label>
          <label className="grid gap-1 text-xs">
            <span>Angle (deg)</span>
            <input
              type="number"
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={selectedForce.angle}
              disabled={disabled}
              onChange={(event) => {
                const angle = Number.parseFloat(event.target.value);
                if (!Number.isFinite(angle)) return;
                onChange({
                  forces: forces.map((force, index) =>
                    selection?.kind === "force" && index === selection.index
                      ? { ...force, angle: normalizeAngle(angle) }
                      : force
                  ),
                  moments,
                });
              }}
            />
          </label>
          <label className="grid gap-1 text-xs">
            <span>Magnitude</span>
            <input
              type="number"
              step="0.01"
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={selectedForce.magnitude}
              disabled={disabled}
              onChange={(event) => {
                const magnitude = Number.parseFloat(event.target.value);
                if (!Number.isFinite(magnitude)) return;
                onChange({
                  forces: forces.map((force, index) =>
                    selection?.kind === "force" && index === selection.index
                      ? { ...force, magnitude: Math.max(0.1, magnitude) }
                      : force
                  ),
                  moments,
                });
              }}
            />
          </label>
        </div>
      ) : null}

      {selectedMoment ? (
        <div className="grid gap-2 rounded-md border border-border/60 bg-muted/30 p-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs">
            <span>Moment label</span>
            <input
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={selectedMoment.label}
              disabled={disabled}
              onChange={(event) => {
                const nextLabel = event.target.value;
                onChange({
                  forces,
                  moments: moments.map((moment, index) =>
                    selection?.kind === "moment" && index === selection.index
                      ? { ...moment, label: nextLabel }
                      : moment
                  ),
                });
              }}
            />
          </label>
          <label className="grid gap-1 text-xs">
            <span>Direction</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={selectedMoment.direction}
              disabled={disabled}
              onChange={(event) => {
                onChange({
                  forces,
                  moments: moments.map((moment, index) =>
                    selection?.kind === "moment" && index === selection.index
                      ? { ...moment, direction: event.target.value === "ccw" ? "ccw" : "cw" }
                      : moment
                  ),
                });
              }}
            >
              <option value="cw">Clockwise</option>
              <option value="ccw">Counter-clockwise</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs">
            <span>Magnitude</span>
            <input
              type="number"
              step="0.01"
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={selectedMoment.magnitude}
              disabled={disabled}
              onChange={(event) => {
                const magnitude = Number.parseFloat(event.target.value);
                if (!Number.isFinite(magnitude)) return;
                onChange({
                  forces,
                  moments: moments.map((moment, index) =>
                    selection?.kind === "moment" && index === selection.index
                      ? { ...moment, magnitude: Math.max(0, magnitude) }
                      : moment
                  ),
                });
              }}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
