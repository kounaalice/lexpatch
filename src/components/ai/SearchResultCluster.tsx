"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_GROUPS } from "@/lib/categories";
import type { AiSearchResult } from "./ArticleDetailPanel";

interface Props {
  lawId: string;
  lawTitle: string;
  categoryGroup: string;
  articles: AiSearchResult[];
  maxScore: number; // highest score across ALL results (for relative bar width)
  rareThreshold: number; // score <= this = "rare" (unexpected cross-domain find)
  onFindSimilar: (result: AiSearchResult) => void;
  similarLoading: boolean;
}

export default function SearchResultCluster({
  lawId,
  lawTitle,
  categoryGroup,
  articles,
  maxScore,
  rareThreshold,
  onFindSimilar,
  similarLoading,
}: Props) {
  const [expanded, setExpanded] = useState(articles.length <= 3);
  const cg = CATEGORY_GROUPS.find((g) => g.id === categoryGroup);
  const color = cg?.color ?? "#64748B";
  const bg = cg?.bg ?? "#F1F5F9";
  const avgScore = articles.reduce((s, a) => s + a.score, 0) / articles.length;
  const displayArticles = expanded ? articles : articles.slice(0, 2);

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: `1px solid var(--color-border)`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 8,
        padding: "0.75rem 1rem",
        marginBottom: "0.5rem",
      }}
    >
      {/* Law header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span
          style={{
            backgroundColor: bg,
            color,
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 6,
          }}
        >
          {cg?.label}
        </span>
        <Link
          href={`/law/${lawId}`}
          style={{
            color: "var(--color-accent)",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          {lawTitle}
        </Link>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
          {articles.length}条文 / 平均{Math.round(avgScore * 100)}%
        </span>
      </div>

      {/* Article list */}
      <div style={{ marginTop: "0.5rem" }}>
        {displayArticles.map((a) => {
          const isRare = rareThreshold > 0 && a.score > 0 && a.score <= rareThreshold;
          return (
            <div
              key={`${a.lawId}:${a.articleNum}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.25rem",
                borderBottom: "1px solid var(--color-border)",
                borderRadius: isRare ? 6 : 0,
                backgroundColor: isRare ? "#FFFBEB" : "transparent",
                borderLeft: isRare ? "3px solid #F59E0B" : "none",
                marginBottom: isRare ? 2 : 0,
                transition: "background-color 0.2s",
              }}
            >
              {/* Score bar */}
              <div style={{ width: 60, flexShrink: 0 }}>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "var(--color-border)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isRare ? "#F59E0B" : color,
                      width: `${(a.score / maxScore) * 100}%`,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: isRare ? "#D97706" : "var(--color-text-secondary)",
                    textAlign: "center",
                    marginTop: 1,
                  }}
                >
                  {Math.round(a.score * 100)}%
                </div>
              </div>

              {/* Rare badge */}
              {isRare && (
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color: "#D97706",
                    backgroundColor: "#FEF3C7",
                    padding: "1px 5px",
                    borderRadius: 4,
                    border: "1px solid #FCD34D",
                    whiteSpace: "nowrap",
                  }}
                >
                  ✦ レア
                </span>
              )}

              {/* Article info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/law/${a.lawId}/article/${a.articleNum}`}
                  style={{
                    color: isRare ? "#B45309" : "var(--color-accent)",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {a.articleNum}
                </Link>
                {a.articleTitle && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-text-secondary)",
                      marginLeft: "0.35rem",
                    }}
                  >
                    {a.articleTitle}
                  </span>
                )}
              </div>

              {/* Find similar */}
              <button
                onClick={() => onFindSimilar(a)}
                disabled={similarLoading}
                title="似た条文を探す"
                style={{
                  flexShrink: 0,
                  padding: "0.2rem 0.5rem",
                  backgroundColor: "transparent",
                  border: `1px solid ${color}`,
                  borderRadius: 6,
                  color,
                  fontSize: "0.7rem",
                  cursor: similarLoading ? "wait" : "pointer",
                  opacity: similarLoading ? 0.5 : 1,
                }}
              >
                類似
              </button>
            </div>
          );
        })}
      </div>

      {/* Expand/collapse */}
      {articles.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: "0.35rem",
            padding: "0.2rem 0.5rem",
            backgroundColor: "transparent",
            border: "none",
            color: "var(--color-accent)",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          {expanded ? "折りたたむ" : `残り${articles.length - 2}件を表示`}
        </button>
      )}
    </div>
  );
}
