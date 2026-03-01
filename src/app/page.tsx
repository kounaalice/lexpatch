"use client";

import { useState } from "react";
import Link from "next/link";
import type { LawSearchResult } from "@/lib/egov/types";
import { CATEGORY_GROUPS, LAW_CATEGORIES } from "@/lib/categories";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LawSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/egov/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "検索エラー");
      setResults(data.laws ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>

      {/* ヒーロー + 検索 */}
      <div style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "2rem",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
            color: "var(--color-text-primary)",
            lineHeight: 1.4,
            marginBottom: "0.5rem",
          }}>
            逐条パッチ記法で法令改正案を提案・議論する
          </h1>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}>
            e-Gov法令データから現行法を取得し、+/− 記法で改正案を作成・議論できます
          </p>

          {/* 検索フォーム */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", maxWidth: "520px", margin: "0 auto" }}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="法令名で検索（例：民法、労働基準法）"
              style={{
                flex: 1,
                padding: "0.7rem 1rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.7rem 1.25rem",
                backgroundColor: loading ? "var(--color-text-secondary)" : "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "検索中…" : "検索"}
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem 1.5rem" }}>

        {/* 検索結果 */}
        {searched && (
          <section style={{ marginBottom: "2rem" }}>
            {error && (
              <div style={{
                padding: "0.75rem 1rem",
                backgroundColor: "var(--color-del-bg)",
                border: "1px solid var(--color-del-fg)",
                borderRadius: "6px",
                color: "var(--color-del-fg)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}>
                {error}
              </div>
            )}
            {!loading && !error && results.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>
                「{query}」に該当する法令が見つかりませんでした。
              </p>
            )}
            {results.length > 0 && (
              <>
                <h2 style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "0.75rem",
                }}>
                  「{query}」の検索結果 {results.length} 件
                </h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "0.5rem",
                }}>
                  {results.map((law) => (
                    <LawCard key={law.law_id} law={law} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* 50分野ポータル */}
        <section>
          <h2 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <span style={{
              display: "inline-block",
              width: "4px",
              height: "1rem",
              backgroundColor: "var(--color-accent)",
              borderRadius: "2px",
            }} />
            法令分野から探す
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {CATEGORY_GROUPS.map((group) => {
              const cats = LAW_CATEGORIES.filter((c) => c.group.id === group.id);
              return (
                <div key={group.id}>
                  {/* グループヘッダ */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.6rem",
                  }}>
                    <span style={{
                      display: "inline-block",
                      padding: "0.15rem 0.6rem",
                      backgroundColor: group.bg,
                      color: group.color,
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      border: `1px solid ${group.color}33`,
                    }}>
                      {group.label}
                    </span>
                  </div>

                  {/* カテゴリカード */}
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.4rem",
                  }}>
                    {cats.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        style={{
                          display: "inline-block",
                          padding: "0.4rem 0.85rem",
                          backgroundColor: "var(--color-surface)",
                          border: `1px solid var(--color-border)`,
                          borderRadius: "20px",
                          textDecoration: "none",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                          color: "var(--color-text-primary)",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = group.bg;
                          e.currentTarget.style.borderColor = group.color;
                          e.currentTarget.style.color = group.color;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--color-surface)";
                          e.currentTarget.style.borderColor = "var(--color-border)";
                          e.currentTarget.style.color = "var(--color-text-primary)";
                        }}
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function LawCard({ law }: { law: LawSearchResult }) {
  return (
    <Link
      href={`/law/${encodeURIComponent(law.law_id)}`}
      style={{
        display: "block",
        padding: "0.75rem 1rem",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        textDecoration: "none",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
    >
      <div style={{
        fontFamily: "var(--font-serif)",
        fontSize: "0.95rem",
        fontWeight: 700,
        color: "var(--color-text-primary)",
        marginBottom: "0.2rem",
      }}>
        {law.law_title || "（タイトルなし）"}
      </div>
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.78rem",
        color: "var(--color-text-secondary)",
      }}>
        {law.law_num}
      </div>
    </Link>
  );
}
