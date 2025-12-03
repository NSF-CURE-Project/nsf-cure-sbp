// src/app/(public)/classes/[classSlug]/lessons/[lessonSlug]/page.tsx
import { notFound } from "next/navigation";
import { SafeHtml } from "@/components/ui/safeHtml";
import { getLessonBySlug } from "@/lib/payloadSdk/lessons";
import type { LessonDoc } from "@/lib/payloadSdk/types";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

const CMS_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3000";

type RouteParams = { classSlug: string; lessonSlug: string };
type PageProps = {
  params: Promise<RouteParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const absUrl = (u?: string | null) =>
  u ? (u.startsWith("http") ? u : `${CMS_URL}${u}`) : null;

/** Try to recover the class.slug from the lesson document (handles a few shapes). */
function getLessonClassSlug(lesson: LessonDoc): string | null {
  const l: any = lesson;

  // Direct class relationship on lesson
  if (l.class && typeof l.class === "object" && "slug" in l.class) {
    return l.class.slug as string;
  }

  // Class via chapter → class
  if (
    l.chapter &&
    typeof l.chapter === "object" &&
    "class" in l.chapter &&
    l.chapter.class &&
    typeof l.chapter.class === "object" &&
    "slug" in l.chapter.class
  ) {
    return l.chapter.class.slug as string;
  }

  return null;
}

async function fetchLessonForClass(
  classSlug: string,
  lessonSlug: string,
): Promise<LessonDoc | null> {
  const lesson = await getLessonBySlug(lessonSlug);
  if (!lesson) return null;

  const lessonClassSlug = getLessonClassSlug(lesson);

  // If we can detect a class slug and it doesn't match the route, treat as not found
  if (
    lessonClassSlug &&
    lessonClassSlug.toLowerCase() !== classSlug.toLowerCase()
  ) {
    return null;
  }

  return lesson;
}

// Convert Payload Lexical JSON to simple HTML (paragraphs + headings).
// If it's already a string, return as-is.
function normalizeTextContent(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (!raw || typeof raw !== "object") return "";

  const node: any = raw;
  if (node.root && Array.isArray(node.root.children)) {
    const html = node.root.children
      .map((child: any) => renderLexicalNode(child))
      .filter(Boolean)
      .join("");
    return html || "";
  }

  return "";
}

function renderLexicalNode(node: any): string {
  if (!node || typeof node !== "object") return "";
  const type = node.type;
  const children = Array.isArray(node.children) ? node.children : [];

  const text = children.map(renderLexicalNode).join("");

  if (type === "text") {
    return typeof node.text === "string" ? node.text : "";
  }

  if (type === "paragraph") {
    return text ? `<p>${text}</p>` : "";
  }

  if (type === "heading") {
    const tag = node.tag || "h2";
    return text ? `<${tag}>${text}</${tag}>` : "";
  }

  // Fallback: concatenate children
  return text;
}

export default async function LessonPage({ params }: PageProps) {
  const { classSlug, lessonSlug } = await params;

  const lesson = await fetchLessonForClass(classSlug, lessonSlug);
  if (!lesson) return notFound();

  const title = lesson.title ?? "Untitled lesson";
  const lastModified = lesson.updatedAt || lesson.createdAt || null;

  // Extract lesson body — supports plain string or Lexical JSON
  const textContent = normalizeTextContent(lesson.textContent);

  const videoUrl = absUrl(
    (lesson.video as any)?.url ?? (lesson as any).videoUrl ?? null,
  );

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(textContent ?? "");

  return (
    <article className="max-w-4xl mx-auto py-10 px-4">
      {/* Visible Lesson Title */}
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      {lastModified && (
        <p className="text-sm text-muted-foreground mb-6">
          Last updated {formatDate(lastModified)}
        </p>
      )}

      {/* Invisible TOC heading (top-level) */}
      <h2 id="lesson-title" className="sr-only">
        {title}
      </h2>

      {/* ============================
          VIDEO SECTION
      ============================ */}

      {/* Invisible TOC heading for video */}
      <h3 id="lesson-video" className="sr-only">
        Lesson Video
      </h3>

      {videoUrl ? (
        <div className="aspect-video mb-8">
          <video
            src={videoUrl}
            controls
            className="w-full h-full rounded-lg shadow"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-8">
          No video for this lesson.
        </p>
      )}

      {/* ============================
          CONTENT SECTION
      ============================ */}

      {/* Invisible TOC heading for content */}
      <h3 id="lesson-content" className="sr-only">
        Lesson Content
      </h3>

      {looksLikeHtml ? (
        <SafeHtml
          html={textContent}
          className="prose dark:prose-invert max-w-none"
        />
      ) : (
        <div className="prose dark:prose-invert whitespace-pre-wrap max-w-none">
          {textContent}
        </div>
      )}
    </article>
  );
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
