import React from "react";
import katex from "katex";
import {
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  $applyNodeReplacement,
} from "@payloadcms/richtext-lexical/lexical";

export type SerializedMathNode = SerializedLexicalNode & {
  latex: string;
  displayMode?: boolean;
  type: "math";
  version: 1;
};

type MathNodeProps = {
  displayMode?: boolean;
  key?: NodeKey;
  latex: string;
};

const renderMath = (latex: string, displayMode: boolean) => {
  try {
    return katex.renderToString(latex, {
      displayMode,
      strict: "ignore",
      throwOnError: false,
    });
  } catch (error) {
    return latex;
  }
};

const MathRenderer = ({ latex, displayMode }: { latex: string; displayMode: boolean }) => {
  const html = renderMath(latex, displayMode);
  return (
    <span
      className={`payload-math ${displayMode ? "payload-math--display" : "payload-math--inline"}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export class MathNode extends DecoratorNode<JSX.Element> {
  __displayMode: boolean;
  __latex: string;

  constructor({ displayMode = false, key, latex }: MathNodeProps) {
    super(key);
    this.__latex = latex;
    this.__displayMode = displayMode;
  }

  static clone(node: MathNode) {
    return new MathNode({
      displayMode: node.__displayMode,
      key: node.__key,
      latex: node.__latex,
    });
  }

  static getType() {
    return "math";
  }

  static importJSON(serializedNode: SerializedMathNode) {
    const latex = serializedNode.latex ?? "";
    return $createMathNode(latex, serializedNode.displayMode ?? false);
  }

  exportJSON(): SerializedMathNode {
    return {
      displayMode: this.__displayMode,
      latex: this.__latex,
      type: "math",
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    const element = document.createElement(this.__displayMode ? "div" : "span");
    element.className = `payload-math-node ${this.__displayMode ? "payload-math-node--display" : "payload-math-node--inline"}`;
    return element;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return !this.__displayMode;
  }

  decorate(): JSX.Element {
    return <MathRenderer latex={this.__latex} displayMode={this.__displayMode} />;
  }

  getTextContent(): string {
    return this.__latex;
  }
}

export const $createMathNode = (latex: string, displayMode = false) =>
  $applyNodeReplacement(new MathNode({ displayMode, latex }));

export const $isMathNode = (node: LexicalNode | null | undefined): node is MathNode =>
  node instanceof MathNode;
