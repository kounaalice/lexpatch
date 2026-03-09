"use client";

import { useState } from "react";
import Link from "next/link";

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  下書き: { fg: "#475569", bg: "#F1F5F9" },
  提案中: { fg: "#D97706", bg: "#FFFBEB" },
  採択済: { fg: "#059669", bg: "#ECFDF5" },
};

interface SourceItem {
  id: string;
  tier: string;
  label: string;
  url: string | null;
}

interface PatchItem {
  id: string;
  title: string;
  status: string;
  target_articles: string[] | null;
  law_id: string | null;
  created_at: string;
  sources?: SourceItem[];
}

interface LawGroup {
  law_id: string | null;
  law_title: string | null;
  patches: PatchItem[];
}

export function PatchesFilter({ groups }: { groups: LawGroup[] }) {
  const [filter, setFilter] = useState<string>("すべて");

  const tabs = ["すべて", "下書き", "提案中", "採択済"];

  // フィルター済みのグループ
  const filtered = groups
    .map((g) => ({
      ...g,
      patches: filter === "すべて" ? g.patches : g.patches.filter((p) => p.status === filter),
    }))
    .filter((g) => g.patches.length > 0);

  // 条文ごとにグループ化
  function groupByArticle(patches: PatchItem[]) {
    const map = new Map<string, PatchItem[]>();
    for (const p of patches) {
      const key = p.target_articles?.[0] ?? "（条文未指定）";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }

  return (
    <div>
      {/* フィルタータブ */}
      <div
        role="tablist"
        aria-label="ステータスフィルター"
        style={{
          display: "flex",
          gap: "0",
          marginBottom: "1.5rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={filter === t}
            onClick={() => setFilter(t)}
            style={{
              padding: "0.45rem 1rem",
              border: "none",
              borderBottom:
                filter === t ? "2px solid var(--color-accent)" : "2px solid transparent",
              backgroundColor: "transparent",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: filter === t ? "var(--color-accent)" : "var(--color-text-secondary)",
              cursor: "pointer",
              fontWeight: filter === t ? 700 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
            color: "var(--color-text-secondary)",
            textAlign: "center",
            padding: "3rem 0",
          }}
        >
          該当する改正案がありません
        </p>
      )}

      {/* 法令グループ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {filtered.map((g) => {
          const articleGroups = groupByArticle(g.patches);
          return (
            <section key={g.law_id ?? "other"}>
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
                {g.law_id ? (
                  <>
                    {/* 法令名（大きく表示） */}
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
                    {/* サブリンク群 */}
                    <Link
                      href={`/law/${encodeURIComponent(g.law_id)}`}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.75rem",
                        color: "var(--color-accent)",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      条文を見る →
                    </Link>
                    <a
                      href={`https://laws.e-gov.go.jp/law/${g.law_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        color: "var(--color-accent)",
                        border: "1px solid var(--color-accent)",
                        borderRadius: "4px",
                        padding: "0.1rem 0.4rem",
                        textDecoration: "none",
                        opacity: 0.75,
                        whiteSpace: "nowrap",
                      }}
                    >
                      e-Gov ↗
                    </a>
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
                      {g.patches.length} 件
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    その他
                  </span>
                )}
              </div>

              {/* 条文ごとのグループ */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {Array.from(articleGroups.entries()).map(([articleKey, patches]) => (
                  <div
                    key={articleKey}
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {/* 条文タイトル */}
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
                      {g.law_id && articleKey !== "（条文未指定）" && (
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
                      )}
                    </div>

                    {/* 改正案リスト */}
                    <div>
                      {patches.map((p, i) => {
                        const sc = STATUS_COLORS[p.status] ?? STATUS_COLORS["下書き"];
                        const hasSources = (p.sources?.length ?? 0) > 0;
                        return (
                          <div
                            key={p.id}
                            style={{
                              borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                            }}
                          >
                            {/* パッチタイトル行 */}
                            <Link
                              href={`/patch/${p.id}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: hasSources ? "0.65rem 1rem 0.35rem" : "0.65rem 1rem",
                                textDecoration: "none",
                                transition: "background-color 0.1s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--color-bg)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  padding: "0.1rem 0.45rem",
                                  borderRadius: "4px",
                                  backgroundColor: sc.bg,
                                  color: sc.fg,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.status}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "0.88rem",
                                  color: "var(--color-text-primary)",
                                  flex: 1,
                                }}
                              >
                                {p.title}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "0.72rem",
                                  color: "var(--color-text-secondary)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {new Date(p.created_at).toLocaleDateString("ja-JP")}
                              </span>
                            </Link>

                            {/* 根拠資料リンク */}
                            {hasSources && (
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "0.4rem",
                                  padding: "0 1rem 0.6rem 2.5rem",
                                }}
                              >
                                {p.sources!.map((src) => {
                                  const tierColor =
                                    src.tier === "一次"
                                      ? { fg: "var(--color-accent)", bg: "var(--color-add-bg)" }
                                      : src.tier === "準一次"
                                        ? { fg: "#1B4B8A", bg: "#EBF2FD" }
                                        : src.tier === "二次"
                                          ? {
                                              fg: "var(--color-warn-fg)",
                                              bg: "var(--color-warn-bg)",
                                            }
                                          : {
                                              fg: "var(--color-text-secondary)",
                                              bg: "var(--color-bg)",
                                            };
                                  const inner = (
                                    <>
                                      <span
                                        style={{
                                          fontSize: "0.65rem",
                                          fontWeight: 700,
                                          padding: "0.05rem 0.35rem",
                                          borderRadius: "3px",
                                          backgroundColor: tierColor.bg,
                                          color: tierColor.fg,
                                          marginRight: "0.3rem",
                                        }}
                                      >
                                        {src.tier}
                                      </span>
                                      {src.label}
                                      {src.url && (
                                        <span style={{ marginLeft: "0.2rem", opacity: 0.6 }}>
                                          ↗
                                        </span>
                                      )}
                                    </>
                                  );
                                  const chipStyle: React.CSSProperties = {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    fontFamily: "var(--font-sans)",
                                    fontSize: "0.75rem",
                                    color: src.url
                                      ? "var(--color-accent)"
                                      : "var(--color-text-secondary)",
                                    backgroundColor: "var(--color-bg)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "4px",
                                    padding: "0.15rem 0.5rem",
                                    textDecoration: "none",
                                    whiteSpace: "nowrap",
                                  };
                                  return src.url ? (
                                    <a
                                      key={src.id}
                                      href={src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={chipStyle}
                                    >
                                      {inner}
                                    </a>
                                  ) : (
                                    <span key={src.id} style={chipStyle}>
                                      {inner}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
