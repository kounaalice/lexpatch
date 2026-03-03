"use client";

import Link from "next/link";

export default function ArticleError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "var(--font-sans)" }}>
      <h2 style={{ color: "var(--color-text-primary)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
        条文データの読み込みに失敗しました
      </h2>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>
        {error.message || "一時的なエラーが発生しました。時間をおいて再度お試しください。"}
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1.25rem",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          再読み込み
        </button>
        <Link
          href="/"
          style={{
            padding: "0.5rem 1.25rem",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
