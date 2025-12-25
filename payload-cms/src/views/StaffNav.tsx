"use client";

import React, { useEffect, useState } from "react";
import { Link, useAuth } from "@payloadcms/ui";

const navStyle: React.CSSProperties = {
  padding: "18px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--cpp-muted, #5b6f66)",
  fontWeight: 700,
  marginTop: 28,
  paddingTop: 12,
};

const sectionDetailsStyle: React.CSSProperties = {
  marginTop: 22,
};

const sectionSummaryStyle: React.CSSProperties = {
  listStyle: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--cpp-muted, #5b6f66)",
  fontWeight: 700,
  cursor: "pointer",
  padding: "6px 4px",
};

const sectionSummaryIconStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--cpp-muted, #5b6f66)",
};

const sectionLinksStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  paddingTop: 8,
};

const inlineNoteStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--cpp-muted, #5b6f66)",
  padding: "4px 8px",
};

const linkStyle: React.CSSProperties = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(0, 80, 48, 0.08)",
  color: "var(--cpp-ink, #0b3d27)",
  textDecoration: "none",
  fontWeight: 600,
};

type PageLink = {
  id: string;
  title: string;
  slug?: string | null;
};

export default function StaffNav() {
  const { user } = useAuth();
  const role = (user as { role?: string } | null)?.role;
  const [pages, setPages] = useState<PageLink[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);

  if (role !== "staff" && role !== "admin") {
    return null;
  }

  useEffect(() => {
    const controller = new AbortController();
    const loadPages = async () => {
      try {
        const res = await fetch("/api/pages?limit=100&sort=title", {
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
        setPages(data.docs ?? []);
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

  return (
    <nav style={navStyle} aria-label="Staff navigation">
      <details style={sectionDetailsStyle}>
        <summary style={sectionSummaryStyle}>
          <span>Main Pages</span>
          <span style={sectionSummaryIconStyle}>▾</span>
        </summary>
        <div style={sectionLinksStyle}>
          {pagesLoading ? (
            <div style={inlineNoteStyle}>Loading pages…</div>
          ) : pages.length ? (
            pages.map((page) => (
              <Link
                key={page.id}
                href={`/admin/collections/pages/${page.id}`}
                style={linkStyle}
              >
                {page.title || page.slug || "Untitled Page"}
              </Link>
            ))
          ) : (
            <div style={inlineNoteStyle}>No pages yet.</div>
          )}
        </div>
      </details>

      <div style={sectionTitleStyle}>Lessons</div>
      <Link href="/admin/collections/lessons" style={linkStyle}>
        View / Edit Lessons
      </Link>
      <Link href="/admin/collections/lessons/create" style={linkStyle}>
        Add New Lesson
      </Link>

      <div style={sectionTitleStyle}>Course Content</div>
      <Link href="/admin/collections/classes" style={linkStyle}>
        View / Edit Classes
      </Link>
      <Link href="/admin/collections/classes/create" style={linkStyle}>
        Add New Class
      </Link>
      <Link href="/admin/collections/chapters" style={linkStyle}>
        View / Edit Chapters
      </Link>
      <Link href="/admin/collections/chapters/create" style={linkStyle}>
        Add New Chapter
      </Link>
    </nav>
  );
}
