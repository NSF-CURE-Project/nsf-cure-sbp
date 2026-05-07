"use client";

import { useRouter } from "next/navigation";

export default function AuthBackButton() {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/60"
    >
      <span aria-hidden="true">←</span>
      Back
    </button>
  );
}
