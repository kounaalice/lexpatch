"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getCollection,
  getCollectionStats,
  getLawCards,
  getArticleRarity,
  getLawNameCache,
  RARITY_STARS,
  RARITY_LABEL,
  RARITY_COLOR,
  type CardRarity,
  type CardEntry,
  type LawCardEntry,
} from "@/lib/cards";
import { loadSettings } from "@/lib/settings";
import { getHistory } from "@/lib/history";

// ── 法令ID → 法令名マッピング（主要法令） ──
const KNOWN_LAW_NAMES: Record<string, string> = {
  "321CONSTITUTION": "日本国憲法",
  "129AC0000000089": "民法",
  "140AC0000000045": "刑法",
  "132AC0000000048": "商法",
  "408AC0000000109": "民事訴訟法",
  "323AC0000000131": "刑事訴訟法",
  "354AC0000000004": "民事執行法",
  "402AC0000000091": "民事保全法",
  "416AC0000000123": "破産法",
  "403AC0000000090": "仲裁法",
  "322AC0000000059": "少年法",
  "405AC0000000088": "行政手続法",
  "337AC0000000139": "行政事件訴訟法",
  "322AC0000000125": "国家公務員法",
  "322AC0000000120": "地方自治法",
  "322AC0000000067": "国家行政組織法",
  "322AC0000000049": "労働基準法",
  "347AC0000000057": "最低賃金法",
  "419AC0000000128": "労働契約法",
  "349AC0000000116": "育児介護休業法",
  "417AC0000000086": "会社法",
  "415AC0000000057": "個人情報保護法",
  "345AC0000000048": "著作権法",
};

/** 永続キャッシュ + 閲覧履歴から法令名マップを構築 */
function buildLawNameMap(): Record<string, string> {
  const map = { ...KNOWN_LAW_NAMES };
  try {
    // 永続キャッシュ（カード獲得時に保存される）
    const cached = getLawNameCache();
    for (const [id, name] of Object.entries(cached)) {
      if (!map[id]) map[id] = name;
    }
    // 閲覧履歴（フォールバック）
    const history = getHistory();
    for (const entry of history) {
      if (entry.lawId && entry.lawTitle && !map[entry.lawId]) {
        map[entry.lawId] = entry.lawTitle;
      }
    }
  } catch {}
  return map;
}

/** 条文番号を表示用にフォーマット */
function formatArticleNum(articleNum: string): string {
  // 附則: "suppl-7" → "附則第7条", "suppl0-3" → "附則第3条"
  const supplMatch = articleNum.match(/^suppl\d*-(.+)$/);
  if (supplMatch) {
    const rawNum = supplMatch[1];
    return rawNum ? `附則第${rawNum}条` : "附則";
  }
  // 枝番号: "3_2" → "第3条の2"
  if (articleNum.includes("_")) {
    const parts = articleNum.split("_");
    return `第${parts[0]}条の${parts.slice(1).join("の")}`;
  }
  return `第${articleNum}条`;
}

type FilterRarity = "ALL" | CardRarity;
type _FilterStatus = "all" | "collected" | "uncollected";
type SortMode = "newest" | "oldest" | "rarity" | "count";

interface CardDisplayItem {
  cardId: string;
  lawId: string;
  articleNum: string;
  rarity: CardRarity;
  entry: CardEntry;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" });
  } catch {
    return iso;
  }
}

const RARITY_ORDER: Record<CardRarity, number> = { SSR: 0, SR: 1, R: 2, N: 3 };

