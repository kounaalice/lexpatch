"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーレポート送信
    fetch("/api/error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        stack: error.stack?.slice(0, 2048),
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // レポート失敗は無視
    });
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "0.75rem",
            color: "var(--text-primary, #1E3A5F)",
          }}
        >
          エラーが発生しました
        </h2>
        <p
          style={{
            color: "var(--text-secondary, #4B6A8A)",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {error.message || "予期しないエラーが発生しました。"}
        </p>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: "var(--accent, #0369A1)",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1.25rem",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          再試行
        </button>
      </div>
    </div>
  );
}
