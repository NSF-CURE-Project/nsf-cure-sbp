import Link from "next/link";
import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { buildMetadata } from "@/lib/seo";
import { LoginLink } from "@/components/auth/LoginLink";

export const metadata = buildMetadata({
  title: "Check Your Email",
  description: "Check your email for a password reset link.",
  path: "/check-email",
  noIndex: true,
});

export default function CheckEmailPage() {
  return (
    <AuthSplitShell>
      <div className="space-y-7">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If an account exists for that email, you’ll receive a reset link
            shortly.
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Didn’t get anything? Check spam or try again.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/forgot-password"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted/50"
          >
            Try another email
          </Link>
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Ready to continue?{" "}
            <LoginLink className="font-medium text-primary transition-colors duration-150 hover:text-primary/80">
              Sign in
            </LoginLink>
          </p>
        </div>
      </div>
    </AuthSplitShell>
  );
}
