"use client";

import React, { useCallback, useState } from "react";

import { ConfirmDialog } from "./confirm-dialog";

// Imperative promise-based replacement for `window.confirm` /
// `window.alert`. See payload-cms/src/views/admin/useConfirm.tsx for the
// admin-side twin; both share the same call signatures so behavior matches
// across the two surfaces.
//
//   const { confirm, alert, dialog } = useConfirm();
//   ...
//   if (!(await confirm({ title: 'Leave?', message: '…', destructive: true }))) return;
//   await alert({ title: 'Done', message: 'You have left the classroom.' });
//   ...
//   return <>{children}{dialog}</>

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type AlertOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
};

type DialogState =
  | { kind: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: "alert"; options: AlertOptions; resolve: () => void }
  | null;

export function useConfirm() {
  const [state, setState] = useState<DialogState>(null);

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> =>
      new Promise<boolean>((resolve) => {
        setState({ kind: "confirm", options, resolve });
      }),
    [],
  );

  const alert = useCallback(
    (options: AlertOptions): Promise<void> =>
      new Promise<void>((resolve) => {
        setState({ kind: "alert", options, resolve });
      }),
    [],
  );

  const closeAndResolve = useCallback((value: boolean) => {
    setState((current) => {
      if (!current) return null;
      if (current.kind === "confirm") current.resolve(value);
      else current.resolve();
      return null;
    });
  }, []);

  const dialog =
    state == null ? null : state.kind === "confirm" ? (
      <ConfirmDialog
        open
        title={state.options.title}
        message={state.options.message}
        confirmLabel={state.options.confirmLabel}
        cancelLabel={state.options.cancelLabel}
        destructive={state.options.destructive}
        onConfirm={() => closeAndResolve(true)}
        onCancel={() => closeAndResolve(false)}
      />
    ) : (
      <ConfirmDialog
        open
        title={state.options.title}
        message={state.options.message}
        confirmLabel={state.options.confirmLabel ?? "OK"}
        onConfirm={() => closeAndResolve(true)}
      />
    );

  return { confirm, alert, dialog };
}
