"use client";

import { useState, useEffect, useRef } from "react";

async function checkConnectivity(): Promise<boolean> {
  try {
    const res = await fetch("/api/ping", { method: "HEAD", cache: "no-store" });
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const clearPending = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };

    const handleOnline = () => {
      clearPending();
      setIsOffline(false);
    };

    const handleOffline = () => {
      clearPending();
      timerRef.current = setTimeout(async () => {
        const online = await checkConnectivity();
        if (!online) setIsOffline(true);
      }, 3000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const mq = window.matchMedia("(max-width: 767px)");
    const mqHandler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", mqHandler);

    return () => {
      clearPending();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
