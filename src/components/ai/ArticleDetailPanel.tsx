"use client";

import Link from "next/link";
import { CATEGORY_GROUPS } from "@/lib/categories";

export interface AiSearchResult {
  lawId: string;
  lawTitle: string;
  articleNum: string;
  articleTitle: string;
  caption: string;
  chapterTitle: string;
  categoryGroup: string;
  score: number;
  text: string;
}

interface Props {
  result: AiSearchResult;
  onFindSimilar: (result: AiSearchResult) => void;
  similarLoading: boolean;
  rareThreshold?: number;
}

export default function ArticleDetailPanel({
  result,
  onFindSimilar,
  similarLoading,
  rareThreshold = 0,
}: Props) {
  const cg = CATEGORY_GROUPS.find((g) => g.id === result.categoryGroup);
  const color = cg?.color ?? "#64748B";
  const bg = cg?.bg ?? "#F1F5F9";
  const isRare = rareThreshold > 0 && result.score > 0 && result.score <= rareThreshold;

  return (
    <div
      style={{
        backgroundColor: isRare ? "#FFFDF5" : "var(--color-surface)",
        border: `2px solid ${isRare ? "#F59E0B" : color}`,
        borderRadius: 12,
        padding: "1rem 1.25rem",
        marginTop: "0.75rem",
        boxShadow: isRare ? "0 0 12px rgba(245, 158, 11, 0.25)" : undefined,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            backgroundColor: bg,
            color,
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 8,
          }}
        >
          {cg?.label ?? ""}
        </span>
        <span
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 8,
          }}
        >
          {Math.round(result.score * 100)}%
        </span>
        {isRare && (
          <span
            style={{
              backgroundColor: "#FEF3C7",
              color: "#D97706",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 8,
              border: "1px solid #FCD34D",
            }}
          >
            ✦ レア発見
          </span>
        )}
      </div>

      {/* Title */}
      <Link
        href={`/law/${result.lawId}/article/${result.articleNum}`}
        style={{
          color: "var(--color-accent)",
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "1rem",
        }}
      >
        {result.lawTitle} {result.articleNum}
      </Link>

      {result.articleTitle && (
        <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: 2 }}>
          {result.articleTitle}
        </div>
      )}

      {result.chapterTitle && (
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: 2 }}>
          {result.chapterTitle}
        </div>
      )}

      {/* Article text preview */}
      {result.text && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.75rem",
            backgroundColor: "var(--color-bg)",
            borderRadius: 8,
            fontSize: "0.8rem",
            lineHeight: 1.6,
            color: "var(--color-text-primary)",
            maxHeight: 200,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {result.text.slice(0, 800)}
          {result.text.length > 800 && "..."}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={() => onFindSimilar(result)}
          disabled={similarLoading}
          style={{
            padding: "0.4rem 0.75rem",
            backgroundColor: color,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: similarLoading ? "wait" : "pointer",
            opacity: similarLoading ? 0.6 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {similarLoading ? "検索中..." : "似た条文を探す"}
        </button>
        <Link
          href={`/law/${result.lawId}/article/${result.articleNum}`}
          style={{
            padding: "0.4rem 0.75rem",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-accent)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: "0.8rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          条文を読む
        </Link>
        <Link
          href={`/law/${result.lawId}`}
          style={{
            padding: "0.4rem 0.75rem",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: "0.8rem",
            textDecoration: "none",
          }}
        >
          {result.lawTitle} 全体
        </Link>
      </div>
    </div>
  );
}
