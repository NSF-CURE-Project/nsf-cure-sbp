import type { ReactNode } from "react";
import Link from "next/link";

import { StudentPortalIntro } from "@/components/auth/StudentPortalIntro";
import { cn } from "@/lib/utils";

type AuthSplitShellProps = {
  children: ReactNode;
  /** Compact intro on mobile so the form stays above the fold. */
  showIntroOnMobile?: boolean;
  formClassName?: string;
};

export function AuthSplitShell({
  children,
  showIntroOnMobile = false,
  formClassName,
}: AuthSplitShellProps) {
  return (
    <div className="flex flex-1 flex-col">
      <main className="relative flex flex-1 items-start justify-center px-4 pt-8 pb-12 sm:px-6 sm:pt-10 sm:pb-14 md:items-center md:pt-12 md:pb-[4.5rem]">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-10 lg:gap-16">
          <div
            className={cn(
              showIntroOnMobile ? "block" : "hidden md:block",
              "min-w-0 self-center"
            )}
          >
            <StudentPortalIntro />
          </div>

          <div className="flex min-w-0 self-center justify-center md:justify-end">
            <div className={cn("w-full max-w-[400px]", formClassName)}>
              {children}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Cal Poly Pomona · NSF CURE Summer
            Bridge Program
          </p>
          <nav className="flex items-center gap-4" aria-label="Legal">
            <Link
              href="/privacy"
              className="transition-colors duration-150 hover:text-foreground"
            >
              Privacy
            </Link>
            <a
              href="mailto:support@cppsbp.org"
              className="transition-colors duration-150 hover:text-foreground"
            >
              Help
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
