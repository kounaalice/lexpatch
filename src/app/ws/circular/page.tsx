"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";

interface Circular {
  id: string;
  title: string;
  content: string;
  target_member_ids: string[];
  deadline: string | null;
  status: string;
  created_at: string;
  author: { id: string; name: string } | null;
  confirmations: { member_id: string; confirmed_at: string; comment: string }[];
}

export default function CircularPage() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    targetIds: [] as string[],
    deadline: "",
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmComment, setConfirmComment] = useState("");
  const [session, setSession] = useState<any>(null);
  const [tab, setTab] = useState<"received" | "sent">("received");

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s?.memberId) {
      fetchCirculars(s.memberId);
      fetchMembers();
    }
  }, []);

  function authHeader(): Record<string, string> {
    if (!session) return {};
    return { Authorization: `Bearer ${session.memberId}:${session.token}` };
  }

  async function fetchCirculars(memberId: string) {
    const res = await fetch(`/api/ws/circular?member_id=${memberId}&role=target`);
    if (res.ok) {
      const d = await res.json();
      setCirculars(d.circulars || []);
    }
  }

  async function fetchMembers() {
    const res = await fetch("/api/members");
    if (res.ok) {
      const d = await res.json();
      setMembers(d.members || []);
    }
  }

  async function handleCreate() {
    if (!form.title.trim() || form.targetIds.length === 0) return;
    const res = await fetch("/api/ws/circular", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        target_member_ids: form.targetIds,
        deadline: form.deadline || null,
      }),
    });
    if (res.ok) {
      setForm({ title: "", content: "", targetIds: [], deadline: "" });
      setShowForm(false);
      fetchCirculars(session.memberId);
    }
  }

  async function handleConfirm(circularId: string) {
    await fetch("/api/ws/circular", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ action: "confirm", circular_id: circularId, comment: confirmComment }),
    });
    setConfirmComment("");
    fetchCirculars(session.memberId);
  }

  async function handleClose(id: string) {
    await fetch("/api/ws/circular", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ action: "close", id }),
    });
    fetchCirculars(session.memberId);
  }

  if (!session) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "3rem" }}>
          ログインが必要です
        </p>
      </div>
    );
  }

  const filtered =
    tab === "sent"
      ? circulars.filter((c) => c.author?.id === session.memberId)
      : circulars.filter(
          (c) =>
            c.target_member_ids.includes(session.memberId) || c.author?.id === session.memberId,
        );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
      <nav
        style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}
      >
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          Top
        </Link>{" "}
        &gt;{" "}
        <Link href="/ws" style={{ color: "var(--color-accent)" }}>
          WS
        </Link>{" "}
        &gt; 回覧・確認
      </nav>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>回覧・確認</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          新規回覧
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["received", "sent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: tab === t ? "var(--color-accent)" : "var(--color-surface)",
              color: tab === t ? "#fff" : "var(--color-text-primary)",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {t === "received" ? "受信" : "送信済"}
          </button>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="タイトル"
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
            }}
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="内容"
            rows={3}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              resize: "vertical",
            }}
          />
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ fontSize: "0.8rem", display: "block", marginBottom: "0.3rem" }}>
              対象メンバー（複数選択可）
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {members
                .filter((m) => m.id !== session.memberId)
                .map((m) => (
                  <label
                    key={m.id}
                    style={{
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "0.2rem 0.5rem",
                      borderRadius: 4,
                      border: "1px solid var(--color-border)",
                      cursor: "pointer",
                      backgroundColor: form.targetIds.includes(m.id)
                        ? "var(--color-accent)"
                        : "var(--color-surface)",
                      color: form.targetIds.includes(m.id) ? "#fff" : "var(--color-text-primary)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.targetIds.includes(m.id)}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          targetIds: e.target.checked
                            ? [...form.targetIds, m.id]
                            : form.targetIds.filter((id) => id !== m.id),
                        });
                      }}
                      style={{ display: "none" }}
                    />
                    {m.name}
                  </label>
                ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label style={{ fontSize: "0.8rem" }}>
              期限:{" "}
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                style={{
                  padding: "0.3rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                }}
              />
            </label>
            <button
              onClick={handleCreate}
              style={{
                marginLeft: "auto",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.4rem 1rem",
                cursor: "pointer",
              }}
            >
              送信
            </button>
          </div>
        </div>
      )}

      {/* Circular List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {filtered.map((c) => {
          const isExpanded = expandedId === c.id;
          const myConfirmation = c.confirmations.find((cf) => cf.member_id === session.memberId);
          const confirmRate =
            c.target_member_ids.length > 0
              ? Math.round((c.confirmations.length / c.target_member_ids.length) * 100)
              : 0;
          const isAuthor = c.author?.id === session.memberId;
          const isOverdue =
            c.deadline && new Date(c.deadline) < new Date() && c.status === "active";

          return (
            <div
              key={c.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: `1px solid ${isOverdue ? "#DC2626" : "var(--color-border)"}`,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                style={{
                  padding: "0.8rem 1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {!myConfirmation && !isAuthor && c.status === "active" && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#D97706",
                      flexShrink: 0,
                    }}
                  />
                )}
                {myConfirmation && <span style={{ color: "#059669", fontSize: "0.8rem" }}>✓</span>}
                <span style={{ fontWeight: 600, flex: 1 }}>{c.title}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {confirmRate}% 確認済
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                    backgroundColor: c.status === "active" ? "#DBEAFE" : "#F3F4F6",
                    color: c.status === "active" ? "#1E40AF" : "#6B7280",
                  }}
                >
                  {c.status === "active" ? "回覧中" : "終了"}
                </span>
              </div>
              {isExpanded && (
                <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid var(--color-border)" }}>
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "0.9rem",
                      marginTop: "0.8rem",
                      lineHeight: 1.7,
                    }}
                  >
                    {c.content}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      marginTop: "0.5rem",
                    }}
                  >
                    作成者: {c.author?.name} · {new Date(c.created_at).toLocaleDateString("ja-JP")}
                    {c.deadline && ` · 期限: ${new Date(c.deadline).toLocaleDateString("ja-JP")}`}
                  </p>

                  {/* Confirmation status */}
                  <div style={{ marginTop: "0.8rem" }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                      確認状況 ({c.confirmations.length}/{c.target_member_ids.length})
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {c.target_member_ids.map((mid) => {
                        const conf = c.confirmations.find((cf) => cf.member_id === mid);
                        const member = members.find((m) => m.id === mid);
                        return (
                          <span
                            key={mid}
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.15rem 0.5rem",
                              borderRadius: 4,
                              backgroundColor: conf ? "#D1FAE5" : "#FEF3C7",
                              color: conf ? "#065F46" : "#92400E",
                            }}
                          >
                            {member?.name || mid.slice(0, 8)}{" "}
                            {conf
                              ? `✓ ${new Date(conf.confirmed_at).toLocaleDateString("ja-JP")}`
                              : "未確認"}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confirm button */}
                  {!myConfirmation && !isAuthor && c.status === "active" && (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.8rem",
                        alignItems: "center",
                      }}
                    >
                      <input
                        value={confirmComment}
                        onChange={(e) => setConfirmComment(e.target.value)}
                        placeholder="コメント（任意）"
                        style={{
                          flex: 1,
                          padding: "0.4rem",
                          borderRadius: 4,
                          border: "1px solid var(--color-border)",
                          fontSize: "0.85rem",
                        }}
                      />
                      <button
                        onClick={() => handleConfirm(c.id)}
                        style={{
                          backgroundColor: "#059669",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "0.4rem 1rem",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        確認済にする
                      </button>
                    </div>
                  )}

                  {isAuthor && c.status === "active" && (
                    <button
                      onClick={() => handleClose(c.id)}
                      style={{
                        marginTop: "0.8rem",
                        fontSize: "0.8rem",
                        padding: "0.3rem 0.8rem",
                        borderRadius: 4,
                        border: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-surface)",
                        cursor: "pointer",
                      }}
                    >
                      回覧終了
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            回覧がありません
          </p>
        )}
      </div>
    </div>
  );
}
