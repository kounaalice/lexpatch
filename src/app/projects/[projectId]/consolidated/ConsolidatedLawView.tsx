"use client";
import { uuid } from "@/lib/uuid";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { textToCanonLines } from "@/lib/patch/directDiff";
import { sideBySideDiff } from "@/lib/patch/diff";
import type { SideBySideRow } from "@/lib/patch/types";
import { SideBySideView } from "@/components/diff/SideBySideView";
import type { CanonLine } from "@/lib/patch/apply";

// ─── Types ───────────────────────────────────────────

interface SourceRef {
  law_id: string;
  article_num: string;
  article_title: string;
}

interface ConsolidatedArticle {
  id: string;
  num: string;
  title: string;
  caption: string;
  text: string;
  source_refs: SourceRef[];
}

interface ConsolidatedBook {
  id: string;
  title: string;
  articles: ConsolidatedArticle[];
}

interface ConsolidatedLawData {
  id: string;
  project_id: string;
  title: string;
  law_num: string | null;
  description: string | null;
  books: ConsolidatedBook[];
  created_at: string;
  updated_at: string;
}

interface Props {
  projectId: string;
  projectTitle: string;
  initial: ConsolidatedLawData | null;
  lawIds: string[];
  lawTitleMap: Record<string, string>;
}

function generateId(): string {
  return uuid();
}

// 半角数字→全角数字
function toFullWidth(s: string): string {
  return s.replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
}

// 条文テキストをCanonLineに変換（表示用）
// autoRenumber は使わない（入力テキストの番号をそのまま表示する）
function textToDisplayLines(text: string): CanonLine[] {
  if (!text.trim()) return [];
  return textToCanonLines(text);
}

// ─── Main Component ──────────────────────────────────

export function ConsolidatedLawView({
  projectId,
  projectTitle,
  initial,
  lawIds,
  lawTitleMap,
}: Props) {
  const [data, setData] = useState<ConsolidatedLawData | null>(initial);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Create new consolidated law ───
  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/consolidated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title: projectTitle.replace(/プロジェクト.*$/, "").trim() + "法（仮称）",
        }),
      });
      if (res.ok) {
        const newData = await res.json();
        setData(newData);
      }
    } finally {
      setCreating(false);
    }
  }

  const [saveError, setSaveError] = useState<string | null>(null);

  // ─── Save books to API ───
  const saveBooks = useCallback(
    async (books: ConsolidatedBook[]) => {
      if (!data) return;
      setSaving(true);
      setSaveError(null);
      try {
        const res = await fetch("/api/consolidated", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.id, books }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          setSaveError(err.error ?? "保存に失敗しました");
        }
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "保存に失敗しました");
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  // ─── Save metadata ───
  const saveMeta = useCallback(
    async (updates: Partial<Pick<ConsolidatedLawData, "title" | "law_num" | "description">>) => {
      if (!data) return;
      setSaving(true);
      setSaveError(null);
      try {
        const res = await fetch("/api/consolidated", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.id, ...updates }),
        });
        if (res.ok) {
          const updated = await res.json();
          setData(updated);
        } else {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          setSaveError(err.error ?? "保存に失敗しました");
        }
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "保存に失敗しました");
      } finally {
        setSaving(false);
      }
    },
    [data],
  );

  // ─── Not yet created ───
  if (!data) {
    return (
      <div
        style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem", textAlign: "center" }}
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.25rem",
            color: "var(--color-text-primary)",
            marginBottom: "1rem",
          }}
        >
          法令案はまだ作成されていません
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          このプロジェクトの法令案を作成して、条文の執筆を始めましょう。
        </p>
        <button
          onClick={handleCreate}
          disabled={creating}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            fontWeight: 600,
            padding: "0.5rem 1.5rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            cursor: creating ? "wait" : "pointer",
            opacity: creating ? 0.6 : 1,
          }}
        >
          {creating ? "作成中..." : "法令案を作成する"}
        </button>
      </div>
    );
  }

  // ─── Main view ───
  return (
    <ConsolidatedLawEditor
      data={data}
      lawIds={lawIds}
      lawTitleMap={lawTitleMap}
      saving={saving}
      saveError={saveError}
      onSaveBooks={saveBooks}
      onSaveMeta={saveMeta}
    />
  );
}

// ─── Editor Component ────────────────────────────────

