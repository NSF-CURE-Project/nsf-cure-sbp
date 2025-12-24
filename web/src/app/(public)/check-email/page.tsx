import Link from "next/link";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export default function CheckEmailPage() {
  return (
    <main className="min-h-[70vh] px-6 py-16">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-border/60 bg-card/80 p-10 shadow-lg">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Student Access
          </p>
          <h1 className="text-3xl font-bold text-foreground">Check your email</h1>
          <p className="text-muted-foreground">
            If an account exists for that email, you’ll receive a reset link shortly.
          </p>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Didn’t get anything? Check spam or try again.
        </p>

        <div className="mt-8">
          <Link
            href="/forgot-password"
            className="inline-flex items-center rounded-lg border border-border/70 bg-muted/40 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/60"
          >
            Try another email
          </Link>
        </div>
      </div>
    </main>
  );
}
