"use client";

import React, { useState, useCallback } from "react";

const btnStyle = (active: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  fontFamily: "var(--font-sans)",
  fontSize: "0.75rem",
  lineHeight: 1,
  border: active ? "1px solid var(--color-add-fg)" : "1px solid var(--color-border)",
  borderRadius: "4px",
  padding: "0.1rem 0.5rem",
  opacity: 0.85,
  backgroundColor: active ? "var(--color-add-bg)" : "transparent",
  color: active ? "var(--color-add-fg)" : "inherit",
  cursor: "pointer",
  transition: "all 0.15s ease",
  whiteSpace: "nowrap",
});

/** URL共有ボタン — 現在のページURLをクリップボードにコピー */
export function ShareUrlButton() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <button type="button" onClick={copy} style={btnStyle(copied)} title="このページのURLをコピー">
      {copied ? "✓ コピー済み" : "URL"}
    </button>
  );
}

/** コピーボタン — 条文テキスト＋引用情報をクリップボードにコピー */
export function CopyArticleButton({
  articleText,
  citation,
}: {
  articleText: string;
  citation: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    const text = `${articleText}\n${citation}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [articleText, citation]);

  return (
    <button
      type="button"
      onClick={copy}
      style={btnStyle(copied)}
      title="条文テキストを引用形式でコピー"
    >
      {copied ? "✓ コピー済み" : "コピー"}
    </button>
  );
}
