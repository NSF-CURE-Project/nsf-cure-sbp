import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const payloadProxyTarget =
  process.env.PAYLOAD_PROXY_TARGET ?? "http://localhost:3000";
const normalizePayloadTarget = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname === "/admin") {
      parsed.pathname = "";
    } else if (parsed.pathname.endsWith("/admin")) {
      parsed.pathname = parsed.pathname.slice(0, -"/admin".length);
    }
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    if (trimmed === "/admin") return "";
    if (trimmed.endsWith("/admin")) return trimmed.slice(0, -"/admin".length);
    return trimmed;
  }
};
const normalizedPayloadTarget = normalizePayloadTarget(payloadProxyTarget);
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      // Allow images from your Strapi dev server
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      // Optional: if you use 127.0.0.1
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
        pathname: "/uploads/**",
      },
      // Payload local media (admin)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/media/**",
      },
      {
        protocol: "http",
        hostname: "admin.sbp.local",
        port: "3000",
        pathname: "/api/media/**",
      },
      {
        protocol: "http",
        hostname: "app.sbp.local",
        port: "3001",
        pathname: "/api/media/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      // Optional: add your production Strapi domain later
      // {
      //   protocol: "https",
      //   hostname: "your-strapi-domain.com",
      //   pathname: "/uploads/**",
      // },
    ],
  },
  rewrites: async () => ({
    afterFiles: [
      {
        source: "/api/:path*",
        destination: `${normalizedPayloadTarget}/api/:path*`,
      },
    ],
  }),
  redirects: async () => [
    {
      source: "/admin",
      destination: `${normalizedPayloadTarget}/admin`,
      permanent: false,
    },
    {
      source: "/admin/:path*",
      destination: `${normalizedPayloadTarget}/admin/:path*`,
      permanent: false,
    },
  ],
};

export default nextConfig;
