import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { buildMetadata } from "@/lib/seo";
import { LoginLink } from "@/components/auth/LoginLink";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your NSF CURE SBP account password.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-[70vh] px-6 py-16">
      <div className="mx-auto w-full max-w-xl rounded-lg border border-border/60 bg-card/80 p-10 shadow-lg">
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
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Remembered your password?{" "}
          <LoginLink
            className="font-semibold text-primary underline underline-offset-4"
          >
            Sign in
          </LoginLink>
        </p>
      </div>
    </main>
  );
}
