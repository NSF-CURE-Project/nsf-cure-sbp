"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@payloadcms/ui";

type PageLink = {
  id: string;
  title: string;
  slug?: string | null;
  navOrder?: number | null;
};

type PageOrderListProps = {
  title?: string;
  showEditLinks?: boolean;
  compact?: boolean;
  showHint?: boolean;
  pendingTitle?: string | null;
  pendingOrder?: number | null;
  onPendingOrderChange?: (order: number) => void;
};

const baseItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  borderRadius: 10,
  background: "rgba(0, 80, 48, 0.06)",
  color: "var(--cpp-ink, #0b3d27)",
};

const baseHandleStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: "1px solid rgba(0, 80, 48, 0.16)",
  background: "rgba(255, 255, 255, 0.8)",
  cursor: "grab",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  color: "rgba(11, 61, 39, 0.7)",
};

export default function PageOrderList({
  title = "Reorder pages",
  showEditLinks = false,
  compact = false,
  showHint = true,
  pendingTitle,
  pendingOrder,
  onPendingOrderChange,
}: PageOrderListProps) {
  const [pages, setPages] = useState<PageLink[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadPages = async () => {
      try {
        const res = await fetch("/api/pages?limit=200&sort=navOrder&sort=title", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setPages([]);
          return;
        }
        const data = (await res.json()) as {
          docs?: PageLink[];
        };
        const ordered = (data.docs ?? []).filter(
          (page) => page.slug && page.slug !== "home"
        );
        setPages(ordered);
      } catch (error) {
        if (!controller.signal.aborted) {
          setPages([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setPagesLoading(false);
        }
      }
    };

    loadPages();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!pendingTitle) {
      if (pendingIndex !== null) {
        setPendingIndex(null);
      }
      return;
    }

    const nextIndex = (() => {
      if (!pages.length) return 0;
      if (pendingOrder && pendingOrder > 0 && pendingOrder <= pages.length + 1) {
        return pendingOrder - 1;
      }
      return pages.length;
    })();

    if (pendingIndex !== nextIndex) {
      setPendingIndex(nextIndex);
    }

    const nextOrder = nextIndex + 1;
    if (pendingOrder !== nextOrder) {
      onPendingOrderChange?.(nextOrder);
    }
  }, [pages.length, pendingOrder, pendingTitle, onPendingOrderChange, pendingIndex]);

  const persistPageOrder = async (nextPages: PageLink[]) => {
    if (!nextPages.length) return;
    setIsSavingOrder(true);
    try {
      const updates = nextPages.map((item, index) => {
        const nextOrder = index + 1;
        if (item.navOrder === nextOrder) return null;
        return fetch(`/api/pages/${item.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ navOrder: nextOrder }),
        });
      });
      await Promise.all(updates.filter(Boolean) as Promise<Response>[]);
      setPages((prev) =>
        prev.map((item, index) => ({ ...item, navOrder: index + 1 }))
      );
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    if (pendingTitle && draggingId === "__pending__") {
      const items = [...pages];
      const targetIndex = items.findIndex((item) => item.id === targetId);
      if (targetIndex < 0) return;
      setPendingIndex(targetIndex);
      onPendingOrderChange?.(targetIndex + 1);
      return;
    }
    const current = [...pages];
    const fromIndex = current.findIndex((item) => item.id === draggingId);
    const toIndex = current.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setPages(current);
    await persistPageOrder(current);
  };

  const listItems = (() => {
    if (!pendingTitle) return pages;
    const index = pendingIndex == null ? pages.length : Math.min(pendingIndex, pages.length);
    const withPending = [...pages];
    withPending.splice(index, 0, {
      id: "__pending__",
      title: pendingTitle,
      slug: null,
    });
    return withPending;
  })();

  return (
    <div>
      <div
        style={{
          fontSize: compact ? 12 : 14,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--cpp-muted, #5b6f66)",
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      {showHint ? (
        <div
          style={{
            fontSize: 11,
            color: "var(--cpp-muted, #5b6f66)",
            marginTop: 6,
          }}
        >
          Drag pages to reorder.
          {isSavingOrder ? " Saving…" : ""}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: compact ? 6 : 8,
          paddingTop: 8,
        }}
      >
        {pagesLoading ? (
          <div
            style={{
              fontSize: 12,
              color: "var(--cpp-muted, #5b6f66)",
              padding: "4px 8px",
            }}
          >
            Loading pages…
          </div>
        ) : listItems.length ? (
          listItems.map((item) => {
            const isPending = item.id === "__pending__";
            return (
              <div
                key={item.id}
                style={{
                  ...baseItemStyle,
                  padding: compact ? "6px 8px" : baseItemStyle.padding,
                  opacity: isPending ? 0.85 : 1,
                  border: isPending ? "1px dashed rgba(0, 80, 48, 0.35)" : "none",
                }}
                draggable
                onDragStart={() => setDraggingId(item.id)}
                onDragEnd={() => setDraggingId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(item.id)}
              >
                <span
                  style={{
                    ...baseHandleStyle,
                    width: compact ? 24 : baseHandleStyle.width,
                    height: compact ? 24 : baseHandleStyle.height,
                    fontSize: compact ? 12 : baseHandleStyle.fontSize,
                    cursor: baseHandleStyle.cursor,
                  }}
                  aria-hidden="true"
                >
                  ⋮⋮
                </span>
                <span style={{ flex: 1, fontWeight: 600 }}>
                  {item.title || item.slug || "Untitled Page"}
                </span>
                {isPending ? (
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--cpp-muted, #5b6f66)",
                      fontWeight: 600,
                    }}
                  >
                    Not saved
                  </span>
                ) : showEditLinks ? (
                  <Link
                    href={`/admin/collections/pages/${item.id}`}
                    style={{
                      display: "block",
                      padding: compact ? "4px 8px" : "6px 10px",
                      borderRadius: 8,
                      background: "rgba(0, 80, 48, 0.08)",
                      color: "var(--cpp-ink, #0b3d27)",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: compact ? 12 : 13,
                    }}
                  >
                    Edit
                  </Link>
                ) : null}
              </div>
            );
          })
        ) : (
          <div
            style={{
              fontSize: 12,
              color: "var(--cpp-muted, #5b6f66)",
              padding: "4px 8px",
            }}
          >
            No pages yet.
          </div>
        )}
      </div>
    </div>
  );
}
