import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { AuthDisabledNotice } from "@/components/auth/AuthDisabledNotice";
import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { buildMetadata } from "@/lib/seo";
import { getAuthSettings } from "@/lib/payloadSdk/authSettings";

export const metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to access NSF CURE SBP.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage() {
  const authSettings = await getAuthSettings({ cache: "no-store" });

  return (
    <AuthSplitShell>
      <div className="space-y-7">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sign in to your student account.
          </p>
        </div>

        {authSettings.studentLoginEnabled ? (
          <LoginForm />
        ) : (
          <AuthDisabledNotice
            message={authSettings.studentLoginDisabledMessage}
          />
        )}

        {authSettings.studentLoginEnabled ? (
          <p className="pt-1 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link
              href="/register"
              className="font-medium text-primary transition-colors duration-150 hover:text-primary/80"
            >
              Create an account
            </Link>
          </p>
        ) : null}
      </div>
    </AuthSplitShell>
  );
}
