"use client";
import { useState, useEffect, useCallback } from "react";
import { trackDailyReadingXp, syncGamingProfile } from "@/lib/gaming";
import { getSession } from "@/lib/session";
import { loadSettings } from "@/lib/settings";

const PARTICLES = ["\u2696\uFE0F", "\uD83D\uDCDC", "\uD83C\uDFDB\uFE0F", "\u2728", "\uD83D\uDCAB"];

export function GamingOverlay() {
  const [active, setActive] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-gaming") === "true",
  );
  const [tracking] = useState(() => !loadSettings().disableGamingData);
  const [xp, setXp] = useState(0);
  const [activityPt, setActivityPt] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setActive(document.documentElement.getAttribute("data-gaming") === "true");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-gaming"],
    });
    return () => observer.disconnect();
  }, []);

  // XP tracking (scroll) — ゲーミング表示OFF時もバックグラウンドで蓄積
  useEffect(() => {
    if (!tracking) return;
    setXp(parseInt(localStorage.getItem("lp_xp") || "0", 10)); // eslint-disable-line react-hooks/set-state-in-effect

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setXp((prev) => {
          const next = prev + 1;
          localStorage.setItem("lp_xp", String(next));
          trackDailyReadingXp(1);
          return next;
        });
        ticking = false;
      });
    };
    // capture: true で内部コンテナ（overflow:auto）のスクロールも検知
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, [tracking]);

  // Activity points tracking (listen for custom event)
  useEffect(() => {
    if (!tracking) return;
    setActivityPt(parseInt(localStorage.getItem("lp_activity_points") || "0", 10)); // eslint-disable-line react-hooks/set-state-in-effect

    const onActivity = () => {
      setActivityPt(parseInt(localStorage.getItem("lp_activity_points") || "0", 10));
    };
    window.addEventListener("lexcard:activity-point", onActivity);
    return () => window.removeEventListener("lexcard:activity-point", onActivity);
  }, [tracking]);

  // DB sync on page leave (logged-in users only)
  const doSync = useCallback(() => {
    if (!tracking) return;
    if (!getSession()) return;
    syncGamingProfile();
  }, [tracking]);

  useEffect(() => {
    if (!tracking) return;
    window.addEventListener("beforeunload", doSync);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") doSync();
    });
    return () => {
      window.removeEventListener("beforeunload", doSync);
    };
  }, [tracking, doSync]);

  // 表示はゲーミングモードON時のみ
  if (!active) return null;

  const level = Math.floor(xp / 200) + 1;
  const progress = ((xp % 200) / 200) * 100;
  const titles = [
    "見習い",
    "法令探究者",
    "条文読み",
    "法令通",
    "法令マスター",
    "法令賢者",
    "法令王",
  ];
  const title = titles[Math.min(level - 1, titles.length - 1)] || titles[titles.length - 1];

  return (
    <>
      {/* XP Bar */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          backgroundColor: "rgba(0,0,0,0.15)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--color-accent), #A78BFA, #F472B6)",
            transition: "width 0.3s",
          }}
        />
      </div>

      {/* Level badge + Activity points */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "5px",
          right: "8px",
          fontSize: "0.6rem",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-mono)",
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0.6,
          textAlign: "right",
          lineHeight: 1.4,
        }}
      >
        <div>
          Lv.{level} {title}
        </div>
        {activityPt > 0 && (
          <div>
            {"\u26A1"}
            {activityPt}pt
          </div>
        )}
      </div>

      {/* Floating particles (pure CSS animation) */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {PARTICLES.map((emoji, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${10 + i * 18}%`,
              fontSize: "1.1rem",
              opacity: 0,
              animation: `gaming-float ${7 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.8}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </>
  );
}
