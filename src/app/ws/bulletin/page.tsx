"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";

interface Bulletin {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  published_at: string;
  author: { id: string; name: string } | null;
  isRead?: boolean;
}

const CATEGORIES = [
  { value: "general", label: "一般", color: "#0369A1" },
  { value: "urgent", label: "緊急", color: "#DC2626" },
  { value: "event", label: "イベント", color: "#7C3AED" },
  { value: "maintenance", label: "メンテナンス", color: "#D97706" },
  { value: "other", label: "その他", color: "#6B7280" },
];

export default function BulletinPage() {
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", pinned: false });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    fetchBulletins(s?.memberId);
  }, []);

  function authHeader(): Record<string, string> {
    if (!session) return {};
    return { Authorization: `Bearer ${session.memberId}:${session.token}` };
  }

  async function fetchBulletins(memberId?: string) {
    const url = memberId ? `/api/ws/bulletin?member_id=${memberId}` : "/api/ws/bulletin";
    const res = await fetch(url);
    if (res.ok) {
      const d = await res.json();
      setBulletins(d.bulletins || []);
    }
  }

  async function handlePost() {
    if (!form.title.trim()) return;
    const res = await fetch("/api/ws/bulletin", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: "", content: "", category: "general", pinned: false });
      setShowForm(false);
      fetchBulletins(session?.memberId);
    }
  }

  async function handleMarkRead(id: string) {
    await fetch("/api/ws/bulletin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ action: "read", bulletin_id: id }),
    });
    setBulletins((prev) => prev.map((b) => (b.id === id ? { ...b, isRead: true } : b)));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/ws/bulletin?id=${id}`, { method: "DELETE", headers: authHeader() });
    fetchBulletins(session?.memberId);
  }

  async function handleTogglePin(b: Bulletin) {
    await fetch("/api/ws/bulletin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ id: b.id, pinned: !b.pinned }),
    });
    fetchBulletins(session?.memberId);
  }

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
        &gt; 掲示板
      </nav>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>掲示板</h1>
        {session && (
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
            新規投稿
          </button>
        )}
      </div>

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
              fontSize: "0.9rem",
            }}
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="内容"
            rows={4}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              fontSize: "0.9rem",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <label style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              />{" "}
              ピン留め
            </label>
            <button
              onClick={handlePost}
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
              投稿
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {bulletins.map((b) => {
          const cat = CATEGORIES.find((c) => c.value === b.category);
          const isExpanded = expandedId === b.id;
          return (
            <div
              key={b.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: `1px solid ${b.pinned ? "var(--color-accent)" : "var(--color-border)"}`,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                onClick={() => {
                  setExpandedId(isExpanded ? null : b.id);
                  if (!b.isRead && session) handleMarkRead(b.id);
                }}
                style={{
                  padding: "0.8rem 1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {b.pinned && <span style={{ fontSize: "0.7rem" }}>📌</span>}
                {!b.isRead && session && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "var(--color-accent)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    backgroundColor: cat?.color || "#6B7280",
                    color: "#fff",
                    fontSize: "0.65rem",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {cat?.label}
                </span>
                <span style={{ fontWeight: 600, flex: 1 }}>{b.title}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  {b.author?.name} · {new Date(b.published_at).toLocaleDateString("ja-JP")}
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
                    {b.content}
                  </p>
                  {session?.memberId === b.author?.id && (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
                      <button
                        onClick={() => handleTogglePin(b)}
                        style={{
                          fontSize: "0.8rem",
                          padding: "0.2rem 0.6rem",
                          borderRadius: 4,
                          border: "1px solid var(--color-border)",
                          backgroundColor: "var(--color-surface)",
                          cursor: "pointer",
                        }}
                      >
                        {b.pinned ? "ピン解除" : "ピン留め"}
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        style={{
                          fontSize: "0.8rem",
                          padding: "0.2rem 0.6rem",
                          borderRadius: 4,
                          border: "1px solid #DC2626",
                          color: "#DC2626",
                          backgroundColor: "var(--color-surface)",
                          cursor: "pointer",
                        }}
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {bulletins.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            掲示がありません
          </p>
        )}
      </div>
    </div>
  );
}
