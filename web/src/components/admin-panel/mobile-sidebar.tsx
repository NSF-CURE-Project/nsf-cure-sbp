"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SidebarClient from "@/components/navigation/SidebarClient";

type LessonNav = { slug: string; title: string };
type ModuleNav = { slug: string; title: string; lessons: LessonNav[] };
type ClassNav = { slug: string; title: string; modules: ModuleNav[] };

type MobileSidebarProps = {
  classes: ClassNav[];
};

export function MobileSidebar({ classes }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="lg:hidden gap-2"
        >
          <Menu className="h-4 w-4" />
          Study topics
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[min(22rem,90vw)] bg-[#fcfcfd] p-0">
        <SheetHeader className="space-y-1.5 px-5 pb-3 pt-5 text-left">
          <SheetTitle className="text-lg text-[#172033]">Browse topics</SheetTitle>
          <p className="text-sm text-[#667085]">
            Classes, chapters, and lessons in one place.
          </p>
        </SheetHeader>

        <div className="h-[calc(100vh-5.75rem)] overflow-y-auto px-3 pb-6">
          <SidebarClient classes={classes} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
