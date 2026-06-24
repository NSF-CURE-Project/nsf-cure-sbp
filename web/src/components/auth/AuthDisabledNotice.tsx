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
      className="border-l-[3px] border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-950"
    >
      <h2 className="text-base font-semibold text-amber-950">{title}</h2>
      <p className="mt-2 leading-relaxed">{message}</p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center rounded-md border border-amber-300 bg-white px-3.5 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
      >
        Return home
      </Link>
    </div>
  );
}
