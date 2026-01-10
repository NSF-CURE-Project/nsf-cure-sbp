import type { NextConfig } from "next";

const payloadProxyTarget =
  process.env.PAYLOAD_PROXY_TARGET ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
        destination: `${payloadProxyTarget}/api/:path*`,
      },
    ],
  }),
};

export default nextConfig;
