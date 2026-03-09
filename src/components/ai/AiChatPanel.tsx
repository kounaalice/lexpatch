"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getSession } from "@/lib/session";

interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  scope: "article" | "law" | "general";
  lawId?: string;
  articleNum?: string;
  lawTitle?: string;
  articleTitle?: string;
  compact?: boolean;
  /** 外部からメッセージを送信するためのref */
  sendRef?: React.MutableRefObject<((msg: string) => void) | null>;
}

function storageKey(scope: string, lawId?: string, articleNum?: string): string {
  const parts = ["lp_ai_chat", scope];
  if (lawId) parts.push(lawId);
  if (articleNum) parts.push(articleNum);
  return parts.join("_");
}

function loadHistory(key: string): AiMessage[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(-20) : [];
  } catch {
    return [];
  }
}

function saveHistory(key: string, messages: AiMessage[]) {
  try {
    localStorage.setItem(key, JSON.stringify(messages.slice(-20)));
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

export default function AiChatPanel({
  scope,
  lawId,
  articleNum,
  lawTitle,
  articleTitle,
  compact,
  sendRef,
}: Props) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [dailyLimit, setDailyLimit] = useState(30);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const key = storageKey(scope, lawId, articleNum);

  // AI有効チェック
  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setEnabled(d.enabled);
          setDailyLimit(d.dailyLimit || 30);
        } else {
          setEnabled(false);
        }
      })
      .catch(() => setEnabled(false));
  }, []);

  // 履歴復元
  useEffect(() => {
    setMessages(loadHistory(key));
  }, [key]);

  // 自動スクロール
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
            scope,
            lawId,
            articleNum,
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

        // SSE ストリーム読み取り
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

        // 完了: メッセージ確定
        if (accumulated) {
          const finalMessages = [...updated, { role: "assistant" as const, content: accumulated }];
          setMessages(finalMessages);
          saveHistory(key, finalMessages);
          incrementUsage();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "通信エラーが発生しました");
      } finally {
        setStreaming(false);
        setStreamText("");
      }
    },
    [messages, streaming, scope, lawId, articleNum, key],
  );

  // 外部からの送信を可能にする
  useEffect(() => {
    if (sendRef) sendRef.current = sendMessage;
  }, [sendRef, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  };

  // 無効 or 判定中
  if (enabled === null) return null;
  if (!enabled) return null;

  const usage = getUsageToday();
  const remaining = Math.max(0, dailyLimit - usage);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: compact ? "300px" : "auto",
        maxHeight: compact ? "300px" : "500px",
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
          minHeight: compact ? 0 : "120px",
        }}
      >
        {messages.length === 0 && !streaming && (
          <div
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
              fontSize: "0.78rem",
              padding: "1.5rem 0.5rem",
              lineHeight: 1.7,
            }}
          >
            {scope === "article" && articleTitle
              ? `${articleTitle} について質問できます`
              : scope === "law" && lawTitle
                ? `${lawTitle} について質問できます`
                : "法令について質問できます"}
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

        {/* ストリーミング中 */}
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
          placeholder="質問を入力..."
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
          fontSize: "0.65rem",
          color: "var(--color-text-secondary)",
        }}
      >
        <span>
          本日 {usage}/{dailyLimit} 回使用
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                fontSize: "0.65rem",
                textDecoration: "underline",
              }}
            >
              会話をクリア
            </button>
          )}
          <span>※AIによる法令解説です</span>
        </div>
      </div>
    </div>
  );
}
