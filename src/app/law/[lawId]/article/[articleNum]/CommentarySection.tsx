"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession } from "@/lib/session";
import { addCard } from "@/lib/cards";

type SourceTier = "一次" | "準一次" | "二次" | "三次";

interface CommentarySource {
  tier: SourceTier;
  label: string;
  url: string;
}

const TIER_COLORS: Record<SourceTier, { fg: string; bg: string }> = {
  一次: { fg: "var(--color-accent)", bg: "var(--color-add-bg)" },
  準一次: { fg: "#1B4B8A", bg: "#EBF2FD" },
  二次: { fg: "var(--color-warn-fg)", bg: "var(--color-warn-bg)" },
  三次: { fg: "var(--color-text-secondary)", bg: "var(--color-bg)" },
};

interface Commentary {
  id: string;
  law_id: string;
  article_title: string;
  content: string;
  author_name: string | null;
  sources: CommentarySource[];
  created_at: string;
  updated_at: string;
}

interface Props {
  lawId: string;
  articleTitle: string;
  initialCommentaries: Commentary[];
}

function authHeaders(): Record<string, string> {
  const s = getSession();
  if (!s) return {};
  return { Authorization: `Bearer ${s.memberId}:${s.token}` };
}

export function CommentarySection({ lawId, articleTitle, initialCommentaries }: Props) {
  const [commentaries, setCommentaries] = useState<Commentary[]>(initialCommentaries);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getSession());
  }, []);

  // 新規作成フォーム
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 新規作成の参考資料
  const [newSources, setNewSources] = useState<CommentarySource[]>([]);

  // 編集フォーム
  const [editContent, setEditContent] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editSources, setEditSources] = useState<CommentarySource[]>([]);

  // localStorage から投稿者名を復元
  useEffect(() => {
    const saved = localStorage.getItem("lp_commentary_author");
    if (saved) setNewAuthor(saved);
  }, []);

  const refreshCommentaries = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/commentary?law_id=${encodeURIComponent(lawId)}&article_title=${encodeURIComponent(articleTitle)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setCommentaries(data);
      }
    } catch {
      /* ignore */
    }
  }, [lawId, articleTitle]);

  async function handleCreate() {
    if (!newContent.trim()) {
      setError("解説内容を入力してください");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          law_id: lawId,
          article_title: articleTitle,
          content: newContent,
          author_name: newAuthor || undefined,
          sources: newSources.filter((s) => s.label.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存エラー");
      // 投稿者名を記憶
      if (newAuthor.trim()) localStorage.setItem("lp_commentary_author", newAuthor.trim());
      // カード報酬: 逐条解説 → 対象条文カード確定
      const artNum = articleTitle.replace(/[^0-9_]/g, "");
      if (artNum) addCard(`${lawId}:${artNum}`);
      setNewContent("");
      setNewSources([]);
      setIsAdding(false);
      await refreshCommentaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editContent.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/commentary?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          content: editContent,
          author_name: editAuthor || undefined,
          sources: editSources.filter((s) => s.label.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "更新エラー");
      if (editAuthor.trim()) localStorage.setItem("lp_commentary_author", editAuthor.trim());
      setEditingId(null);
      await refreshCommentaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("この解説を削除しますか？")) return;
    try {
      const res = await fetch(`/api/commentary?id=${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "削除エラー");
      }
      await refreshCommentaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  }

  function startEdit(c: Commentary) {
    setEditingId(c.id);
    setEditContent(c.content);
    setEditAuthor(c.author_name ?? "");
    setEditSources(Array.isArray(c.sources) ? [...c.sources] : []);
    setError(null);
  }

  function renderSourceEditor(
    sources: CommentarySource[],
    setSources: (s: CommentarySource[]) => void,
  ) {
    return (
      <div style={{ marginTop: "0.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.35rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
            }}
          >
            参考資料
          </span>
          <button
            type="button"
            onClick={() => setSources([...sources, { tier: "二次", label: "", url: "" }])}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-accent)",
              backgroundColor: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              padding: "0.15rem 0.5rem",
              cursor: "pointer",
            }}
          >
            + 追加
          </button>
        </div>
        {sources.map((src, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "0.35rem",
              marginBottom: "0.35rem",
              alignItems: "center",
            }}
          >
            <select
              value={src.tier}
              onChange={(e) => {
                const next = [...sources];
                next[i] = { ...next[i], tier: e.target.value as SourceTier };
                setSources(next);
              }}
              style={{
                padding: "0.3rem",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                backgroundColor: TIER_COLORS[src.tier].bg,
                color: TIER_COLORS[src.tier].fg,
                width: "72px",
                flexShrink: 0,
              }}
            >
              {(["一次", "準一次", "二次", "三次"] as SourceTier[]).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={src.label}
              onChange={(e) => {
                const next = [...sources];
                next[i] = { ...next[i], label: e.target.value };
                setSources(next);
              }}
              placeholder="資料名"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "0.3rem 0.5rem",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                backgroundColor: "var(--color-bg)",
              }}
            />
            <input
              type="url"
              value={src.url}
              onChange={(e) => {
                const next = [...sources];
                next[i] = { ...next[i], url: e.target.value };
                setSources(next);
              }}
              placeholder="URL（任意）"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "0.3rem 0.5rem",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                backgroundColor: "var(--color-bg)",
              }}
            />
            <button
              type="button"
              onClick={() => setSources(sources.filter((_, j) => j !== i))}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.65rem",
                color: "var(--color-del-fg)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.2rem",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  }

  function renderSourceChips(sources: CommentarySource[]) {
    if (!Array.isArray(sources) || sources.length === 0) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.5rem" }}>
        {sources
          .filter((s) => s.label)
          .map((src, i) => {
            const colors = TIER_COLORS[src.tier] ?? TIER_COLORS["三次"];
            const inner = (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-sans)",
                  backgroundColor: colors.bg,
                  color: colors.fg,
                  border: `1px solid ${colors.fg}22`,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.65rem" }}>{src.tier}</span>
                {src.label}
              </span>
            );
            if (src.url) {
              return (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  {inner}
                </a>
              );
            }
            return inner;
          })}
      </div>
    );
  }

  // ログインなし＆解説なし → セクション自体を非表示
  if (!loggedIn && commentaries.length === 0) return null;

  return (
    <div style={{ marginTop: "0.25rem" }}>
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.25rem",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            margin: 0,
          }}
        >
          逐条解説
          {commentaries.length > 0 && (
            <span
              style={{
                fontWeight: 400,
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                marginLeft: "0.5rem",
              }}
            >
              ({commentaries.length})
            </span>
          )}
        </h3>
        {loggedIn && !isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setError(null);
            }}
            style={{
              padding: "0.3rem 0.75rem",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "5px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--color-accent)",
              cursor: "pointer",
            }}
          >
            + 解説を追加
          </button>
        )}
      </div>

      {/* 解説がない場合（ログイン済みのみ表示） */}
      {commentaries.length === 0 && !isAdding && loggedIn && (
        <div
          style={{
            padding: "0.5rem 0.75rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <button
            onClick={() => {
              setIsAdding(true);
              setError(null);
            }}
            style={{
              padding: "0.2rem 0.6rem",
              backgroundColor: "transparent",
              color: "var(--color-accent)",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + 解説を書く
          </button>
        </div>
      )}

      {/* 既存の解説一覧 */}
      {commentaries.map((c) => (
        <div
          key={c.id}
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            marginBottom: "0.75rem",
          }}
        >
          {editingId === c.id ? (
            /* 編集モード */
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  lineHeight: 1.8,
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "0.5rem",
                }}
              />
              {renderSourceEditor(editSources, setEditSources)}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginTop: "0.5rem",
                }}
              >
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  placeholder="投稿者名（任意）"
                  style={{
                    padding: "0.35rem 0.6rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "5px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    backgroundColor: "var(--color-bg)",
                    width: "160px",
                  }}
                />
                <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      padding: "0.35rem 0.75rem",
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "5px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => handleUpdate(c.id)}
                    disabled={saving}
                    style={{
                      padding: "0.35rem 0.75rem",
                      backgroundColor: saving ? "var(--color-border)" : "var(--color-accent)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? "保存中…" : "保存"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 表示モード */
            <div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  lineHeight: 1.9,
                  color: "var(--color-text-primary)",
                  whiteSpace: "pre-wrap",
                  marginBottom: "0.5rem",
                }}
              >
                {c.content}
              </div>
              {renderSourceChips(c.sources)}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "0.5rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  {c.author_name && <span>{c.author_name}</span>}
                  <span>{new Date(c.updated_at || c.created_at).toLocaleDateString("ja-JP")}</span>
                  {c.updated_at && c.updated_at !== c.created_at && (
                    <span style={{ fontStyle: "italic" }}>（編集済み）</span>
                  )}
                </div>
                {loggedIn && (
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button
                      onClick={() => startEdit(c)}
                      style={{
                        padding: "0.2rem 0.5rem",
                        backgroundColor: "transparent",
                        border: "1px solid var(--color-border)",
                        borderRadius: "4px",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        color: "var(--color-text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{
                        padding: "0.2rem 0.5rem",
                        backgroundColor: "transparent",
                        border: "1px solid var(--color-del-fg)",
                        borderRadius: "4px",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        color: "var(--color-del-fg)",
                        cursor: "pointer",
                      }}
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 新規追加フォーム */}
      {isAdding && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-accent)",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            marginBottom: "0.75rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              margin: "0 0 0.5rem",
            }}
          >
            条文の趣旨・要件・効果・判例・実務上の注意点などを解説してください。
          </p>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={8}
            placeholder="この条文の逐条解説を入力…"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.88rem",
              lineHeight: 1.8,
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "0.5rem",
            }}
          />
          {renderSourceEditor(newSources, setNewSources)}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginTop: "0.5rem",
            }}
          >
            <input
              type="text"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              placeholder="投稿者名（任意）"
              style={{
                padding: "0.35rem 0.6rem",
                border: "1px solid var(--color-border)",
                borderRadius: "5px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                backgroundColor: "var(--color-bg)",
                width: "160px",
              }}
            />
            {error && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-del-fg)",
                }}
              >
                {error}
              </span>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setError(null);
                }}
                style={{
                  padding: "0.35rem 0.75rem",
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "5px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                style={{
                  padding: "0.35rem 0.75rem",
                  backgroundColor: saving ? "var(--color-border)" : "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "保存中…" : "投稿する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
