"use client";

import { useState, useCallback } from "react";
import { SideBySideView } from "@/components/diff/SideBySideView";
import type { SideBySideRow } from "@/lib/patch/types";
import Link from "next/link";

interface ArticleData {
  lawTitle: string;
  lawId: string;
  articleNum: string;
  articleTitle: string;
  lines: string[];
}

// ─── 条文比較ページ ───────────────────────────────────
export default function ComparePage() {
  const [left, setLeft] = useState<ArticleData | null>(null);
  const [right, setRight] = useState<ArticleData | null>(null);
  const [diffRows, setDiffRows] = useState<SideBySideRow[] | null>(null);
  const [diffStats, setDiffStats] = useState<{
    added: number;
    deleted: number;
    unchanged: number;
  } | null>(null);
  const [comparing, setComparing] = useState(false);

  const handleCompare = useCallback(async () => {
    if (!left || !right) return;
    setComparing(true);
    try {
      // diff を API 経由ではなくクライアントで計算（軽量）
      const { sideBySideDiff } = await import("@/lib/patch/diff");
      const leftCanon = left.lines.map((text, i) => ({
        num: String(i + 1),
        text,
        sentences: [text],
      }));
      const rightCanon = right.lines.map((text, i) => ({
        num: String(i + 1),
        text,
        sentences: [text],
      }));
      const result = sideBySideDiff(leftCanon, rightCanon);
      setDiffRows(result.rows);
      setDiffStats(result.stats);
    } catch {
      alert("比較に失敗しました");
    } finally {
      setComparing(false);
    }
  }, [left, right]);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <Link
            href="/"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            ← 検索に戻る
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              color: "var(--color-text-primary)",
              marginTop: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            条文比較
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
            }}
          >
            異なる法令の条文や、同一法令の異なる条文を横並びで比較できます。
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        {/* 条文選択パネル（2カラム） */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <ArticleSelector
            label="左（比較元）"
            value={left}
            onChange={(v) => {
              setLeft(v);
              setDiffRows(null);
            }}
          />
          <ArticleSelector
            label="右（比較先）"
            value={right}
            onChange={(v) => {
              setRight(v);
              setDiffRows(null);
            }}
          />
        </div>

        {/* 比較ボタン */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <button
            onClick={handleCompare}
            disabled={!left || !right || comparing}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.88rem",
              fontWeight: 700,
              padding: "0.5rem 2rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: left && right ? "var(--color-accent)" : "var(--color-border)",
              color: left && right ? "#fff" : "var(--color-text-secondary)",
              cursor: left && right && !comparing ? "pointer" : "not-allowed",
              transition: "background-color 0.15s",
            }}
          >
            {comparing ? "比較中..." : "比較する"}
          </button>
        </div>

        {/* 差分結果 */}
        {diffRows && diffStats && left && right && (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "0.75rem 1rem",
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-primary)",
                  fontWeight: 700,
                }}
              >
                比較結果
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                追加: <strong style={{ color: "var(--color-add-fg)" }}>{diffStats.added}</strong>
                削除: <strong style={{ color: "var(--color-del-fg)" }}>{diffStats.deleted}</strong>
                一致: {diffStats.unchanged}
              </span>
            </div>
            <SideBySideView
              rows={diffRows}
              leftHeader={`${left.lawTitle} ${left.articleTitle}`}
              rightHeader={`${right.lawTitle} ${right.articleTitle}`}
            />
          </div>
        )}

        {diffRows && diffStats && diffStats.added === 0 && diffStats.deleted === 0 && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontFamily: "var(--font-sans)",
              fontSize: "0.88rem",
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-surface)",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
            }}
          >
            条文の内容は同一です。差分はありません。
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 条文選択コンポーネント ───────────────────────────
function ArticleSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ArticleData | null;
  onChange: (v: ArticleData | null) => void;
}) {
  const [lawQuery, setLawQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ lawId: string; lawTitle: string; lawNum: string }>
  >([]);
  const [selectedLaw, setSelectedLaw] = useState<{ lawId: string; lawTitle: string } | null>(null);
  const [articles, setArticles] = useState<Array<{ num: string; title: string; lines: string[] }>>(
    [],
  );
  const [searching, setSearching] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const searchLaws = async () => {
    if (!lawQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/egov/search?q=${encodeURIComponent(lawQuery.trim())}&limit=8`);
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();
      // API returns law_id/law_title/law_num (snake_case) → map to camelCase
      const mapped = (data.laws ?? []).map((l: Record<string, string>) => ({
        lawId: l.law_id,
        lawTitle: l.law_title,
        lawNum: l.law_num,
      }));
      setSearchResults(mapped);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectLaw = async (lawId: string, lawTitle: string) => {
    setSelectedLaw({ lawId, lawTitle });
    setSearchResults([]);
    setLoadingArticles(true);
    try {
      const res = await fetch(`/api/egov/law/${encodeURIComponent(lawId)}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      // articles を抽出
      const arts: Array<{ num: string; title: string; lines: string[] }> = [];
      const extractArticles = (
        chapters: Array<{
          articles: Array<{
            num: string;
            title: string;
            paragraphs: Array<{ sentences: string[] }>;
          }>;
        }>,
        directArticles: Array<{
          num: string;
          title: string;
          paragraphs: Array<{ sentences: string[] }>;
        }>,
      ) => {
        const all = chapters.length > 0 ? chapters.flatMap((ch) => ch.articles) : directArticles;
        for (const a of all) {
          arts.push({
            num: a.num,
            title: a.title || `第${a.num}条`,
            lines: a.paragraphs.flatMap((p) => p.sentences),
          });
        }
      };
      extractArticles(data.chapters ?? [], data.articles ?? []);
      setArticles(arts);
    } catch {
      setArticles([]);
    } finally {
      setLoadingArticles(false);
    }
  };

  const selectArticle = (art: { num: string; title: string; lines: string[] }) => {
    if (!selectedLaw) return;
    onChange({
      lawTitle: selectedLaw.lawTitle,
      lawId: selectedLaw.lawId,
      articleNum: art.num,
      articleTitle: art.title,
      lines: art.lines,
    });
  };

  const reset = () => {
    setSelectedLaw(null);
    setArticles([]);
    setSearchResults([]);
    setLawQuery("");
    onChange(null);
  };

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </h3>

      {/* 選択済み表示 */}
      {value ? (
        <div>
          <div
            style={{
              padding: "0.5rem",
              backgroundColor: "var(--color-bg)",
              borderRadius: "6px",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {value.lawTitle}
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.92rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {value.articleTitle}
            </div>
          </div>
          <button
            onClick={reset}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            変更する
          </button>
        </div>
      ) : selectedLaw ? (
        /* 条文選択 */
        <div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}
          >
            {selectedLaw.lawTitle}
            <button
              onClick={reset}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                color: "var(--color-accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: "0.5rem",
              }}
            >
              戻る
            </button>
          </div>
          {loadingArticles ? (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
                padding: "0.5rem 0",
              }}
            >
              条文を取得中...
            </div>
          ) : (
            <div style={{ maxHeight: "240px", overflow: "auto" }}>
              {articles.map((a) => (
                <button
                  key={a.num}
                  onClick={() => selectArticle(a)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.35rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    color: "var(--color-text-primary)",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--color-border)",
                    cursor: "pointer",
                  }}
                >
                  {a.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 法令検索 */
        <div>
          <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.5rem" }}>
            <input
              type="text"
              value={lawQuery}
              onChange={(e) => setLawQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchLaws()}
              placeholder="法令名を検索..."
              style={{
                flex: 1,
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                padding: "0.35rem 0.5rem",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            />
            <button
              onClick={searchLaws}
              disabled={searching}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                padding: "0.35rem 0.75rem",
                border: "1px solid var(--color-accent)",
                borderRadius: "4px",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                cursor: searching ? "wait" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {searching ? "..." : "検索"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ maxHeight: "200px", overflow: "auto" }}>
              {searchResults.map((law) => (
                <button
                  key={law.lawId}
                  onClick={() => selectLaw(law.lawId, law.lawTitle)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.35rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    color: "var(--color-text-primary)",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--color-border)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{law.lawTitle}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary)" }}>
                    {law.lawNum}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
