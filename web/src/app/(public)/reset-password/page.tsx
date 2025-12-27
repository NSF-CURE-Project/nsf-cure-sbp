import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export const metadata = buildMetadata({
  title: "Reset Password",
  description: "Choose a new password for your NSF CURE SBP account.",
  path: "/reset-password",
  noIndex: true,
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = (await searchParams) ?? {};
  const rawToken = sp.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  return (
    <main className="min-h-[70vh] px-6 py-16">
      <div className="mx-auto w-full max-w-xl rounded-lg border border-border/60 bg-card/80 p-10 shadow-lg">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Student Access
          </p>
          <h1 className="text-3xl font-bold text-foreground">Choose a new password</h1>
          <p className="text-muted-foreground">
            Enter a new password to finish resetting your account.
          </p>
        </div>

        <div className="mt-8">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-red-700">
              Reset token missing. Please request a new reset link.
            </p>
          )}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Back to{" "}
          <Link href="/login" className="font-semibold text-primary underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
