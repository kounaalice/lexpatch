"use client";

import Link from "next/link";
import { getArticleRarity, hasCard, RARITY_STARS, RARITY_LABEL, RARITY_COLOR } from "@/lib/cards";
import type { Article } from "@/lib/egov/types";
import { ArticleNoteBadge } from "@/components/ArticleNoteBadge";

interface ArticleCardProps {
  article: Article;
  lawId: string;
  lawTitle?: string;
  isChanged?: boolean;
}

export default function ArticleCard({ article, lawId, lawTitle, isChanged }: ArticleCardProps) {
  const rarity = getArticleRarity(lawId, article.num, article);
  const collected = hasCard(`${lawId}:${article.num}`);
  const colors = RARITY_COLOR[rarity];

  // Stats
  const pCount = article.paragraphs.length;
  const iCount = article.paragraphs.reduce((s, p) => s + (p.items?.length || 0), 0);
  const charCount = article.paragraphs.reduce(
    (s, p) =>
      s +
      p.sentences.join("").length +
      (p.items?.reduce((si, it) => si + it.sentences.join("").length, 0) || 0),
    0,
  );

  const isSSR = rarity === "SSR";
  const isSR = rarity === "SR";

  return (
    <Link
      href={`/law/${encodeURIComponent(lawId)}/article/${encodeURIComponent(article.num)}`}
      style={{
        display: "block",
        textDecoration: "none",
        position: "relative",
        borderRadius: "10px",
        overflow: "hidden",
        // レアリティ別ボーダー
        border: `2px solid ${collected ? colors.border : "var(--color-border)"}`,
        boxShadow: collected ? colors.glow : "none",
        backgroundColor: collected ? "var(--color-surface)" : "var(--color-bg)",
        opacity: collected ? 1 : 0.6,
        transition: "all 0.2s ease",
      }}
    >
      {/* ホロ演出（SSR収集済み） */}
      {isSSR && collected && (
        <div
          className="gaming-card-shimmer"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      {/* SR パルス */}
      {isSR && collected && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
            borderRadius: "8px",
            animation: "card-glow-sr 2s ease-in-out infinite",
          }}
        />
      )}

      {/* カードヘッダー: レアリティ + 法令名 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.4rem 0.6rem",
          backgroundColor: collected ? colors.bg : "rgba(0,0,0,0.03)",
          borderBottom: `1px solid ${collected ? colors.border : "var(--color-border)"}`,
          fontSize: "0.62rem",
          fontFamily: "var(--font-sans)",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: collected
              ? isSSR
                ? "#F59E0B"
                : isSR
                  ? "#A78BFA"
                  : rarity === "R"
                    ? "#38BDF8"
                    : "var(--color-text-secondary)"
              : "var(--color-text-secondary)",
          }}
        >
          {RARITY_STARS[rarity]} {RARITY_LABEL[rarity]}
        </span>
        <span
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "0.58rem",
            maxWidth: "60%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lawTitle || ""}
        </span>
      </div>

      {/* カード本体 */}
      <div style={{ padding: "0.6rem 0.7rem", position: "relative", zIndex: 2 }}>
        {/* 条文タイトル */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
          {collected ? (
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {article.title || `\u7B2C${article.num}\u6761`}
            </span>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                filter: "blur(3px)",
                userSelect: "none",
              }}
            >
              {article.title || `\u7B2C${article.num}\u6761`}
            </span>
          )}
          {isChanged && (
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.58rem",
                fontWeight: 700,
                padding: "0.05rem 0.3rem",
                borderRadius: "3px",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
              }}
            >
              {"\u6539\u6B63"}
            </span>
          )}
          <ArticleNoteBadge
            lawId={lawId}
            articleTitle={article.title || `\u7B2C${article.num}\u6761`}
          />
        </div>

        {/* キャプション */}
        {article.caption && collected && (
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.15rem",
            }}
          >
            {article.caption}
          </div>
        )}

        {/* 未収集時: シルエットメッセージ */}
        {!collected && (
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.3rem",
              fontStyle: "italic",
            }}
          >
            {"\u{1F0CF}"} {"\u672A\u53CE\u96C6"}
            {/* 🃏 未収集 */}
          </div>
        )}
      </div>

      {/* カードフッター: ステータス */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.3rem 0.6rem",
          borderTop: `1px solid ${collected ? colors.border : "var(--color-border)"}`,
          fontSize: "0.58rem",
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-secondary)",
          backgroundColor: collected ? colors.bg : "rgba(0,0,0,0.02)",
        }}
      >
        <span>
          {"\u9805"}:{pCount} {"\u53F7"}:{iCount} {"\u5B57"}:{charCount}
        </span>
        {collected && (
          <span
            style={{
              backgroundColor: colors.border,
              color: "#fff",
              padding: "0.05rem 0.25rem",
              borderRadius: "2px",
              fontSize: "0.52rem",
              fontWeight: 700,
            }}
          >
            GET
          </span>
        )}
      </div>

      {/* プレビューテキスト（収集済みのみ） */}
      {collected && article.paragraphs[0]?.sentences[0] && (
        <div
          style={{
            padding: "0.3rem 0.6rem 0.5rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.68rem",
            color: "var(--color-text-secondary)",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            borderTop: `1px dashed ${colors.border}`,
          }}
        >
          {article.paragraphs[0].sentences[0]}
        </div>
      )}
    </Link>
  );
}
