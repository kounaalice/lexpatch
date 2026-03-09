"use client";

import { useState, useRef, useEffect } from "react";

interface Chapter {
  title: string;
  firstArticleNum: string;
}

interface Props {
  chapters: Chapter[];
}

export function ChapterDropdown({ chapters }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (chapters.length === 0) return null;

  function scrollToArticle(num: string) {
    const el = document.getElementById(`preview-article-${num}`);
    const container = document.getElementById("law-fulltext-container");
    if (el && container) {
      const scrollTarget = el.offsetTop - container.offsetTop - 12;
      container.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
    }
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "0.35rem 0.6rem",
          border: "1px solid var(--color-border)",
          borderRadius: "6px",
          backgroundColor: open ? "var(--color-accent)" : "var(--color-surface)",
          color: open ? "#fff" : "var(--color-text-secondary)",
          fontFamily: "var(--font-sans)",
          fontSize: "0.8rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "background-color 0.15s, color 0.15s",
        }}
      >
        目次 {open ? "▲" : "▼"}
      </button>

      {open && (
        <div
          style={{
            marginTop: "0.35rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            maxHeight: "40vh",
            overflow: "auto",
            padding: "0.35rem 0",
            width: "100%",
          }}
        >
          {chapters.map((ch, i) => (
            <button
              key={i}
              onClick={() => scrollToArticle(ch.firstArticleNum)}
              style={{
                display: "block",
                width: "100%",
                padding: "0.4rem 0.75rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                color: "var(--color-text-primary)",
                textDecoration: "none",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {ch.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
