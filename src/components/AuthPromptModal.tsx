"use client";

import { useState, useCallback } from "react";
import { isLoggedIn } from "@/lib/session";

/**
 * AuthPromptModal — progressive registration prompt.
 * Shows a modal when non-logged-in users try to use gated features.
 * Usage:
 *   const { requireAuth, modal } = useAuthPrompt();
 *   function handleBookmark() {
 *     if (!requireAuth("ブックマーク")) return;
 *     // proceed with action
 *   }
 *   return <>{modal}<button onClick={handleBookmark}>...</button></>;
 */

interface AuthPromptState {
  visible: boolean;
  feature: string;
}

export function useAuthPrompt() {
  const [state, setState] = useState<AuthPromptState>({ visible: false, feature: "" });

  const requireAuth = useCallback((featureName: string): boolean => {
    if (isLoggedIn()) return true;
    setState({ visible: true, feature: featureName });
    return false;
  }, []);

  const close = useCallback(() => setState({ visible: false, feature: "" }), []);

  const modal = state.visible ? <AuthPromptModal feature={state.feature} onClose={close} /> : null;

  return { requireAuth, modal };
}

function AuthPromptModal({ feature, onClose }: { feature: string; onClose: () => void }) {
  const returnUrl =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.pathname + window.location.search)
      : "/";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "10px",
          padding: "1.5rem 2rem",
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.75rem",
          }}
        >
          ログインが必要です
        </h2>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            marginBottom: "1.25rem",
          }}
        >
          「{feature}
          」機能を使うにはアカウントが必要です。Google・Microsoftアカウントやメールアドレスで簡単に登録できます。
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <a
            href={`/login?return=${returnUrl}`}
            style={{
              display: "block",
              padding: "0.6rem 1rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.88rem",
              fontWeight: 600,
              border: "none",
              borderRadius: "6px",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            ログイン / 新規登録
          </a>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              cursor: "pointer",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-secondary)",
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
