import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { AuthDisabledNotice } from "@/components/auth/AuthDisabledNotice";
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
    <main className="min-h-[70vh] px-6 py-16">
      <div className="mx-auto w-full max-w-xl border-y border-border/60 bg-background/50 py-10">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Student Access
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Reset your password
          </h1>
          <p className="text-muted-foreground">
            We’ll email you a link to reset your password.
          </p>
        </div>

        <div className="mt-8">
          {authSettings.studentLoginEnabled ? (
            <ForgotPasswordForm />
          ) : (
            <AuthDisabledNotice
              message={authSettings.studentLoginDisabledMessage}
              title="Password reset is temporarily unavailable"
            />
          )}
        </div>

        {authSettings.studentLoginEnabled ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Remembered your password?{" "}
            <LoginLink
              className="font-semibold text-primary underline underline-offset-4"
            >
              Sign in
            </LoginLink>
          </p>
        ) : null}
      </div>
    </main>
  );
}
