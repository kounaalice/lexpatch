"use client";

import { useState, useEffect } from "react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    const mq = window.matchMedia("(max-width: 767px)");
    const mqHandler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", mqHandler);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      mq.removeEventListener("change", mqHandler);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        // モバイル: ボトムナビの上に配置
        bottom: isMobile ? "calc(60px + env(safe-area-inset-bottom, 0px) + 0.5rem)" : "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#D97706",
        color: "#fff",
        padding: "0.5rem 1.25rem",
        borderRadius: "8px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.82rem",
        fontWeight: 600,
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "1rem" }}>&#x26A0;</span>
      オフラインモード — キャッシュ済みページを表示中
    </div>
  );
}
