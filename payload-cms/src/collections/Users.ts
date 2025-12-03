import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    read: ({ req }) => req.user?.role === "admin", // Only admins can see user list
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
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
