import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { QuestionStatusBadge } from "@/components/questions/QuestionStatusBadge";

type AccountUser = {
  id: string;
};

type QuestionDoc = {
  id: string | number;
  title?: string | null;
  status?: "open" | "answered" | "resolved" | null;
  createdAt?: string | null;
  lesson?: {
    id?: string | number;
    title?: string | null;
    slug?: string | null;
    chapter?:
      | {
          slug?: string | null;
          class?: { slug?: string | null } | string | number;
        }
      | string
      | number
      | null;
  };
};

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

const getLessonLink = (lesson?: QuestionDoc["lesson"]) => {
  if (!lesson) return null;
  const lessonSlug = typeof lesson.slug === "string" ? lesson.slug : null;
  const chapterValue = lesson.chapter;
  const chapter =
    typeof chapterValue === "object" && chapterValue !== null
      ? chapterValue
      : null;
  const classValue = chapter?.class;
  const classSlug =
    typeof classValue === "object" && classValue !== null
      ? (classValue as { slug?: string | null }).slug ?? null
      : null;
  if (classSlug && lessonSlug) return `/classes/${classSlug}/lessons/${lessonSlug}`;
  return null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default async function QuestionsPage() {
  const base = await buildBaseUrl();
  if (!base) {
    redirect("/login?next=/questions");
  }

  const meRes = await fetch(`${base.base}/api/accounts/me`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!meRes.ok) redirect("/login?next=/questions");

  const me = (await meRes.json()) as { user?: AccountUser };
  const userId = me.user?.id;
  if (!userId) redirect("/login?next=/questions");

  const params = new URLSearchParams({
    sort: "-createdAt",
    depth: "2",
    limit: "200",
  });
  params.set("where[user][equals]", userId);

  const questionsRes = await fetch(`${base.base}/api/questions?${params.toString()}`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!questionsRes.ok) {
    throw new Error("Unable to load your questions.");
  }

  const questionsPayload = (await questionsRes.json()) as { docs?: QuestionDoc[] };
  const questions = Array.isArray(questionsPayload.docs) ? questionsPayload.docs : [];

  const grouped = questions.reduce(
    (acc, question) => {
      const lesson = question.lesson;
      const lessonId =
        lesson && typeof lesson === "object" && lesson.id != null
          ? String(lesson.id)
          : "unknown";
      const lessonTitle =
        lesson && typeof lesson === "object" && typeof lesson.title === "string"
          ? lesson.title
          : "Unknown lesson";
      if (!acc[lessonId]) {
        acc[lessonId] = {
          lessonTitle,
          items: [],
        };
      }
      acc[lessonId].items.push(question);
      return acc;
    },
    {} as Record<string, { lessonTitle: string; items: QuestionDoc[] }>
  );

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,96ch)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Student support
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">My Questions</h1>
        </header>

        {Object.keys(grouped).length === 0 ? (
          <section className="rounded-xl border border-border/60 bg-card/40 p-5 text-sm text-muted-foreground">
            You have not posted any questions yet.
          </section>
        ) : (
          Object.entries(grouped).map(([lessonId, group]) => (
            <section
              key={lessonId}
              className="rounded-xl border border-border/60 bg-card/40 p-5"
            >
              <h2 className="text-base font-semibold text-foreground">
                {group.lessonTitle}
              </h2>
              <div className="mt-3 space-y-3">
                {group.items.map((question) => {
                  const threadHref = `/questions/${encodeURIComponent(String(question.id))}`;
                  const lessonHref = getLessonLink(question.lesson);
                  return (
                    <div
                      key={String(question.id)}
                      className="rounded-lg border border-border/60 bg-background/60 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <QuestionStatusBadge status={question.status} />
                          <span className="font-medium text-foreground">
                            {question.title || "Untitled question"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(question.createdAt)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <Link
                          href={threadHref}
                          className="font-semibold text-primary underline underline-offset-4"
                        >
                          Open thread
                        </Link>
                        {lessonHref ? (
                          <Link
                            href={lessonHref}
                            className="font-semibold text-primary underline underline-offset-4"
                          >
                            Go to lesson
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
