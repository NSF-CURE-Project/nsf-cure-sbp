import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border/60 bg-card/70 h-10 w-full min-w-0 rounded-lg border px-3.5 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-[color,box-shadow,background-color,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-muted/30 dark:border-border/70 dark:shadow-black/20",
        "focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20",
        "aria-invalid:border-destructive/70 aria-invalid:ring-destructive/30",
        className
      )}
      {...props}
    />
  );
}

export { Input };
