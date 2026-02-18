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
    <main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-transparent px-4 py-8 sm:px-6 sm:py-10">
      <section className="relative mx-auto grid w-full max-w-[90rem] gap-6 md:-translate-y-6 md:grid-cols-[0.8fr_1.2fr] md:items-stretch">
        <div className="relative flex h-full flex-col justify-between gap-10 p-6 sm:p-8 md:p-10">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              Student Access
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-[2.7rem]">
                Sign in to NSF CURE SBP
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                Use your student account to access course content, submit
                assignments, and keep your lesson progress in one place.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium uppercase tracking-[0.08em] text-slate-600 dark:text-slate-200">
            <span className="rounded-full border border-white/85 bg-white/85 px-3 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
              Progress tracking
            </span>
            <span className="rounded-full border border-white/85 bg-white/85 px-3 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
              Ask questions
            </span>
            <span className="rounded-full border border-white/85 bg-white/85 px-3 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
              Join classrooms
            </span>
          </div>
        </div>

        <div className="relative h-full p-2 sm:p-4 md:p-6">
          <div className="relative mx-auto flex h-full w-full max-w-[56rem] flex-col rounded-2xl border border-slate-200/90 bg-[#f9fafb] p-6 shadow-xl shadow-slate-900/15 ring-1 ring-black/5 dark:border-white/10 dark:shadow-black/40 dark:ring-white/10 sm:p-8">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">
                Welcome back
              </h2>
              <p className="text-sm text-slate-600">
                Enter your email and password to continue.
              </p>
            </div>

            <LoginForm />

            <div className="mt-auto pt-6 space-y-2 text-sm text-slate-600">
              <p>
                Need an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800"
                >
                  Create one
                </Link>
              </p>
              <p>
                Forgot your password?{" "}
                <Link
                  href="/forgot-password"
                  className="font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800"
                >
                  Reset it
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
