import type { CollectionConfig } from "payload";

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
  },
  access: {
    read: () => true,
  },
  // Disable versions/drafts to avoid version tables
  versions: false,
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

    {
      // Strapi `video` media field → Payload upload to Media collection
      name: "video",
      type: "upload",
      relationTo: "media" as any, // assumes you have Media collection with slug 'media'
    },
    {
      // Strapi `textContent` (Markdown) → Payload richText
      name: "textContent",
      type: "richText",
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
      blocks: [
        {
          slug: "richTextBlock",
          interfaceName: "RichTextBlock",
          labels: { singular: "Rich Text", plural: "Rich Text" },
          fields: [
            {
              name: "body",
              type: "richText",
              required: true,
            },
          ],
        },
        {
          slug: "videoBlock",
          interfaceName: "VideoBlock",
          labels: { singular: "Video", plural: "Videos" },
          fields: [
            {
              name: "video",
              type: "upload",
              relationTo: "media" as any,
              required: false,
            },
            {
              name: "url",
              label: "External URL (optional)",
              type: "text",
            },
            {
              name: "caption",
              type: "text",
            },
          ],
        },
      ],
      admin: {
        description:
          "Add rich text or videos and drag to reorder. Leave empty to fall back to legacy fields.",
      },
    },
    {
      // Strapi `problemSets` component
      name: "problemSets",
      label: "Problem Sets",
      type: "array", // repeatable component
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          // nested repeatable `questions` component
          name: "questions",
          label: "Questions",
          type: "array",
          fields: [
            {
              name: "questionText",
              type: "richText", // maps Strapi markdown
              required: true,
            },
            {
              name: "answer",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
