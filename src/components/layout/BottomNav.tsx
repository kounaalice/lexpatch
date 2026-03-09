"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getSession } from "@/lib/session";

// SVG アイコン（24x24 viewBox）
const icons = {
  home: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  search: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  projects: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  dashboard: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  notifications: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

interface NavTab {
  href: string;
  label: string;
  icon: keyof typeof icons;
  matchPrefixes?: string[];
}

const TABS: NavTab[] = [
  { href: "/", label: "ホーム", icon: "home" },
  { href: "/search", label: "検索", icon: "search" },
  { href: "/ws", label: "WS", icon: "projects", matchPrefixes: ["/ws"] },
  { href: "/dashboard", label: "マイ", icon: "dashboard", matchPrefixes: ["/dashboard"] },
  {
    href: "/notifications",
    label: "通知",
    icon: "notifications",
    matchPrefixes: ["/notifications"],
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (s?.memberId) setMemberId(s.memberId);
  }, []);

  // 未読通知ポーリング
  useEffect(() => {
    if (!memberId) return;
    const fetchCount = () => {
      fetch(`/api/notifications/count?member_id=${memberId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.count !== undefined) setUnreadCount(d.count);
        })
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [memberId]);

  // 既読イベント
  useEffect(() => {
    if (!memberId) return;
    const handler = () => {
      fetch(`/api/notifications/count?member_id=${memberId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.count !== undefined) setUnreadCount(d.count);
        })
        .catch(() => {});
    };
    window.addEventListener("lexcard:notification-read", handler);
    return () => window.removeEventListener("lexcard:notification-read", handler);
  }, [memberId]);

  function isActive(tab: NavTab) {
    if (tab.href === "/" && pathname === "/") return true;
    if (tab.href === "/") return false;
    if (tab.matchPrefixes) return tab.matchPrefixes.some((p) => pathname?.startsWith(p));
    return pathname === tab.href;
  }

  return (
    <nav
      className="md:hidden"
      aria-label="モバイルナビゲーション"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        paddingTop: "0.4rem",
        paddingBottom: "calc(0.4rem + env(safe-area-inset-bottom, 0px))",
        zIndex: 1000,
        fontFamily: "var(--font-sans)",
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            aria-label={
              tab.icon === "notifications" && unreadCount > 0
                ? `${tab.label} (${unreadCount}件未読)`
                : tab.label
            }
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.15rem",
              textDecoration: "none",
              color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
              fontSize: "0.6rem",
              fontWeight: active ? 700 : 400,
              position: "relative",
              padding: "0.1rem 0.5rem",
              transition: "color 0.15s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ position: "relative", lineHeight: 1 }}>
              {icons[tab.icon]}
              {/* 通知バッジ */}
              {tab.icon === "notifications" && unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-8px",
                    backgroundColor: "#DC2626",
                    color: "#fff",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    padding: "0.05rem 0.25rem",
                    borderRadius: "8px",
                    minWidth: "14px",
                    textAlign: "center",
                    lineHeight: "1.3",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
