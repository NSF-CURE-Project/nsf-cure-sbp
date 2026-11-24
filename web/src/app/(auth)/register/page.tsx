import { RegisterForm } from "./RegisterForm";
import { AuthDisabledNotice } from "@/components/auth/AuthDisabledNotice";
import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { buildMetadata } from "@/lib/seo";
import { LoginLink } from "@/components/auth/LoginLink";
import { getAuthSettings } from "@/lib/payloadSdk/authSettings";

export const metadata = buildMetadata({
  title: "Register",
  description: "Create a student account for NSF CURE SBP.",
  path: "/register",
  noIndex: true,
});

export default async function RegisterPage() {
  const authSettings = await getAuthSettings({ cache: "no-store" });

  return (
    <AuthSplitShell>
      <div className="space-y-7">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Register to access program content and lessons.
          </p>
        </div>

        {authSettings.studentLoginEnabled ? (
          <RegisterForm />
        ) : (
          <AuthDisabledNotice
            message={authSettings.studentLoginDisabledMessage}
            title="Student registration is temporarily unavailable"
          />
        )}

        {authSettings.studentLoginEnabled ? (
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <LoginLink className="font-medium text-primary transition-colors duration-150 hover:text-primary/80">
              Sign in
            </LoginLink>
          </p>
        ) : null}
      </div>
    </AuthSplitShell>
  );
}
