"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession, type Session } from "@/lib/session";
import AiChatPanel from "@/components/ai/AiChatPanel";

interface MessageGroup {
  id: string;
  name: string;
  type: "project" | "community";
  messages: { id: string; content: string; author_name: string; created_at: string }[];
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

export default function ChatHubPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"messages" | "ai">("messages");
  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const s = getSession();
    setSession(s); // eslint-disable-line react-hooks/set-state-in-effect
    setLoading(false);

    if (s) {
      // メッセージ集約
      setMsgLoading(true);
      fetch(
        `/api/dashboard/messages?member_id=${s.memberId}&name=${encodeURIComponent(s.name)}&org=${encodeURIComponent(s.org || "")}`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) {
            const all: MessageGroup[] = [...(d.projects || []), ...(d.communities || [])];
            // 最新メッセージが新しい順にソート
            all.sort((a, b) => {
              const aLast = a.messages[a.messages.length - 1]?.created_at ?? "";
              const bLast = b.messages[b.messages.length - 1]?.created_at ?? "";
              return bLast.localeCompare(aLast);
            });
            setGroups(all);
          }
        })
        .catch(() => {})
        .finally(() => setMsgLoading(false));

      // AI状態チェック
      fetch("/api/ai/status")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setAiEnabled(d?.enabled ?? false))
        .catch(() => setAiEnabled(false));
    }
  }, []);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-secondary)",
          padding: "4rem 1rem",
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "2.5rem 2rem",
            textAlign: "center",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.75rem",
            }}
          >
            ログインが必要です
          </div>
          <Link
            href="/login?return=/dashboard/chat"
            style={{
              display: "inline-block",
              padding: "0.7rem 1.5rem",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.5rem 1.2rem",
    fontFamily: "var(--font-sans)",
    fontSize: "0.85rem",
    fontWeight: active ? 700 : 400,
    color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
    borderBottom: active ? "2px solid var(--color-accent)" : "2px solid transparent",
    background: "none",
    border: "none",
    borderBottomStyle: "solid",
    cursor: "pointer",
    transition: "color 0.15s",
  });

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 1.5rem 3rem" }}>
        {/* パンくず */}
        <nav
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            トップ
          </Link>
          <span style={{ margin: "0 0.4rem" }}>{" \u203A "}</span>
          <Link href="/dashboard" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            マイページ
          </Link>
          <span style={{ margin: "0 0.4rem" }}>{" \u203A "}</span>
          <span>チャット</span>
        </nav>

        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "1.2rem",
          }}
        >
          チャット
        </h1>

        {/* タブ */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: "1.5rem",
          }}
        >
          <button onClick={() => setTab("messages")} style={tabStyle(tab === "messages")}>
            メッセージ
          </button>
          {aiEnabled && (
            <button onClick={() => setTab("ai")} style={tabStyle(tab === "ai")}>
              AIアシスタント
            </button>
          )}
        </div>

        {/* メッセージタブ */}
        {tab === "messages" && (
          <div>
            {msgLoading ? (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  padding: "2rem 0",
                  textAlign: "center",
                }}
              >
                メッセージを読み込み中...
              </p>
            ) : groups.length === 0 ? (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  padding: "2rem 0",
                  textAlign: "center",
                }}
              >
                参加中のプロジェクト・コミュニティにメッセージはありません。
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {groups.map((g) => (
                  <div
                    key={`${g.type}-${g.id}`}
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {/* グループヘッダー */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.65rem 1rem",
                        borderBottom: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-bg)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 600,
                            padding: "0.1rem 0.35rem",
                            borderRadius: "3px",
                            backgroundColor:
                              g.type === "project" ? "var(--color-add-bg)" : "var(--color-warn-bg)",
                            color:
                              g.type === "project" ? "var(--color-add-fg)" : "var(--color-warn-fg)",
                          }}
                        >
                          {g.type === "project" ? "PJ" : "CM"}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {g.name}
                        </span>
                      </div>
                      <Link
                        href={g.type === "project" ? `/projects/${g.id}` : `/communities/${g.id}`}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.72rem",
                          color: "var(--color-accent)",
                          textDecoration: "none",
                        }}
                      >
                        開く →
                      </Link>
                    </div>

                    {/* メッセージ一覧 */}
                    <div style={{ padding: "0.5rem 1rem" }}>
                      {g.messages.map((msg) => (
                        <div
                          key={msg.id}
                          style={{
                            padding: "0.4rem 0",
                            borderBottom: "1px solid var(--color-border)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              marginBottom: "0.15rem",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                color: "var(--color-text-primary)",
                              }}
                            >
                              {msg.author_name}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.68rem",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.82rem",
                              color: "var(--color-text-secondary)",
                              lineHeight: 1.6,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {msg.content.length > 200
                              ? msg.content.slice(0, 200) + "..."
                              : msg.content}
                          </div>
                        </div>
                      ))}
                      {/* 最後のメッセージの下線を消す */}
                      <style>{`div > div:last-child { border-bottom: none !important; }`}</style>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AIチャットタブ */}
        {tab === "ai" && aiEnabled && (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
              <AiChatPanel scope="general" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
