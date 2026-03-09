"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import { addActivityPoints } from "@/lib/gaming";
import { getSession } from "@/lib/session";
import AdvancedSearchPanel, {
  type AdvancedSearchState,
  DEFAULT_ADVANCED,
  splitOrQuery,
  buildSearchParams,
  applyExcludeFilter,
} from "@/components/AdvancedSearchPanel";
import SemanticSearchView from "@/components/ai/SemanticSearchView";

/* ────────────────────────── types ────────────────────────── */

type TabKey = "all" | "law" | "patch" | "commentary" | "project" | "ai";

interface AiSearchResult {
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

interface LawResult {
  kind: "law";
  law_id: string;
  law_title: string;
  law_num: string;
  law_type: string;
  promulgation_date?: string;
}

interface PatchResult {
  kind: "patch";
  id: string;
  title: string;
  law_title?: string;
  law_id?: string;
  status: string;
  created_at: string;
}

interface CommentaryResult {
  kind: "commentary";
  id: string;
  law_id: string;
  article_title: string;
  author_name?: string;
  created_at: string;
}

interface ProjectResult {
  kind: "project";
  id: string;
  title: string;
  description?: string;
  status: string;
  owner_name?: string;
  created_at?: string;
}

type SearchResult = LawResult | PatchResult | CommentaryResult | ProjectResult;

interface TabDef {
  key: TabKey;
  label: string;
  kind: SearchResult["kind"] | null; // null = all
}

/* ────────────────────────── constants ────────────────────────── */

const TABS_BASE: TabDef[] = [
  { key: "all", label: "すべて", kind: null },
  { key: "law", label: "法令", kind: "law" },
  { key: "patch", label: "改正案", kind: "patch" },
  { key: "commentary", label: "逐条解説", kind: "commentary" },
  { key: "project", label: "プロジェクト", kind: "project" },
];

const AI_TAB: TabDef = { key: "ai", label: "AI検索", kind: null };

const BADGE_STYLES: Record<SearchResult["kind"], { color: string; bg: string; label: string }> = {
  law: { color: "#1B4B8A", bg: "#EBF2FD", label: "法令" },
  patch: { color: "#D97706", bg: "#FFFBEB", label: "改正案" },
  commentary: { color: "#059669", bg: "#ECFDF5", label: "逐条解説" },
  project: { color: "#7C3AED", bg: "#F5F3FF", label: "プロジェクト" },
};

const LAW_TYPE_JA: Record<string, string> = {
  Act: "法律",
  Constitution: "憲法",
  CabinetOrder: "政令",
  ImperialOrder: "勅令",
  MinisterialOrdinance: "省令",
  Rule: "規則",
  Misc: "告示等",
};

/* ────────────────────────── component ────────────────────────── */

export default function CrossSearchPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
          読み込み中…
        </div>
      }
    >
      <CrossSearchInner />
    </Suspense>
  );
}

