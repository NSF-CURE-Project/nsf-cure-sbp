"use client";

import { useEffect, useMemo, useState } from "react";

type LivePreviewMessage<T> = {
  type?: string;
  ready?: boolean;
  collectionSlug?: string;
  globalSlug?: string;
  data?: T;
};

type LivePreviewOptions = {
  collectionSlug?: string;
  globalSlug?: string;
};

export function usePayloadLivePreview<T>(
  initialData: T | null,
  options: LivePreviewOptions,
) {
  const [data, setData] = useState<T | null>(initialData);
  const { collectionSlug, globalSlug } = options;

  const match = useMemo(
    () => ({
      collectionSlug,
      globalSlug,
    }),
    [collectionSlug, globalSlug],
  );

  useEffect(() => {
    const handler = (event: MessageEvent<LivePreviewMessage<T>>) => {
      const message = event.data;
      if (!message || message.type !== "payload-live-preview") return;
      if (message.ready) return;
      if (match.collectionSlug && message.collectionSlug !== match.collectionSlug)
        return;
      if (match.globalSlug && message.globalSlug !== match.globalSlug) return;
      if (message.data) {
        setData(message.data);
      }
    };

    window.addEventListener("message", handler);
    window.parent?.postMessage(
      {
        type: "payload-live-preview",
        ready: true,
      },
      "*",
    );

    return () => {
      window.removeEventListener("message", handler);
    };
  }, [match.collectionSlug, match.globalSlug]);

  return data;
}
