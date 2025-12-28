import { DefaultNodeTypes } from "@payloadcms/richtext-lexical";
import {
  JSXConvertersFunction,
  LinkJSXConverter,
} from "@payloadcms/richtext-lexical/react";

import { internalDocToHref } from "@/components/ui/RichText/converters/internalLink";
import { mathTextConverter } from "@/components/ui/RichText/converters/mathConverter";

type NodeTypes = DefaultNodeTypes;

export const jsxConverter: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  text: mathTextConverter,
});
