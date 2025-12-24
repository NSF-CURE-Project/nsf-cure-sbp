import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default function LoginPage() {
  return (
    <main className="min-h-[70vh] px-6 py-16">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-border/60 bg-card/80 p-10 shadow-lg">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Student Access
          </p>
          <h1 className="text-3xl font-bold text-foreground">Sign in to NSF CURE SBP</h1>
          <p className="text-muted-foreground">
            Use your student account to access program content.
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-primary underline underline-offset-4">
            Create one
          </Link>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Forgot your password?{" "}
          <Link href="/forgot-password" className="font-semibold text-primary underline underline-offset-4">
            Reset it
          </Link>
        </p>
      </div>
    </main>
  );
}
