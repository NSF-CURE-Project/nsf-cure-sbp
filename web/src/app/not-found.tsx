import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          We can&rsquo;t find that page
        </h1>
        <p className="mt-4 text-base text-slate-600">
          The link may be broken, or the page may have been moved or renamed.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white shadow-md shadow-emerald-900/30 transition-colors hover:bg-emerald-800"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
