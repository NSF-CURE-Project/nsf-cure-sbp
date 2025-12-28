import type { CollectionConfig } from "payload";

const isStaff = (req?: { user?: { collection?: string; role?: string } }) =>
  req?.user?.collection === "users" ||
  ["admin", "staff"].includes(req?.user?.role ?? "");

export const LessonFeedback: CollectionConfig = {
  slug: "lesson-feedback",
  admin: {
    useAsTitle: "message",
    group: "Student Support",
    defaultColumns: ["lesson", "rating", "user", "createdAt"],
    defaultSort: "-createdAt",
  },
  access: {
    read: ({ req }) => (isStaff(req) ? true : false),
    create: () => true,
    update: ({ req }) => isStaff(req),
    delete: ({ req }) => isStaff(req),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (!data || !req?.payload) return data;

        if (!data.user && req.user?.collection === "accounts" && req.user?.id) {
          data.user = req.user.id;
        }

        const lessonValue = data.lesson ?? originalDoc?.lesson;
        const lessonId =
          typeof lessonValue === "object" && lessonValue !== null
            ? (lessonValue as { id?: string }).id
            : lessonValue;

        if (lessonId) {
          const lesson = await req.payload.findByID({
            collection: "lessons",
            id: lessonId,
            depth: 0,
          });
          if (lesson) {
            data.lesson = lesson.id;
            data.chapter =
              (lesson as { chapter?: string | { id?: string } }).chapter ?? data.chapter;
            const chapterId =
              typeof data.chapter === "object" && data.chapter !== null
                ? (data.chapter as { id?: string }).id
                : data.chapter;
            if (chapterId) {
              const chapter = await req.payload.findByID({
                collection: "chapters",
                id: chapterId,
                depth: 0,
              });
              if (chapter) {
                data.chapter = chapter.id;
                data.class = (chapter as { class?: string | { id?: string } }).class ?? data.class;
              }
            }
          }
        }

        if (typeof data.reply === "string" && data.reply.trim()) {
          data.repliedAt = data.repliedAt ?? new Date().toISOString();
          if (isStaff(req) && req.user?.id && !data.repliedBy) {
            data.repliedBy = req.user.id;
          }
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "accounts" as any,
      required: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "lesson",
      type: "relationship",
      relationTo: "lessons" as any,
      required: true,
      admin: {
        description: "Feedback is scoped to this lesson.",
      },
    },
    {
      name: "chapter",
      type: "relationship",
      relationTo: "chapters" as any,
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "class",
      type: "relationship",
      relationTo: "classes" as any,
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "rating",
      type: "select",
      required: true,
      options: [
        { label: "Not helpful", value: "not_helpful" },
        { label: "Somewhat helpful", value: "somewhat_helpful" },
        { label: "Helpful", value: "helpful" },
        { label: "Very helpful", value: "very_helpful" },
      ],
    },
    {
      name: "message",
      type: "textarea",
      admin: {
        description: "Optional comments from the student.",
      },
    },
    {
      name: "reply",
      type: "textarea",
      admin: {
        description: "Staff reply shown in the admin panel.",
      },
    },
    {
      name: "repliedAt",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "repliedBy",
      type: "relationship",
      relationTo: "users" as any,
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "pageUrl",
      label: "Page URL",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "userAgent",
      label: "User Agent",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
  ],
};
