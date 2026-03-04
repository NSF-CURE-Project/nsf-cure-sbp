"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type LoginLinkProps = Omit<React.ComponentProps<typeof Link>, "href">;

export function LoginLink({ children, ...props }: LoginLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let href = "/login";
  if (pathname && pathname !== "/login") {
    const query = searchParams.toString();
    const nextPath = `${pathname}${query ? `?${query}` : ""}`;
    const encodedNext = encodeURIComponent(nextPath);
    href = `/login?next=${encodedNext}`;
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
