"use client";

import { useEffect } from "react";

export default function LockBodyScroll() {
  useEffect(() => {
    const { style } = document.body;
    const prev = {
      overflow: style.overflow,
      height: style.height,
      width: style.width,
    };

    style.overflow = "hidden";
    style.height = "100%";
    style.width = "100%";

    return () => {
      style.overflow = prev.overflow;
      style.height = prev.height;
      style.width = prev.width;
    };
  }, []);

  return null;
}
