"use client";

import { useState, useEffect } from "react";

export function SWUpdateToast() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handler = () => setShowUpdate(true);
    window.addEventListener("lexcard:sw-update", handler);
    return () => window.removeEventListener("lexcard:sw-update", handler);
  }, []);

  if (!showUpdate) return null;

  const handleReload = () => {
    const reg = (window as unknown as { __swReg?: ServiceWorkerRegistration }).__swReg;
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    // controllerchange で自動リロードされるが、フォールバックも用意
    navigator.serviceWorker?.addEventListener("controllerchange", () => {
      window.location.reload();
    });
    // 2秒後にフォールバックリロード
    setTimeout(() => window.location.reload(), 2000);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        backgroundColor: "var(--color-accent)",
        color: "#fff",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.82rem",
        fontWeight: 500,
        zIndex: 10000,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        maxWidth: "320px",
      }}
    >
      <span>新しいバージョンがあります</span>
      <button
        onClick={handleReload}
        style={{
          backgroundColor: "#fff",
          color: "var(--color-accent)",
          border: "none",
          padding: "0.3rem 0.75rem",
          borderRadius: "5px",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        更新
      </button>
      <button
        onClick={() => setShowUpdate(false)}
        aria-label="閉じる"
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
          fontSize: "1rem",
          padding: "0 0.2rem",
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
