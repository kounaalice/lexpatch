"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  searchBookmarks,
  BOOKMARK_CATEGORIES,
  type WsBookmark,
} from "@/lib/ws-bookmarks";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<WsBookmark[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState({
    title: "",
    url: "",
    description: "",
    category: BOOKMARK_CATEGORIES[0],
    tags: "",
    pinned: false,
  });

  function reload() {
    let list = search ? searchBookmarks(search) : getAllBookmarks();
    if (categoryFilter) list = list.filter((b) => b.category === categoryFilter);
    setBookmarks(list);
  }

  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [search, categoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function openEdit(b: WsBookmark) {
    setForm({
      title: b.title,
      url: b.url,
      description: b.description,
      category: b.category,
      tags: b.tags.join(", "),
      pinned: b.pinned,
    });
    setEditId(b.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const data = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (editId) updateBookmark(editId, data);
    else addBookmark(data);
    setForm({
      title: "",
      url: "",
      description: "",
      category: BOOKMARK_CATEGORIES[0],
      tags: "",
      pinned: false,
    });
    setShowForm(false);
    setEditId(null);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteBookmark(id);
    reload();
  }

  function handleTogglePin(b: WsBookmark) {
    updateBookmark(b.id, { pinned: !b.pinned });
    reload();
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
        &gt; ブックマーク
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>ブックマーク</h1>
        <button
          onClick={() => {
            setEditId(null);
            setForm({
              title: "",
              url: "",
              description: "",
              category: BOOKMARK_CATEGORIES[0],
              tags: "",
              pinned: false,
            });
            setShowForm(!showForm);
          }}
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          追加
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="タイトル・URL・説明・タグで検索"
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
          }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: "0.4rem", borderRadius: 6, border: "1px solid var(--color-border)" }}
        >
          <option value="">全カテゴリ</option>
          {BOOKMARK_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.8rem" }}>
            {editId ? "ブックマークを編集" : "ブックマークを追加"}
          </h3>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="タイトル *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="URL"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="説明"
            rows={2}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            >
              {BOOKMARK_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="タグ (カンマ区切り)"
              style={{
                flex: 1,
                minWidth: 120,
                padding: "0.4rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
              }}
            />
            <label style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              />{" "}
              ピン留め
            </label>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              保存
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {bookmarks.map((b) => (
          <div
            key={b.id}
            style={{
              backgroundColor: "var(--color-surface)",
              border: `1px solid ${b.pinned ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: 8,
              padding: "0.8rem 1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {b.pinned && (
                <span
                  style={{ fontSize: "0.65rem", color: "var(--color-accent)", fontWeight: 700 }}
                >
                  PIN
                </span>
              )}
              <span
                style={{
                  fontSize: "0.65rem",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  padding: "0.1rem 0.4rem",
                  borderRadius: 4,
                }}
              >
                {b.category}
              </span>
              {b.url ? (
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontWeight: 600,
                    flex: 1,
                    color: "var(--color-accent)",
                    textDecoration: "none",
                  }}
                >
                  {b.title}
                </a>
              ) : (
                <span style={{ fontWeight: 600, flex: 1 }}>{b.title}</span>
              )}
              <button
                onClick={() => handleTogglePin(b)}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.15rem 0.4rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  cursor: "pointer",
                }}
              >
                {b.pinned ? "unpin" : "pin"}
              </button>
              <button
                onClick={() => openEdit(b)}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.15rem 0.4rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  cursor: "pointer",
                }}
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                style={{
                  fontSize: "0.75rem",
                  padding: "0.15rem 0.4rem",
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
            {b.url && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  marginTop: "0.2rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {b.url}
              </div>
            )}
            {b.description && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  marginTop: "0.3rem",
                }}
              >
                {b.description}
              </div>
            )}
            {b.tags.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "0.4rem" }}>
                {b.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "0.6rem",
                      backgroundColor: "var(--color-border)",
                      padding: "0.1rem 0.3rem",
                      borderRadius: 4,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {bookmarks.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            ブックマークがありません
          </p>
        )}
      </div>
    </div>
  );
}
