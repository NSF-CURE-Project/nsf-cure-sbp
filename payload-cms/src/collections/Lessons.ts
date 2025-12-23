import type { CollectionConfig } from "payload";
import { pageBlocks } from "../blocks/pageBlocks";

export const Lessons: CollectionConfig = {
  slug: "lessons",
  admin: {
    useAsTitle: "title",
    preview: {
      url: ({ data }) => {
        const lessonSlug = data?.slug ?? "";
        const classSlug =
          (typeof data?.class === "object" && (data.class as any)?.slug) ||
          (typeof data?.chapter === "object" &&
            (data.chapter as any)?.class &&
            typeof (data.chapter as any).class === "object" &&
            (data.chapter as any).class.slug) ||
          "";
        const base = process.env.WEB_PREVIEW_URL ?? "http://localhost:3001";
        const secret = process.env.PREVIEW_SECRET ?? "";
        const search = new URLSearchParams({
          secret,
          type: "lesson",
          slug: lessonSlug,
        });
        if (classSlug) search.set("classSlug", classSlug);
        return `${base}/api/preview?${search.toString()}`;
      },
    },
    livePreview: {
      url: ({ data }) => {
        const lessonSlug = data?.slug ?? "";
        const classSlug =
          (typeof data?.class === "object" && (data.class as any)?.slug) ||
          (typeof data?.chapter === "object" &&
            (data.chapter as any)?.class &&
            typeof (data.chapter as any).class === "object" &&
            (data.chapter as any).class.slug) ||
          "";
        const base = process.env.WEB_PREVIEW_URL ?? "http://localhost:3001";
        const secret = process.env.PREVIEW_SECRET ?? "";
        const search = new URLSearchParams({
          secret,
          type: "lesson",
          slug: lessonSlug,
        });
        if (classSlug) search.set("classSlug", classSlug);
        return `${base}/api/preview?${search.toString()}`;
      },
    },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },

    // 🔹 NEW: slug used in /classes/[classSlug]/lessons/[lessonSlug]
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "Used in lesson URLs, e.g. /classes/statics/lessons/vector-operations",
      },
    },

    // Flexible layout so staff can reorder content blocks
    {
      name: "layout",
      label: "Page Layout",
      type: "blocks",
      labels: {
        singular: "Section",
        plural: "Sections",
      },
      blocks: pageBlocks,
      admin: {
        description: "Build the lesson by adding and reordering content blocks.",
      },
    },
  ],
};
