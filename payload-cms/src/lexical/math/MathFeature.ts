import katex from "katex";
import { createNode, createServerFeature } from "@payloadcms/richtext-lexical";
import { MathNode, type SerializedMathNode } from "./MathNode";

export const MathFeature = createServerFeature({
  feature: {
    ClientFeature: "@/lexical/math/MathFeatureClient#MathFeatureClient",
    clientFeatureProps: null,
    nodes: [
      createNode({
        converters: {
          html: {
            converter: ({ node }) => {
              const serialized = node as SerializedMathNode | undefined;
              const latex = serialized?.latex ?? "";
              if (!latex) return "";
              const displayMode = Boolean(serialized?.displayMode);
              const html = katex.renderToString(latex, {
                displayMode,
                strict: "ignore",
                throwOnError: false,
              });
              return `<span class="payload-math">${html}</span>`;
            },
            nodeTypes: [MathNode.getType()],
          },
        },
        node: MathNode,
      }),
    ],
  },
  key: "math",
});
