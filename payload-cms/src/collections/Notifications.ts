import type { CollectionConfig } from "payload";

const isStaff = (req?: { user?: { collection?: string; role?: string } }) =>
  req?.user?.collection === "users" ||
  ["admin", "staff"].includes(req?.user?.role ?? "");

export const Notifications: CollectionConfig = {
  slug: "notifications",
  admin: {
    useAsTitle: "title",
    group: "Student Support",
    defaultColumns: ["title", "recipient", "read", "createdAt"],
    defaultSort: "-createdAt",
  },
  access: {
    read: ({ req }) => {
      if (isStaff(req)) return true;
      if (req.user?.collection === "accounts") {
        return { recipient: { equals: req.user.id } };
      }
      return false;
    },
    create: ({ req }) => isStaff(req),
    update: ({ req }) => {
      if (isStaff(req)) return true;
      if (req.user?.collection === "accounts") {
        return { recipient: { equals: req.user.id } };
      }
      return false;
    },
    delete: ({ req }) => isStaff(req),
  },
  fields: [
    {
      name: "recipient",
      type: "relationship",
      relationTo: "accounts" as any,
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "question_answered",
      options: [
        { label: "Question answered", value: "question_answered" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "body",
      type: "textarea",
    },
    {
      name: "question",
      type: "relationship",
      relationTo: "questions" as any,
    },
    {
      name: "read",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
  ],
};
