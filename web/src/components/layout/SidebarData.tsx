import AppSidebar from "@/components/admin-panel/sidebar";
import { MobileSidebar } from "@/components/admin-panel/mobile-sidebar";
import { getSidebarClasses } from "@/components/layout/sidebar-data";

type SidebarDataProps = {
  draft: boolean;
  variant: "desktop" | "mobile";
};

export default async function SidebarData({ draft, variant }: SidebarDataProps) {
  const sidebarClasses = await getSidebarClasses(draft);

  if (variant === "mobile") {
    return <MobileSidebar classes={sidebarClasses} />;
  }

  return <AppSidebar classes={sidebarClasses} />;
}
