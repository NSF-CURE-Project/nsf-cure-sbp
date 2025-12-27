"use client";

import React, { useEffect } from "react";
import {
  createClientFeature,
  toolbarFeatureButtonsGroupWithItems,
} from "@payloadcms/richtext-lexical/client";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  TextNode,
} from "@payloadcms/richtext-lexical/lexical";
import { useLexicalComposerContext } from "@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext";
import { MathNode, $createMathNode } from "./MathNode";

const DOLLAR_PLACEHOLDER = "__DOLLAR__PLACEHOLDER__";
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

const cloneTextNode = (node: TextNode, text: string) => {
  const next = $createTextNode(text);
  next.setFormat(node.getFormat());
  next.setStyle(node.getStyle());
  next.setDetail(node.getDetail());
  return next;
};

const replaceWithNodes = (node: TextNode, nodes: Array<TextNode | ReturnType<typeof $createMathNode>>) => {
  if (!nodes.length) return;
  nodes.forEach((nextNode, index) => {
    if (index === 0) {
      node.replace(nextNode);
    } else {
      nodes[index - 1].insertAfter(nextNode);
    }
  });
};

const MathPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (node) => {
      if (!node.isSimpleText()) return;
      if (!node.getTextContent().includes("$")) return;
      if (node.hasFormat("code")) return;

      const parent = node.getParent();
      if (!parent || parent.getType() === "code") return;

      const tokens = splitMathTokens(node.getTextContent());
      if (!tokens.some((token) => token.type === "math")) return;

      const nextNodes = tokens.flatMap((token) => {
        if (token.type === "math") {
          if (!token.value) return [];
          return [$createMathNode(token.value, Boolean(token.display))];
        }
        if (!token.value) return [];
        return [cloneTextNode(node, token.value)];
      });

      replaceWithNodes(node, nextNodes);
    });
  }, [editor]);

  return null;
};

const MathIcon = () => (
  <span style={{ fontWeight: 700, fontSize: 12 }}>Math</span>
);

const insertMathFromPrompt = (editor: {
  update: (cb: () => void) => void;
  getEditorState: () => { read: (cb: () => void) => void };
}) => {
  let selectionText = "";
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    selectionText = $isRangeSelection(selection) ? selection.getTextContent() : "";
  });
  const rawInput = window.prompt(
    "Enter LaTeX (use $...$ inline or $$...$$ for display)",
    selectionText,
  );
  if (!rawInput) return;

  let latex = rawInput.trim();
  let displayMode = false;

  if (latex.startsWith("$$") && latex.endsWith("$$")) {
    displayMode = true;
    latex = latex.slice(2, -2).trim();
  } else if (latex.startsWith("$") && latex.endsWith("$")) {
    latex = latex.slice(1, -1).trim();
  }

  if (!latex) return;

  editor.update(() => {
    const currentSelection = $getSelection();
    if (!$isRangeSelection(currentSelection)) return;
    currentSelection.insertNodes([$createMathNode(latex, displayMode)]);
  });
};

export const MathFeatureClient = createClientFeature({
  nodes: [MathNode],
  plugins: [
    {
      Component: MathPlugin,
      position: "normal",
    },
  ],
  toolbarFixed: {
    groups: [
      toolbarFeatureButtonsGroupWithItems([
        {
          ChildComponent: MathIcon,
          key: "math",
          label: "Math",
          onSelect: ({ editor }) => {
            insertMathFromPrompt(editor);
          },
        },
      ]),
    ],
  },
  toolbarInline: {
    groups: [
      toolbarFeatureButtonsGroupWithItems([
        {
          ChildComponent: MathIcon,
          key: "math",
          label: "Math",
          onSelect: ({ editor }) => {
            insertMathFromPrompt(editor);
          },
        },
      ]),
    ],
  },
});
