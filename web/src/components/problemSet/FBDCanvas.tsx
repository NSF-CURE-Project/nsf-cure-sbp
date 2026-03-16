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

type Props = {
  figure: EngineeringFigureDoc;
  value: PlacedForce[];
  onChange: (forces: PlacedForce[]) => void;
  disabled?: boolean;
};

const normalizeAngle = (angle: number) => {
  const next = angle % 360;
  return next < 0 ? next + 360 : next;
};

const arrowEnd = (force: PlacedForce) => {
  const radians = (force.angle * Math.PI) / 180;
  const length = Math.max(20, force.magnitude * 80);
  return {
    x: force.origin[0] + Math.cos(radians) * length,
    y: force.origin[1] - Math.sin(radians) * length,
  };
};

export function FBDCanvas({ figure, value, onChange, disabled }: Props) {
  const width = figure.width ?? 600;
  const height = figure.height ?? 400;
  const overlayRef = useRef<SVGSVGElement | null>(null);
  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [dragCurrent, setDragCurrent] = useState<[number, number] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const selectedForce = selectedIndex >= 0 ? value[selectedIndex] : null;

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
    const angle = normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);
    const magnitude = Math.max(0.1, Math.min(2.5, Math.hypot(dx, cy - sy) / 80));
    return { id: "draft", origin: dragStart, angle, magnitude, label: "" } satisfies PlacedForce;
  }, [dragCurrent, dragStart]);

  const selectNext = () => {
    if (!value.length) return;
    setSelectedIndex((prev) => (prev + 1) % value.length);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <EngineeringFigure figure={figure} />
        <svg
          ref={overlayRef}
          viewBox={`0 0 ${width} ${height}`}
          className={cn(
            "absolute inset-0 h-full w-full rounded-lg",
            disabled ? "cursor-not-allowed" : "cursor-crosshair"
          )}
          role="application"
          aria-label="Free body force placement canvas"
          tabIndex={disabled ? -1 : 0}
          onPointerDown={(event) => {
            if (disabled) return;
            if (value.length >= 20) return;
            const point = toPoint(event);
            setDragStart(point);
            setDragCurrent(point);
            setSelectedIndex(-1);
          }}
          onPointerMove={(event) => {
            if (disabled || !dragStart) return;
            setDragCurrent(toPoint(event));
          }}
          onPointerUp={() => {
            if (disabled || !draftForce) {
              setDragStart(null);
              setDragCurrent(null);
              return;
            }
            const nextForce: PlacedForce = {
              ...draftForce,
              id: `F${Date.now()}-${Math.round(Math.random() * 9999)}`,
              label: `F${value.length + 1}`,
            };
            const next = [...value, nextForce];
            onChange(next);
            setSelectedIndex(next.length - 1);
            setDragStart(null);
            setDragCurrent(null);
          }}
          onKeyDown={(event) => {
            if (!selectedForce || disabled) {
              if (event.key === "Tab" && value.length) {
                event.preventDefault();
                selectNext();
              }
              return;
            }

            if (event.key === "Delete" || event.key === "Backspace") {
              event.preventDefault();
              onChange(value.filter((_, index) => index !== selectedIndex));
              setSelectedIndex(-1);
              return;
            }

            if (event.key === "Tab") {
              event.preventDefault();
              selectNext();
              return;
            }

            const deltaAngle =
              event.key === "ArrowLeft"
                ? -1
                : event.key === "ArrowRight"
                ? 1
                : event.key === "ArrowUp"
                ? 1
                : event.key === "ArrowDown"
                ? -1
                : 0;
            if (deltaAngle !== 0) {
              event.preventDefault();
              onChange(
                value.map((force, index) =>
                  index !== selectedIndex
                    ? force
                    : { ...force, angle: normalizeAngle(force.angle + deltaAngle) }
                )
              );
              return;
            }

            if (event.key === "+" || event.key === "=" || event.key === "-") {
              event.preventDefault();
              const direction = event.key === "-" ? -1 : 1;
              onChange(
                value.map((force, index) =>
                  index !== selectedIndex
                    ? force
                    : {
                        ...force,
                        magnitude: Math.max(0.1, Math.min(3, force.magnitude + direction * 0.05)),
                      }
                )
              );
            }
          }}
        >
          {value.map((force, index) => {
            const end = arrowEnd(force);
            const active = index === selectedIndex;
            return (
              <g
                key={force.id}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  if (disabled) return;
                  setSelectedIndex(index);
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
              </g>
            );
          })}
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
        Click and drag to place a force. Tab cycles forces. Arrow keys rotate by 1°. + / - adjusts magnitude.
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
                onChange(
                  value.map((force, index) =>
                    index !== selectedIndex ? force : { ...force, label: nextLabel }
                  )
                );
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
                onChange(
                  value.map((force, index) =>
                    index !== selectedIndex
                      ? force
                      : { ...force, angle: normalizeAngle(angle) }
                  )
                );
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
                onChange(
                  value.map((force, index) =>
                    index !== selectedIndex
                      ? force
                      : { ...force, magnitude: Math.max(0.1, magnitude) }
                  )
                );
              }}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
