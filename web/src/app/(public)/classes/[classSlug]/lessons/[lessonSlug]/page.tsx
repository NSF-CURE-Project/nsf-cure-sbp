// src/app/(public)/classes/[classSlug]/lessons/[lessonSlug]/page.tsx
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { SafeHtml } from "@/components/ui/safeHtml";
import { getLessonBySlug } from "@/lib/payloadSdk/lessons";
import type { LessonBlock, LessonDoc } from "@/lib/payloadSdk/types";

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
  const l = lesson as LessonDoc & {
    class?: { slug?: string } | null;
    chapter?: { class?: { slug?: string } | null } | null;
  };

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
  options?: { draft?: boolean },
): Promise<LessonDoc | null> {
  const lesson = await getLessonBySlug(lessonSlug, options);
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

  const node = raw as {
    root?: {
      children?: unknown[];
    };
  };
  if (node.root && Array.isArray(node.root.children)) {
    const html = node.root.children
      .map((child) => renderLexicalNode(child))
      .filter(Boolean)
      .join("");
    return html || "";
  }

  return "";
}

type LexicalNode = {
  type?: string;
  children?: LexicalNode[];
  text?: string;
  tag?: string;
};

function renderLexicalNode(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const current = node as LexicalNode;
  const type = current.type;
  const children = Array.isArray(current.children) ? current.children : [];

  const text = children.map(renderLexicalNode).join("");

  if (type === "text") {
    return typeof current.text === "string" ? current.text : "";
  }

  if (type === "paragraph") {
    return text ? `<p>${text}</p>` : "";
  }

  if (type === "heading") {
    const tag = current.tag || "h2";
    return text ? `<${tag}>${text}</${tag}>` : "";
  }

  // Fallback: concatenate children
  return text;
}

export default async function LessonPage({ params }: PageProps) {
  const { classSlug, lessonSlug } = await params;
  const { isEnabled: isPreview } = await draftMode();

  const lesson = await fetchLessonForClass(classSlug, lessonSlug, {
    draft: isPreview,
  });
  if (!lesson) return notFound();

  const title = lesson.title ?? "Untitled lesson";
  const lastModified = lesson.updatedAt || lesson.createdAt || null;

  const layoutBlocks = Array.isArray(lesson.layout)
    ? (lesson.layout as LessonBlock[])
    : [];

  // Legacy fields (fallback if no blocks exist)
  const textContent = normalizeTextContent(lesson.textContent);
  const lessonMedia = lesson as {
    video?: { url?: string } | null;
    videoUrl?: string | null;
  };
  const videoUrl = absUrl(lessonMedia.video?.url ?? lessonMedia.videoUrl ?? null);
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(textContent ?? "");

  return (
    <article className="mx-auto w-full max-w-[var(--content-max,100ch)] py-10 px-4">
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

      {layoutBlocks.length > 0 ? (
        <div className="space-y-10">
          {layoutBlocks.map((block, idx) => {
            if (block.blockType === "richTextBlock") {
              const html = normalizeTextContent(block.body);
              const looksHtml = /<\/?[a-z][\s\S]*>/i.test(html ?? "");
              return (
                <section key={block.id ?? idx}>
                  {looksHtml ? (
                    <SafeHtml
                      html={html}
                      className="prose dark:prose-invert max-w-none"
                    />
                  ) : (
                    <div className="prose dark:prose-invert whitespace-pre-wrap max-w-none">
                      {html}
                    </div>
                  )}
                </section>
              );
            }

            if (block.blockType === "videoBlock") {
              const blockMedia = block as {
                video?: { url?: string } | null;
                url?: string | null;
              };
              const url = absUrl(blockMedia.video?.url ?? blockMedia.url ?? null);
              if (!url) return null;
              return (
                <section key={block.id ?? idx} className="space-y-3">
                  <div className="aspect-video w-full">
                    <video
                      src={url}
                      controls
                      className="w-full h-full rounded-lg shadow"
                    />
                  </div>
                  {block.caption && (
                    <p className="text-sm text-muted-foreground">{block.caption}</p>
                  )}
                </section>
              );
            }

            return null;
          })}
        </div>
      ) : (
        <>
          {/* ============================
              VIDEO SECTION (legacy)
          ============================ */}
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
              CONTENT SECTION (legacy)
          ============================ */}
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
        </>
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
