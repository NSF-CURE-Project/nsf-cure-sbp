import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devServer: {
    allowedDevOrigins: [
      "http://app.sbp.local:3001",
      "http://app.sbp.local",
      "http://192.168.5.88:3001",
    ],
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
      // Optional: add your production Strapi domain later
      // {
      //   protocol: "https",
      //   hostname: "your-strapi-domain.com",
      //   pathname: "/uploads/**",
      // },
    ],
  },
};

export default nextConfig;
