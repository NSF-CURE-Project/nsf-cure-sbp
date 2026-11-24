"use client";

import { useEffect, useRef, useState } from "react";

export function SimulationFrame({ title, document }: { title: string; document: string }) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    function resize(event: MessageEvent) {
      if (event.source !== iframe.current?.contentWindow || event.origin !== "null") return;
      const message = event.data;
      if (message?.type !== "sbp-practice-size" || !Number.isFinite(message.height)) return;
      setHeight(Math.max(360, Math.min(12000, Math.ceil(message.height))));
    }
    window.addEventListener("message", resize);
    return () => window.removeEventListener("message", resize);
  }, []);

  return (
    <iframe
      ref={iframe}
      title={title}
      sandbox="allow-scripts"
      srcDoc={document}
      className="h-[80vh] w-full min-w-0 bg-transparent"
      style={height ? { height } : undefined}
    />
  );
}
