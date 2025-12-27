import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "../theme/theme-provider";
import React from "react";
import NavbarGate from "@/components/navigation/NavbarGate";
import { defaultDescription, siteName, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  openGraph: {
    title: siteName,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
  },
  icons: {
  icon: [
    {
      url: "/assets/logos/sbp_logo_transparent.png",
      href: "/assets/logos/sbp_logo_transparent.png",
    }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Tailwind's default font stack (font-sans) instead of next/font */}
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavbarGate />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
