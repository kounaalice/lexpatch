"use client";

import { useState, useCallback } from "react";
import type { LawRevisionEntry } from "@/lib/egov/types";
import type { SideBySideRow } from "@/lib/patch/types";
import { SideBySideView } from "@/components/diff/SideBySideView";

interface ArticleDiffEntry {
  num: string;
  title: string;
  caption?: string;
  rows: SideBySideRow[];
  isNew?: boolean;
  isDeleted?: boolean;
  stats: { added: number; deleted: number; unchanged: number };
}

interface LawAmendmentDiffData {
  changedArticles: ArticleDiffEntry[];
  revisionIdx: number;
  prevDate: string;
  currentDate: string;
  totalArticles: number;
}

function fmtEnforcementDate(d: string): string {
  const m = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return d;
  const year = parseInt(m[1]);
  const month = parseInt(m[2]);
  const day = parseInt(m[3]);
  if (year >= 2019) return `令和${year - 2018}年${month}月${day}日`;
  if (year >= 1989) return `平成${year - 1988}年${month}月${day}日`;
  return `${year}年${month}月${day}日`;
}

export function LawAmendmentView({
  lawId,
  revisions,
  initialDiff,
}: {
  lawId: string;
  revisions: LawRevisionEntry[];
  initialDiff: LawAmendmentDiffData | null;
}) {
  const [selectedRevisionIdx, setSelectedRevisionIdx] = useState(initialDiff?.revisionIdx ?? 0);
  const [diffData, setDiffData] = useState<LawAmendmentDiffData | null>(initialDiff);
  const [loading, setLoading] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  const handleRevisionChange = useCallback(
    async (idx: number) => {
      if (idx === selectedRevisionIdx && diffData) return;
      setSelectedRevisionIdx(idx);
      setLoading(true);
      setExpandedArticles(new Set());

      try {
        const enfDate = new Date(revisions[idx].amendment_enforcement_date);
        enfDate.setDate(enfDate.getDate() - 1);
        const asof = enfDate.toISOString().split("T")[0];

        const res = await fetch(
          `/api/egov/law-diff?law_id=${encodeURIComponent(lawId)}&asof=${asof}`,
        );
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();

        setDiffData({
          changedArticles: data.changedArticles ?? [],
          revisionIdx: idx,
          prevDate: revisions[idx + 1]?.amendment_enforcement_date ?? "",
          currentDate: revisions[idx].amendment_enforcement_date,
          totalArticles: data.totalArticles ?? 0,
        });
      } catch {
        setDiffData(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedRevisionIdx, diffData, revisions, lawId],
  );

  const toggleArticle = useCallback((num: string) => {
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!diffData) return;
    setExpandedArticles(new Set(diffData.changedArticles.map((a) => a.num)));
  }, [diffData]);

  const collapseAll = useCallback(() => {
    setExpandedArticles(new Set());
  }, []);

  if (revisions.length < 2) return null;

  const changed = diffData?.changedArticles ?? [];
  const currentDate =
    diffData?.currentDate ?? revisions[selectedRevisionIdx]?.amendment_enforcement_date ?? "";
  const prevDate = diffData?.prevDate ?? "";

  return (
    <div>
      {/* ヘッダ: タイトル + プルダウン */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          改正差分
        </span>
        <select
          value={selectedRevisionIdx}
          onChange={(e) => handleRevisionChange(Number(e.target.value))}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            maxWidth: "500px",
            flex: "1 1 auto",
          }}
        >
          {revisions.map((rev, i) => (
            <option key={rev.law_revision_id || i} value={i}>
              {fmtEnforcementDate(rev.amendment_enforcement_date)} 施行
              {rev.amendment_law_title ? ` — ${rev.amendment_law_title}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* ローディング */}
      {loading && (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
          }}
        >
          改正差分を計算中...
        </div>
      )}

      {/* 結果 */}
      {!loading && diffData && (
        <>
          {/* サマリー */}
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            {changed.length > 0 ? (
              <>
                <span>
                  この改正で{" "}
                  <strong style={{ color: "var(--color-text-primary)" }}>{changed.length}条</strong>
                  {diffData.totalArticles > 0 && ` / 全${diffData.totalArticles}条`}{" "}
                  が変更されました
                </span>
                <button
                  onClick={expandedArticles.size > 0 ? collapseAll : expandAll}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "3px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {expandedArticles.size > 0 ? "全て折畳" : "全て展開"}
                </button>
              </>
            ) : (
              <span>この改正ではこの法令の条文に変更はありませんでした。</span>
            )}
          </div>

          {/* 変更条文リスト */}
          {changed.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {changed.map((entry) => {
                const isExpanded = expandedArticles.has(entry.num);
                return (
                  <div
                    key={entry.num}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    {/* 条文ヘッダ（クリックで展開） */}
                    <button
                      onClick={() => toggleArticle(entry.num)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        backgroundColor: isExpanded ? "var(--color-bg)" : "var(--color-surface)",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--color-text-secondary)",
                          width: "1rem",
                          textAlign: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isExpanded ? "▲" : "▼"}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {entry.title || `第${entry.num}条`}
                      </span>
                      {entry.caption && (
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {entry.caption}
                        </span>
                      )}
                      {/* バッジ */}
                      {entry.isNew && (
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            padding: "0.05rem 0.35rem",
                            borderRadius: "3px",
                            backgroundColor: "#16a34a",
                            color: "#fff",
                          }}
                        >
                          新設
                        </span>
                      )}
                      {entry.isDeleted && (
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            padding: "0.05rem 0.35rem",
                            borderRadius: "3px",
                            backgroundColor: "#dc2626",
                            color: "#fff",
                          }}
                        >
                          削除
                        </span>
                      )}
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.7rem",
                          color: "var(--color-text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        +{entry.stats.added} -{entry.stats.deleted}
                      </span>
                    </button>

                    {/* 展開時: SideBySideView */}
                    {isExpanded && (
                      <div
                        style={{
                          borderTop: "1px solid var(--color-border)",
                        }}
                      >
                        <SideBySideView
                          rows={entry.rows}
                          leftHeader={
                            prevDate ? `改正前（${fmtEnforcementDate(prevDate)} 施行）` : "改正前"
                          }
                          rightHeader={
                            currentDate
                              ? `改正後（${fmtEnforcementDate(currentDate)} 施行）`
                              : "改正後"
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* diff計算失敗 */}
      {!loading && !diffData && (
        <div
          style={{
            padding: "1rem",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
          }}
        >
          改正差分の計算がタイムアウトしました。プルダウンで改正を選び直してください。
        </div>
      )}
    </div>
  );
}
