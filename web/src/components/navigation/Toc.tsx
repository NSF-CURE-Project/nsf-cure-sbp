"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { usePathname } from "next/navigation";

type TocItem = { id: string; text: string; level: number };

export default function Toc() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [open, setOpen] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();
  const TOC_OPEN_WIDTH = "14rem";
  const TOC_OPEN_GAP = "1.25rem";

  // Restore persisted state
  useEffect(() => {
    const saved = localStorage.getItem("toc-open");
    if (saved !== null) setOpen(saved === "true");
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem("toc-open", String(open));
  }, [open]);

  // Build TOC from headings whenever the route changes
  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll("main h2, main h3")
    ) as HTMLHeadingElement[];

    const tocItems = headings.map((h) => {
      const id =
        h.id || h.textContent?.toLowerCase().trim().replace(/\s+/g, "-") || "";
      h.id = id;

      return {
        id,
        text: h.textContent || "",
        level: h.tagName === "H2" ? 2 : 3,
      };
    });

    setItems(tocItems);
    setActiveId(tocItems[0]?.id ?? null);
  }, [pathname]);

  // Drive layout via CSS variables (consumed in #layout grid)
  useEffect(() => {
    document.body.dataset.toc = open ? "open" : "closed";
  }, [open]);

  // Active section highlight
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveId((e.target as HTMLElement).id);
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px", threshold: [0, 1] }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [items]);

  // TOC list
  const TocList = useMemo(
    () => (
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id} className={item.level === 3 ? "ml-3" : ""}>
              <a
                href={`#${item.id}`}
                onClick={() => setDrawer(false)}
                className={[
                  "block rounded px-2 py-1 hover:underline",
                  "text-muted-foreground",
                  isActive ? "font-semibold underline text-foreground" : "",
                ].join(" ")}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    ),
    [items, activeId]
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        className="fixed bottom-5 right-5 z-40 rounded-full bg-background/70 px-4 py-2 text-sm backdrop-blur lg:hidden"
        onClick={() => setDrawer(true)}
        aria-controls="toc-drawer"
        aria-expanded={drawer}
      >
        Contents
      </button>

      {/* Mobile drawer */}
      <div
        id="toc-drawer"
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-50 w-72 transform bg-background transition-transform duration-200 lg:hidden ${
          drawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold">Table of contents</span>
          <button
            className="rounded px-2 py-1 text-sm hover:bg-muted"
            onClick={() => setDrawer(false)}
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(100vh-56px)] overflow-y-auto p-3">
          <nav className="text-sm space-y-4">
            {TocList}
            <div className="pt-4">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop TOC panel (right column) */}
      <div
        className="relative hidden h-[calc(100dvh-var(--nav-h))] lg:block"
        aria-label="Table of contents"
      >
        {/* Toggle button hanging over the content edge */}
        <button
          className={[
            "hidden lg:inline-flex fixed z-10 h-7 w-7 items-center justify-center rounded-full bg-background text-xs shadow transition-all duration-200",
          ].join(" ")}
          style={{
            top: "calc(var(--nav-h) + 0.5rem)",
            right: open
              ? `calc(${TOC_OPEN_WIDTH} + ${TOC_OPEN_GAP} - 0.75rem)`
              : "0.75rem",
          }}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="desktop-toc"
          title={open ? "Collapse TOC" : "Expand TOC"}
        >
          {open ? "→" : "←"}
        </button>

        <div
          id="desktop-toc"
          className="sticky top-[var(--nav-h)] h-full overflow-hidden"
        >
          <div
            className={`h-full overflow-y-auto border-l bg-background p-4 transition-opacity ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="sticky top-0 z-10 pb-2">
              <p className="mb-2 font-semibold">On this page</p>
            </div>
            <nav className="text-sm">
              {TocList}
              <div className="mt-6">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
