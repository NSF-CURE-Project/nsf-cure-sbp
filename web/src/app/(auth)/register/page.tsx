import { RegisterForm } from "./RegisterForm";
import { AuthDisabledNotice } from "@/components/auth/AuthDisabledNotice";
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
    <main className="min-h-[70vh] px-6 py-16">
      <div className="mx-auto w-full max-w-xl border-y border-border/60 bg-background/50 py-10">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Student Access
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground">
            Register to access program content and lessons.
          </p>
        </div>

        <div className="mt-8">
          {authSettings.studentLoginEnabled ? (
            <RegisterForm />
          ) : (
            <AuthDisabledNotice
              message={authSettings.studentLoginDisabledMessage}
              title="Student registration is temporarily unavailable"
            />
          )}
        </div>

        {authSettings.studentLoginEnabled ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
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
