import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === "admin") return true;
      return { id: { equals: req.user.id } };
    },
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === "admin") return true;
      return { id: { equals: req.user.id } };
    },
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      defaultValue: "staff",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Staff", value: "staff" },
      ],
      admin: {
        description:
          "Admins can manage users, settings, and the entire CMS. Staff can edit content only.",
      },
    },
    // Add additional user fields as needed (e.g. name, department)
  ],
};
