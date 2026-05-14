"use client";

import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  // Omit for an alert-only dialog (single button, no escape/backdrop dismiss).
  onCancel?: () => void;
};

// Custom confirm/alert dialog used in place of `window.confirm` /
// `window.alert` across the student-facing app. Mirrors the admin-side
// ConfirmDialog so the visual language is consistent across both surfaces.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;
    confirmRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy && onCancel) {
        event.stopPropagation();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      previouslyFocused?.focus?.();
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy && onCancel) {
          onCancel();
        }
      }}
    >
      <div
        className={cn(
          "grid w-full max-w-md gap-3.5 rounded-2xl border border-border/60 bg-background p-5 shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              destructive
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : "bg-primary/15 text-primary",
            )}
          >
            {destructive ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 7v4M10 14v.01M3.4 16.5h13.2c1.2 0 2-1.3 1.4-2.4l-6.6-11a1.7 1.7 0 0 0-2.8 0L2 14.1c-.6 1.1.2 2.4 1.4 2.4Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M10 6.5v4.5M10 13.5v.01"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
          <div className="min-w-0 grid gap-1.5">
            <h2
              id="confirm-dialog-title"
              className="m-0 text-[17px] font-bold tracking-tight text-foreground"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-message"
              className="m-0 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className={cn(
                "rounded-lg border border-border/60 bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors",
                "hover:border-border hover:bg-muted/40",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all",
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-70",
            )}
          >
            {busy ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 12 12"
                      to="360 12 12"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
                Working…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
