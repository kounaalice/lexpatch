"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * navigator.onLine is unreliable on mobile — it can report false even when
 * the device has working connectivity (e.g. 4G). We double-check by sending
 * a HEAD request to the origin before showing the offline banner.
 */
function checkConnectivity(): Promise<boolean> {
  return fetch("/api/ping", { method: "HEAD", cache: "no-store" })
    .then(() => true)
    .catch(() => false);
}

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verify = useCallback(() => {
    if (navigator.onLine) {
      setIsOffline(false);
      return;
    }
    // navigator.onLine says offline — verify with a real request
    checkConnectivity().then((online) => setIsOffline(!online));
  }, []);

  useEffect(() => {
    // Initial check
    verify();

    const onOnline = () => {
      setIsOffline(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    const onOffline = () => {
      // Don't trust the event blindly — verify after a short delay
      // (transient disconnections during network handover are common on mobile)
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(verify, 3000);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const mq = window.matchMedia("(max-width: 767px)");
    const mqHandler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", mqHandler);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      mq.removeEventListener("change", mqHandler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [verify]);

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
