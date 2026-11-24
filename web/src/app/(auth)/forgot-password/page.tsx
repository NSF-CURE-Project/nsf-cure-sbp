import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { AuthDisabledNotice } from "@/components/auth/AuthDisabledNotice";
import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { buildMetadata } from "@/lib/seo";
import { LoginLink } from "@/components/auth/LoginLink";
import { getAuthSettings } from "@/lib/payloadSdk/authSettings";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your NSF CURE SBP account password.",
  path: "/forgot-password",
  noIndex: true,
});

export default async function ForgotPasswordPage() {
  const authSettings = await getAuthSettings({ cache: "no-store" });

  return (
    <AuthSplitShell>
      <div className="space-y-7">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Reset your password
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We’ll email you a link to reset your password.
          </p>
        </div>

        {authSettings.studentLoginEnabled ? (
          <ForgotPasswordForm />
        ) : (
          <AuthDisabledNotice
            message={authSettings.studentLoginDisabledMessage}
            title="Password reset is temporarily unavailable"
          />
        )}

        {authSettings.studentLoginEnabled ? (
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <LoginLink className="font-medium text-primary transition-colors duration-150 hover:text-primary/80">
              Sign in
            </LoginLink>
          </p>
        ) : null}
      </div>
    </AuthSplitShell>
  );
}
