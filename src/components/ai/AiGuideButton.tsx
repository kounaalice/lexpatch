"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getSession } from "@/lib/session";
import AiGuideConsent from "./AiGuideConsent";
import AiGuidePanel from "./AiGuidePanel";

const CONSENT_KEY = "lp_ai_guide_consent";

function hasConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.agreed === true;
  } catch {
    return false;
  }
}

function saveConsent() {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ agreed: true, at: new Date().toISOString() }),
    );
  } catch {
    /* ignore */
  }
}

export function AiGuideButton() {
  const pathname = usePathname();
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [consented, setConsented] = useState(false);

  // AI有効チェック + ログインチェック + ユーザー設定 aiMode
  useEffect(() => {
    const session = getSession();
    setLoggedIn(!!session);
    setConsented(hasConsent());

    const userAi = localStorage.getItem("lp_aiMode") === "true";
    if (!userAi) {
      setAiEnabled(false);
      return;
    }
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAiEnabled(d?.enabled ?? false))
      .catch(() => setAiEnabled(false));
  }, []);

  const handleClick = useCallback(() => {
    if (open) {
      setOpen(false);
      setShowConsent(false);
      return;
    }
    if (consented) {
      setOpen(true);
      setShowConsent(false);
    } else {
      setOpen(true);
      setShowConsent(true);
    }
  }, [open, consented]);

  const handleAgree = useCallback(() => {
    saveConsent();
    setConsented(true);
    setShowConsent(false);
  }, []);

  const handleDecline = useCallback(() => {
    setOpen(false);
    setShowConsent(false);
  }, []);

  const handleShowPolicy = useCallback(() => {
    setShowConsent(true);
  }, []);

  // 非表示条件: AI無効、未ログイン、判定中
  if (aiEnabled === null || !aiEnabled || !loggedIn) return null;

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={handleClick}
        aria-label={open ? "AIガイドを閉じる" : "AIガイドを開く"}
        aria-expanded={open}
        style={{
          position: "fixed",
          bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
          right: "1rem",
          zIndex: 9990,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: open ? "var(--color-text-secondary)" : "var(--color-accent)",
          color: "#fff",
          fontSize: "1.3rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          transition: "background-color 0.2s, transform 0.2s",
          transform: open ? "rotate(45deg)" : "none",
        }}
      >
        {open ? (
          "+"
        ) : (
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="10" r="0.5" fill="currentColor" />
            <circle cx="8" cy="10" r="0.5" fill="currentColor" />
            <circle cx="16" cy="10" r="0.5" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* パネル */}
      {open && (
        <div
          role="dialog"
          aria-label="AIガイド"
          style={{
            position: "fixed",
            bottom: "calc(140px + env(safe-area-inset-bottom, 0px))",
            right: "1rem",
            zIndex: 9991,
            width: "min(350px, calc(100vw - 2rem))",
            maxHeight: "min(450px, calc(100vh - 200px))",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              padding: "0.6rem 0.85rem",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              backgroundColor: "var(--color-surface)",
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                flex: 1,
              }}
            >
              AIガイド
            </span>
            <button
              onClick={() => {
                setOpen(false);
                setShowConsent(false);
              }}
              aria-label="閉じる"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                fontSize: "1.1rem",
                padding: "0 0.2rem",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* コンテンツ */}
          <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            {showConsent ? (
              <AiGuideConsent onAgree={handleAgree} onDecline={handleDecline} />
            ) : (
              <AiGuidePanel currentPath={pathname} onShowPolicy={handleShowPolicy} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
