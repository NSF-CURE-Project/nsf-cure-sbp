import React from "react";
import type { BlocksContent } from "@strapi/blocks-react-renderer";

// The node shape Strapi gives us is compatible with this loose type
type BlockNode = {
  type?: string;
  text?: string;
  url?: string;
  format?: string;
  children?: BlockNode[];
};

// Recursively render an array of nodes
function renderNodes(nodes: BlockNode[] | undefined): React.ReactNode {
  if (!nodes) return null;
  return nodes.map((node, idx) => renderNode(node, idx));
}

function renderNode(node: BlockNode, key: number): React.ReactNode {
  const { type, text, url, format, children } = node;
  const kids = renderNodes(children);

  switch (type) {
    case "paragraph":
      return (
        <p key={key} className="mb-3 leading-7">
          {kids}
        </p>
      );

    case "list": {
      const ordered = format === "ordered";
      const Tag = ordered ? "ol" : "ul";
      return (
        <Tag
          key={key}
          className={`mb-3 list-inside space-y-1 ${
            ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {kids}
        </Tag>
      );
    }

    case "list-item":
      return <li key={key}>{kids}</li>;

    case "link":
      return (
        <a
          key={key}
          href={url ?? "#"}
          className="underline decoration-muted-foreground/60 hover:decoration-muted-foreground text-primary"
        >
          {kids}
        </a>
      );

    case "text":
      return <React.Fragment key={key}>{text}</React.Fragment>;

    default:
      // Fallback: just render children
      return <React.Fragment key={key}>{kids}</React.Fragment>;
  }
}

export function RichText({
  content,
  className,
}: {
  content: BlocksContent | null;
  className?: string;
}) {
  if (!content) return null;
  return <div className={className}>{renderNodes(content as any)}</div>;
}
