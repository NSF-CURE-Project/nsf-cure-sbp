import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { QuestionThreadCard } from "@/components/questions/QuestionThreadCard";

type RouteParams = { questionId: string };

type QuestionDetail = {
  id: string | number;
  title?: string | null;
  body?: string | null;
  status?: "open" | "answered" | "resolved" | null;
  createdAt?: string | null;
  lesson?: {
    slug?: string | null;
    title?: string | null;
    chapter?:
      | {
          slug?: string | null;
          class?: { slug?: string | null } | string | number;
        }
      | string
      | number
      | null;
  } | null;
  answers?: {
    body?: unknown;
    createdAt?: string | null;
  }[];
};

const buildBaseUrl = async () => {
  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  if (!host) return null;
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "http";
  return { base: `${protocol}://${host}`, cookie: reqHeaders.get("cookie") ?? "" };
};

const getLessonLink = (lesson?: QuestionDetail["lesson"]) => {
  if (!lesson || typeof lesson !== "object") return null;
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

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { questionId } = await params;
  const base = await buildBaseUrl();
  if (!base) notFound();

  const meRes = await fetch(`${base.base}/api/accounts/me`, {
    headers: base.cookie ? { cookie: base.cookie } : undefined,
    cache: "no-store",
  });
  if (!meRes.ok) redirect(`/login?next=${encodeURIComponent(`/questions/${questionId}`)}`);

  const detailRes = await fetch(
    `${base.base}/api/questions/${encodeURIComponent(questionId)}/detail`,
    {
      headers: base.cookie ? { cookie: base.cookie } : undefined,
      cache: "no-store",
    }
  );

  if (detailRes.status === 404) notFound();
  if (detailRes.status === 401) {
    redirect(`/login?next=${encodeURIComponent(`/questions/${questionId}`)}`);
  }
  if (!detailRes.ok) {
    throw new Error("Unable to load question thread.");
  }

  const detailPayload = (await detailRes.json()) as { doc?: QuestionDetail };
  const question = detailPayload.doc;
  if (!question) notFound();
  const lessonHref = getLessonLink(question.lesson);

  return (
    <main className="mx-auto w-full max-w-[var(--content-max,96ch)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/questions"
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            Back to my questions
          </Link>
          {lessonHref ? (
            <Link
              href={lessonHref}
              className="text-sm font-semibold text-primary underline underline-offset-4"
            >
              Back to lesson
            </Link>
          ) : null}
        </div>
        <QuestionThreadCard
          question={{
            id: String(question.id),
            title: question.title ?? "Untitled question",
            status: question.status ?? "open",
            body: question.body ?? "",
            createdAt: question.createdAt ?? null,
            answers: Array.isArray(question.answers) ? question.answers : [],
          }}
        />
      </div>
    </main>
  );
}