export default function CardsPage() {
  const [mounted, setMounted] = useState(false);
  const [filterRarity, setFilterRarity] = useState<FilterRarity>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [gamingEnabled, setGamingEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGamingEnabled(loadSettings().gamingMode);

    const handler = () => setMounted((v) => !v); // force re-render
    window.addEventListener("lexcard:card-reward", handler);
    return () => window.removeEventListener("lexcard:card-reward", handler);
  }, []);

  const stats = useMemo(() => (mounted ? getCollectionStats() : null), [mounted]);
  const lawCards = useMemo(() => (mounted ? getLawCards() : []), [mounted]);
  const lawNameMap = useMemo(() => (mounted ? buildLawNameMap() : {}), [mounted]);

  const cards = useMemo(() => {
    if (!mounted) return [];
    const collection = getCollection();
    const items: CardDisplayItem[] = Object.entries(collection).map(([cardId, entry]) => {
      const [lawId, articleNum] = cardId.split(":");
      return {
        cardId,
        lawId,
        articleNum,
        rarity: getArticleRarity(lawId, articleNum),
        entry,
      };
    });

    // Filter
    let filtered = items;
    if (filterRarity !== "ALL") {
      filtered = filtered.filter((c) => c.rarity === filterRarity);
    }

    // Sort
    switch (sortMode) {
      case "newest":
        filtered.sort((a, b) => b.entry.firstAt.localeCompare(a.entry.firstAt));
        break;
      case "oldest":
        filtered.sort((a, b) => a.entry.firstAt.localeCompare(b.entry.firstAt));
        break;
      case "rarity":
        filtered.sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);
        break;
      case "count":
        filtered.sort((a, b) => b.entry.count - a.entry.count);
        break;
    }

    return filtered;
  }, [mounted, filterRarity, sortMode]);

  if (!mounted) {
    return (
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>読み込み中...</p>
      </main>
    );
  }

  if (!gamingEnabled) {
    return (
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.2rem",
            color: "var(--color-text-primary)",
            marginBottom: "1rem",
          }}
        >
          カード図鑑
        </h1>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
            }}
          >
            カード図鑑はゲーミングモードで利用できます。
          </p>
          <Link
            href="/settings"
            style={{
              color: "var(--color-accent)",
              fontSize: "0.82rem",
              textDecoration: "underline",
            }}
          >
            サイト設定でゲーミングモードをONにする
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.2rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          カード図鑑
        </h1>
        <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
          法令の条文をカードとして収集しましょう。ガチャ・購入・報酬で獲得できます。
        </p>
      </div>

      {/* 統計サマリー */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "0.8rem",
            marginBottom: "1.5rem",
          }}
        >
          <StatCard label="ユニーク" value={stats.unique} unit="種" color="var(--color-accent)" />
          <StatCard
            label="総枚数"
            value={stats.total}
            unit="枚"
            color="var(--color-text-primary)"
          />
          <StatCard label="SSR" value={stats.byRarity.SSR} unit="" color="#F59E0B" />
          <StatCard label="SR" value={stats.byRarity.SR} unit="" color="#A78BFA" />
          <StatCard label="R" value={stats.byRarity.R} unit="" color="#38BDF8" />
          <StatCard
            label="N"
            value={stats.byRarity.N}
            unit=""
            color="var(--color-text-secondary)"
          />
          {stats.lawCardCount > 0 && (
            <StatCard label="法令カード" value={stats.lawCardCount} unit="" color="#F59E0B" />
          )}
        </div>
      )}

      {/* 法令カード（コンプリート報酬） */}
      {lawCards.length > 0 && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.95rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.6rem",
            }}
          >
            法令カード
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "0.6rem",
            }}
          >
            {lawCards.map((lc) => (
              <LawCardItem key={lc.lawId} lawCard={lc} />
            ))}
          </div>
        </section>
      )}

      {/* フィルタ・ソート */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.6rem",
          alignItems: "center",
          marginBottom: "1rem",
          fontSize: "0.75rem",
        }}
      >
        <span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>レアリティ:</span>
        {(["ALL", "SSR", "SR", "R", "N"] as FilterRarity[]).map((r) => (
          <button
            key={r}
            onClick={() => setFilterRarity(r)}
            style={{
              padding: "0.2rem 0.5rem",
              border: `1px solid ${filterRarity === r ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: "4px",
              backgroundColor: filterRarity === r ? "var(--color-accent)" : "transparent",
              color: filterRarity === r ? "#fff" : "var(--color-text-secondary)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              fontWeight: filterRarity === r ? 700 : 400,
            }}
          >
            {r === "ALL" ? "すべて" : r}
          </button>
        ))}

        <span
          style={{ color: "var(--color-text-secondary)", fontWeight: 600, marginLeft: "0.5rem" }}
        >
          並替:
        </span>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          style={{
            padding: "0.2rem 0.4rem",
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
          }}
        >
          <option value="newest">新しい順</option>
          <option value="oldest">古い順</option>
          <option value="rarity">レアリティ順</option>
          <option value="count">所持数順</option>
        </select>
      </div>

      {/* カードグリッド */}
      {cards.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "2rem",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            fontSize: "0.85rem",
          }}
        >
          {filterRarity === "ALL"
            ? "まだカードがありません。法令ページでガチャを引いてカードを集めましょう！"
            : `${filterRarity}のカードはまだありません。`}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "0.6rem",
          }}
        >
          {cards.map((card) => (
            <CollectedCard key={card.cardId} card={card} lawName={lawNameMap[card.lawId]} />
          ))}
        </div>
      )}
    </main>
  );
}

// ── 統計カード ──
function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "0.6rem 0.8rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.2rem",
          fontWeight: 700,
          color,
        }}
      >
        {value.toLocaleString()}
        {unit && (
          <span style={{ fontSize: "0.7rem", fontWeight: 400, marginLeft: "0.15rem" }}>{unit}</span>
        )}
      </div>
      <div
        style={{
          fontSize: "0.65rem",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── コレクション済みカード ──
function CollectedCard({ card, lawName }: { card: CardDisplayItem; lawName?: string }) {
  const colors = RARITY_COLOR[card.rarity];
  const isSSR = card.rarity === "SSR";
  const isSR = card.rarity === "SR";

  return (
    <Link
      href={`/law/${encodeURIComponent(card.lawId)}/article/${encodeURIComponent(card.articleNum)}`}
      style={{
        display: "block",
        textDecoration: "none",
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        border: `2px solid ${colors.border}`,
        boxShadow: colors.glow,
        backgroundColor: "var(--color-surface)",
        transition: "all 0.2s ease",
      }}
    >
      {/* SSR ホロ */}
      {isSSR && (
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
      {isSR && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
            borderRadius: "6px",
            animation: "card-glow-sr 2s ease-in-out infinite",
          }}
        />
      )}

      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.3rem 0.5rem",
          backgroundColor: colors.bg,
          borderBottom: `1px solid ${colors.border}`,
          fontSize: "0.6rem",
          fontFamily: "var(--font-sans)",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: isSSR
              ? "#F59E0B"
              : isSR
                ? "#A78BFA"
                : card.rarity === "R"
                  ? "#38BDF8"
                  : "var(--color-text-secondary)",
          }}
        >
          {RARITY_STARS[card.rarity]} {RARITY_LABEL[card.rarity]}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            color: "var(--color-text-secondary)",
          }}
        >
          x{card.entry.count}
        </span>
      </div>

      {/* 本体 */}
      <div style={{ padding: "0.5rem", position: "relative", zIndex: 2 }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "0.15rem",
          }}
        >
          {formatArticleNum(card.articleNum)}
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            color: "var(--color-text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lawName || card.lawId}
        </div>
      </div>

      {/* フッター */}
      <div
        style={{
          padding: "0.25rem 0.5rem",
          borderTop: `1px solid ${colors.border}`,
          fontSize: "0.55rem",
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-secondary)",
          backgroundColor: colors.bg,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{formatDate(card.entry.firstAt)}</span>
        <span
          style={{
            backgroundColor: colors.border,
            color: "#fff",
            padding: "0.03rem 0.2rem",
            borderRadius: "2px",
            fontSize: "0.5rem",
            fontWeight: 700,
          }}
        >
          GET
        </span>
      </div>
    </Link>
  );
}

// ── 法令カード ──
function LawCardItem({ lawCard }: { lawCard: LawCardEntry }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        border: "2px solid #F59E0B",
        boxShadow: "0 0 15px rgba(245,158,11,0.5)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* ホロ演出 */}
      <div
        className="gaming-card-shimmer"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.35rem 0.5rem",
          backgroundColor: "rgba(245,158,11,0.1)",
          borderBottom: "1px solid #F59E0B",
          fontSize: "0.6rem",
          fontFamily: "var(--font-sans)",
        }}
      >
        <span style={{ fontWeight: 700, color: "#F59E0B" }}>{"\u2605\u2605\u2605"} SSR</span>
        <span
          style={{
            fontSize: "0.55rem",
            color: "var(--color-text-secondary)",
          }}
        >
          法令カード
        </span>
      </div>

      {/* 本体 */}
      <div style={{ padding: "0.6rem", position: "relative", zIndex: 2 }}>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "0.2rem",
          }}
        >
          {lawCard.lawTitle}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--color-text-secondary)",
          }}
        >
          全{lawCard.articleCount}条 コンプリート
        </div>
      </div>

      {/* フッター */}
      <div
        style={{
          padding: "0.25rem 0.5rem",
          borderTop: "1px solid #F59E0B",
          fontSize: "0.55rem",
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-secondary)",
          backgroundColor: "rgba(245,158,11,0.05)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{formatDate(lawCard.unlockedAt)}</span>
        <span
          style={{
            backgroundColor: "#F59E0B",
            color: "#fff",
            padding: "0.03rem 0.2rem",
            borderRadius: "2px",
            fontSize: "0.5rem",
            fontWeight: 700,
          }}
        >
          COMPLETE
        </span>
      </div>
    </div>
  );
}