function ConsolidatedLawEditor({
  data,
  lawIds,
  lawTitleMap,
  saving,
  saveError,
  onSaveBooks,
  onSaveMeta,
}: {
  data: ConsolidatedLawData;
  lawIds: string[];
  lawTitleMap: Record<string, string>;
  saving: boolean;
  saveError: string | null;
  onSaveBooks: (books: ConsolidatedBook[]) => Promise<void>;
  onSaveMeta: (
    updates: Partial<Pick<ConsolidatedLawData, "title" | "law_num" | "description">>,
  ) => Promise<void>;
}) {
  const [books, setBooks] = useState<ConsolidatedBook[]>(data.books ?? []);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(data.title);
  const [descDraft, setDescDraft] = useState(data.description ?? "");
  const [editingDesc, setEditingDesc] = useState(false);

  // ─── View mode (edit / preview) ───
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const previewRef = useRef<HTMLDivElement>(null);

  // Track which article is being edited
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  // Track which article's source comparison is shown
  const [showSourceId, setShowSourceId] = useState<string | null>(null);
  const [sourceData, setSourceData] = useState<Record<string, CanonLine[]>>({});
  const [loadingSource, setLoadingSource] = useState<string | null>(null);

  // 全条文数
  const totalArticles = useMemo(
    () => books.reduce((sum, b) => sum + b.articles.length, 0),
    [books],
  );

  // ─── Book operations ───

  function addBook() {
    const num = books.length + 1;
    const kanji =
      ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"][num - 1] ?? String(num);
    const newBook: ConsolidatedBook = {
      id: generateId(),
      title: `第${kanji}編`,
      articles: [],
    };
    const updated = [...books, newBook];
    setBooks(updated);
    onSaveBooks(updated);
  }

  function updateBookTitle(bookId: string, title: string) {
    const updated = books.map((b) => (b.id === bookId ? { ...b, title } : b));
    setBooks(updated);
    onSaveBooks(updated);
  }

  function removeBook(bookId: string) {
    const updated = books.filter((b) => b.id !== bookId);
    setBooks(updated);
    onSaveBooks(updated);
  }

  // ─── Article operations ───

  function addArticle(bookId: string) {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    const articleNum = String(book.articles.length + 1);
    const kanji = numToKanji(parseInt(articleNum));
    const newArticle: ConsolidatedArticle = {
      id: generateId(),
      num: articleNum,
      title: `第${kanji}条`,
      caption: "",
      text: "",
      source_refs: [],
    };
    const updated = books.map((b) =>
      b.id === bookId ? { ...b, articles: [...b.articles, newArticle] } : b,
    );
    setBooks(updated);
    onSaveBooks(updated);
    // Open editor for new article
    setEditingArticleId(newArticle.id);
    setEditDraft("");
  }

  function startEditArticle(article: ConsolidatedArticle) {
    setEditingArticleId(article.id);
    setEditDraft(article.text);
  }

  function cancelEdit() {
    setEditingArticleId(null);
    setEditDraft("");
  }

  function saveArticle(bookId: string, articleId: string) {
    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      return {
        ...b,
        articles: b.articles.map((a) => (a.id === articleId ? { ...a, text: editDraft } : a)),
      };
    });
    setBooks(updated);
    onSaveBooks(updated);
    setEditingArticleId(null);
    setEditDraft("");
  }

  function updateArticleMeta(
    bookId: string,
    articleId: string,
    updates: Partial<Pick<ConsolidatedArticle, "title" | "caption" | "num">>,
  ) {
    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      return {
        ...b,
        articles: b.articles.map((a) => (a.id === articleId ? { ...a, ...updates } : a)),
      };
    });
    setBooks(updated);
    onSaveBooks(updated);
  }

  function removeArticle(bookId: string, articleId: string) {
    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      return { ...b, articles: b.articles.filter((a) => a.id !== articleId) };
    });
    setBooks(updated);
    onSaveBooks(updated);
  }

  // ─── Article reorder ───

  function moveArticle(bookId: string, articleId: string, direction: "up" | "down") {
    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      const idx = b.articles.findIndex((a) => a.id === articleId);
      if (idx < 0) return b;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= b.articles.length) return b;
      const arts = [...b.articles];
      [arts[idx], arts[newIdx]] = [arts[newIdx], arts[idx]];
      return { ...b, articles: arts };
    });
    setBooks(updated);
    onSaveBooks(updated);
  }

  // ─── Source reference operations ───

  function addSourceRef(bookId: string, articleId: string, ref: SourceRef) {
    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      return {
        ...b,
        articles: b.articles.map((a) =>
          a.id === articleId ? { ...a, source_refs: [...a.source_refs, ref] } : a,
        ),
      };
    });
    setBooks(updated);
    onSaveBooks(updated);
  }

  function removeSourceRef(bookId: string, articleId: string, refIdx: number) {
    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      return {
        ...b,
        articles: b.articles.map((a) =>
          a.id === articleId
            ? { ...a, source_refs: a.source_refs.filter((_, i) => i !== refIdx) }
            : a,
        ),
      };
    });
    setBooks(updated);
    onSaveBooks(updated);
  }

  // ─── Fetch source article text for comparison ───

  async function fetchSourceText(ref: SourceRef): Promise<CanonLine[]> {
    const key = `${ref.law_id}:${ref.article_num}`;
    if (sourceData[key]) return sourceData[key];

    setLoadingSource(key);
    try {
      const res = await fetch(`/api/egov/law/${encodeURIComponent(ref.law_id)}`);
      if (!res.ok) return [];
      const law = await res.json();

      // Find the article in the law
      const allArticles =
        law.chapters?.length > 0
          ? law.chapters.flatMap((ch: { articles: unknown[] }) => ch.articles)
          : (law.articles ?? []);

      const article = allArticles.find(
        (a: any) => a.num === ref.article_num || a.title === ref.article_title,
      );

      if (!article) return [];

      const lines: CanonLine[] = article.paragraphs.map(
        (p: { num: string; sentences: string[] }) => ({
          num: !p.num || p.num === "1" ? null : p.num,
          text: p.sentences.join(""),
        }),
      );

      setSourceData((prev) => ({ ...prev, [key]: lines }));
      return lines;
    } catch {
      return [];
    } finally {
      setLoadingSource(null);
    }
  }

  return (
    <>
      {/* タイトル部 */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1rem 2rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {editingTitle && viewMode === "edit" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  padding: "0.25rem 0.5rem",
                  flex: 1,
                  backgroundColor: "var(--color-surface)",
                }}
              />
              <button
                onClick={() => {
                  onSaveMeta({ title: titleDraft });
                  setEditingTitle(false);
                }}
                style={btnStyle("var(--color-accent)", "#fff")}
              >
                保存
              </button>
              <button
                onClick={() => {
                  setTitleDraft(data.title);
                  setEditingTitle(false);
                }}
                style={btnStyle("var(--color-border)", "var(--color-text-secondary)")}
              >
                取消
              </button>
            </div>
          ) : (
            <h1
              onClick={viewMode === "edit" ? () => setEditingTitle(true) : undefined}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.25rem",
                cursor: viewMode === "edit" ? "pointer" : "default",
              }}
              title={viewMode === "edit" ? "クリックして編集" : undefined}
            >
              {data.title}
            </h1>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "0.5rem",
            }}
          >
            {data.law_num && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                {data.law_num}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.1rem 0.45rem",
                borderRadius: "3px",
                backgroundColor: "#FEF3C7",
                border: "1px solid #F59E0B",
                color: "#92400E",
              }}
            >
              法令案
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {books.length} 編 / 全 {totalArticles} 条
            </span>

            {/* モード切替 */}
            <span style={{ display: "inline-flex", gap: 0, marginLeft: "0.5rem" }}>
              {(["edit", "preview"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: viewMode === m ? 700 : 400,
                    padding: "0.15rem 0.6rem",
                    border: `1px solid var(--color-border)`,
                    borderRight: m === "edit" ? "none" : undefined,
                    borderRadius: m === "edit" ? "4px 0 0 4px" : "0 4px 4px 0",
                    backgroundColor:
                      viewMode === m ? "var(--color-accent)" : "var(--color-surface)",
                    color: viewMode === m ? "#fff" : "var(--color-text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {m === "edit" ? "編集" : "プレビュー"}
                </button>
              ))}
            </span>

            {/* プレビュー時の出力ボタン群 */}
            {viewMode === "preview" && (
              <span style={{ display: "inline-flex", gap: "0.3rem", marginLeft: "0.5rem" }}>
                <button
                  onClick={() => handleCopyAll(data.title, books)}
                  style={exportBtnStyle}
                  title="全文をクリップボードにコピー"
                >
                  📋 コピー
                </button>
                <button
                  onClick={() => handleDownloadMd(data.title, data.law_num, books)}
                  style={exportBtnStyle}
                  title="Markdown形式でダウンロード"
                >
                  📝 MD
                </button>
                <button
                  onClick={() => handlePrint()}
                  style={exportBtnStyle}
                  title="ブラウザ印刷（PDF保存可）"
                >
                  🖨 印刷
                </button>
                <button onClick={() => handleShareUrl()} style={exportBtnStyle} title="URLをコピー">
                  🔗 共有
                </button>
              </span>
            )}

            {saving && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  opacity: 0.6,
                }}
              >
                保存中...
              </span>
            )}
            {saveError && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-del-fg)",
                  fontWeight: 600,
                }}
              >
                {saveError}
              </span>
            )}
          </div>

          {/* 概要 */}
          {editingDesc && viewMode === "edit" ? (
            <div style={{ marginBottom: "0.5rem" }}>
              <textarea
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  padding: "0.4rem",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  resize: "vertical",
                }}
              />
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                <button
                  onClick={() => {
                    onSaveMeta({ description: descDraft });
                    setEditingDesc(false);
                  }}
                  style={btnStyle("var(--color-accent)", "#fff")}
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setDescDraft(data.description ?? "");
                    setEditingDesc(false);
                  }}
                  style={btnStyle("var(--color-border)", "var(--color-text-secondary)")}
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={viewMode === "edit" ? () => setEditingDesc(true) : undefined}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: data.description
                  ? "var(--color-text-secondary)"
                  : viewMode === "edit"
                    ? "var(--color-border)"
                    : "transparent",
                marginBottom: "0.5rem",
                cursor: viewMode === "edit" ? "pointer" : "default",
                display: !data.description && viewMode === "preview" ? "none" : undefined,
              }}
              title={viewMode === "edit" ? "クリックして編集" : undefined}
            >
              {data.description || "概要を追加..."}
            </p>
          )}

          {/* プロジェクトへのリンク */}
          <Link
            href={`/projects/${data.project_id}`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-accent)",
              textDecoration: "none",
            }}
          >
            ← プロジェクトに戻る
          </Link>
        </div>
      </div>

      {/* プレビューモード */}
      {viewMode === "preview" && (
        <div
          ref={previewRef}
          style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 2rem 4rem" }}
        >
          {books.map((book) => (
            <section key={book.id} style={{ marginBottom: "2.5rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  borderBottom: "2px solid var(--color-accent)",
                  paddingBottom: "0.4rem",
                  marginBottom: "1.2rem",
                }}
              >
                {book.title}
              </h2>
              {book.articles.map((article) => {
                const lines = textToDisplayLines(article.text);
                return (
                  <div key={article.id} style={{ marginBottom: "1.5rem" }}>
                    {article.caption && (
                      <p
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "0.85rem",
                          color: "var(--color-text-secondary)",
                          textAlign: "center",
                          marginBottom: "0.15rem",
                        }}
                      >
                        {article.caption}
                      </p>
                    )}
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        marginBottom: "0.4rem",
                      }}
                    >
                      {article.title || `第${article.num}条`}
                    </h3>
                    {lines.length > 0 ? (
                      <div
                        style={{
                          fontSize: "0.88rem",
                          lineHeight: 2.1,
                          color: "var(--color-text-primary)",
                          fontFamily: "var(--font-serif)",
                        }}
                      >
                        {lines.map((line, i) => {
                          const isFirst = !line.num;
                          return (
                            <p
                              key={i}
                              style={{ margin: "0 0 0.15rem", textIndent: isFirst ? "1em" : 0 }}
                            >
                              {!isFirst && line.num && (
                                <span
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    marginRight: "0.4rem",
                                    color: "var(--color-text-secondary)",
                                    fontSize: "0.82rem",
                                  }}
                                >
                                  {toFullWidth(line.num)}
                                </span>
                              )}
                              {line.text}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--color-border)",
                          fontStyle: "italic",
                        }}
                      >
                        （条文未入力）
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          ))}
          {books.length === 0 && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              まだ編・条文がありません。「編集」モードで追加してください。
            </p>
          )}
        </div>
      )}

      {/* 編集モード — 編構成 + 条文 */}
      {viewMode === "edit" && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 2rem" }}>
          {books.map((book) => (
            <BookSection
              key={book.id}
              book={book}
              editingArticleId={editingArticleId}
              editDraft={editDraft}
              onEditDraft={setEditDraft}
              onStartEdit={startEditArticle}
              onCancelEdit={cancelEdit}
              onSaveArticle={(articleId) => saveArticle(book.id, articleId)}
              onAddArticle={() => addArticle(book.id)}
              onRemoveArticle={(articleId) => removeArticle(book.id, articleId)}
              onMoveArticle={(articleId, dir) => moveArticle(book.id, articleId, dir)}
              onUpdateArticleMeta={(articleId, updates) =>
                updateArticleMeta(book.id, articleId, updates)
              }
              onUpdateBookTitle={(title) => updateBookTitle(book.id, title)}
              onRemoveBook={() => removeBook(book.id)}
              onAddSourceRef={(articleId, ref) => addSourceRef(book.id, articleId, ref)}
              onRemoveSourceRef={(articleId, idx) => removeSourceRef(book.id, articleId, idx)}
              showSourceId={showSourceId}
              onToggleSource={setShowSourceId}
              sourceData={sourceData}
              loadingSource={loadingSource}
              onFetchSource={fetchSourceText}
              lawIds={lawIds}
              lawTitleMap={lawTitleMap}
            />
          ))}

          {/* 編を追加 */}
          <button
            onClick={addBook}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              fontWeight: 600,
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "1px dashed var(--color-border)",
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              width: "100%",
              marginTop: "1rem",
            }}
          >
            + 編を追加
          </button>
        </div>
      )}
    </>
  );
}

