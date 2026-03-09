"use client";

import { useState, useRef, useEffect } from "react";
import AiChatPanel from "./AiChatPanel";
import AiQuickActions from "./AiQuickActions";

interface Props {
  lawId: string;
  lawTitle: string;
  articleNum: string;
  articleTitle: string;
  hasAmendment?: boolean;
}

export default function AiArticleAssistant({
  lawId,
  lawTitle,
  articleNum,
  articleTitle,
  hasAmendment,
}: Props) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const sendRef = useRef<((msg: string) => void) | null>(null);

  // AI有効チェック: サーバー + ユーザー設定 aiMode
  useEffect(() => {
    const userAi = localStorage.getItem("lp_aiMode") === "true";
    if (!userAi) {
      setEnabled(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEnabled(d?.enabled ?? false))
      .catch(() => setEnabled(false));
  }, []);

  if (enabled === null || !enabled) return null;

  return (
    <section style={{ marginTop: "1.5rem" }}>
      {/* ヘッダー */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
          padding: "0.6rem 0.75rem",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: open ? "8px 8px 0 0" : "8px",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          transition: "background-color 0.15s",
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
          <path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 0 1 7-7z" />
          <line x1="9" y1="21" x2="15" y2="21" />
          <line x1="10" y1="24" x2="14" y2="24" />
        </svg>
        <span
          style={{
            flex: 1,
            textAlign: "left",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          AI法令アシスタント
        </span>
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--color-text-secondary)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </button>

      {/* コンテンツ */}
      {open && (
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            backgroundColor: "var(--color-bg)",
            overflow: "hidden",
          }}
        >
          {/* クイックアクション */}
          <AiQuickActions onSend={(msg) => sendRef.current?.(msg)} hasAmendment={hasAmendment} />

          {/* チャットパネル */}
          <AiChatPanel
            scope="article"
            lawId={lawId}
            articleNum={articleNum}
            lawTitle={lawTitle}
            articleTitle={articleTitle}
            sendRef={sendRef}
          />
        </div>
      )}
    </section>
  );
}
