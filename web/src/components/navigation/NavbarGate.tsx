"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/navigation/navbar";
import { isAuthRoute } from "@/lib/routes/authRoutes";

export default function NavbarGate() {
  const pathname = usePathname();

  if (isAuthRoute(pathname)) {
    return null;
  }

  return <Navbar />;
}
