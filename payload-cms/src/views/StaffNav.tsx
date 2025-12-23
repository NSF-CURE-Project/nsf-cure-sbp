"use client";

import React from "react";
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

const linkStyle: React.CSSProperties = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(0, 80, 48, 0.08)",
  color: "var(--cpp-ink, #0b3d27)",
  textDecoration: "none",
  fontWeight: 600,
};

export default function StaffNav() {
  const { user } = useAuth();
  const role = (user as { role?: string } | null)?.role;

  if (role !== "staff") {
    return null;
  }

  return (
    <nav style={navStyle} aria-label="Staff navigation">
      <div style={sectionTitleStyle}>Main Pages</div>
      <Link href="/admin/globals/home-page" style={linkStyle}>
        Edit Home Page
      </Link>
      <Link href="/admin/globals/resources-page" style={linkStyle}>
        Edit Resources Page
      </Link>
      <Link href="/admin/globals/contact-page" style={linkStyle}>
        Edit Contact Page
      </Link>
      <Link href="/admin/globals/getting-started" style={linkStyle}>
        Edit Getting Started
      </Link>

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
