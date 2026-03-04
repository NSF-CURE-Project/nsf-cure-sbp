import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "../theme/theme-provider";
import React from "react";
import NavbarGate from "@/components/navigation/NavbarGate";
import { getSiteBranding } from "@/lib/payloadSdk/siteBranding";
import { defaultDescription, siteName, siteUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const siteBranding = await getSiteBranding({ revalidate: 60 });
  const iconUrl = siteBranding.programLogo.src;

  return {
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
      icon: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },
  };
}

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
