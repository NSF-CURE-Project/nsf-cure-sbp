import React from "react";
import katex from "katex";
import type { JSXConverter } from "@payloadcms/richtext-lexical/react";

type TextNode = {
  text?: string;
  format?: number;
};

const DOLLAR_PLACEHOLDER = "__DOLLAR__PLACEHOLDER__";
const NODE_FORMAT = {
  IS_BOLD: 1,
  IS_ITALIC: 1 << 1,
  IS_STRIKETHROUGH: 1 << 2,
  IS_UNDERLINE: 1 << 3,
  IS_CODE: 1 << 4,
  IS_SUBSCRIPT: 1 << 5,
  IS_SUPERSCRIPT: 1 << 6,
};
const MATH_REGEX = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

const splitMathTokens = (value: string) => {
  const safeValue = value.replace(/\\\$/g, DOLLAR_PLACEHOLDER);
  const tokens: Array<{ type: "text" | "math"; value: string; display?: boolean }> = [];
  let lastIndex = 0;

  for (const match of safeValue.matchAll(MATH_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: "text", value: safeValue.slice(lastIndex, index) });
    }
    const displayValue = match[1];
    const inlineValue = match[2];
    tokens.push({
      type: "math",
      value: (displayValue ?? inlineValue ?? "").trim(),
      display: Boolean(displayValue),
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < safeValue.length) {
    tokens.push({ type: "text", value: safeValue.slice(lastIndex) });
  }

  return tokens.map((token) => ({
    ...token,
    value: token.value.replaceAll(DOLLAR_PLACEHOLDER, "$"),
  }));
};

const renderMath = (value: string, displayMode: boolean) => {
  if (!value) return null;
  const html = katex.renderToString(value, {
    displayMode,
    throwOnError: false,
    strict: "ignore",
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const applyFormat = (content: React.ReactNode, format = 0) => {
  let output: React.ReactNode = content;
  if (format & NODE_FORMAT.IS_BOLD) {
    output = <strong>{output}</strong>;
  }
  if (format & NODE_FORMAT.IS_ITALIC) {
    output = <em>{output}</em>;
  }
  if (format & NODE_FORMAT.IS_STRIKETHROUGH) {
    output = <span style={{ textDecoration: "line-through" }}>{output}</span>;
  }
  if (format & NODE_FORMAT.IS_UNDERLINE) {
    output = <span style={{ textDecoration: "underline" }}>{output}</span>;
  }
  if (format & NODE_FORMAT.IS_CODE) {
    output = <code>{output}</code>;
  }
  if (format & NODE_FORMAT.IS_SUBSCRIPT) {
    output = <sub>{output}</sub>;
  }
  if (format & NODE_FORMAT.IS_SUPERSCRIPT) {
    output = <sup>{output}</sup>;
  }
  return output;
};

export const mathTextConverter: JSXConverter<TextNode> = ({ node }) => {
  const text = node.text ?? "";
  const format = node.format ?? 0;

  if (format & NODE_FORMAT.IS_CODE) {
    return applyFormat(text, format);
  }

  const tokens = splitMathTokens(text);
  if (!tokens.some((token) => token.type === "math")) {
    return applyFormat(text, format);
  }

  const children = tokens.map((token, index) => {
    if (token.type === "math") {
      return (
        <span key={`math-${index}`} className="math-token">
          {renderMath(token.value, Boolean(token.display))}
        </span>
      );
    }
    return token.value;
  });

  return applyFormat(children, format);
};
