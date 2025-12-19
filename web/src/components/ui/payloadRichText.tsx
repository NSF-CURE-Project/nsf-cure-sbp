// web/src/components/ui/payloadRichText.tsx
"use client";

import * as React from "react";
import { RichText as RichTextRenderer } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, "content"> & {
  content: SerializedEditorState; // <- the Lexical JSON from Payload
};

export function PayloadRichText({ content, className, ...rest }: Props) {
  if (!content) return null;

  return (
    <RichTextRenderer
      data={content}
      className={className}
      {...rest}
      // converters={jsxConverter} // you can add this later if you need custom blocks/links
    />
  );
}
