import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export const metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to access NSF CURE SBP.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <main className="relative flex min-h-[70vh] items-start justify-center overflow-hidden px-6 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-[-6rem] h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto -mt-3 grid w-full max-w-2xl gap-6 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Student Access
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Sign in to NSF CURE SBP
            </h1>
            <p className="max-w-md text-base text-muted-foreground">
              Use your student account to access program content, track lesson
              progress, and join classroom activities.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
              Progress tracking
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
              Quiz access
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">
              Course materials
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/90 p-5 shadow-lg">
          <LoginForm />

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>
              Need an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Create one
              </Link>
            </p>
            <p>
              Forgot your password?{" "}
              <Link
                href="/forgot-password"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Reset it
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
