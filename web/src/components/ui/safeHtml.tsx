import DOMPurify from "isomorphic-dompurify";

export function SafeHtml({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  const safe = DOMPurify.sanitize(html ?? "");
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />
  );
}
