"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getSession } from "@/lib/session";

interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  currentPath: string;
  onShowPolicy: () => void;
}

const STORAGE_KEY = "lp_ai_chat_guide";

function loadHistory(): AiMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(-20) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages: AiMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
  } catch {
    /* quota exceeded */
  }
}

function usageTodayKey(): string {
  return `lp_ai_usage_${new Date().toISOString().split("T")[0]}`;
}

function getUsageToday(): number {
  try {
    return parseInt(localStorage.getItem(usageTodayKey()) || "0");
  } catch {
    return 0;
  }
}

function incrementUsage() {
  try {
    const k = usageTodayKey();
    localStorage.setItem(k, String(getUsageToday() + 1));
  } catch {
    /* ignore */
  }
}

/** ページパスに応じたクイックアクション */
function getQuickActions(path: string): { label: string; message: string }[] {
  if (!path || path === "/") {
    return [
      { label: "法令を検索するには？", message: "法令を検索する方法を教えてください" },
      { label: "改め文って何？", message: "改め文とは何ですか？どうやって作れますか？" },
      { label: "おすすめ機能", message: "LexCardのおすすめ機能を教えてください" },
    ];
  }
  if (path.match(/^\/law\/[^/]+\/article\//)) {
    return [
      { label: "この画面でできること", message: "この条文詳細ページでできることを教えてください" },
      {
        label: "条文を編集するには？",
        message: "条文を直接編集して改め文を生成する方法を教えてください",
      },
      { label: "AIに条文を質問", message: "条文の内容についてAIに質問する方法を教えてください" },
    ];
  }
  if (path.match(/^\/law\//)) {
    return [
      { label: "この画面でできること", message: "この法令ページでできることを教えてください" },
      {
        label: "法令をフォロー",
        message: "法令をフォローして改正通知を受け取る方法を教えてください",
      },
      { label: "AI要約を使う", message: "法令のAI要約機能の使い方を教えてください" },
    ];
  }
  if (path.startsWith("/projects")) {
    return [
      { label: "タスクの管理", message: "プロジェクトでタスクを管理する方法を教えてください" },
      { label: "ガントチャート", message: "ガントチャートの使い方を教えてください" },
      { label: "議事録メモ", message: "議事録メモの作成方法を教えてください" },
    ];
  }
  if (path.startsWith("/dashboard")) {
    return [
      {
        label: "ウィジェット切り替え",
        message: "ダッシュボードのウィジェットをカスタマイズする方法を教えてください",
      },
      { label: "通知設定", message: "通知の設定を変更する方法を教えてください" },
      { label: "主な機能一覧", message: "LexCardの主な機能を一覧で教えてください" },
    ];
  }
  if (path.startsWith("/settings")) {
    return [
      { label: "テーマ変更", message: "テーマやゲーミングモードの設定方法を教えてください" },
      { label: "通知設定", message: "メール通知の設定方法を教えてください" },
      { label: "データ管理", message: "データのエクスポートや管理方法を教えてください" },
    ];
  }
  if (path.startsWith("/communities")) {
    return [
      { label: "コミュニティの使い方", message: "コミュニティ機能の使い方を教えてください" },
      {
        label: "パッチを共有",
        message: "改正案（パッチ）をコミュニティで共有する方法を教えてください",
      },
    ];
  }
  // デフォルト
  return [
    { label: "主な機能一覧", message: "LexCardの主な機能を一覧で教えてください" },
    { label: "設定の変更", message: "テーマや通知など設定を変更する方法を教えてください" },
    { label: "使い方ガイド", message: "詳しい使い方ガイドはどこにありますか？" },
  ];
}

export default function AiGuidePanel({ currentPath, onShowPolicy }: Props) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamText]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || streaming) return;

      const session = getSession();
      if (!session) {
        setError("ログインが必要です");
        return;
      }

      setError("");
      const userMsg: AiMessage = { role: "user", content: content.trim() };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setInput("");
      setStreaming(true);
      setStreamText("");

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: session.memberId,
            token: session.token,
            messages: updated,
            scope: "guide",
            currentPath,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "エラーが発生しました" }));
          setError(err.error || `エラー (${res.status})`);
          setStreaming(false);
          return;
        }

        if (!res.body) {
          setError("ストリーミング応答が取得できませんでした");
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const token = parsed.response ?? parsed.choices?.[0]?.delta?.content ?? "";
                if (token) {
                  accumulated += token;
                  setStreamText(accumulated);
                }
              } catch {
                /* skip malformed SSE */
              }
            }
          }
        }

        if (accumulated) {
          const finalMessages = [...updated, { role: "assistant" as const, content: accumulated }];
          setMessages(finalMessages);
          saveHistory(finalMessages);
          incrementUsage();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "通信エラーが発生しました");
      } finally {
        setStreaming(false);
        setStreamText("");
      }
    },
    [messages, streaming, currentPath],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const usage = getUsageToday();
  const remaining = Math.max(0, 30 - usage);
  const quickActions = getQuickActions(currentPath);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* メッセージ一覧 */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          minHeight: 0,
        }}
      >
        {messages.length === 0 && !streaming && (
          <div
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
              fontSize: "0.78rem",
              padding: "1rem 0.5rem 0.5rem",
              lineHeight: 1.7,
            }}
          >
            LexCardの使い方について質問できます
          </div>
        )}

        {/* クイックアクション（メッセージがないとき） */}
        {messages.length === 0 && !streaming && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              padding: "0 0.25rem",
            }}
          >
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.message)}
                style={{
                  padding: "0.45rem 0.7rem",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color 0.15s",
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              fontSize: "0.82rem",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              backgroundColor: msg.role === "user" ? "var(--color-accent)" : "var(--color-surface)",
              color: msg.role === "user" ? "#fff" : "var(--color-text-primary)",
              border: msg.role === "assistant" ? "1px solid var(--color-border)" : "none",
            }}
          >
            {msg.content}
          </div>
        ))}

        {streaming && streamText && (
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "85%",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              fontSize: "0.82rem",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            }}
          >
            {streamText}
            <span style={{ animation: "blink 1s step-end infinite", color: "var(--color-accent)" }}>
              |
            </span>
          </div>
        )}

        {streaming && !streamText && (
          <div
            style={{
              alignSelf: "flex-start",
              padding: "0.5rem 0.75rem",
              fontSize: "0.78rem",
              color: "var(--color-text-secondary)",
            }}
          >
            考え中...
          </div>
        )}
      </div>

      {/* エラー */}
      {error && (
        <div
          style={{
            padding: "0.4rem 0.75rem",
            fontSize: "0.75rem",
            color: "var(--color-del-fg)",
            backgroundColor: "var(--color-del-bg)",
            borderRadius: "4px",
            margin: "0 0.5rem",
          }}
        >
          {error}
        </div>
      )}

      {/* 入力エリア */}
      <div
        style={{
          padding: "0.5rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: "0.4rem",
          alignItems: "flex-end",
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="使い方を質問..."
          disabled={streaming || remaining <= 0}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            padding: "0.45rem 0.6rem",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text-primary)",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim() || remaining <= 0}
          style={{
            padding: "0.45rem 0.8rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
            opacity: streaming || !input.trim() ? 0.5 : 1,
            whiteSpace: "nowrap",
          }}
        >
          送信
        </button>
      </div>

      {/* フッター */}
      <div
        style={{
          padding: "0.3rem 0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.6rem",
          color: "var(--color-text-secondary)",
        }}
      >
        <span>
          本日 {usage}/30 回 ·{" "}
          <button
            onClick={onShowPolicy}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-accent)",
              fontSize: "0.6rem",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            AIガイドについて
          </button>
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                fontSize: "0.6rem",
                textDecoration: "underline",
              }}
            >
              クリア
            </button>
          )}
          <span>Llama 3.1 · 操作案内のみ</span>
        </div>
      </div>
    </div>
  );
}
