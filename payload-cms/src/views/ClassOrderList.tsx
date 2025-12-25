"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@payloadcms/ui";

type ClassLink = {
  id: string;
  title: string;
  slug?: string | null;
  order?: number | null;
};

type ClassOrderListProps = {
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

export default function ClassOrderList({
  title = "Reorder Classes",
  showEditLinks = false,
  compact = false,
  showHint = true,
  pendingTitle,
  pendingOrder,
  onPendingOrderChange,
}: ClassOrderListProps) {
  const [classes, setClasses] = useState<ClassLink[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadClasses = async () => {
      try {
        const res = await fetch("/api/classes?limit=200&sort=order&sort=title", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setClasses([]);
          return;
        }
        const data = (await res.json()) as {
          docs?: ClassLink[];
        };
        setClasses(data.docs ?? []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setClasses([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setClassesLoading(false);
        }
      }
    };

    loadClasses();
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
      if (!classes.length) return 0;
      if (pendingOrder && pendingOrder > 0 && pendingOrder <= classes.length + 1) {
        return pendingOrder - 1;
      }
      return classes.length;
    })();

    if (pendingIndex !== nextIndex) {
      setPendingIndex(nextIndex);
    }

    const nextOrder = nextIndex + 1;
    if (pendingOrder !== nextOrder) {
      onPendingOrderChange?.(nextOrder);
    }
  }, [
    classes.length,
    pendingOrder,
    pendingTitle,
    onPendingOrderChange,
    pendingIndex,
  ]);

  const persistClassOrder = async (nextClasses: ClassLink[]) => {
    if (!nextClasses.length) return;
    setIsSavingOrder(true);
    try {
      const updates = nextClasses.map((item, index) => {
        const nextOrder = index + 1;
        if (item.order === nextOrder) return null;
        return fetch(`/api/classes/${item.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order: nextOrder }),
        });
      });
      await Promise.all(updates.filter(Boolean) as Promise<Response>[]);
      setClasses((prev) =>
        prev.map((item, index) => ({ ...item, order: index + 1 }))
      );
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    if (pendingTitle && draggingId === "__pending__") {
      const items = [...classes];
      const targetIndex = items.findIndex((item) => item.id === targetId);
      if (targetIndex < 0) return;
      setPendingIndex(targetIndex);
      onPendingOrderChange?.(targetIndex + 1);
      return;
    }
    const current = [...classes];
    const fromIndex = current.findIndex((item) => item.id === draggingId);
    const toIndex = current.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setClasses(current);
    await persistClassOrder(current);
  };

  const listItems = (() => {
    if (!pendingTitle) return classes;
    const index =
      pendingIndex == null ? classes.length : Math.min(pendingIndex, classes.length);
    const withPending = [...classes];
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
          Drag classes to reorder.
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
        {classesLoading ? (
          <div
            style={{
              fontSize: 12,
              color: "var(--cpp-muted, #5b6f66)",
              padding: "4px 8px",
            }}
          >
            Loading classes…
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
              draggable={!pendingTitle || isPending}
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
                  cursor: !pendingTitle || isPending ? baseHandleStyle.cursor : "not-allowed",
                }}
                aria-hidden="true"
              >
                ⋮⋮
              </span>
              <span style={{ flex: 1, fontWeight: 600 }}>
                {item.title || item.slug || "Untitled Class"}
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
                  href={`/admin/collections/classes/${item.id}`}
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
            No classes yet.
          </div>
        )}
      </div>
    </div>
  );
}
