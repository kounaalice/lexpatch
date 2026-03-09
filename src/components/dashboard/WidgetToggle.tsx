"use client";

import { useState, useRef, useEffect } from "react";
import { type WidgetId, WIDGET_LABELS, saveWidgetVisibility } from "./types";

interface Props {
  visibility: Record<WidgetId, boolean>;
  onChange: (v: Record<WidgetId, boolean>) => void;
  gamingEnabled: boolean;
  hasAgencies: boolean;
}

const WIDGET_ORDER: WidgetId[] = [
  "stats",
  "ai",
  "tasks",
  "upcoming",
  "gaming",
  "agencies",
  "bookmarks",
  "follows",
  "history",
  "notes",
];

export default function WidgetToggle({ visibility, onChange, gamingEnabled, hasAgencies }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function toggle(id: WidgetId) {
    const next = { ...visibility, [id]: !visibility[id] };
    onChange(next);
    saveWidgetVisibility(next);
  }

  // ゲーミング無効なら非表示、行政機関なしなら非表示
  const visibleWidgets = WIDGET_ORDER.filter((id) => {
    if (id === "gaming" && !gamingEnabled) return false;
    if (id === "agencies" && !hasAgencies) return false;
    return true;
  });

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="ウィジェット表示設定"
        aria-expanded={open}
        style={{
          background: "none",
          border: "1px solid var(--color-border)",
          borderRadius: "6px",
          padding: "0.3rem 0.5rem",
          cursor: "pointer",
          color: "var(--color-text-secondary)",
          fontSize: "0.9rem",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-sans)" }}>表示設定</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "0.6rem 0",
            zIndex: 200,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            minWidth: "180px",
          }}
        >
          {visibleWidgets.map((id) => (
            <label
              key={id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-primary)",
                transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <input
                type="checkbox"
                checked={visibility[id]}
                onChange={() => toggle(id)}
                style={{ accentColor: "var(--color-accent)", width: "14px", height: "14px" }}
              />
              {WIDGET_LABELS[id]}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
