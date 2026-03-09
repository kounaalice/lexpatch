"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllArticles,
  getFaqArticles,
  getArticle,
  addArticle,
  updateArticle,
  deleteArticle,
  incrementViewCount,
  searchArticles,
  DEFAULT_CATEGORIES,
  type KnowledgeArticle,
} from "@/lib/ws-knowledge";

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "faq">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: DEFAULT_CATEGORIES[0],
    tags: "",
    isFaq: false,
    pinned: false,
  });

  function reload() {
    let list = search
      ? searchArticles(search)
      : tab === "faq"
        ? getFaqArticles()
        : getAllArticles();
    if (categoryFilter) list = list.filter((a) => a.category === categoryFilter);
    setArticles(list);
  }

  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [search, tab, categoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function openDetail(a: KnowledgeArticle) {
    incrementViewCount(a.id);
    setSelectedId(a.id);
  }

  function openEdit(a: KnowledgeArticle) {
    setForm({
      title: a.title,
      content: a.content,
      category: a.category,
      tags: a.tags.join(", "),
      isFaq: a.isFaq,
      pinned: a.pinned,
    });
    setEditId(a.id);
    setShowForm(true);
    setSelectedId(null);
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
    if (editId) updateArticle(editId, data);
    else addArticle(data);
    setForm({
      title: "",
      content: "",
      category: DEFAULT_CATEGORIES[0],
      tags: "",
      isFaq: false,
      pinned: false,
    });
    setShowForm(false);
    setEditId(null);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteArticle(id);
    if (selectedId === id) setSelectedId(null);
    reload();
  }

  const selected = selectedId ? getArticle(selectedId) : null;

  if (selected) {
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
          &gt;{" "}
          <span
            onClick={() => setSelectedId(null)}
            style={{ color: "var(--color-accent)", cursor: "pointer" }}
          >
            ナレッジ
          </span>{" "}
          &gt; {selected.title}
        </nav>
        <button
          onClick={() => setSelectedId(null)}
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "0.3rem 0.8rem",
            cursor: "pointer",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}
        >
          戻る
        </button>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1.2rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}
          >
            {selected.pinned && (
              <span style={{ fontSize: "0.7rem", color: "var(--color-accent)" }}>PIN</span>
            )}
            <span
              style={{
                fontSize: "0.7rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                padding: "0.1rem 0.4rem",
                borderRadius: 4,
              }}
            >
              {selected.category}
            </span>
            {selected.isFaq && (
              <span
                style={{
                  fontSize: "0.7rem",
                  backgroundColor: "#D97706",
                  color: "#fff",
                  padding: "0.1rem 0.4rem",
                  borderRadius: 4,
                }}
              >
                FAQ
              </span>
            )}
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
                marginLeft: "auto",
              }}
            >
              閲覧: {selected.viewCount}
            </span>
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>
            {selected.title}
          </h2>
          <div style={{ fontSize: "0.9rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {selected.content}
          </div>
          {selected.tags.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "1rem" }}>
              {selected.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "0.65rem",
                    backgroundColor: "var(--color-border)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              onClick={() => openEdit(selected)}
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.8rem",
                borderRadius: 6,
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.8rem",
                borderRadius: 6,
                border: "1px solid #DC2626",
                color: "#DC2626",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              削除
            </button>
          </div>
        </div>
      </div>
    );
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
        &gt; ナレッジ
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>ナレッジベース</h1>
        <button
          onClick={() => {
            setEditId(null);
            setForm({
              title: "",
              content: "",
              category: DEFAULT_CATEGORIES[0],
              tags: "",
              isFaq: false,
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

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {(["all", "faq"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              backgroundColor: tab === t ? "var(--color-accent)" : "var(--color-surface)",
              color: tab === t ? "#fff" : "var(--color-text-primary)",
            }}
          >
            {t === "all" ? "全記事" : "FAQ"}
          </button>
        ))}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: "0.4rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            marginLeft: "auto",
          }}
        >
          <option value="">全カテゴリ</option>
          {DEFAULT_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="タイトル・内容・タグで検索"
        style={{
          width: "100%",
          padding: "0.5rem",
          borderRadius: 6,
          border: "1px solid var(--color-border)",
          marginBottom: "1rem",
        }}
      />

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
            {editId ? "記事を編集" : "記事を追加"}
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
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="内容"
            rows={8}
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
              {DEFAULT_CATEGORIES.map((c) => (
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
                checked={form.isFaq}
                onChange={(e) => setForm({ ...form, isFaq: e.target.checked })}
              />{" "}
              FAQ
            </label>
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
        {articles.map((a) => (
          <div
            key={a.id}
            onClick={() => openDetail(a)}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "0.8rem 1rem",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {a.pinned && (
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
                {a.category}
              </span>
              {a.isFaq && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    backgroundColor: "#D97706",
                    color: "#fff",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  FAQ
                </span>
              )}
              <span style={{ fontWeight: 600, flex: 1 }}>{a.title}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {a.viewCount}回
              </span>
            </div>
            {a.tags.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "0.4rem" }}>
                {a.tags.map((t) => (
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
        {articles.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            記事がありません
          </p>
        )}
      </div>
    </div>
  );
}
