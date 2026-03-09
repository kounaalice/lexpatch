"use client";

import { useState, useEffect, useRef } from "react";
import { getSession } from "@/lib/session";

interface Message {
  id: string;
  author_name: string;
  content: string;
  visibility: string;
  created_at: string;
}

interface ProjectChatProps {
  projectId: string;
  members: Array<{ name: string; org: string; role: string }>;
}

export function ProjectChat({ projectId, members }: ProjectChatProps) {
  const [tab, setTab] = useState<"public" | "member">("public");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const session = getSession();
  const isMember = members.some((m) => m.name === (session?.name ?? authorName));

  useEffect(() => {
    const s = getSession();
    if (s?.name) setAuthorName(s.name);
    else {
      const saved = localStorage.getItem("lp_project_owner");
      if (saved) setAuthorName(saved);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function fetchMessages() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        project_id: projectId,
        visibility: tab,
        ...(authorName ? { viewer_name: authorName } : {}),
      });
      const res = await fetch(`/api/projects/messages?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 50);
      } else if (res.status === 403) {
        setMessages([]);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/projects/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          author_name: authorName || "匿名",
          content: content.trim(),
          visibility: tab,
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setContent("");
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 50);
      }
    } catch {
      /* ignore */
    }
    setSending(false);
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.35rem 0.8rem",
    fontFamily: "var(--font-sans)",
    fontSize: "0.78rem",
    fontWeight: active ? 600 : 400,
    border: "1px solid",
    borderColor: active ? "var(--color-accent)" : "var(--color-border)",
    borderRadius: "4px",
    backgroundColor: active ? "var(--color-accent)" : "transparent",
    color: active ? "#fff" : "var(--color-text-secondary)",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            margin: 0,
          }}
        >
          <span
            style={{
              width: "3px",
              height: "1rem",
              backgroundColor: "var(--color-accent)",
              borderRadius: "2px",
            }}
          />
          チャット
        </h3>
        <div style={{ display: "flex", gap: "0.3rem" }}>
          <button style={tabStyle(tab === "public")} onClick={() => setTab("public")}>
            一般
          </button>
          <button style={tabStyle(tab === "member")} onClick={() => setTab("member")}>
            メンバー限定
          </button>
        </div>
      </div>

      {tab === "member" && !isMember ? (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            padding: "1rem",
            backgroundColor: "var(--color-bg)",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            textAlign: "center",
          }}
        >
          メンバー限定です。メンバーに追加されると閲覧できます。
        </p>
      ) : (
        <>
          <div
            ref={scrollRef}
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              padding: "0.5rem",
            }}
          >
            {loading ? (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  textAlign: "center",
                  padding: "1rem",
                }}
              >
                読み込み中...
              </p>
            ) : messages.length === 0 ? (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  textAlign: "center",
                  padding: "1rem",
                }}
              >
                メッセージはありません
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    padding: "0.4rem 0.5rem",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--color-accent)",
                      }}
                    >
                      {msg.author_name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.65rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "var(--color-text-primary)",
                      margin: "0.2rem 0 0",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div
            style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem", alignItems: "flex-end" }}
          >
            {!session && (
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="名前"
                style={{
                  width: "80px",
                  padding: "0.4rem 0.5rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                }}
              />
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="メッセージを入力..."
              rows={1}
              style={{
                flex: 1,
                padding: "0.4rem 0.5rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                resize: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !content.trim()}
              style={{
                padding: "0.4rem 0.75rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                fontWeight: 600,
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                opacity: sending || !content.trim() ? 0.5 : 1,
              }}
            >
              送信
            </button>
            <button
              onClick={fetchMessages}
              style={{
                padding: "0.4rem 0.5rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
              }}
            >
              更新
            </button>
          </div>
        </>
      )}
    </div>
  );
}
