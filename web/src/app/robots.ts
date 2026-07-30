import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/preview",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/check-email",
          "/settings",
          "/profile",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
