import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "../theme/theme-provider";
import React from "react";
import NavbarGate from "@/components/navigation/NavbarGate";

export const metadata: Metadata = {
  title: "NSF CURE Summer Bridge Program",
  description: "The online NSF CURE Summer Bridge Program (SBP) is a National Science Foundation-funded initiative (NSF Award #2318158) that launched in 2026 to help rising second-year engineering students build a strong foundation in Statics and Mechanics of Materials.",
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
