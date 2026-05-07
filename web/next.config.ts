import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const payloadProxyTarget =
  process.env.PAYLOAD_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_CMS_URL ??
  "http://localhost:3000";
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
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      // Payload local media (dev only — gated on NODE_ENV)
      ...(process.env.NODE_ENV !== "production"
        ? ([
            {
              protocol: "http",
              hostname: "localhost",
              port: "3000",
              pathname: "/api/media/**",
            },
            {
              protocol: "http",
              hostname: "127.0.0.1",
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
          ] as const)
        : []),
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      ...(process.env.NEXT_PUBLIC_CMS_URL
        ? (() => {
            try {
              const cmsUrl = new URL(process.env.NEXT_PUBLIC_CMS_URL);
              const protocol =
                cmsUrl.protocol === "http:" ? ("http" as const) : ("https" as const);
              return [
                {
                  protocol,
                  hostname: cmsUrl.hostname,
                  pathname: "/api/media/**",
                },
              ];
            } catch {
              return [];
            }
          })()
        : []),
    ],
  },
  headers: async () => {
    const cmsHostFromEnv = (() => {
      try {
        return process.env.NEXT_PUBLIC_CMS_URL
          ? new URL(process.env.NEXT_PUBLIC_CMS_URL).origin
          : "";
      } catch {
        return "";
      }
    })();

    const isProd = process.env.NODE_ENV === "production";
    const scriptSrc = isProd
      ? "'self' 'unsafe-inline'"
      : "'self' 'unsafe-inline' 'unsafe-eval'";

    // Allow the Payload admin to embed this site in its live-preview iframe.
    // Falls back to 'self' if NEXT_PUBLIC_CMS_URL is not configured.
    const frameAncestors = cmsHostFromEnv
      ? `'self' ${cmsHostFromEnv}`
      : "'self'";

    const csp = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      `img-src 'self' data: blob: https://i.ytimg.com${cmsHostFromEnv ? ` ${cmsHostFromEnv}` : ""}`,
      `connect-src 'self'${cmsHostFromEnv ? ` ${cmsHostFromEnv}` : ""}`,
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      `frame-ancestors ${frameAncestors}`,
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      ...(isProd ? ["upgrade-insecure-requests"] : []),
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // X-Frame-Options is intentionally omitted; CSP frame-ancestors is
          // the modern equivalent and supports per-origin allow-listing for
          // the admin live-preview iframe (XFO can't).
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
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
      destination: `${normalizedPayloadTarget}/admin/login`,
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
