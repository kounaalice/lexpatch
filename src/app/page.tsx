"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { LawSearchResult } from "@/lib/egov/types";
import { CATEGORY_GROUPS, LAW_CATEGORIES } from "@/lib/categories";
import { getRecentLaws, type HistoryEntry } from "@/lib/history";
import { getFollowedIds } from "@/lib/follows";
import { isLoggedIn } from "@/lib/session";
import { loadSettings } from "@/lib/settings";
import HomepageStats from "@/components/HomepageStats";
import { TRIAL_TYPE_LABEL } from "@/lib/precedent/types";
import type { TrialType } from "@/lib/precedent/types";
import Pagination from "@/components/Pagination";
import AdvancedSearchPanel, {
  type AdvancedSearchState,
  DEFAULT_ADVANCED,
  splitOrQuery,
  buildSearchParams,
  applyExcludeFilter,
} from "@/components/AdvancedSearchPanel";

const POPULAR_LAWS: { title: string; num: string; type: string; lawId: string }[] = [
  // ── 六法 ──
  { title: "日本国憲法", num: "昭和21年", type: "憲法", lawId: "321CONSTITUTION" },
  { title: "民法", num: "明治29年法律第89号", type: "法律", lawId: "129AC0000000089" },
  { title: "刑法", num: "明治40年法律第45号", type: "法律", lawId: "140AC0000000045" },
  { title: "商法", num: "明治32年法律第48号", type: "法律", lawId: "132AC0000000048" },
  { title: "会社法", num: "平成17年法律第86号", type: "法律", lawId: "417AC0000000086" },
  { title: "民事訴訟法", num: "平成8年法律第109号", type: "法律", lawId: "408AC0000000109" },
  { title: "刑事訴訟法", num: "昭和23年法律第131号", type: "法律", lawId: "323AC0000000131" },
  { title: "行政手続法", num: "平成5年法律第88号", type: "法律", lawId: "405AC0000000088" },
  // ── 実務主要法令 ──
  { title: "労働基準法", num: "昭和22年法律第49号", type: "法律", lawId: "322AC0000000049" },
  { title: "著作権法", num: "昭和45年法律第48号", type: "法律", lawId: "345AC0000000048" },
  { title: "個人情報保護法", num: "平成15年法律第57号", type: "法律", lawId: "415AC0000000057" },
  { title: "国家公務員法", num: "昭和22年法律第120号", type: "法律", lawId: "322AC0000000120" },
  // ── 税法・経済 ──
  { title: "所得税法", num: "昭和40年法律第33号", type: "法律", lawId: "340AC0000000033" },
  { title: "法人税法", num: "昭和40年法律第34号", type: "法律", lawId: "340AC0000000034" },
  { title: "消費税法", num: "昭和63年法律第108号", type: "法律", lawId: "363AC0000000108" },
  { title: "金融商品取引法", num: "昭和23年法律第25号", type: "法律", lawId: "323AC0000000025" },
  // ── 不動産・知財・倒産 ──
  { title: "不動産登記法", num: "平成16年法律第123号", type: "法律", lawId: "416AC0000000123" },
  { title: "借地借家法", num: "平成3年法律第90号", type: "法律", lawId: "403AC0000000090" },
  { title: "特許法", num: "昭和34年法律第121号", type: "法律", lawId: "334AC0000000121" },
  { title: "破産法", num: "平成16年法律第75号", type: "法律", lawId: "416AC0000000075" },
  // ── 行政・社会・生活 ──
  { title: "地方自治法", num: "昭和22年法律第67号", type: "法律", lawId: "322AC0000000067" },
  { title: "独占禁止法", num: "昭和22年法律第54号", type: "法律", lawId: "322AC0000000054" },
  { title: "道路交通法", num: "昭和35年法律第105号", type: "法律", lawId: "335AC0000000105" },
  { title: "介護保険法", num: "平成9年法律第123号", type: "法律", lawId: "409AC0000000123" },
];

const LAW_TYPE_JA: Record<string, string> = {
  Act: "法律",
  CabinetOrder: "政令",
  ImperialOrder: "勅令",
  MinisterialOrdinance: "省令",
  Rule: "規則",
  Misc: "告示等",
};

