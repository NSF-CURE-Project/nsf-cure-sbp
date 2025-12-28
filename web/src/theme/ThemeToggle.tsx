"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  className?: string;
  variant?: "default" | "compact" | "icon";
};

export function ThemeToggle({
  className = "",
  variant = "default",
}: ThemeToggleProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const effective = theme === "system" ? systemTheme : theme;

  const baseClasses =
    variant === "compact"
      ? "rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
      : variant === "icon"
        ? "inline-flex h-8 w-8 items-center justify-center rounded-full border"
        : "rounded-md border px-3 py-1.5 text-sm";

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(effective === "dark" ? "light" : "dark")}
      className={`${baseClasses} ${className}`.trim()}
    >
      {variant === "icon" ? (
        effective === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : effective === "dark" ? (
        "Light mode"
      ) : (
        "Dark mode"
      )}
    </button>
  );
}
