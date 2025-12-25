import type { CollectionConfig } from "payload";
import { ensureUniqueSlug, slugify } from "../utils/slug";

export const Chapters: CollectionConfig = {
  slug: "chapters",
  admin: {
    useAsTitle: "title",
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc, id }) => {
        if (!data) return data;
        if (!data.slug) {
          const title = data.title ?? originalDoc?.title ?? "";
          const base = slugify(String(title));
          data.slug = await ensureUniqueSlug({
            base,
            collection: "chapters",
            req,
            id,
          });
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "lessons",
      label: "Lessons",
      type: "relationship",
      relationTo: "lessons" as any, // each chapter can link to many lessons
      hasMany: true,
    },
    {
      name: "class",
      label: "Class",
      type: "relationship",
      relationTo: "classes" as any, // many chapters → one class
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: "objective",
      type: "richText", // same as before, just now “chapter objective”
    },
  ],
};