// ─── Book Section ────────────────────────────────────

function BookSection({
  book,
  editingArticleId,
  editDraft,
  onEditDraft,
  onStartEdit,
  onCancelEdit,
  onSaveArticle,
  onAddArticle,
  onRemoveArticle,
  onMoveArticle,
  onUpdateArticleMeta,
  onUpdateBookTitle,
  onRemoveBook,
  onAddSourceRef,
  onRemoveSourceRef,
  showSourceId,
  onToggleSource,
  sourceData,
  loadingSource,
  onFetchSource,
  lawIds,
  lawTitleMap,
}: {
  book: ConsolidatedBook;
  editingArticleId: string | null;
  editDraft: string;
  onEditDraft: (text: string) => void;
  onStartEdit: (article: ConsolidatedArticle) => void;
  onCancelEdit: () => void;
  onSaveArticle: (articleId: string) => void;
  onAddArticle: () => void;
  onRemoveArticle: (articleId: string) => void;
  onMoveArticle: (articleId: string, direction: "up" | "down") => void;
  onUpdateArticleMeta: (
    articleId: string,
    updates: Partial<Pick<ConsolidatedArticle, "title" | "caption" | "num">>,
  ) => void;
  onUpdateBookTitle: (title: string) => void;
  onRemoveBook: () => void;
  onAddSourceRef: (articleId: string, ref: SourceRef) => void;
  onRemoveSourceRef: (articleId: string, idx: number) => void;
  showSourceId: string | null;
  onToggleSource: (id: string | null) => void;
  sourceData: Record<string, CanonLine[]>;
  loadingSource: string | null;
  onFetchSource: (ref: SourceRef) => Promise<CanonLine[]>;
  lawIds: string[];
  lawTitleMap: Record<string, string>;
}) {
  const [editingBookTitle, setEditingBookTitle] = useState(false);
  const [bookTitleDraft, setBookTitleDraft] = useState(book.title);

  return (
    <section style={{ marginBottom: "2rem" }}>
      {/* 編タイトル */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid var(--color-accent)",
          paddingBottom: "0.4rem",
          marginBottom: "1rem",
        }}
      >
        {editingBookTitle ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
            <input
              value={bookTitleDraft}
              onChange={(e) => setBookTitleDraft(e.target.value)}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                padding: "0.15rem 0.4rem",
                flex: 1,
                backgroundColor: "var(--color-surface)",
              }}
            />
            <button
              onClick={() => {
                onUpdateBookTitle(bookTitleDraft);
                setEditingBookTitle(false);
              }}
              style={btnStyle("var(--color-accent)", "#fff")}
            >
              OK
            </button>
          </div>
        ) : (
          <h2
            onClick={() => setEditingBookTitle(true)}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
            title="クリックして編集"
          >
            {book.title}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                fontWeight: 400,
                color: "var(--color-text-secondary)",
                marginLeft: "0.5rem",
              }}
            >
              {book.articles.length} 条
            </span>
          </h2>
        )}
        <button
          onClick={onRemoveBook}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.68rem",
            color: "var(--color-del-fg)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.2rem 0.4rem",
            opacity: 0.6,
          }}
          title="この編を削除"
        >
          削除
        </button>
      </div>

      {/* 条文一覧 */}
      {book.articles.map((article, idx) => (
        <ArticleBlock
          key={article.id}
          article={article}
          bookId={book.id}
          isEditing={editingArticleId === article.id}
          editDraft={editDraft}
          onEditDraft={onEditDraft}
          onStartEdit={() => onStartEdit(article)}
          onCancelEdit={onCancelEdit}
          onSave={() => onSaveArticle(article.id)}
          onRemove={() => onRemoveArticle(article.id)}
          onMoveUp={idx > 0 ? () => onMoveArticle(article.id, "up") : undefined}
          onMoveDown={
            idx < book.articles.length - 1 ? () => onMoveArticle(article.id, "down") : undefined
          }
          onUpdateMeta={(updates) => onUpdateArticleMeta(article.id, updates)}
          onAddSourceRef={(ref) => onAddSourceRef(article.id, ref)}
          onRemoveSourceRef={(idx) => onRemoveSourceRef(article.id, idx)}
          showSource={showSourceId === article.id}
          onToggleSource={() => onToggleSource(showSourceId === article.id ? null : article.id)}
          sourceData={sourceData}
          loadingSource={loadingSource}
          onFetchSource={onFetchSource}
          lawIds={lawIds}
          lawTitleMap={lawTitleMap}
        />
      ))}

      {/* 条文を追加 */}
      <button
        onClick={onAddArticle}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
          padding: "0.35rem 0.75rem",
          borderRadius: "4px",
          border: "1px dashed var(--color-border)",
          backgroundColor: "transparent",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          marginTop: "0.5rem",
        }}
      >
        + 条文を追加
      </button>
    </section>
  );
}

