import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

export default async function InstructorClassroomsPage() {
  const base = await buildBaseUrl();
  if (!base) redirect("/dashboard");

  const res = await fetch(`${base.base}/api/instructor/classrooms`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!res.ok) redirect("/dashboard");

  const payload = (await res.json()) as {
    classrooms?: {
      id: string;
      title: string;
      classTitle: string;
      studentCount: number;
    }[];
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Instructor portal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Your classrooms</h1>
      </header>

      <div className="grid gap-4">
        {(payload.classrooms ?? []).map((classroom) => (
          <article
            key={classroom.id}
            className="rounded-xl border border-border/60 bg-card/50 p-5"
          >
            <p className="text-base font-semibold text-foreground">{classroom.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{classroom.classTitle}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {classroom.studentCount} student{classroom.studentCount === 1 ? "" : "s"}
              </span>
              <Link
                href={`/instructor/classrooms/${classroom.id}`}
                className="text-sm font-semibold text-primary underline underline-offset-4"
              >
                View roster
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
