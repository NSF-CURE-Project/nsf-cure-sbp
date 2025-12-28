"use client";
import Link from "next/link";
import React from "react";

export function ThemedButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        inline-flex items-center justify-center
        px-5 py-2.5 rounded-md font-medium
        bg-primary text-primary-foreground
        hover:bg-secondary hover:text-secondary-foreground
        transition-colors duration-200
      "
    >
      {children}
    </Link>
  );
}