function CrossSearchInner() {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams?.get("q") ?? "");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const [lawResults, setLawResults] = useState<LawResult[]>([]);
  const [patchResults, setPatchResults] = useState<PatchResult[]>([]);
  const [commentaryResults, setCommentaryResults] = useState<CommentaryResult[]>([]);
  const [projectResults, setProjectResults] = useState<ProjectResult[]>([]);

  const [lawLoading, setLawLoading] = useState(false);
  const [patchLoading, setPatchLoading] = useState(false);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);

  const [lawError, setLawError] = useState<string | null>(null);
  const [patchError, setPatchError] = useState<string | null>(null);
  const [commentaryError, setCommentaryError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [searched, setSearched] = useState(false);
  const [adv, setAdv] = useState<AdvancedSearchState>(DEFAULT_ADVANCED);
  const [lawTotalCount, setLawTotalCount] = useState<number | null>(null);
  const [lawPage, setLawPage] = useState(1);
  const PER_PAGE = 20;

  // AI検索
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiResults, setAiResults] = useState<AiSearchResult[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSearched, setAiSearched] = useState(false); // AI検索実行済みかどうか
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiAnswerStreaming, setAiAnswerStreaming] = useState(false);

  type SortKey = "default" | "title" | "newest" | "oldest";
  const [sortKey, setSortKey] = useState<SortKey>("default");

  // AI検索の有効チェック: サーバーAI有効 AND ユーザー設定 aiMode=ON
  const [aiServerAvailable, setAiServerAvailable] = useState(false);
  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAiServerAvailable(!!(d?.enabled && d?.vectorize?.enabled)))
      .catch(() => setAiServerAvailable(false));
  }, []);
  useEffect(() => {
    // ユーザー設定の aiMode を読み込み
    const userAi = localStorage.getItem("lp_aiMode") === "true";
    setAiEnabled(aiServerAvailable && userAi);
  }, [aiServerAvailable]);
  useEffect(() => {
    // ヘッダーの AI トグル変更を検知
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setAiEnabled(aiServerAvailable && !!detail?.aiMode);
    };
    window.addEventListener("lexcard:ai-mode-change", handler);
    return () => window.removeEventListener("lexcard:ai-mode-change", handler);
  }, [aiServerAvailable]);

  // AI検索タブを「法令」の隣（2番目）に配置
  const TABS = aiEnabled ? [TABS_BASE[0], TABS_BASE[1], AI_TAB, ...TABS_BASE.slice(2)] : TABS_BASE;

  /* ── search helpers ── */

  const searchedQueryRef = useRef("");
  const searchLawsRef = useRef(adv);
  searchLawsRef.current = adv;

  const searchLaws = useCallback(async (q: string, page = 1) => {
    setLawLoading(true);
    setLawError(null);
    setLawTotalCount(null);
    setLawPage(page);
    try {
      const currentAdv = searchLawsRef.current;
      // OR 検索対応
      const orParts = splitOrQuery(q);
      const isOrSearch = orParts.length > 1;
      let allLaws: LawResult[] = [];
      let sumTotal = 0;

      for (const part of orParts) {
        const pagination = isOrSearch
          ? undefined
          : { offset: (page - 1) * PER_PAGE, limit: PER_PAGE };
        const qs = buildSearchParams(part, currentAdv, pagination);
        const res = await fetch(`/api/egov/search?${qs}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        const laws: LawResult[] = (data.laws ?? data ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (l: any) => ({
            kind: "law" as const,
            law_id: l.law_id,
            law_title: l.law_title,
            law_num: l.law_num,
            law_type: l.law_type,
            promulgation_date: l.promulgation_date,
          }),
        );
        allLaws = allLaws.concat(laws);
        sumTotal += data.total_count ?? laws.length;
      }

      // 重複排除
      if (isOrSearch) {
        const seen = new Set<string>();
        allLaws = allLaws.filter((l) => {
          if (seen.has(l.law_id)) return false;
          seen.add(l.law_id);
          return true;
        });
      }

      // 除外ワード
      allLaws = applyExcludeFilter(allLaws, currentAdv.excludeKeyword) as LawResult[];

      setLawResults(allLaws);
      setLawTotalCount(sumTotal);
    } catch {
      setLawError("検索未対応");
      setLawResults([]);
    } finally {
      setLawLoading(false);
    }
  }, []);

  const searchPatches = useCallback(async (q: string) => {
    setPatchLoading(true);
    setPatchError(null);
    try {
      const res = await fetch(`/api/patch?search=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const patches: PatchResult[] = (Array.isArray(data) ? data : []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => ({
          kind: "patch" as const,
          id: p.id,
          title: p.title,
          law_title: p.law_title,
          law_id: p.law_id,
          status: p.status,
          created_at: p.created_at,
        }),
      );
      setPatchResults(patches);
    } catch {
      setPatchError("検索未対応");
      setPatchResults([]);
    } finally {
      setPatchLoading(false);
    }
  }, []);

  const searchCommentaries = useCallback(async (q: string) => {
    setCommentaryLoading(true);
    setCommentaryError(null);
    try {
      const res = await fetch(`/api/commentary?search=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const comms: CommentaryResult[] = (Array.isArray(data) ? data : []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => ({
          kind: "commentary" as const,
          id: c.id,
          law_id: c.law_id,
          article_title: c.article_title,
          author_name: c.author_name,
          created_at: c.created_at,
        }),
      );
      setCommentaryResults(comms);
    } catch {
      setCommentaryError("検索未対応");
      setCommentaryResults([]);
    } finally {
      setCommentaryLoading(false);
    }
  }, []);

  const searchProjects = useCallback(async (q: string) => {
    setProjectLoading(true);
    setProjectError(null);
    try {
      const res = await fetch(`/api/projects?search=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const projs: ProjectResult[] = (Array.isArray(data) ? data : []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => ({
          kind: "project" as const,
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status,
          owner_name: p.owner_name,
          created_at: p.created_at,
        }),
      );
      setProjectResults(projs);
    } catch {
      setProjectError("検索未対応");
      setProjectResults([]);
    } finally {
      setProjectLoading(false);
    }
  }, []);

  const searchAi = useCallback(
    async (q: string) => {
      if (!aiEnabled) return;
      const session = getSession();
      setAiLoading(true);
      setAiError(null);
      setAiResults([]);
      setAiAnswer("");
      setAiSearched(false);
      try {
        const res = await fetch("/api/ai/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(session ? { memberId: session.memberId, token: session.token } : {}),
            query: q,
            topK: 20,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "エラー" }));
          throw new Error(err.error || `${res.status}`);
        }
        const data = await res.json();
        setAiResults(data.results ?? []);
      } catch (e) {
        setAiError(e instanceof Error ? e.message : "AI検索に失敗しました");
      } finally {
        setAiLoading(false);
        setAiSearched(true);
      }
    },
    [aiEnabled],
  );

  /** AI検索結果に基づくLLM回答をストリーミング取得 */
  const getAiAnswer = useCallback(async (q: string) => {
    const session = getSession();
    if (!session) {
      // AI回答生成はログイン必要（LLMコストが高いため）
      setAiAnswer(
        "AI回答の生成にはログインが必要です。上部のログインボタンからログインしてください。",
      );
      return;
    }
    setAiAnswerStreaming(true);
    setAiAnswer("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: session.memberId,
          token: session.token,
          messages: [{ role: "user", content: q }],
          scope: "semantic",
        }),
      });
      if (!res.ok || !res.body) {
        setAiAnswer("AI回答の取得に失敗しました");
        setAiAnswerStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const d = line.slice(6).trim();
            if (d === "[DONE]") continue;
            try {
              const parsed = JSON.parse(d);
              const token = parsed.response ?? parsed.choices?.[0]?.delta?.content ?? "";
              if (token) {
                acc += token;
                setAiAnswer(acc);
              }
            } catch {
              /* skip */
            }
          }
        }
      }
    } catch {
      setAiAnswer("AI回答の取得に失敗しました");
    } finally {
      setAiAnswerStreaming(false);
    }
  }, []);

  const doSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return;
      setSearched(true);
      setActiveTab("all");
      setSortKey("default");
      searchedQueryRef.current = q.trim();
      // update URL without triggering Next.js Suspense re-suspension
      // (router.replace can cause useSearchParams to re-suspend → component re-mount → state reset)
      window.history.replaceState(null, "", `/search?q=${encodeURIComponent(q.trim())}`);
      // fire all searches in parallel
      searchLaws(q.trim(), 1);
      searchPatches(q.trim());
      searchCommentaries(q.trim());
      searchProjects(q.trim());
      addActivityPoints("search", q.trim());
    },
    [searchLaws, searchPatches, searchCommentaries, searchProjects],
  );

  /** AI検索タブに切り替えた時にAI検索実行 */
  const handleTabChange = useCallback(
    (key: TabKey) => {
      setActiveTab(key);
      if (key === "ai" && searchedQueryRef.current && aiResults.length === 0 && !aiLoading) {
        searchAi(searchedQueryRef.current);
      }
    },
    [searchAi, aiResults, aiLoading],
  );

  /* ── auto-search from URL param on mount ── */
  useEffect(() => {
    const q = searchParams?.get("q");
    if (q?.trim()) {
      setQuery(q);
      doSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── derived values ── */

  const counts: Record<TabKey, number> = {
    all: lawResults.length + patchResults.length + commentaryResults.length + projectResults.length,
    law: lawResults.length,
    patch: patchResults.length,
    commentary: commentaryResults.length,
    project: projectResults.length,
    ai: aiResults.length,
  };

  const isLoading = lawLoading || patchLoading || commentaryLoading || projectLoading;

  const filteredResults: SearchResult[] = (() => {
    if (activeTab === "all")
      return [...lawResults, ...patchResults, ...commentaryResults, ...projectResults];
    if (activeTab === "law") return lawResults;
    if (activeTab === "patch") return patchResults;
    if (activeTab === "commentary") return commentaryResults;
    return projectResults;
  })();

  /* ── sort ── */

  function getResultDate(r: SearchResult): string {
    switch (r.kind) {
      case "law":
        return r.promulgation_date ?? "";
      case "patch":
        return r.created_at ?? "";
      case "commentary":
        return r.created_at ?? "";
      case "project":
        return r.created_at ?? "";
    }
  }

  function getResultTitle(r: SearchResult): string {
    switch (r.kind) {
      case "law":
        return r.law_title;
      case "patch":
        return r.title;
      case "commentary":
        return r.article_title;
      case "project":
        return r.title;
    }
  }

  const sortedResults: SearchResult[] = (() => {
    if (sortKey === "default") return filteredResults;
    const arr = [...filteredResults];
    switch (sortKey) {
      case "title":
        return arr.sort((a, b) => getResultTitle(a).localeCompare(getResultTitle(b), "ja"));
      case "newest":
        return arr.sort((a, b) => getResultDate(b).localeCompare(getResultDate(a)));
      case "oldest":
        return arr.sort((a, b) => getResultDate(a).localeCompare(getResultDate(b)));
      default:
        return arr;
    }
  })();

  const errorForTab = (key: TabKey): string | null => {
    if (key === "law" || key === "all") if (lawError) return lawError;
    if (key === "patch" || key === "all") if (patchError) return patchError;
    if (key === "commentary" || key === "all") if (commentaryError) return commentaryError;
    if (key === "project" || key === "all") if (projectError) return projectError;
    return null;
  };

  /* ── helpers ── */

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  function formatDate(iso?: string) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function resultLink(r: SearchResult): string {
    switch (r.kind) {
      case "law":
        return `/law/${r.law_id}`;
      case "patch":
        return `/patch/${r.id}`;
      case "commentary":
        return `/law/${r.law_id}`;
      case "project":
        return `/projects/${r.id}`;
    }
  }

  /* ────────────────────────── render ────────────────────────── */

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── ヘッダー ── */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <nav
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              marginBottom: "0.5rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span aria-hidden>›</span>
            <span>横断検索</span>
          </nav>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.25rem",
            }}
          >
            横断検索
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            法令・改正案・逐条解説・プロジェクトをキーワードでまとめて検索。AI検索タブでは全9,444法令をセマンティック検索し、関連条文をマップ表示で探索できます。🌐
            英語・中国語・韓国語など多言語でも検索可能。
          </p>
        </div>
      </div>

      {/* ── search bar ── */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "1.5rem 1.25rem 0",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
          <div
            style={{
              flex: 1,
              position: "relative",
            }}
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 18,
                height: 18,
                color: "var(--color-text-secondary)",
                opacity: 0.6,
              }}
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <label htmlFor="cross-search-input" className="sr-only">
              横断検索
            </label>
            <input
              id="cross-search-input"
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="法令・改正案を横断検索（AI検索は多言語対応 🌐）"
              style={{
                width: "100%",
                padding: "0.75rem 0.75rem 0.75rem 2.75rem",
                fontSize: "1rem",
                border: "1.5px solid var(--color-border)",
                borderRadius: 10,
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-sans)",
                outline: "none",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              color: "#fff",
              backgroundColor: "var(--color-accent)",
              border: "none",
              borderRadius: 10,
              cursor: !query.trim() || isLoading ? "not-allowed" : "pointer",
              opacity: !query.trim() || isLoading ? 0.55 : 1,
              transition: "opacity 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {isLoading ? "検索中..." : "検索"}
          </button>
        </form>
        <div style={{ marginTop: "0.5rem" }}>
          <AdvancedSearchPanel state={adv} onChange={setAdv} />
        </div>
      </div>

      {/* ── tab bar + sort ── */}
      {searched && (
        <div
          style={{
            maxWidth: 900,
            margin: "1.5rem auto 0",
            padding: "0 1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderBottom: "2px solid var(--color-border)",
            }}
          >
            <div
              role="tablist"
              aria-label="検索結果フィルター"
              style={{
                display: "flex",
                gap: 0,
                overflowX: "auto",
              }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const err = tab.kind
                  ? tab.kind === "law"
                    ? lawError
                    : tab.kind === "patch"
                      ? patchError
                      : tab.kind === "commentary"
                        ? commentaryError
                        : projectError
                  : null;
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleTabChange(tab.key)}
                    style={{
                      padding: "0.6rem 1rem",
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 700 : 500,
                      fontFamily: "var(--font-sans)",
                      color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: isActive
                        ? "2.5px solid var(--color-accent)"
                        : "2.5px solid transparent",
                      marginBottom: "-2px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                  >
                    {tab.label}
                    {err ? (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--color-text-secondary)",
                          opacity: 0.7,
                        }}
                      >
                        (検索未対応)
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          backgroundColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                          color: isActive ? "#fff" : "var(--color-text-secondary)",
                          borderRadius: 999,
                          padding: "0.1rem 0.45rem",
                          minWidth: "1.2rem",
                          textAlign: "center",
                          lineHeight: 1.5,
                        }}
                      >
                        {counts[tab.key]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* sort dropdown */}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="並び替え"
              style={{
                padding: "0.35rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                cursor: "pointer",
                marginBottom: "0.4rem",
                flexShrink: 0,
              }}
            >
              <option value="default">表示順</option>
              <option value="title">名前順</option>
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
            </select>
          </div>
          {/* 総件数表示 */}
          {lawTotalCount !== null && lawTotalCount > lawResults.length && (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
                padding: "0.4rem 0",
                textAlign: "right",
              }}
            >
              法令: {lawResults.length} 件表示（全 {lawTotalCount.toLocaleString()} 件中）
            </div>
          )}
        </div>
      )}

      {/* ── results area ── */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "1rem 1.25rem 3rem",
        }}
      >
        {/* loading skeleton */}
        {isLoading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: "1.25rem",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              >
                <div
                  style={{
                    height: 14,
                    width: 60,
                    backgroundColor: "var(--color-border)",
                    borderRadius: 4,
                    marginBottom: "0.65rem",
                    opacity: 0.5,
                  }}
                />
                <div
                  style={{
                    height: 16,
                    width: "60%",
                    backgroundColor: "var(--color-border)",
                    borderRadius: 4,
                    marginBottom: "0.5rem",
                    opacity: 0.4,
                  }}
                />
                <div
                  style={{
                    height: 12,
                    width: "40%",
                    backgroundColor: "var(--color-border)",
                    borderRadius: 4,
                    opacity: 0.3,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* error messages */}
        {searched &&
          !isLoading &&
          errorForTab(activeTab) &&
          activeTab !== "all" &&
          activeTab !== "ai" && (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "2rem",
                textAlign: "center",
                color: "var(--color-text-secondary)",
                fontSize: "0.9rem",
                marginTop: "0.5rem",
              }}
            >
              このカテゴリは検索に対応していません (検索未対応)
            </div>
          )}

        {/* no results */}
        {searched &&
          !isLoading &&
          activeTab !== "ai" &&
          sortedResults.length === 0 &&
          !errorForTab(activeTab) && (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "2.5rem 2rem",
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                style={{
                  width: 40,
                  height: 40,
                  color: "var(--color-border)",
                  margin: "0 auto 0.75rem",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.3rem",
                }}
              >
                検索結果が見つかりません
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                別のキーワードで検索してください
              </p>
            </div>
          )}

        {/* initial state */}
        {!searched && !isLoading && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              color: "var(--color-text-secondary)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{
                width: 48,
                height: 48,
                color: "var(--color-border)",
                margin: "0 auto 0.75rem",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <p style={{ fontSize: "0.95rem" }}>キーワードを入力して検索してください</p>
          </div>
        )}

        {/* ── AI検索タブ（コンステレーションマップ） ── */}
        {activeTab === "ai" && searched && (
          <div style={{ marginTop: "0.5rem" }}>
            <SemanticSearchView
              query={searchedQueryRef.current}
              results={aiResults}
              loading={aiLoading}
              error={aiError}
              hasSearched={aiSearched}
              aiAnswer={aiAnswer}
              aiAnswerStreaming={aiAnswerStreaming}
              onRequestAiAnswer={() => getAiAnswer(searchedQueryRef.current)}
            />
            {!aiLoading && aiResults.length > 0 && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-secondary)",
                  textAlign: "center",
                  padding: "0.5rem",
                  lineHeight: 1.6,
                }}
              >
                bge-m3 エンベディングによるセマンティック検索（全9,444法令 /
                371,305条文対応）。結果の正確性は保証されません。
              </div>
            )}
          </div>
        )}

        {/* result cards */}
        {activeTab !== "ai" && !isLoading && sortedResults.length > 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem" }}
          >
            {/* error banner for "all" tab */}
            {activeTab === "all" && (lawError || patchError || commentaryError || projectError) && (
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "0.6rem 1rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                {lawError && <span>法令: (検索未対応)</span>}
                {patchError && <span>改正案: (検索未対応)</span>}
                {commentaryError && <span>逐条解説: (検索未対応)</span>}
                {projectError && <span>プロジェクト: (検索未対応)</span>}
              </div>
            )}

            {sortedResults.map((r, i) => {
              const badge = BADGE_STYLES[r.kind];
              return (
                <Link
                  key={`${r.kind}-${i}`}
                  href={resultLink(r)}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      padding: "1rem 1.25rem",
                      transition: "box-shadow 0.15s, border-color 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                      e.currentTarget.style.borderColor = "var(--color-accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                    }}
                  >
                    {/* badge */}
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: badge.color,
                        backgroundColor: badge.bg,
                        padding: "0.15rem 0.55rem",
                        borderRadius: 999,
                        marginBottom: "0.5rem",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {badge.label}
                    </span>

                    {/* title */}
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        marginBottom: "0.3rem",
                        lineHeight: 1.45,
                      }}
                    >
                      {renderTitle(r)}
                    </div>

                    {/* subtitle / meta */}
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--color-text-secondary)",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      {renderMeta(r, formatDate)}
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* 法令ページネーション（法令タブまたは全体タブ表示時） */}
            {(activeTab === "law" || activeTab === "all") &&
              lawTotalCount !== null &&
              lawTotalCount > PER_PAGE &&
              splitOrQuery(searchedQueryRef.current).length <= 1 && (
                <Pagination
                  currentPage={lawPage}
                  totalPages={Math.ceil(lawTotalCount / PER_PAGE)}
                  onPageChange={(page) => searchLaws(searchedQueryRef.current, page)}
                />
              )}
          </div>
        )}
      </div>

      {/* animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────── render helpers ────────────────────────── */

function renderTitle(r: SearchResult): string {
  switch (r.kind) {
    case "law":
      return r.law_title;
    case "patch":
      return r.title;
    case "commentary":
      return r.article_title;
    case "project":
      return r.title;
  }
}

function renderMeta(r: SearchResult, formatDate: (iso?: string) => string) {
  switch (r.kind) {
    case "law":
      return (
        <>
          <span>{r.law_num}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>{LAW_TYPE_JA[r.law_type] ?? r.law_type}</span>
        </>
      );
    case "patch":
      return (
        <>
          {r.law_title && <span>{r.law_title}</span>}
          {r.law_title && <span style={{ opacity: 0.5 }}>|</span>}
          <span
            style={{
              padding: "0.08rem 0.4rem",
              borderRadius: 4,
              fontSize: "0.72rem",
              fontWeight: 600,
              backgroundColor: statusColor(r.status).bg,
              color: statusColor(r.status).fg,
            }}
          >
            {r.status}
          </span>
          {r.created_at && (
            <>
              <span style={{ opacity: 0.5 }}>|</span>
              <span>{formatDate(r.created_at)}</span>
            </>
          )}
        </>
      );
    case "commentary":
      return (
        <>
          <span>法令ID: {r.law_id}</span>
          {r.author_name && (
            <>
              <span style={{ opacity: 0.5 }}>|</span>
              <span>{r.author_name}</span>
            </>
          )}
          {r.created_at && (
            <>
              <span style={{ opacity: 0.5 }}>|</span>
              <span>{formatDate(r.created_at)}</span>
            </>
          )}
        </>
      );
    case "project":
      return (
        <>
          {r.description && (
            <span
              style={{
                maxWidth: 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.description}
            </span>
          )}
          {r.description && <span style={{ opacity: 0.5 }}>|</span>}
          <span
            style={{
              padding: "0.08rem 0.4rem",
              borderRadius: 4,
              fontSize: "0.72rem",
              fontWeight: 600,
              backgroundColor: "#F5F3FF",
              color: "#7C3AED",
            }}
          >
            {r.status}
          </span>
          {r.owner_name && (
            <>
              <span style={{ opacity: 0.5 }}>|</span>
              <span>{r.owner_name}</span>
            </>
          )}
        </>
      );
  }
}

function statusColor(status: string): { fg: string; bg: string } {
  switch (status) {
    case "下書き":
      return { fg: "#6B7280", bg: "#F3F4F6" };
    case "議論中":
      return { fg: "#0369A1", bg: "#E0F2FE" };
    case "投票中":
      return { fg: "#D97706", bg: "#FFFBEB" };
    case "反映済":
      return { fg: "#059669", bg: "#ECFDF5" };
    case "却下":
      return { fg: "#DC2626", bg: "#FEF2F2" };
    default:
      return { fg: "#6B7280", bg: "#F3F4F6" };
  }
}
