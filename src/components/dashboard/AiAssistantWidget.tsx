"use client";

import { useState, useEffect } from "react";
import AiChatPanel from "@/components/ai/AiChatPanel";

export default function AiAssistantWidget() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const userAi = localStorage.getItem("lp_aiMode") === "true";
    if (!userAi) {
      setEnabled(false);
      return;
    }
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEnabled(d?.enabled ?? false))
      .catch(() => setEnabled(false));
  }, []);

  if (enabled === null || !enabled) return null;

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.95rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "3px",
            height: "1rem",
            backgroundColor: "var(--color-accent)",
            borderRadius: "2px",
          }}
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 0 1 7-7z" />
          <line x1="9" y1="21" x2="15" y2="21" />
        </svg>
        AIアシスタント
      </h2>
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <AiChatPanel scope="general" compact />
      </div>
    </section>
  );
}
