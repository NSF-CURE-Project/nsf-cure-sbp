"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type LoginLinkProps = Omit<React.ComponentProps<typeof Link>, "href">;

export function LoginLink({ children, ...props }: LoginLinkProps) {
  const pathname = usePathname();
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setQueryString(window.location.search);
  }, [pathname]);

  let href = "/login";
  if (pathname && pathname !== "/login") {
    const nextPath = `${pathname}${queryString}`;
    const encodedNext = encodeURIComponent(nextPath);
    href = `/login?next=${encodedNext}`;
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
