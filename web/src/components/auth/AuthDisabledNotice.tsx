import Link from "next/link";

type AuthDisabledNoticeProps = {
  message: string;
  title?: string;
};

export function AuthDisabledNotice({
  message,
  title = "Student access is temporarily unavailable",
}: AuthDisabledNoticeProps) {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-4 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
    >
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 leading-relaxed opacity-90">{message}</p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center rounded-lg border border-amber-300/80 bg-background px-3.5 py-2 text-sm font-semibold transition-colors duration-150 hover:bg-amber-100/80 dark:border-amber-500/40 dark:hover:bg-amber-500/15"
      >
        Return home
      </Link>
    </div>
  );
}