// ─── Article Block ───────────────────────────────────

function ArticleBlock({
  article,
  isEditing,
  editDraft,
  onEditDraft,
  onStartEdit,
  onCancelEdit,
  onSave,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdateMeta,
  onAddSourceRef,
  onRemoveSourceRef,
  showSource,
  onToggleSource,
  sourceData,
  loadingSource,
  onFetchSource,
  lawIds,
  lawTitleMap,
}: {
  article: ConsolidatedArticle;
  bookId: string;
  isEditing: boolean;
  editDraft: string;
  onEditDraft: (text: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onUpdateMeta: (updates: Partial<Pick<ConsolidatedArticle, "title" | "caption" | "num">>) => void;
  onAddSourceRef: (ref: SourceRef) => void;
  onRemoveSourceRef: (idx: number) => void;
  showSource: boolean;
  onToggleSource: () => void;
  sourceData: Record<string, CanonLine[]>;
  loadingSource: string | null;
  onFetchSource: (ref: SourceRef) => Promise<CanonLine[]>;
  lawIds: string[];
  lawTitleMap: Record<string, string>;
}) {
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaDraft, setMetaDraft] = useState({ title: article.title, caption: article.caption });
  const [showRefForm, setShowRefForm] = useState(false);
  const [refLawId, setRefLawId] = useState(lawIds[0] ?? "");
  const [refArticleNum, setRefArticleNum] = useState("");
  const [refArticleTitle, setRefArticleTitle] = useState("");

  // Parse article text for display
  const displayLines = useMemo(() => textToDisplayLines(article.text), [article.text]);

  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        marginBottom: "0.5rem",
        backgroundColor: "var(--color-surface)",
        border: `1px solid ${isEditing ? "var(--color-accent)" : "var(--color-border)"}`,
        borderRadius: "6px",
      }}
    >
      {/* 条文ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.35rem",
        }}
      >
        {editingMeta ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1 }}>
            <input
              value={metaDraft.title}
              onChange={(e) => setMetaDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="第○条"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.88rem",
                fontWeight: 700,
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                padding: "0.15rem 0.4rem",
                width: "8rem",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
              }}
            />
            <input
              value={metaDraft.caption}
              onChange={(e) => setMetaDraft((prev) => ({ ...prev, caption: e.target.value }))}
              placeholder="（見出し）"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                padding: "0.15rem 0.4rem",
                flex: 1,
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
              }}
            />
            <button
              onClick={() => {
                onUpdateMeta(metaDraft);
                setEditingMeta(false);
              }}
              style={btnStyle("var(--color-accent)", "#fff")}
            >
              OK
            </button>
            <button
              onClick={() => {
                setMetaDraft({ title: article.title, caption: article.caption });
                setEditingMeta(false);
              }}
              style={btnStyle("var(--color-border)", "var(--color-text-secondary)")}
            >
              取消
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              onClick={() => setEditingMeta(true)}
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: "0.88rem",
                color: "var(--color-text-primary)",
                cursor: "pointer",
              }}
              title="クリックして編集"
            >
              {article.title || `第${article.num}条`}
            </span>
            {article.caption && (
              <span
                onClick={() => setEditingMeta(true)}
                style={{
                  fontWeight: 400,
                  color: "var(--color-text-secondary)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                {article.caption}
              </span>
            )}
          </div>
        )}

        {/* アクションボタン */}
        {!editingMeta && (
          <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
            {/* 並べ替え */}
            {onMoveUp && (
              <button
                onClick={onMoveUp}
                title="上へ移動"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.1rem 0.25rem",
                  lineHeight: 1,
                }}
              >
                ▲
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={onMoveDown}
                title="下へ移動"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.1rem 0.25rem",
                  lineHeight: 1,
                }}
              >
                ▼
              </button>
            )}
            {(onMoveUp || onMoveDown) && (
              <span
                style={{
                  width: "1px",
                  height: "0.8rem",
                  backgroundColor: "var(--color-border)",
                  margin: "0 0.15rem",
                }}
              />
            )}
            {article.source_refs.length > 0 && (
              <button
                onClick={onToggleSource}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.68rem",
                  color: showSource ? "var(--color-accent)" : "var(--color-text-secondary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.15rem 0.35rem",
                }}
              >
                {showSource ? "対照を閉じる" : "新旧対照"}
              </button>
            )}
            {!isEditing && (
              <button
                onClick={onStartEdit}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.68rem",
                  color: "var(--color-accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.15rem 0.35rem",
                }}
              >
                編集
              </button>
            )}
            <button
              onClick={onRemove}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                color: "var(--color-del-fg)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.15rem 0.35rem",
                opacity: 0.6,
              }}
            >
              削除
            </button>
          </div>
        )}
      </div>

      {/* 条文テキスト表示（非編集時） */}
      {!isEditing && displayLines.length > 0 && (
        <div
          style={{
            fontSize: "0.82rem",
            lineHeight: 1.8,
            color: "var(--color-text-primary)",
            marginBottom: "0.25rem",
          }}
        >
          {displayLines.map((line, i) => {
            const isFirst = !line.num;
            return (
              <p key={i} style={{ margin: "0 0 0.1rem" }}>
                {!isFirst && line.num && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      marginRight: "0.4rem",
                      color: "var(--color-text-secondary)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {toFullWidth(line.num)}
                  </span>
                )}
                {line.text}
              </p>
            );
          })}
        </div>
      )}

      {!isEditing && displayLines.length === 0 && (
        <p style={{ fontSize: "0.78rem", color: "var(--color-border)", fontStyle: "italic" }}>
          （条文未入力 — 「編集」をクリック）
        </p>
      )}

      {/* 編集モード */}
      {isEditing && (
        <div
          style={{
            borderTop: "1px solid var(--color-accent)",
            paddingTop: "0.5rem",
            marginTop: "0.25rem",
          }}
        >
          <textarea
            value={editDraft}
            onChange={(e) => onEditDraft(e.target.value)}
            rows={10}
            placeholder={
              "　この法律は、労働条件の最低基準を...\n２　労働条件は、労働者と使用者が..."
            }
            style={{
              width: "100%",
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              lineHeight: 1.7,
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              padding: "0.5rem",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-primary)",
              resize: "vertical",
            }}
          />

          {/* 引用元の追加 */}
          <div style={{ marginTop: "0.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginBottom: "0.35rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              >
                引用元現行条文:
              </span>
              {article.source_refs.map((ref, idx) => (
                <span
                  key={idx}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.68rem",
                    padding: "0.1rem 0.35rem",
                    borderRadius: "3px",
                    backgroundColor: "var(--color-add-bg)",
                    color: "var(--color-accent)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  {lawTitleMap[ref.law_id]
                    ? lawTitleMap[ref.law_id].substring(0, 8)
                    : ref.law_id.substring(0, 8)}
                  ... {ref.article_title}
                  <button
                    onClick={() => onRemoveSourceRef(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-del-fg)",
                      fontSize: "0.68rem",
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => setShowRefForm(!showRefForm)}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.68rem",
                  color: "var(--color-accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + 追加
              </button>
            </div>

            {showRefForm && (
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                  padding: "0.4rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "4px",
                }}
              >
                <select
                  value={refLawId}
                  onChange={(e) => setRefLawId(e.target.value)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    padding: "0.2rem 0.4rem",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {lawIds.map((id) => (
                    <option key={id} value={id}>
                      {lawTitleMap[id] ?? id}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="条文番号 (例: 1)"
                  value={refArticleNum}
                  onChange={(e) => setRefArticleNum(e.target.value)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    padding: "0.2rem 0.4rem",
                    width: "8rem",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <input
                  placeholder="第一条"
                  value={refArticleTitle}
                  onChange={(e) => setRefArticleTitle(e.target.value)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    padding: "0.2rem 0.4rem",
                    width: "8rem",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <button
                  onClick={() => {
                    if (refLawId && (refArticleNum || refArticleTitle)) {
                      onAddSourceRef({
                        law_id: refLawId,
                        article_num: refArticleNum,
                        article_title:
                          refArticleTitle || `第${numToKanji(parseInt(refArticleNum) || 1)}条`,
                      });
                      setRefArticleNum("");
                      setRefArticleTitle("");
                      setShowRefForm(false);
                    }
                  }}
                  style={btnStyle("var(--color-accent)", "#fff")}
                >
                  追加
                </button>
              </div>
            )}
          </div>

          {/* 保存/キャンセル */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.5rem",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "0.5rem",
            }}
          >
            <button onClick={onSave} style={btnStyle("var(--color-accent)", "#fff")}>
              保存
            </button>
            <button
              onClick={onCancelEdit}
              style={btnStyle("var(--color-border)", "var(--color-text-secondary)")}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 新旧対照表 */}
      {showSource && article.source_refs.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          {article.source_refs.map((ref, idx) => (
            <SourceComparison
              key={idx}
              ref_={ref}
              articleText={article.text}
              sourceData={sourceData}
              loadingSource={loadingSource}
              onFetchSource={onFetchSource}
              lawTitleMap={lawTitleMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Source Comparison ───────────────────────────────

function SourceComparison({
  ref_,
  articleText,
  sourceData,
  loadingSource,
  onFetchSource,
  lawTitleMap,
}: {
  ref_: SourceRef;
  articleText: string;
  sourceData: Record<string, CanonLine[]>;
  loadingSource: string | null;
  onFetchSource: (ref: SourceRef) => Promise<CanonLine[]>;
  lawTitleMap: Record<string, string>;
}) {
  const key = `${ref_.law_id}:${ref_.article_num}`;
  const sourceLinesRaw = sourceData[key];
  const isLoading = loadingSource === key;

  // Auto-fetch on mount
  const [fetched, setFetched] = useState(false);
  if (!fetched && !sourceLinesRaw && !isLoading) {
    setFetched(true);
    onFetchSource(ref_);
  }

  const rows = useMemo((): SideBySideRow[] => {
    if (!sourceLinesRaw) return [];
    const editedLines = textToDisplayLines(articleText);
    return sideBySideDiff(sourceLinesRaw, editedLines).rows;
  }, [sourceLinesRaw, articleText]);

  const lawName = lawTitleMap[ref_.law_id] ?? ref_.law_id;

  return (
    <div
      style={{
        marginBottom: "0.5rem",
        border: "1px solid var(--color-border)",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0.3rem 0.5rem",
          backgroundColor: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          fontFamily: "var(--font-sans)",
          fontSize: "0.72rem",
          color: "var(--color-text-secondary)",
        }}
      >
        引用元: {lawName} {ref_.article_title}
      </div>
      {isLoading && (
        <div
          style={{ padding: "0.5rem", fontSize: "0.78rem", color: "var(--color-text-secondary)" }}
        >
          読み込み中...
        </div>
      )}
      {!isLoading && rows.length > 0 && (
        <SideBySideView
          rows={rows}
          leftHeader={`現行 — ${lawName.substring(0, 10)}`}
          rightHeader="法令案"
        />
      )}
      {!isLoading && rows.length === 0 && sourceLinesRaw && (
        <div
          style={{ padding: "0.5rem", fontSize: "0.78rem", color: "var(--color-text-secondary)" }}
        >
          条文が見つかりませんでした
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-sans)",
    fontSize: "0.72rem",
    fontWeight: 600,
    padding: "0.2rem 0.6rem",
    borderRadius: "4px",
    border: "none",
    backgroundColor: bg,
    color,
    cursor: "pointer",
  };
}

// ─── Export / Share helpers ──────────────────────────

const exportBtnStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.68rem",
  fontWeight: 600,
  padding: "0.15rem 0.5rem",
  borderRadius: "4px",
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
};

function booksToPlainText(title: string, books: ConsolidatedBook[]): string {
  const lines: string[] = [title, ""];
  for (const book of books) {
    lines.push(book.title, "");
    for (const art of book.articles) {
      if (art.caption) lines.push(`（${art.caption.replace(/[（）()]/g, "")}）`);
      lines.push(art.title || `第${art.num}条`);
      const parsed = textToDisplayLines(art.text);
      for (const l of parsed) {
        const prefix = l.num ? `${toFullWidth(l.num)}　` : "　";
        lines.push(prefix + l.text);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

function booksToMarkdown(title: string, lawNum: string | null, books: ConsolidatedBook[]): string {
  const lines: string[] = [`# ${title}`];
  if (lawNum) lines.push(`\n*${lawNum}*`);
  lines.push("");
  for (const book of books) {
    lines.push(`## ${book.title}`, "");
    for (const art of book.articles) {
      if (art.caption) lines.push(`*${art.caption}*`);
      lines.push(`### ${art.title || `第${art.num}条`}`, "");
      const parsed = textToDisplayLines(art.text);
      for (const l of parsed) {
        const prefix = l.num ? `**${toFullWidth(l.num)}**　` : "";
        lines.push(prefix + l.text);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

async function handleCopyAll(title: string, books: ConsolidatedBook[]) {
  const text = booksToPlainText(title, books);
  try {
    await navigator.clipboard.writeText(text);
    alert("全文をコピーしました");
  } catch {
    alert("コピーに失敗しました");
  }
}

function handleDownloadMd(title: string, lawNum: string | null, books: ConsolidatedBook[]) {
  const md = booksToMarkdown(title, lawNum, books);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[\\/:*?"<>|]/g, "_")}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function handlePrint() {
  window.print();
}

async function handleShareUrl() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    alert("URLをコピーしました");
  } catch {
    alert("URLのコピーに失敗しました");
  }
}

function numToKanji(n: number): string {
  const digits = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const tens = ["", "十", "二十", "三十", "四十", "五十", "六十", "七十", "八十", "九十"];
  const hundreds = ["", "百", "二百", "三百", "四百", "五百", "六百", "七百", "八百", "九百"];

  if (n <= 0 || n >= 1000) return String(n);

  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const d = n % 10;

  return hundreds[h] + tens[t] + digits[d];
}
