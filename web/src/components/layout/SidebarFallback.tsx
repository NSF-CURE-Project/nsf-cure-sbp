import React from "react";

export function SidebarFallback() {
  return (
    <div className="h-full w-64 px-3 py-3">
      <div className="h-6 w-32 rounded-full bg-muted/60" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-4 w-full rounded-full bg-muted/40" />
        ))}
      </div>
    </div>
  );
}

export function MobileSidebarFallback() {
  return (
    <div
      className="h-9 w-28 rounded-full bg-muted/50"
      aria-hidden="true"
    />
  );
}
