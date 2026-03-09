"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { CATEGORY_GROUPS, LAW_CATEGORIES } from "@/lib/categories";
import { getSession, logout as doLogout, type Session } from "@/lib/session";
import {
  loadSettings,
  applyTheme,
  applyGamingMode,
  saveSetting,
  resolveTheme,
  THEME_META,
  THEME_CYCLE,
  type ThemeMode,
} from "@/lib/settings";

/** AI モード読み取り用ヘルパー（他コンポーネントでも使える） */
export function isAiModeOn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("lp_aiMode") === "true";
}

export function Header() {
  const pathname = usePathname();
  const [catOpen, setCatOpen] = useState(false);
  const catTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catTriggerRef = useRef<HTMLButtonElement>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("system");
  const [session, setSession] = useState<Session | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [_gamingMode, setGamingMode] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setCurrentTheme(s.theme); // eslint-disable-line react-hooks/set-state-in-effect
    applyTheme(s.theme);
    applyGamingMode(s.gamingMode);
    setGamingMode(s.gamingMode);
    setAiMode(s.aiMode);
    setSession(getSession());
  }, []);

  // 未読通知ポーリング（60秒間隔）
  useEffect(() => {
    if (!session?.memberId) return;
    const fetchCount = () => {
      fetch(`/api/notifications/count?member_id=${session.memberId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.count !== undefined) setUnreadCount(d.count);
        })
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [session?.memberId]);

  // 既読イベントで即時更新
  useEffect(() => {
    if (!session?.memberId) return;
    const handler = () => {
      fetch(`/api/notifications/count?member_id=${session.memberId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.count !== undefined) setUnreadCount(d.count);
        })
        .catch(() => {});
    };
    window.addEventListener("lexcard:notification-read", handler);
    return () => window.removeEventListener("lexcard:notification-read", handler);
  }, [session?.memberId]);

  function handleLogout() {
    doLogout();
    setSession(null);
    setUnreadCount(0);
  }

  function toggleAiMode() {
    const next = !aiMode;
    setAiMode(next);
    saveSetting("aiMode", next);
    // 他コンポーネントに通知（検索ページ等）
    window.dispatchEvent(new CustomEvent("lexcard:ai-mode-change", { detail: { aiMode: next } }));
  }

  function cycleTheme() {
    const effective = resolveTheme(currentTheme);
    const idx = THEME_CYCLE.indexOf(effective);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    setCurrentTheme(next);
    applyTheme(next);
    saveSetting("theme", next);
  }

  const themeLabel = (() => {
    const eff = resolveTheme(currentTheme);
    const meta = THEME_META[eff];
    return meta ? `${meta.emoji} ${meta.label}` : "テーマ";
  })();

  const openCat = useCallback(() => {
    if (catTimer.current) clearTimeout(catTimer.current);
    setCatOpen(true);
  }, []);

  const closeCat = useCallback(() => {
    catTimer.current = setTimeout(() => setCatOpen(false), 200);
  }, []);

  const closeCatImmediate = useCallback(() => {
    setCatOpen(false);
    catTriggerRef.current?.focus();
  }, []);

  function handleCatKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeCatImmediate();
    } else if (e.key === "ArrowDown" && !catOpen) {
      e.preventDefault();
      setCatOpen(true);
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('#category-dropdown [role="menuitem"]')?.focus();
      });
    }
  }

  function navLinkCurrent(href: string) {
    return pathname === href ? ("page" as const) : undefined;
  }

  const linkStyle = {
    color: "var(--color-header-link)",
    textDecoration: "none" as const,
  };

  return (
    <header
      style={{
        backgroundColor: "var(--color-header-bg)",
        fontFamily: "var(--font-sans)",
        borderBottom: "1px solid var(--color-header-border)",
        position: "relative",
        zIndex: 100,
      }}
      className="w-full px-6 py-3 flex items-center justify-between gap-3"
    >
      {/* ロゴ */}
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--color-header-accent)" }}
        >
          LexCard
        </span>
        <span
          className="text-sm hidden sm:inline"
          style={{ color: "var(--color-header-link)", opacity: 0.5 }}
        >
          /
        </span>
        <span
          className="text-sm hidden sm:inline"
          style={{
            color: "var(--color-header-link)",
            opacity: 0.7,
            fontFamily: "var(--font-sans)",
          }}
        >
          法令アクセス支援システム
        </span>
      </Link>

      {/* ナビゲーション（デスクトップ） */}
      <nav
        className="hidden md:flex items-center gap-5"
        style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}
        aria-label="メインナビゲーション"
      >
        <Link
          href="/"
          style={linkStyle}
          aria-current={navLinkCurrent("/")}
          className="hover:opacity-70 transition-opacity"
        >
          法令検索
        </Link>
        {/* 分野プルダウン（条例含む） */}
        <div style={{ position: "relative" }}>
          <button
            ref={catTriggerRef}
            onMouseEnter={openCat}
            onMouseLeave={closeCat}
            onClick={() => setCatOpen((v) => !v)}
            onKeyDown={handleCatKeyDown}
            aria-haspopup="true"
            aria-expanded={catOpen}
            aria-controls="category-dropdown"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-header-link)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
            className="hover:opacity-70 transition-opacity"
          >
            分野・条例 <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>▼</span>
          </button>
          {catOpen && (
            <div
              id="category-dropdown"
              role="menu"
              onMouseEnter={openCat}
              onMouseLeave={closeCat}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  closeCatImmediate();
                  return;
                }
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const items = e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]');
                  if (!items.length) return;
                  const cur = Array.from(items).indexOf(document.activeElement as HTMLElement);
                  const next =
                    e.key === "ArrowDown"
                      ? (cur + 1) % items.length
                      : cur <= 0
                        ? items.length - 1
                        : cur - 1;
                  items[next]?.focus();
                }
                if (e.key === "Home") {
                  e.preventDefault();
                  e.currentTarget.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
                }
                if (e.key === "End") {
                  e.preventDefault();
                  const items = e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]');
                  items[items.length - 1]?.focus();
                }
              }}
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                width: "580px",
                backgroundColor: "var(--color-header-bg)",
                border: "1px solid var(--color-header-border)",
                borderRadius: "8px",
                padding: "1rem",
                zIndex: 200,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                marginTop: "0.5rem",
                maxHeight: "75vh",
                overflowY: "auto",
              }}
            >
              <CategoryDropdown onClose={() => setCatOpen(false)} />
            </div>
          )}
        </div>
        <Link
          href="/search"
          style={linkStyle}
          aria-current={navLinkCurrent("/search")}
          className="hover:opacity-70 transition-opacity"
        >
          横断検索
        </Link>
        <Link
          href="/patches"
          style={linkStyle}
          aria-current={navLinkCurrent("/patches")}
          className="hover:opacity-70 transition-opacity"
        >
          改正提案
        </Link>
        <Link
          href="/projects"
          style={linkStyle}
          aria-current={navLinkCurrent("/projects")}
          className="hover:opacity-70 transition-opacity"
        >
          プロジェクト
        </Link>
        <Link
          href="/commentaries"
          style={linkStyle}
          aria-current={navLinkCurrent("/commentaries")}
          className="hover:opacity-70 transition-opacity"
        >
          逐条解説
        </Link>
        <Link
          href="/communities"
          style={linkStyle}
          aria-current={navLinkCurrent("/communities")}
          className="hover:opacity-70 transition-opacity"
        >
          コミュニティ
        </Link>
        <Link
          href="/calendar"
          style={linkStyle}
          aria-current={navLinkCurrent("/calendar")}
          className="hover:opacity-70 transition-opacity"
        >
          カレンダー
        </Link>
        <Link
          href="/cards"
          style={linkStyle}
          aria-current={navLinkCurrent("/cards")}
          className="hover:opacity-70 transition-opacity"
        >
          法令カード
        </Link>
        <Link
          href="/ws"
          style={linkStyle}
          aria-current={navLinkCurrent("/ws")}
          className="hover:opacity-70 transition-opacity"
        >
          ワークスペース
        </Link>
        <Link
          href="/w100"
          style={linkStyle}
          aria-current={navLinkCurrent("/w100")}
          className="hover:opacity-70 transition-opacity"
        >
          W100
        </Link>
        <Link
          href="/guide"
          style={linkStyle}
          aria-current={navLinkCurrent("/guide")}
          className="hover:opacity-70 transition-opacity"
        >
          使い方
        </Link>
        <Link
          href="/about"
          style={linkStyle}
          aria-current={navLinkCurrent("/about")}
          className="hover:opacity-70 transition-opacity"
        >
          LexCardとは
        </Link>
        {/* ログイン状態 */}
        {session ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link
              href="/dashboard"
              style={{
                color: "var(--color-header-accent)",
                fontWeight: 600,
                fontSize: "0.82rem",
                textDecoration: "none",
              }}
            >
              {session.name}
              {session.org ? `（${session.org}）` : ""}
            </Link>
            <Link
              href="/notifications"
              aria-label={unreadCount > 0 ? `未読通知 ${unreadCount}件` : "通知"}
              style={{
                position: "relative",
                color: "var(--color-header-link)",
                textDecoration: "none",
                fontSize: "1rem",
                lineHeight: 1,
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-8px",
                    backgroundColor: "#DC2626",
                    color: "#fff",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    padding: "0.05rem 0.3rem",
                    borderRadius: "10px",
                    minWidth: "16px",
                    textAlign: "center",
                    lineHeight: "1.3",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
            {(session.role === "admin" || session.role === "moderator") && (
              <Link
                href="/admin"
                style={{
                  color: "var(--color-header-accent)",
                  fontSize: "0.72rem",
                  textDecoration: "none",
                  opacity: 0.8,
                }}
              >
                管理
              </Link>
            )}
            <button
              onClick={handleLogout}
              style={{
                color: "var(--color-header-link)",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                opacity: 0.7,
              }}
            >
              ログアウト
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              color: "var(--color-header-accent)",
              fontSize: "0.82rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ログイン
          </Link>
        )}
        <Link
          href="/en"
          style={{
            color: "var(--color-header-accent)",
            border: "1px solid var(--color-header-border)",
            padding: "0.15rem 0.5rem",
            borderRadius: "4px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}
          className="hover:opacity-70 transition-opacity"
        >
          EN
        </Link>
        <button
          onClick={toggleAiMode}
          aria-label={aiMode ? "AI機能をOFF" : "AI機能をON"}
          title={aiMode ? "AI機能: ON — クリックでOFF" : "AI機能: OFF — クリックでON"}
          style={{
            color: aiMode ? "#fff" : "var(--color-header-link)",
            border: aiMode ? "1px solid #0ea5e9" : "1px solid var(--color-header-border)",
            padding: "0.2rem 0.55rem",
            borderRadius: "4px",
            background: aiMode ? "linear-gradient(135deg, #0369a1, #0ea5e9)" : "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            fontWeight: aiMode ? 700 : 400,
            transition: "all 0.2s",
            opacity: aiMode ? 1 : 0.7,
          }}
        >
          {aiMode ? "AI ON" : "AI"}
        </button>
        <button
          onClick={cycleTheme}
          aria-label={`テーマ切替: ${themeLabel}`}
          style={{
            color: "var(--color-header-accent)",
            border: "1px solid var(--color-header-border)",
            padding: "0.2rem 0.6rem",
            borderRadius: "4px",
            background: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
          }}
        >
          {themeLabel}
        </button>
      </nav>

      {/* モバイル: ハンバーガーメニュー */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={mobileMenuOpen}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-header-link)",
            fontSize: "1.4rem",
            lineHeight: 1,
            padding: "0.2rem",
            position: "relative",
          }}
        >
          {mobileMenuOpen ? "✕" : "☰"}
          {/* 未読バッジをハンバーガーに表示 */}
          {!mobileMenuOpen && unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-6px",
                backgroundColor: "#DC2626",
                color: "#fff",
                fontSize: "0.5rem",
                fontWeight: 700,
                padding: "0.05rem 0.2rem",
                borderRadius: "8px",
                minWidth: "12px",
                textAlign: "center",
                lineHeight: "1.3",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* モバイルメニューパネル */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "var(--color-header-bg)",
            borderBottom: "1px solid var(--color-header-border)",
            padding: "0.75rem 1.25rem 1rem",
            zIndex: 200,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <nav
            aria-label="モバイルメニュー"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.15rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.88rem",
            }}
          >
            {[
              { href: "/", label: "法令検索" },
              { href: "/search", label: "横断検索" },
              { href: "/patches", label: "改正提案" },
              { href: "/projects", label: "プロジェクト" },
              { href: "/commentaries", label: "逐条解説" },
              { href: "/communities", label: "コミュニティ" },
              { href: "/calendar", label: "カレンダー" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color:
                    pathname === item.href
                      ? "var(--color-header-accent)"
                      : "var(--color-header-link)",
                  textDecoration: "none",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--color-header-border)",
                  fontWeight: pathname === item.href ? 700 : 400,
                }}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/cards"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color:
                  pathname === "/cards" ? "var(--color-header-accent)" : "var(--color-header-link)",
                textDecoration: "none",
                padding: "0.5rem 0",
                borderBottom: "1px solid var(--color-header-border)",
                fontWeight: pathname === "/cards" ? 700 : 400,
              }}
            >
              法令カード
            </Link>
            <Link
              href="/ws"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: pathname?.startsWith("/ws")
                  ? "var(--color-header-accent)"
                  : "var(--color-header-link)",
                textDecoration: "none",
                padding: "0.5rem 0",
                borderBottom: "1px solid var(--color-header-border)",
                fontWeight: pathname?.startsWith("/ws") ? 700 : 400,
              }}
            >
              ワークスペース
            </Link>

            <Link
              href="/guide"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color:
                  pathname === "/guide" ? "var(--color-header-accent)" : "var(--color-header-link)",
                textDecoration: "none",
                padding: "0.5rem 0",
                borderBottom: "1px solid var(--color-header-border)",
                fontWeight: pathname === "/guide" ? 700 : 400,
              }}
            >
              使い方ガイド
            </Link>

            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color:
                  pathname === "/settings"
                    ? "var(--color-header-accent)"
                    : "var(--color-header-link)",
                textDecoration: "none",
                padding: "0.5rem 0",
                borderBottom: "1px solid var(--color-header-border)",
                fontWeight: pathname === "/settings" ? 700 : 400,
              }}
            >
              サイト設定
            </Link>

            {session && (
              <Link
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: "var(--color-header-link)",
                  textDecoration: "none",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--color-header-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                🔔 通知
                {unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: "#DC2626",
                      color: "#fff",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "0.1rem 0.35rem",
                      borderRadius: "8px",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* AI・テーマ・ログイン */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.6rem 0",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  onClick={toggleAiMode}
                  style={{
                    color: aiMode ? "#fff" : "var(--color-header-link)",
                    border: aiMode ? "1px solid #0ea5e9" : "1px solid var(--color-header-border)",
                    padding: "0.25rem 0.55rem",
                    borderRadius: "4px",
                    background: aiMode ? "linear-gradient(135deg, #0369a1, #0ea5e9)" : "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: aiMode ? 700 : 400,
                  }}
                >
                  {aiMode ? "AI ON" : "AI"}
                </button>
                <button
                  onClick={cycleTheme}
                  style={{
                    color: "var(--color-header-accent)",
                    border: "1px solid var(--color-header-border)",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "4px",
                    background: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                  }}
                >
                  {themeLabel}
                </button>
              </div>

              {session ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: "var(--color-header-accent)",
                      fontSize: "0.78rem",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {session.name}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      color: "var(--color-header-link)",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      opacity: 0.7,
                    }}
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: "var(--color-header-accent)",
                    fontSize: "0.82rem",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  ログイン
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── カテゴリドロップダウン ──────────────────────────────
function CategoryDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {CATEGORY_GROUPS.map((group) => {
        const cats = LAW_CATEGORIES.filter((c) => c.group.id === group.id);
        return (
          <div key={group.id}>
            <div
              style={{
                display: "inline-block",
                padding: "0.1rem 0.55rem",
                backgroundColor: group.bg,
                color: group.color,
                borderRadius: "3px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                fontWeight: 700,
                marginBottom: "0.4rem",
                border: `1px solid ${group.color}33`,
              }}
            >
              {group.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {cats.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="category-chip"
                  role="menuitem"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
