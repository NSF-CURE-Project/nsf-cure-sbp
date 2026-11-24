import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 supports-[backdrop-filter]:bg-background/60">
      <div className="relative flex h-16 items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="NSF CURE SBP home"
          className="relative z-10 flex min-w-0 max-w-[calc(100%-9.5rem)] items-center"
        >
          <span className="flex shrink-0 items-center gap-3 sm:gap-4">
            <Image
              src="/assets/logos/cpp_green.png"
              alt="Cal Poly Pomona"
              width={300}
              height={150}
              className="h-8 w-auto dark:hidden sm:h-12"
              sizes="(min-width: 640px) 96px, 80px"
              priority
            />
            <Image
              src="/assets/logos/cpp_yellow.png"
              alt="Cal Poly Pomona"
              width={300}
              height={150}
              className="hidden h-8 w-auto dark:block sm:h-12"
              sizes="(min-width: 640px) 96px, 80px"
              priority
            />
            <Image
              src="/assets/logos/nsf.png"
              alt="National Science Foundation"
              width={80}
              height={80}
              className="size-8 sm:size-12"
              sizes="(min-width: 640px) 48px, 40px"
              priority
            />
          </span>
          <span
            className="mx-3 hidden h-6 w-px shrink-0 bg-border/70 sm:mx-4 sm:block"
            aria-hidden
          />
          <span className="truncate text-[13px] font-semibold text-foreground sm:text-xl">
            NSF CURE SBP
          </span>
        </Link>

        {/* Reserve space so the absolute back link never covers the brand. */}
        <div className="ml-auto h-10 w-[8.75rem] shrink-0" aria-hidden />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 sm:px-6">
          <div className="flex w-full max-w-6xl justify-end">
            <Link
              href="/"
              className="pointer-events-auto inline-flex h-10 min-h-10 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              <span>Back to website</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
