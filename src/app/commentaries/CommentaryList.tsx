"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type _SourceTier = "一次" | "準一次" | "二次" | "三次";

interface CommentarySource {
  tier: string;
  label: string;
  url: string;
}

const TIER_COLORS: Record<string, { fg: string; bg: string }> = {
  一次: { fg: "var(--color-accent)", bg: "var(--color-add-bg)" },
  準一次: { fg: "#1B4B8A", bg: "#EBF2FD" },
  二次: { fg: "var(--color-warn-fg)", bg: "var(--color-warn-bg)" },
  三次: { fg: "var(--color-text-secondary)", bg: "var(--color-bg)" },
};

interface CommentaryRow {
  id: string;
  law_id: string;
  article_title: string;
  content: string;
  author_name: string | null;
  sources: CommentarySource[];
  created_at: string;
  updated_at: string;
}

interface LawGroup {
  law_id: string;
  law_title: string | null;
  commentaries: CommentaryRow[];
}

const PER_PAGE = 10; // 法令グループ単位

export function CommentaryList({ groups, total }: { groups: LawGroup[]; total: number }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => {
        const lawMatch = (g.law_title ?? g.law_id).toLowerCase().includes(q);
        if (lawMatch) return g;
        const matchedCommentaries = g.commentaries.filter(
          (c) =>
            c.article_title.toLowerCase().includes(q) ||
            c.content.toLowerCase().includes(q) ||
            (c.author_name ?? "").toLowerCase().includes(q),
        );
        if (matchedCommentaries.length === 0) return null;
        return { ...g, commentaries: matchedCommentaries };
      })
      .filter(Boolean) as LawGroup[];
  }, [groups, query]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const filteredCount = filtered.reduce((n, g) => n + g.commentaries.length, 0);

  function groupByArticle(items: CommentaryRow[]) {
    const map = new Map<string, CommentaryRow[]>();
    for (const c of items) {
      if (!map.has(c.article_title)) map.set(c.article_title, []);
      map.get(c.article_title)!.push(c);
    }
    return map;
  }

  return (
    <>
      {/* 検索バー */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="法令名・条文・著者名で検索…"
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "0.55rem 0.85rem",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.88rem",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            outline: "none",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            whiteSpace: "nowrap",
          }}
        >
          {query ? `${filteredCount} / ${total} 件` : `${total} 件`}
        </span>
      </div>

      {/* 結果 */}
      {paged.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              color: "var(--color-text-secondary)",
            }}
          >
            {query ? "検索結果がありません" : "まだ逐条解説がありません"}
          </p>
          {!query && (
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: "1rem",
                padding: "0.6rem 1.5rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              法令を検索する →
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {paged.map((g) => {
            const articleGroups = groupByArticle(g.commentaries);
            return (
              <section key={g.law_id}>
                {/* 法令ヘッダー */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid var(--color-border)",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`/law/${encodeURIComponent(g.law_id)}`}
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      textDecoration: "none",
                      flexGrow: 1,
                    }}
                  >
                    {g.law_title ?? g.law_id}
                  </Link>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      padding: "0.1rem 0.4rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g.commentaries.length} 件
                  </span>
                </div>

                {/* 条文ごと */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {Array.from(articleGroups.entries()).map(([articleKey, items]) => (
                    <div
                      key={articleKey}
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "var(--color-bg)",
                          borderBottom: "1px solid var(--color-border)",
                          fontFamily: "var(--font-serif)",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: "var(--color-text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{articleKey}</span>
                        <Link
                          href={`/law/${encodeURIComponent(g.law_id)}/article/${encodeURIComponent(articleKey)}`}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            color: "var(--color-accent)",
                            textDecoration: "none",
                          }}
                        >
                          条文を見る →
                        </Link>
                      </div>

                      {items.map((c, i) => (
                        <div
                          key={c.id}
                          style={{
                            padding: "0.75rem 1rem",
                            borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.85rem",
                              lineHeight: 1.8,
                              color: "var(--color-text-primary)",
                              margin: "0 0 0.5rem",
                              whiteSpace: "pre-wrap",
                              display: "-webkit-box",
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {c.content}
                          </p>
                          {Array.isArray(c.sources) &&
                            c.sources.filter((s) => s.label).length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "0.25rem",
                                  marginBottom: "0.35rem",
                                }}
                              >
                                {c.sources
                                  .filter((s) => s.label)
                                  .map((src, si) => {
                                    const colors = TIER_COLORS[src.tier] ?? TIER_COLORS["三次"];
                                    const chip = (
                                      <span
                                        key={si}
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "0.2rem",
                                          padding: "0.1rem 0.4rem",
                                          borderRadius: "3px",
                                          fontSize: "0.68rem",
                                          fontFamily: "var(--font-sans)",
                                          backgroundColor: colors.bg,
                                          color: colors.fg,
                                        }}
                                      >
                                        <span style={{ fontWeight: 600, fontSize: "0.6rem" }}>
                                          {src.tier}
                                        </span>
                                        {src.label}
                                      </span>
                                    );
                                    if (src.url)
                                      return (
                                        <a
                                          key={si}
                                          href={src.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ textDecoration: "none" }}
                                        >
                                          {chip}
                                        </a>
                                      );
                                    return chip;
                                  })}
                              </div>
                            )}
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
                            <span>
                              {new Date(c.updated_at || c.created_at).toLocaleDateString("ja-JP")}
                            </span>
                            {c.updated_at && c.updated_at !== c.created_at && (
                              <span style={{ fontStyle: "italic" }}>（編集済み）</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "2rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "5px",
              border: "1px solid var(--color-border)",
              backgroundColor: page === 0 ? "var(--color-bg)" : "var(--color-surface)",
              color: page === 0 ? "var(--color-text-secondary)" : "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              cursor: page === 0 ? "default" : "pointer",
            }}
          >
            ← 前へ
          </button>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
              padding: "0.4rem 0.5rem",
            }}
          >
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "5px",
              border: "1px solid var(--color-border)",
              backgroundColor: page >= totalPages - 1 ? "var(--color-bg)" : "var(--color-surface)",
              color:
                page >= totalPages - 1
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              cursor: page >= totalPages - 1 ? "default" : "pointer",
            }}
          >
            次へ →
          </button>
        </div>
      )}
    </>
  );
}
