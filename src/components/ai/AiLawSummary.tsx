"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/session";

interface Props {
  lawId: string;
  lawTitle: string;
  lawNum: string;
}

function cacheKey(lawId: string): string {
  return `lp_ai_summary_${lawId}`;
}

function loadCache(lawId: string): { text: string; ts: number } | null {
  try {
    const raw = localStorage.getItem(cacheKey(lawId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // 24h 有効
    if (Date.now() - parsed.ts > 24 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(lawId: string, text: string) {
  try {
    localStorage.setItem(cacheKey(lawId), JSON.stringify({ text, ts: Date.now() }));
  } catch {
    /* quota exceeded */
  }
}

export default function AiLawSummary({ lawId, lawTitle, lawNum }: Props) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userAi = localStorage.getItem("lp_aiMode") === "true";
    if (!userAi) {
      setEnabled(false);
      return;
    }
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setEnabled(d?.enabled ?? false);
        if (d?.enabled) {
          const cached = loadCache(lawId);
          if (cached) setSummary(cached.text);
        }
      })
      .catch(() => setEnabled(false));
  }, [lawId]);

  if (enabled === null || !enabled) return null;

  async function generate() {
    const session = getSession();
    if (!session) {
      setError("ログインが必要です");
      return;
    }

    setLoading(true);
    setStreaming(true);
    setError("");
    setSummary("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: session.memberId,
          token: session.token,
          messages: [
            {
              role: "user",
              content: `「${lawTitle}（${lawNum}）」の概要を要約してください。この法令の目的、主な規定内容、適用対象を簡潔に説明してください。`,
            },
          ],
          scope: "law",
          lawId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "エラー" }));
        setError(err.error || `エラー (${res.status})`);
        setLoading(false);
        setStreaming(false);
        return;
      }

      if (!res.body) {
        setError("応答を取得できませんでした");
        setLoading(false);
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
              // Workers AI フォーマット対応: 旧 {"response":"..."} / 新 {"choices":[{"delta":{"content":"..."}}]}
              const token = parsed.response ?? parsed.choices?.[0]?.delta?.content ?? "";
              if (token) {
                accumulated += token;
                setSummary(accumulated);
              }
            } catch {
              /* skip */
            }
          }
        }
      }

      if (accumulated) {
        saveCache(lawId, accumulated);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラー");
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  return (
    <section
      style={{
        margin: "1rem 0 1.5rem",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 1rem",
          borderBottom: summary ? "1px solid var(--color-border)" : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 0 1 7-7z" />
            <line x1="9" y1="21" x2="15" y2="21" />
          </svg>
          AI要約
        </div>

        {!summary && !loading && (
          <button
            onClick={generate}
            style={{
              padding: "0.3rem 0.7rem",
              borderRadius: "6px",
              border: "1px solid var(--color-accent)",
              backgroundColor: "transparent",
              color: "var(--color-accent)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-accent)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-accent)";
            }}
          >
            AIで法令の概要を生成
          </button>
        )}

        {summary && !loading && (
          <button
            onClick={generate}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              fontSize: "0.68rem",
              fontFamily: "var(--font-sans)",
              textDecoration: "underline",
            }}
          >
            再生成
          </button>
        )}
      </div>

      {/* エラー */}
      {error && (
        <div
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.78rem",
            color: "var(--color-del-fg)",
            backgroundColor: "var(--color-del-bg)",
          }}
        >
          {error}
        </div>
      )}

      {/* ローディング */}
      {loading && !summary && (
        <div
          style={{
            padding: "1rem",
            textAlign: "center",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)",
          }}
        >
          要約を生成中...
        </div>
      )}

      {/* 要約コンテンツ */}
      {summary && (
        <div
          style={{
            padding: "0.75rem 1rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-primary)",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
          }}
        >
          {summary}
          {streaming && <span style={{ color: "var(--color-accent)" }}>|</span>}
        </div>
      )}

      {/* 免責 */}
      {summary && !streaming && (
        <div
          style={{
            padding: "0.3rem 1rem 0.5rem",
            fontSize: "0.65rem",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)",
          }}
        >
          ※AIによる法令解説です。法的助言ではありません。
        </div>
      )}
    </section>
  );
}
