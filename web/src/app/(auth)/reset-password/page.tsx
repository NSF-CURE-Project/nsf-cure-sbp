import { ResetPasswordForm } from "./ResetPasswordForm";
import { AuthDisabledNotice } from "@/components/auth/AuthDisabledNotice";
import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { buildMetadata } from "@/lib/seo";
import { LoginLink } from "@/components/auth/LoginLink";
import { getAuthSettings } from "@/lib/payloadSdk/authSettings";

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
  const authSettings = await getAuthSettings({ cache: "no-store" });

  return (
    <AuthSplitShell>
      <div className="space-y-7">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Choose a new password
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Enter a new password to finish resetting your account.
          </p>
        </div>

        {!authSettings.studentLoginEnabled ? (
          <AuthDisabledNotice
            message={authSettings.studentLoginDisabledMessage}
            title="Password reset is temporarily unavailable"
          />
        ) : token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p
            className="rounded-lg border border-destructive/25 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
            role="alert"
          >
            Reset token missing. Please request a new reset link.
          </p>
        )}

        {authSettings.studentLoginEnabled ? (
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Back to{" "}
            <LoginLink className="font-medium text-primary transition-colors duration-150 hover:text-primary/80">
              Sign in
            </LoginLink>
          </p>
        ) : null}
      </div>
    </AuthSplitShell>
  );
}
