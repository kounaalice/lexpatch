"use client";

import { useState, useEffect } from "react";
import { recordLawVisit } from "@/lib/history";

export function LawCopyButton({
  text,
  lawId,
  lawTitle,
  lawNum,
}: {
  text: string;
  lawId?: string;
  lawTitle?: string;
  lawNum?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (lawId && lawTitle) {
      recordLawVisit(lawId, lawTitle, lawNum ?? "");
    }
  }, [lawId, lawTitle, lawNum]);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.75rem",
        color: copied ? "var(--color-add-fg)" : "var(--color-accent)",
        textDecoration: "none",
        border: `1px solid ${copied ? "var(--color-add-fg)" : "var(--color-accent)"}`,
        borderRadius: "4px",
        padding: "0.1rem 0.5rem",
        opacity: 0.85,
        whiteSpace: "nowrap",
        backgroundColor: copied ? "var(--color-add-bg)" : "transparent",
        cursor: "pointer",
        transition: "background-color 0.2s, color 0.2s",
      }}
    >
      {copied ? "✓ コピー済み" : "全文コピー"}
    </button>
  );
}
