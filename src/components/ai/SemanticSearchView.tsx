"use client";

import { useState, useCallback, useMemo } from "react";
import { getSession } from "@/lib/session";
import ConstellationMap, { type MapNode } from "./ConstellationMap";
import ArticleDetailPanel, { type AiSearchResult } from "./ArticleDetailPanel";
import SearchResultCluster from "./SearchResultCluster";

/* ── Types ── */

interface ExplorationStep {
  type: "query" | "similar";
  label: string;
  results: AiSearchResult[];
}

interface Props {
  query: string;
  results: AiSearchResult[];
  loading: boolean;
  error: string | null;
  /** AI検索が実行済みかどうか（0件と未検索を区別） */
  hasSearched?: boolean;
  /** AI 回答関連 */
  aiAnswer: string;
  aiAnswerStreaming: boolean;
  onRequestAiAnswer: () => void;
}

type ViewMode = "map" | "list";

/* ── Component ── */

export default function SemanticSearchView({
  query,
  results,
  loading,
  error,
  hasSearched = false,
  aiAnswer,
  aiAnswerStreaming,
  onRequestAiAnswer,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarMessage, setSimilarMessage] = useState<{
    text: string;
    type: "error" | "info";
  } | null>(null);
  const [explorationSteps, setExplorationSteps] = useState<ExplorationStep[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  // Merge initial results + exploration results
  const allResults = useMemo(() => {
    const map = new Map<string, AiSearchResult>();
    for (const r of results) {
      map.set(`${r.lawId}:${r.articleNum}`, r);
    }
    for (const step of explorationSteps) {
      for (const r of step.results) {
        const key = `${r.lawId}:${r.articleNum}`;
        if (!map.has(key)) map.set(key, r);
      }
    }
    return [...map.values()].sort((a, b) => b.score - a.score);
  }, [results, explorationSteps]);

  // Map nodes
  const mapNodes: MapNode[] = useMemo(
    () =>
      allResults.map((r) => ({
        id: `${r.lawId}:${r.articleNum}`,
        lawId: r.lawId,
        lawTitle: r.lawTitle,
        articleNum: r.articleNum,
        articleTitle: r.articleTitle,
        score: r.score,
        categoryGroup: r.categoryGroup,
        chapterTitle: r.chapterTitle,
      })),
    [allResults],
  );

  // Group by lawId for list view
  const clusters = useMemo(() => {
    const map = new Map<string, AiSearchResult[]>();
    for (const r of allResults) {
      const arr = map.get(r.lawId) ?? [];
      arr.push(r);
      map.set(r.lawId, arr);
    }
    return [...map.entries()]
      .map(([lawId, arts]) => ({
        lawId,
        lawTitle: arts[0].lawTitle,
        categoryGroup: arts[0].categoryGroup,
        articles: arts.sort((a, b) => b.score - a.score),
      }))
      .sort(
        (a, b) =>
          Math.max(...b.articles.map((x) => x.score)) - Math.max(...a.articles.map((x) => x.score)),
      );
  }, [allResults]);

  const maxScore = allResults.length > 0 ? allResults[0].score : 1;
  const minScore = allResults.length > 0 ? allResults[allResults.length - 1].score : 0;
  // "Rare" = bottom 40% of score range — unexpected cross-domain connections
  const rareThreshold = allResults.length >= 5 ? minScore + (maxScore - minScore) * 0.4 : 0; // don't show rarity if too few results

  // Selected result for detail panel
  const selectedResult = selectedId
    ? (allResults.find((r) => `${r.lawId}:${r.articleNum}` === selectedId) ?? null)
    : null;

  // Find similar handler
  const handleFindSimilar = useCallback(
    async (result: AiSearchResult) => {
      const session = getSession();
      setSimilarLoading(true);
      setSimilarMessage(null);
      try {
        const res = await fetch("/api/ai/search/similar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(session ? { memberId: session.memberId, token: session.token } : {}),
            lawId: result.lawId,
            articleNum: result.articleNum,
            topK: 10,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const errMsg = errData?.error ?? `検索に失敗しました (${res.status})`;
          setSimilarMessage({ text: errMsg, type: "error" });
          setTimeout(() => setSimilarMessage(null), 5000);
          return;
        }
        const data = await res.json();
        if (data.results?.length > 0) {
          const newCount = data.results.filter(
            (r: AiSearchResult) =>
              !allResults.some((a) => a.lawId === r.lawId && a.articleNum === r.articleNum),
          ).length;
          setExplorationSteps((prev) => [
            ...prev,
            {
              type: "similar",
              label: `${result.lawTitle} ${result.articleNum}`,
              results: data.results,
            },
          ]);
          setSimilarMessage({
            text: `${data.results.length}件の類似条文を発見（新規${newCount}件）`,
            type: "info",
          });
          setTimeout(() => setSimilarMessage(null), 3000);
        } else {
          setSimilarMessage({ text: "類似する条文が見つかりませんでした", type: "info" });
          setTimeout(() => setSimilarMessage(null), 4000);
        }
      } catch (e) {
        console.error("[FindSimilar] error:", e);
        setSimilarMessage({ text: "類似検索の実行に失敗しました", type: "error" });
        setTimeout(() => setSimilarMessage(null), 5000);
      } finally {
        setSimilarLoading(false);
      }
    },
    [allResults],
  );

  // Reset exploration
  const resetExploration = useCallback(() => {
    setExplorationSteps([]);
    setSelectedId(null);
  }, []);

  /* ── Render ── */

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid var(--color-border)",
            borderTopColor: "var(--color-accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 0.75rem",
          }}
        />
        AI検索中... ({query})
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "1rem",
          borderRadius: 8,
          backgroundColor: "#FEF2F2",
          border: "1px solid #FECACA",
          color: "#991B1B",
          fontSize: "0.85rem",
        }}
      >
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    // 検索実行済みで0件 → 「見つかりませんでした」
    if (hasSearched) {
      return (
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderRadius: 12,
            background: "linear-gradient(135deg, var(--color-surface), var(--color-bg))",
            border: "1px solid var(--color-border)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>🔍</div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: "0.3rem",
              }}
            >
              「{query}」に関連する条文は見つかりませんでした
            </div>
            <div
              style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}
            >
              別のキーワードや表現で検索してみてください。AI検索は意味の近さで探すため、同義語や言い換えも有効です。
            </div>
          </div>
          <div
            style={{
              padding: "0.6rem 0.75rem",
              borderRadius: 8,
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <b>💡 ヒント:</b>{" "}
            「契約の解除」→「契約解除の要件」、「未成年の保護」→「成年年齢と制限行為能力」のように、
            具体的な法概念や条文で使われそうな表現に言い換えると精度が上がることがあります。
            <br />
            🌐 英語（&quot;contract cancellation&quot;）や中国語・韓国語でも検索可能です。
          </div>
        </div>
      );
    }
    // 未検索 → ガイド表示
    return (
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderRadius: 12,
          background: "linear-gradient(135deg, var(--color-surface), var(--color-bg))",
          border: "1px solid var(--color-border)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>🔍</div>
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "0.2rem",
            }}
          >
            AI セマンティック検索
          </div>
          <div
            style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}
          >
            自然言語で検索すると、全9,444法令（371,305条文）から意味的に関連する条文を自動検出します。
            <span style={{ display: "inline-block", marginTop: "0.25rem", fontSize: "0.75rem" }}>
              🌐 英語・中国語・韓国語など<b>多言語</b>でも検索できます
            </span>
          </div>
        </div>
        <AiSearchGuide />
      </div>
    );
  }

  return (
    <div>
      {/* ── Compact hint (always visible) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          fontSize: "0.72rem",
          color: "var(--color-text-secondary)",
          marginBottom: "0.5rem",
          padding: "0.4rem 0.65rem",
          backgroundColor: "var(--color-bg)",
          borderRadius: 8,
          border: "1px solid var(--color-border)",
          lineHeight: 1.5,
        }}
      >
        <span>
          🗺️ <b>マップ</b>: ノードをクリックで詳細
        </span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>
          🔗 <b>類似</b>: 似た条文を連鎖探索
        </span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>
          🤖 <b>AI回答</b>: 関連条文から要約生成
        </span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>
          ✦ <b style={{ color: "#D97706" }}>レア</b>: 意外な関連条文
        </span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>
          🌐 <b>多言語</b>対応
        </span>
        <button
          onClick={() => setShowGuide((v) => !v)}
          style={{
            marginLeft: "auto",
            padding: "0.15rem 0.45rem",
            backgroundColor: showGuide ? "var(--color-accent)" : "transparent",
            color: showGuide ? "#fff" : "var(--color-accent)",
            border: "1px solid " + (showGuide ? "var(--color-accent)" : "var(--color-accent)"),
            borderRadius: 4,
            fontSize: "0.65rem",
            cursor: "pointer",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {showGuide ? "✕ 閉じる" : "詳しく"}
        </button>
      </div>

      {/* ── Full guide panel (toggleable) ── */}
      {showGuide && (
        <div style={{ marginBottom: "0.75rem" }}>
          <AiSearchGuide />
        </div>
      )}

      {/* ── Controls ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          <TabBtn active={viewMode === "map"} onClick={() => setViewMode("map")} label="マップ" />
          <TabBtn active={viewMode === "list"} onClick={() => setViewMode("list")} label="リスト" />
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
          {allResults.length}件{clusters.length > 0 && ` / ${clusters.length}法令`}
          {explorationSteps.length > 0 && (
            <button
              onClick={resetExploration}
              style={{
                marginLeft: "0.5rem",
                color: "var(--color-accent)",
                background: "none",
                border: "none",
                fontSize: "0.75rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              リセット
            </button>
          )}
        </div>
      </div>

      {/* ── Exploration breadcrumb ── */}
      {explorationSteps.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            flexWrap: "wrap",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            marginBottom: "0.5rem",
            padding: "0.35rem 0.5rem",
            backgroundColor: "var(--color-bg)",
            borderRadius: 6,
          }}
        >
          <span style={{ fontWeight: 600 }}>探索:</span>
          <span>{query}</span>
          {explorationSteps.map((step, i) => (
            <span key={i}>
              <span style={{ margin: "0 0.15rem" }}>→</span>
              <span style={{ color: "var(--color-accent)" }}>{step.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Similar search feedback ── */}
      {similarMessage && (
        <div
          style={{
            padding: "0.5rem 0.75rem",
            marginBottom: "0.5rem",
            borderRadius: 8,
            fontSize: "0.8rem",
            fontWeight: 500,
            backgroundColor: similarMessage.type === "error" ? "#FEF2F2" : "#EFF8FF",
            color: similarMessage.type === "error" ? "#991B1B" : "#0369A1",
            border: `1px solid ${similarMessage.type === "error" ? "#FECACA" : "#BAE6FD"}`,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {similarMessage.type === "error" ? "⚠️ " : "✨ "}
          {similarMessage.text}
        </div>
      )}

      {/* ── AI Answer Box ── */}
      <div
        style={{
          marginBottom: "0.75rem",
          padding: "0.75rem 1rem",
          border: "1px solid var(--color-accent)",
          borderRadius: 10,
          backgroundColor: "var(--color-surface)",
        }}
      >
        {aiAnswer ? (
          <div
            style={{
              fontSize: "0.85rem",
              lineHeight: 1.7,
              color: "var(--color-text-primary)",
              whiteSpace: "pre-wrap",
            }}
          >
            {aiAnswer}
            {aiAnswerStreaming && <span style={{ animation: "blink 1s infinite" }}>|</span>}
          </div>
        ) : (
          <button
            onClick={onRequestAiAnswer}
            disabled={aiAnswerStreaming}
            style={{
              width: "100%",
              padding: "0.5rem",
              background: "linear-gradient(135deg, var(--color-accent), #0284C7)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            関連条文に基づいてAIに回答を生成させる
          </button>
        )}
      </div>

      {/* ── Map or List ── */}
      {viewMode === "map" ? (
        <ConstellationMap
          query={query}
          nodes={mapNodes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          rareThreshold={rareThreshold}
        />
      ) : (
        <div>
          {clusters.map((c) => (
            <SearchResultCluster
              key={c.lawId}
              lawId={c.lawId}
              lawTitle={c.lawTitle}
              categoryGroup={c.categoryGroup}
              articles={c.articles}
              maxScore={maxScore}
              rareThreshold={rareThreshold}
              onFindSimilar={handleFindSimilar}
              similarLoading={similarLoading}
            />
          ))}
        </div>
      )}

      {/* ── Detail panel (when node selected) ── */}
      {selectedResult && (
        <ArticleDetailPanel
          result={selectedResult}
          onFindSimilar={handleFindSimilar}
          similarLoading={similarLoading}
          rareThreshold={rareThreshold}
        />
      )}
    </div>
  );
}

/* ── Tab button helper ── */

/* ── AI Search Guide ── */

function AiSearchGuide() {
  const items: { icon: string; title: string; desc: string }[] = [
    {
      icon: "💬",
      title: "自然言語で検索",
      desc: "「契約の解除」「未成年者の保護」など、自然な言葉で検索すると意味的に関連する条文が最大20件表示されます。キーワード一致ではなく、意味の近さで検索します。",
    },
    {
      icon: "🗺️",
      title: "マップ表示",
      desc: "検索結果を放射状のマップで可視化。中心が検索クエリ、周囲に法令グループと条文ノードが配置されます。ノードの大きさは関連度、色は法分野（行政・司法・財政等9分野）を表します。",
    },
    {
      icon: "📋",
      title: "リスト表示",
      desc: "法令ごとにグループ化して表示。スコアバーで関連度を確認でき、折りたたみで条文を一覧できます。",
    },
    {
      icon: "🔗",
      title: "似た条文を探す",
      desc: "条文をクリックして詳細パネルを開き「似た条文を探す」を押すと、その条文に意味的に近い別の条文を追加探索できます。探索パスはパンくずに表示され、リセットで初期状態に戻せます。",
    },
    {
      icon: "🤖",
      title: "AI回答を生成",
      desc: "検索結果の上部にあるボタンで、見つかった関連条文に基づいてAIが質問に回答します。条文の要約や横断的な解説を生成できます。",
    },
    {
      icon: "🌐",
      title: "多言語対応",
      desc: '英語・中国語・韓国語など100以上の言語で検索可能。"contract cancellation" や "合同解除" でも日本法の関連条文がヒットします。外国人法務にも活用できます。',
    },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "0.6rem",
      }}
    >
      {items.map((item) => (
        <div
          key={item.title}
          style={{
            padding: "0.65rem 0.75rem",
            backgroundColor: "var(--color-bg)",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "0.2rem",
            }}
          >
            {item.icon} {item.title}
          </div>
          <div
            style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", lineHeight: 1.55 }}
          >
            {item.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Tab button helper ── */

function TabBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.3rem 0.75rem",
        backgroundColor: active ? "var(--color-accent)" : "var(--color-bg)",
        color: active ? "#fff" : "var(--color-text-secondary)",
        border: "1px solid " + (active ? "var(--color-accent)" : "var(--color-border)"),
        borderRadius: 6,
        fontSize: "0.8rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}
