import type { CollectionConfig } from "payload";

export const Classes: CollectionConfig = {
  slug: "classes",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "slug"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
    },

    // 🔽 NEW: Sidebar ordering
    {
      name: "order",
      label: "Sidebar order",
      type: "number",
      required: false,
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Lower numbers appear earlier in the sidebar.",
      },
    },

    {
      name: "chapters",
      label: "Chapters",
      type: "relationship",
      relationTo: "chapters" as any, // must match Chapters.slug
      hasMany: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
    },
  ],
};