type TypeFilter = "" | "Act" | "CabinetOrder" | "MinisterialOrdinance" | "Rule";
const PER_PAGE = 20;

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LawSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [adv, setAdv] = useState<AdvancedSearchState>(DEFAULT_ADVANCED);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recentPromulgated, setRecentPromulgated] = useState<LawSearchResult[]>([]);
  const [recentEnforced, setRecentEnforced] = useState<LawSearchResult[]>([]);
  const [showPromulgated, setShowPromulgated] = useState(false);
  const [showEnforced, setShowEnforced] = useState(false);
  const [recentPrecedents, setRecentPrecedents] = useState<RecentPrecedentItem[]>([]);
  const [showPrecedents, setShowPrecedents] = useState(false);
  const [showGamingBanner, setShowGamingBanner] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setShowGamingBanner(!loadSettings().gamingMode);
  }, []);

  // 最近公布された法令を取得
  useEffect(() => {
    fetch("/api/egov/new-laws")
      .then((r) => r.json())
      .then((data) => {
        if (data.laws) setRecentPromulgated(data.laws);
      })
      .catch(() => {});
    fetch("/api/egov/enforced-laws")
      .then((r) => r.json())
      .then((data) => {
        if (data.laws) setRecentEnforced(data.laws);
      })
      .catch(() => {});
    fetch("/api/precedents/recent?limit=10")
      .then((r) => r.json())
      .then((data) => {
        if (data.precedents) setRecentPrecedents(data.precedents);
      })
      .catch(() => {});
  }, []);

  async function doSearch(q: string, page = 1) {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setError(null);
    setSearched(true);
    setTypeFilter("");
    setTotalCount(null);
    setCurrentPage(page);
    try {
      // OR 検索: "民法 OR 刑法" → 分割して複数API → マージ
      const orParts = splitOrQuery(q);
      const isOrSearch = orParts.length > 1;
      let allLaws: LawSearchResult[] = [];
      let sumTotal = 0;

      for (const part of orParts) {
        // OR検索時はページネーション無効（全件取得）
        const pagination = isOrSearch
          ? undefined
          : { offset: (page - 1) * PER_PAGE, limit: PER_PAGE };
        const qs = buildSearchParams(part, adv, pagination);
        const url = `/api/egov/search?${qs}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "検索エラー");
        const laws = data.laws ?? [];
        allLaws = allLaws.concat(laws);
        sumTotal += data.total_count ?? laws.length;
      }

      // 重複排除（OR 検索時）
      if (isOrSearch) {
        const seen = new Set<string>();
        allLaws = allLaws.filter((l) => {
          if (seen.has(l.law_id)) return false;
          seen.add(l.law_id);
          return true;
        });
      }

      // 除外ワードフィルタリング
      allLaws = applyExcludeFilter(allLaws, adv.excludeKeyword);

      setResults(allLaws);
      setTotalCount(sumTotal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await doSearch(query, 1);
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ── ヒーロー ── */}
      <div
        style={{
          background: "linear-gradient(160deg, #EFF8FF 0%, #DBEAFE 55%, #BFDBFE 100%)",
          padding: "3.5rem 2rem 3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 装飾：ソフトサークル */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.65) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-50px",
            left: "-50px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(147,197,253,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.5), transparent)",
          }}
        />

        <div
          style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center", position: "relative" }}
        >
          {/* バッジ */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0.85rem",
              backgroundColor: "rgba(255,255,255,0.75)",
              border: "1px solid #93C5FD",
              borderRadius: "4px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.73rem",
              color: "#0369A1",
              marginBottom: "1.5rem",
              letterSpacing: "0.03em",
            }}
          >
            e-Gov法令API準拠
            <span style={{ color: "#BAE6FD" }}>|</span>
            無料・登録不要
          </div>
          <div
            style={{
              display: "inline-block",
              padding: "0.25rem 0.85rem",
              backgroundColor: "rgba(255,255,255,0.65)",
              border: "1px solid #BAE6FD",
              borderRadius: "4px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.68rem",
              color: "#4B6A8A",
              marginBottom: "1.5rem",
              letterSpacing: "0.02em",
              lineHeight: 1.6,
            }}
          >
            広告なし・データ販売なし<span style={{ color: "#BAE6FD" }}>｜</span>
            寄付・プロジェクト支援協力のみで運営し、維持環境に再投資します。
          </div>

          {/* メインタイトル */}
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1.7rem, 4vw, 2.6rem)",
              color: "#1E3A5F",
              lineHeight: 1.4,
              marginBottom: "0.85rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            現行法令の検索・条文閲覧
          </h1>

          {/* サブタイトル */}
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              color: "#4B6A8A",
              marginBottom: "2rem",
              lineHeight: 1.85,
            }}
          >
            e-Gov法令APIに基づく日本の現行法律・政令・省令等の全条文を提供しています。
            <br />
            改正案の作成・共有にも対応しています。
          </p>

          {/* 検索フォーム */}
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              gap: "0.5rem",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            <label htmlFor="hero-search" className="sr-only">
              法令名で検索
            </label>
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="法令名で検索（例：民法、労働基準法、民法 OR 刑法）"
              className="hero-search-input"
              style={{
                flex: 1,
                padding: "0.875rem 1.25rem",
                border: "1px solid #93C5FD",
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                color: "#1E3A5F",
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                outline: "none",
                boxShadow: "0 1px 4px rgba(30,58,95,0.08)",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.875rem 1.5rem",
                backgroundColor: loading ? "#7FBCE8" : "#0369A1",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                transition: "background-color 0.15s",
                boxShadow: loading ? "none" : "0 2px 8px rgba(3,105,161,0.2)",
              }}
            >
              {loading ? "検索中…" : "検索"}
            </button>
          </form>
          <div style={{ maxWidth: "560px", margin: "0.5rem auto 0", textAlign: "left" }}>
            <AdvancedSearchPanel state={adv} onChange={setAdv} />
          </div>
        </div>
      </div>

      {/* ── コンテンツ ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* 検索結果 */}
        {searched && (
          <section style={{ marginBottom: "2.5rem" }}>
            {error && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--color-del-bg)",
                  border: "1px solid var(--color-del-fg)",
                  borderRadius: "6px",
                  color: "var(--color-del-fg)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
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
                  <h2
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-secondary)",
                      margin: 0,
                    }}
                  >
                    「{query}」の検索結果 —{" "}
                    {results.filter((r) => !typeFilter || r.law_type === typeFilter).length} 件
                    {typeFilter ? `（${results.length} 件中）` : ""}
                    {totalCount !== null && totalCount > results.length && (
                      <span style={{ fontWeight: 400, fontSize: "0.78rem" }}>
                        （全 {totalCount.toLocaleString()} 件中 {results.length} 件表示）
                      </span>
                    )}
                  </h2>
                  {/* 種別フィルタータブ */}
                  <div
                    role="tablist"
                    aria-label="法令種別フィルター"
                    style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}
                  >
                    {(
                      [
                        { key: "", label: "すべて" },
                        { key: "Act", label: "法律" },
                        { key: "CabinetOrder", label: "政令" },
                        { key: "MinisterialOrdinance", label: "省令" },
                        { key: "Rule", label: "規則" },
                      ] as { key: TypeFilter; label: string }[]
                    ).map(({ key, label }) => {
                      const count = key
                        ? results.filter((r) => r.law_type === key).length
                        : results.length;
                      if (count === 0 && key !== "") return null;
                      return (
                        <button
                          key={key}
                          role="tab"
                          aria-selected={typeFilter === key}
                          onClick={() => setTypeFilter(key)}
                          style={{
                            padding: "0.2rem 0.65rem",
                            border: "1px solid var(--color-border)",
                            borderRadius: "4px",
                            backgroundColor:
                              typeFilter === key ? "var(--color-accent)" : "var(--color-surface)",
                            color: typeFilter === key ? "#fff" : "var(--color-text-secondary)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            fontWeight: typeFilter === key ? 700 : 400,
                          }}
                        >
                          {label} {count}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "0.5rem",
                  }}
                >
                  {results
                    .filter((r) => !typeFilter || r.law_type === typeFilter)
                    .map((law) => (
                      <LawCard key={law.law_id} law={law} />
                    ))}
                </div>
                {/* ページネーション */}
                {totalCount !== null &&
                  totalCount > PER_PAGE &&
                  splitOrQuery(query).length <= 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalCount / PER_PAGE)}
                      onPageChange={(page) => doSearch(query, page)}
                    />
                  )}
              </>
            )}
          </section>
        )}

        {/* 新着情報（ログインユーザーのみ） */}
        {!searched && loggedIn && <NewsFeedSection />}

        {/* 閲覧履歴 */}
        {!searched && <RecentHistory />}

        {/* 最近公布された法令（折りたたみ） */}
        {!searched && recentPromulgated.length > 0 && (
          <section style={{ marginBottom: "1.5rem" }}>
            <CollapsibleSectionHeading
              label="最近公布された法令"
              count={recentPromulgated.length}
              open={showPromulgated}
              onToggle={() => setShowPromulgated(!showPromulgated)}
            />
            {showPromulgated && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {recentPromulgated.map((law) => (
                  <RecentLawCard key={law.law_id} law={law} dateType="promulgation" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 最近施行された法令（折りたたみ） */}
        {!searched && recentEnforced.length > 0 && (
          <section style={{ marginBottom: "2.5rem" }}>
            <CollapsibleSectionHeading
              label="最近施行された法令"
              count={recentEnforced.length}
              open={showEnforced}
              onToggle={() => setShowEnforced(!showEnforced)}
            />
            {showEnforced && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {recentEnforced.map((law) => (
                  <RecentLawCard key={law.law_id} law={law} dateType="enforcement" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 最新判例（折りたたみ） */}
        {!searched && recentPrecedents.length > 0 && (
          <section style={{ marginBottom: "1.5rem" }}>
            <CollapsibleSectionHeading
              label="最新判例"
              count={recentPrecedents.length}
              open={showPrecedents}
              onToggle={() => setShowPrecedents(!showPrecedents)}
            />
            {showPrecedents && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {recentPrecedents.map((p) => (
                  <RecentPrecedentCard key={p.lawsuit_id} item={p} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 主要法令 */}
        {!searched && (
          <section style={{ marginBottom: "2.5rem" }}>
            <SectionHeading label="主要法令" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                gap: "0.5rem",
              }}
            >
              {POPULAR_LAWS.map((law) => (
                <PopularLawCard key={law.lawId} law={law} />
              ))}
            </div>
          </section>
        )}

        {/* ゲーミング誘導バナー */}
        {showGamingBanner && (
          <Link
            href="/guide#gaming"
            style={{
              display: "block",
              padding: "0.7rem 1.25rem",
              background:
                "linear-gradient(135deg, rgba(3,105,161,0.06), rgba(167,139,250,0.06), rgba(244,114,182,0.06))",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              textDecoration: "none",
              marginBottom: "2rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{"\uD83C\uDFB4"}</span>
              <span>条文カードを集めよう — ゲーミングモードで法令がカードゲームに</span>
              <span style={{ color: "var(--color-accent)", marginLeft: "auto", flexShrink: 0 }}>
                詳しく →
              </span>
            </span>
          </Link>
        )}

        {/* 50分野ポータル */}
        <section>
          <SectionHeading label="法令分野から探す" />

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {CATEGORY_GROUPS.map((group) => {
              const cats = LAW_CATEGORIES.filter((c) => c.group.id === group.id);
              return (
                <div key={group.id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.6rem",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.15rem 0.6rem",
                        backgroundColor: group.bg,
                        color: group.color,
                        borderRadius: "4px",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        border: `1px solid ${group.color}33`,
                      }}
                    >
                      {group.label}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: "0.4rem",
                    }}
                  >
                    {cats.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          padding: "0.55rem 0.75rem",
                          backgroundColor: "var(--color-surface)",
                          border: `1px solid var(--color-border)`,
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.84rem",
                          color: "var(--color-text-primary)",
                          transition: "all 0.15s",
                          minHeight: "2.4rem",
                          lineHeight: 1.35,
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

      {/* ── サイト統計（フッター付近） ── */}
      <HomepageStats />
    </div>
  );
}

// ─── セクション見出し ──────────────────────────────────
function SectionHeading({ label }: { label: string }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.95rem",
        fontWeight: 700,
        color: "var(--color-text-primary)",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "3px",
          height: "1rem",
          backgroundColor: "var(--color-accent)",
          borderRadius: "2px",
        }}
      />
      {label}
    </h2>
  );
}

// ─── 主要法令カード ───────────────────────────────────
function PopularLawCard({
  law,
}: {
  law: { title: string; num: string; type: string; lawId: string };
}) {
  return (
    <Link
      href={`/law/${law.lawId}`}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
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
      <div style={{ marginBottom: "0.25rem" }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "#0369A1",
            backgroundColor: "#EFF8FF",
            border: "1px solid #BAE6FD",
            borderRadius: "3px",
            padding: "0.1rem 0.4rem",
          }}
        >
          {law.type}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.92rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "0.15rem",
        }}
      >
        {law.title}
      </div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#4B6A8A" }}>
        {law.num}
      </div>
    </Link>
  );
}

// ─── 新着情報 ─────────────────────────────────────────
function NewsFeedSection() {
  const [items, setItems] = useState<
    Array<{
      type: string;
      id: string;
      title: string;
      subtitle?: string;
      date: string;
      href: string;
    }>
  >([]);
  const [followedProjects, setFollowedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch(() => {});
    setFollowedProjects(getFollowedIds("project"));
  }, []);

  if (items.length === 0) return null;

  const TYPE_LABELS: Record<string, { label: string; bg: string; fg: string }> = {
    project: { label: "プロジェクト", bg: "#EBF2FD", fg: "#1B4B8A" },
    patch: { label: "改正案", bg: "#FFFBEB", fg: "#D97706" },
    commentary: { label: "逐条解説", bg: "#ECFDF5", fg: "#059669" },
  };

  return (
    <section style={{ marginBottom: "2rem" }}>
      <SectionHeading label="新着情報" />
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {items.map((item, i) => {
          const typeInfo = TYPE_LABELS[item.type] ?? {
            label: item.type,
            bg: "#F1F5F9",
            fg: "#475569",
          };
          const isFollowed = item.type === "project" && followedProjects.has(item.id);
          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.55rem 1rem",
                textDecoration: "none",
                borderBottom: i < items.length - 1 ? "1px solid var(--color-border)" : "none",
                fontFamily: "var(--font-sans)",
                backgroundColor: isFollowed ? "rgba(2,132,199,0.05)" : undefined,
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                  minWidth: "3.2rem",
                }}
              >
                {new Date(item.date).toLocaleDateString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                })}
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  padding: "0.1rem 0.4rem",
                  borderRadius: "3px",
                  backgroundColor: typeInfo.bg,
                  color: typeInfo.fg,
                  whiteSpace: "nowrap",
                }}
              >
                {typeInfo.label}
              </span>
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {isFollowed && (
                  <span style={{ color: "var(--color-accent)", marginRight: "0.25rem" }}>★</span>
                )}
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─── 閲覧履歴 ─────────────────────────────────────────
function RecentHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getRecentLaws());
  }, []);

  if (history.length === 0) return null;

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <SectionHeading label="最近閲覧した法令" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "0.5rem",
        }}
      >
        {history.map((entry, idx) => (
          <Link
            key={`${entry.law_id}-${idx}`}
            href={`/law/${encodeURIComponent(entry.law_id)}`}
            style={{
              display: "block",
              padding: "0.65rem 1rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.15rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {entry.law_title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {entry.law_num}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── 折りたたみセクション見出し ─────────────────────────
function CollapsibleSectionHeading({
  label,
  count,
  open,
  onToggle,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "none",
        border: "none",
        padding: "0.25rem 0",
        marginBottom: open ? "1rem" : "0",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "0.95rem",
        fontWeight: 700,
        color: "var(--color-text-primary)",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "3px",
          height: "1rem",
          backgroundColor: "var(--color-accent)",
          borderRadius: "2px",
        }}
      />
      {label}
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 400,
          color: "var(--color-text-secondary)",
        }}
      >
        ({count}件)
      </span>
      <span
        style={{
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.15s",
          fontSize: "0.6rem",
          color: "var(--color-text-secondary)",
        }}
      >
        ▼
      </span>
    </button>
  );
}

// ─── 最近の法令カード（公布/施行兼用） ──────────────────
function RecentLawCard({
  law,
  dateType,
}: {
  law: LawSearchResult;
  dateType: "promulgation" | "enforcement";
}) {
  const rawDate =
    dateType === "enforcement"
      ? (law.amendment_enforcement_date ?? "")
      : (law.promulgation_date ?? "");
  const dateStr = rawDate.replace(/-/g, "/");
  const dateLabel = dateType === "enforcement" ? "施行" : "公布";
  const dateBg = dateType === "enforcement" ? "#ECFDF5" : "#FFFBEB";
  const dateFg = dateType === "enforcement" ? "#059669" : "#D97706";
  const dateBorder = dateType === "enforcement" ? "#A7F3D0" : "#FDE68A";

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.25rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "#0369A1",
            backgroundColor: "#EFF8FF",
            border: "1px solid #BAE6FD",
            borderRadius: "3px",
            padding: "0.1rem 0.4rem",
          }}
        >
          {LAW_TYPE_JA[law.law_type] ?? law.law_type}
        </span>
        {dateStr && (
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.65rem",
              color: dateFg,
              backgroundColor: dateBg,
              border: `1px solid ${dateBorder}`,
              borderRadius: "3px",
              padding: "0.1rem 0.4rem",
            }}
          >
            {dateLabel} {dateStr}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.92rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "0.15rem",
        }}
      >
        {law.law_title || "（タイトルなし）"}
      </div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#4B6A8A" }}>
        {law.law_num}
      </div>
    </Link>
  );
}

// ─── 最新判例の型 ─────────────────────────────────────
interface RecentPrecedentItem {
  lawsuit_id: string;
  case_number: string;
  case_name: string;
  court_name: string;
  date: string;
  trial_type: TrialType;
  result?: string;
  detail_url: string;
  law_refs: { law_id: string; law_name: string; article: string }[];
}

// ─── 最新判例カード ──────────────────────────────────
function RecentPrecedentCard({ item: p }: { item: RecentPrecedentItem }) {
  const typeLabel = TRIAL_TYPE_LABEL[p.trial_type] || p.trial_type;
  const dateStr = p.date
    ? new Date(p.date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div
      style={{
        padding: "0.6rem 0.8rem",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        backgroundColor: "var(--color-surface)",
        fontSize: "0.82rem",
        lineHeight: 1.5,
      }}
    >
      {/* ヘッダー行 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.1rem 0.4rem",
            borderRadius: "3px",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
          }}
        >
          {typeLabel}
        </span>
        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.78rem" }}>{dateStr}</span>
        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>
          {p.court_name}
        </span>
        {p.result && (
          <span style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>
            — {p.result}
          </span>
        )}
      </div>

      {/* 事件名 + 裁判所HPリンク */}
      <div
        style={{
          marginTop: "0.3rem",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span
            style={{ fontWeight: 600, fontSize: "0.84rem", color: "var(--color-text-primary)" }}
          >
            {p.case_name}
          </span>
          <span
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.75rem",
              marginLeft: "0.5rem",
            }}
          >
            {p.case_number}
          </span>
        </div>
        <a
          href={p.detail_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.75rem",
            color: "var(--color-accent)",
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          裁判所HPで確認 ↗
        </a>
      </div>

      {/* 参照法条リンク */}
      {p.law_refs.length > 0 && (
        <div style={{ marginTop: "0.35rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
          {p.law_refs.map((ref, i) => (
            <Link
              key={`${ref.law_id}-${ref.article}-${i}`}
              href={`/law/${ref.law_id}/article/${ref.article.replace(/の/g, "_")}`}
              style={{
                fontSize: "0.7rem",
                padding: "0.1rem 0.45rem",
                borderRadius: "3px",
                backgroundColor: "#EFF8FF",
                border: "1px solid #BAE6FD",
                color: "#0369A1",
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
                whiteSpace: "nowrap",
              }}
            >
              {ref.law_name}
              {ref.article}条
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 法令カード（検索結果用）──────────────────────────
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
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.95rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "0.2rem",
        }}
      >
        {law.law_title || "（タイトルなし）"}
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
          color: "var(--color-text-secondary)",
        }}
      >
        {law.law_num}
      </div>
    </Link>
  );
}
