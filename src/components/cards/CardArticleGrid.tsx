"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { loadSettings } from "@/lib/settings";
import {
  buildArticlePool,
  getLawCollectionRate,
  getPoints,
  drawGacha,
  drawGacha10,
  spendPoints,
  GACHA_COST_SINGLE,
  GACHA_COST_TEN,
  canClaimDailyBonus,
  claimDailyBonus,
  checkLawCompletion,
  cacheLawName,
  type GachaResult,
} from "@/lib/cards";
import type { Article } from "@/lib/egov/types";
import ArticleCard from "./ArticleCard";
import GachaModal from "./GachaModal";
import CardRewardToast from "./CardRewardToast";
import { ArticleNoteBadge } from "@/components/ArticleNoteBadge";

interface CardArticleGridProps {
  articles: Article[];
  lawId: string;
  lawTitle: string;
  changedArticleNums?: Set<string>;
}

export default function CardArticleGrid({
  articles,
  lawId,
  lawTitle,
  changedArticleNums,
}: CardArticleGridProps) {
  const [gamingMode, setGamingMode] = useState(false);
  const [points, setPoints] = useState(0);
  const [showGacha, setShowGacha] = useState(false);
  const [gachaResults, setGachaResults] = useState<GachaResult[]>([]);
  const [toast, setToast] = useState<GachaResult | null>(null);
  const [collectionRate, setCollectionRate] = useState({ collected: 0, total: 0, rate: 0 });

  useEffect(() => {
    const settings = loadSettings();
    setGamingMode(settings.gamingMode);
    setPoints(getPoints());
    setCollectionRate(getLawCollectionRate(lawId, articles.length));
    // 法令名を永続キャッシュに保存（カード図鑑で使用）
    if (settings.gamingMode) cacheLawName(lawId, lawTitle);

    // デイリーボーナス
    if (settings.gamingMode && canClaimDailyBonus()) {
      const pool = buildArticlePool(lawId, articles);
      const bonus = claimDailyBonus(pool);
      if (bonus) {
        setToast(bonus);
        setPoints(getPoints());
        setCollectionRate(getLawCollectionRate(lawId, articles.length));
      }
    }
  }, [lawId, articles]);

  // ポイント変化を監視
  useEffect(() => {
    const onPointChange = () => {
      setPoints(getPoints());
      setCollectionRate(getLawCollectionRate(lawId, articles.length));
    };
    window.addEventListener("lexcard:activity-point", onPointChange);
    window.addEventListener("lexcard:card-reward", onPointChange);
    return () => {
      window.removeEventListener("lexcard:activity-point", onPointChange);
      window.removeEventListener("lexcard:card-reward", onPointChange);
    };
  }, [lawId, articles.length]);

  const pool = buildArticlePool(lawId, articles);

  const handleSingleGacha = useCallback(() => {
    if (!spendPoints(GACHA_COST_SINGLE)) return;
    const result = drawGacha(pool);
    setGachaResults([result]);
    setPoints(getPoints());
    setCollectionRate(getLawCollectionRate(lawId, articles.length));
    // 法令コンプリートチェック
    checkLawCompletion(lawId, lawTitle, articles.length);
  }, [pool, lawId, lawTitle, articles.length]);

  const handleTenGacha = useCallback(() => {
    if (!spendPoints(GACHA_COST_TEN)) return;
    const results = drawGacha10(pool);
    setGachaResults(results);
    setPoints(getPoints());
    setCollectionRate(getLawCollectionRate(lawId, articles.length));
    checkLawCompletion(lawId, lawTitle, articles.length);
  }, [pool, lawId, lawTitle, articles.length]);

  // ゲーミングモードOFF → 通常表示
  if (!gamingMode) {
    return (
      <NormalArticleGrid
        articles={articles}
        lawId={lawId}
        changedArticleNums={changedArticleNums}
      />
    );
  }

  return (
    <div>
      {/* ガチャバー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.75rem",
          padding: "0.6rem 0.8rem",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
        }}
      >
        {/* 収集率 */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
            }}
          >
            {"\uD83C\uDCCF"} {collectionRate.collected}/{collectionRate.total}
            {collectionRate.total > 0 && ` (${Math.round(collectionRate.rate * 100)}%)`}
          </span>
          {/* ミニ進捗バー */}
          <div
            style={{
              width: "60px",
              height: "4px",
              backgroundColor: "rgba(0,0,0,0.08)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${collectionRate.rate * 100}%`,
                background: "linear-gradient(90deg, var(--color-accent), #A78BFA)",
                borderRadius: "2px",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>

        {/* ガチャボタン */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--color-text-secondary)",
            }}
          >
            {"\u26A1"}
            {points}pt
          </span>
          <button
            onClick={() => {
              handleSingleGacha();
              setShowGacha(true);
            }}
            disabled={points < GACHA_COST_SINGLE}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.68rem",
              fontWeight: 600,
              padding: "0.25rem 0.6rem",
              borderRadius: "6px",
              border: "1px solid var(--color-accent)",
              backgroundColor:
                points >= GACHA_COST_SINGLE ? "var(--color-accent)" : "var(--color-bg)",
              color: points >= GACHA_COST_SINGLE ? "#fff" : "var(--color-text-secondary)",
              cursor: points >= GACHA_COST_SINGLE ? "pointer" : "not-allowed",
              opacity: points >= GACHA_COST_SINGLE ? 1 : 0.5,
            }}
          >
            {"\uD83C\uDFB0"} {GACHA_COST_SINGLE}pt
          </button>
          <button
            onClick={() => {
              handleTenGacha();
              setShowGacha(true);
            }}
            disabled={points < GACHA_COST_TEN}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.68rem",
              fontWeight: 600,
              padding: "0.25rem 0.6rem",
              borderRadius: "6px",
              border: "1px solid #A78BFA",
              backgroundColor: points >= GACHA_COST_TEN ? "#A78BFA" : "var(--color-bg)",
              color: points >= GACHA_COST_TEN ? "#fff" : "var(--color-text-secondary)",
              cursor: points >= GACHA_COST_TEN ? "pointer" : "not-allowed",
              opacity: points >= GACHA_COST_TEN ? 1 : 0.5,
            }}
          >
            10{"\u9023"} {GACHA_COST_TEN}pt
          </button>
          <Link
            href="/cards"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.62rem",
              color: "var(--color-accent)",
              textDecoration: "none",
            }}
          >
            {"\uD83C\uDCCF"}
            {"\u56F3\u9451"}
          </Link>
        </div>
      </div>

      {/* TCG カードグリッド */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "0.6rem",
        }}
      >
        {articles.map((a) => (
          <ArticleCard
            key={a.num}
            article={a}
            lawId={lawId}
            lawTitle={lawTitle}
            isChanged={changedArticleNums?.has(a.num)}
          />
        ))}
      </div>

      {/* ガチャ結果モーダル */}
      {showGacha && gachaResults.length > 0 && (
        <GachaModal
          results={gachaResults}
          onClose={() => {
            setShowGacha(false);
            setGachaResults([]);
          }}
        />
      )}

      {/* デイリーボーナストースト */}
      {toast && (
        <CardRewardToast
          result={toast}
          source={"\u30C7\u30A4\u30EA\u30FC\u30DC\u30FC\u30CA\u30B9"}
          onDone={() => setToast(null)}
        />
      )}

      <style>{`
        @media (max-width: 600px) {
          .card-article-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

/** 通常表示（ゲーミングモードOFF時） */
function NormalArticleGrid({
  articles,
  lawId,
  changedArticleNums,
}: {
  articles: Article[];
  lawId: string;
  changedArticleNums?: Set<string>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "0.5rem",
      }}
    >
      {articles.map((a) => {
        const isChanged = changedArticleNums?.has(a.num);
        return (
          <Link
            key={a.num}
            id={`article-${a.num}`}
            href={`/law/${encodeURIComponent(lawId)}/article/${encodeURIComponent(a.num)}`}
            style={{
              display: "block",
              padding: "0.75rem 1rem",
              backgroundColor: "var(--color-surface)",
              border: `1px solid ${isChanged ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: "6px",
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {a.title || `\u7B2C${a.num}\u6761`}
              </span>
              {isChanged && (
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    padding: "0.05rem 0.35rem",
                    borderRadius: "3px",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    whiteSpace: "nowrap",
                  }}
                >
                  {"\u6539\u6B63"}
                </span>
              )}
              <ArticleNoteBadge lawId={lawId} articleTitle={a.title || `\u7B2C${a.num}\u6761`} />
            </div>
            {a.caption && (
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  marginTop: "0.15rem",
                }}
              >
                {a.caption}
              </div>
            )}
            {a.paragraphs[0]?.sentences[0] && (
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  marginTop: "0.25rem",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {a.paragraphs[0].sentences[0]}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
