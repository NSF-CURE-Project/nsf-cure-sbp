import {
  BarChart3,
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  GraduationCap,
  LucideIcon,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: [],
        },
        {
          href: "/classrooms",
          label: "Classrooms",
          icon: GraduationCap,
          submenus: [],
        },
        {
          href: "/analytics",
          label: "Analytics",
          icon: BarChart3,
          submenus: [],
        },
        {
          href: "/saved-lessons",
          label: "Saved Lessons",
          icon: Bookmark,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "",
          label: "Posts",
          icon: SquarePen,
          submenus: [
            {
              href: "/posts",
              label: "All Posts",
            },
            {
              href: "/posts/new",
              label: "New Post",
            },
          ],
        },
        {
          href: "/categories",
          label: "Categories",
          icon: Bookmark,
        },
        {
          href: "/tags",
          label: "Tags",
          icon: Tag,
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Users",
          icon: Users,
        },
        {
          href: "/account",
          label: "Account",
          icon: Settings,
        },
      ],
    },
  ];
}
