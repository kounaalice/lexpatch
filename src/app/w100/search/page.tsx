"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { W100Breadcrumb } from "@/components/w100/W100Breadcrumb";
import { getSession } from "@/lib/session";
import { getFieldByCode, getFieldGroup, W100_ASPECTS } from "@/lib/w100-data";
import { getTopicName } from "@/lib/w100-topics";
import { getUUEntries, getUUName, getUUNameEn } from "@/lib/w100-uu-samples";

type SearchMode = "coordinate" | "classify" | "search";

/** W100 座標パース結果 */
interface W100Coord {
  cc: string;
  tt?: string;
  aa?: string;
  uu?: string;
  label: string;
}

/** 座標入力からの解決結果 */
interface CoordResolution {
  cc: string;
  tt?: string;
  aa?: string;
  uu?: string;
  code: string;
  fieldName?: string;
  topicName?: string;
  aspectName?: string;
  uuNameJa?: string;
  uuNameEn?: string;
  groupColor?: string;
  groupBg?: string;
  depth: number; // 1=CC, 2=CC.TT, 3=CC.TT.AA, 4=CC.TT.AA.UU
}

export default function W100SearchPage() {
  const [mode, setMode] = useState<SearchMode>("coordinate");
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [coordInput, setCoordInput] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  /** 座標入力のリアルタイム解決 */
  const coordResolution = useMemo<CoordResolution | null>(() => {
    const raw = coordInput.replace(/\s/g, "").replace(/^W/i, "");
    if (!raw) return null;

    // 数字とドットのみ許可
    if (!/^[\d.]+$/.test(raw)) return null;

    const parts = raw.split(".");
    const cc = parts[0]?.padStart(2, "0").slice(0, 2);
    if (!cc || !/^\d{2}$/.test(cc)) return null;

    const field = getFieldByCode(cc);
    const group = field ? getFieldGroup(field.groupId) : null;

    const result: CoordResolution = {
      cc,
      code: `W${cc}`,
      fieldName: field?.name,
      groupColor: group?.color,
      groupBg: group?.bg,
      depth: 1,
    };

    // TT
    if (parts.length >= 2 && parts[1]) {
      const tt = parts[1].padStart(2, "0").slice(0, 2);
      if (/^\d{2}$/.test(tt)) {
        result.tt = tt;
        result.topicName = getTopicName(cc, tt) || undefined;
        result.code = `W${cc}.${tt}`;
        result.depth = 2;
      }
    }

    // AA
    if (parts.length >= 3 && parts[2]) {
      const aaRaw = parts[2].slice(0, 1);
      if (/^\d$/.test(aaRaw)) {
        result.aa = aaRaw;
        const aspect = W100_ASPECTS.find((a) => a.code === aaRaw);
        result.aspectName = aspect ? `${aspect.label}（${aspect.description}）` : undefined;
        result.code = `W${cc}.${result.tt ?? "00"}.${aaRaw}`;
        result.depth = 3;
      }
    }

    // UU
    if (parts.length >= 4 && parts[3]) {
      const uu = parts[3].padStart(2, "0").slice(0, 2);
      if (/^\d{2}$/.test(uu) && result.tt && result.aa) {
        result.uu = uu;
        result.uuNameJa = getUUName(cc, result.tt, result.aa, uu) || undefined;
        result.uuNameEn = getUUNameEn(cc, result.tt, result.aa, uu) || undefined;
        result.code = `W${cc}.${result.tt}.${result.aa}.${uu}`;
        result.depth = 4;
      }
    }

    return result;
  }, [coordInput]);

  /** 座標から周辺UUをプレビュー */
  const neighborUUs = useMemo(() => {
    if (!coordResolution?.tt || !coordResolution?.aa) return [];
    return getUUEntries(coordResolution.cc, coordResolution.tt, coordResolution.aa);
  }, [coordResolution]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setAiResponse("");
    setSearched(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const session = getSession();
    const aiMode = mode === "classify" ? "classify" : "search";
    const endpoint = aiMode === "classify" ? "/api/w100/classify" : "/api/w100/search";
    const bodyKey = aiMode === "classify" ? "text" : "query";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [bodyKey]: query,
          memberId: session?.memberId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAiResponse(`エラー: ${err.error || res.statusText}`);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "matches") continue;
            const token = parsed.response ?? parsed.choices?.[0]?.delta?.content ?? "";
            if (token) {
              setAiResponse((prev) => prev + token);
            }
          } catch {
            // non-JSON line, skip
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setAiResponse("通信エラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  };

  /** AI応答テキストからW100座標を抽出 */
  const extractCoords = (text: string): W100Coord[] => {
    const regex = /W(\d{2})(?:\.(\d{2}))?(?:\.(\d{1,2}))?(?:\.(\d{2}))?/g;
    const seen = new Set<string>();
    const results: W100Coord[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const cc = m[1];
      const tt = m[2];
      const aa = m[3];
      const uu = m[4];
      const key = `${cc}-${tt ?? ""}-${aa ?? ""}-${uu ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const f = getFieldByCode(cc);
      const fieldName = f?.name ?? `CC${cc}`;
      const tName = tt ? getTopicName(cc, tt) : undefined;

      let label = fieldName;
      if (tName) label += ` › ${tName}`;
      results.push({ cc, tt, aa, uu, label });
    }
    return results;
  };

  const coords = aiResponse ? extractCoords(aiResponse) : [];

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "var(--color-bg)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── header area ── */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--color-header-bg) 0%, #1a4971 100%)",
          padding: "2rem 1.25rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: "0.75rem" }}>
            <W100Breadcrumb />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 0.5rem",
              letterSpacing: "-0.01em",
            }}
          >
            W100 座標探索
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.8)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            座標コードを直接入力、テキストから座標を推定、またはセマンティック検索が可能です
          </p>
        </div>
      </div>

      {/* ── tab bar + content ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1.25rem 0" }}>
        {/* tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "2px solid var(--color-border)",
            marginBottom: "1rem",
          }}
        >
          {(
            [
              { key: "coordinate" as const, label: "座標コード入力", icon: "#⃣" },
              { key: "classify" as const, label: "テキスト → 座標", icon: "📝" },
              { key: "search" as const, label: "セマンティック検索", icon: "🔍" },
            ] as const
          ).map((tab) => {
            const isActive = mode === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setMode(tab.key);
                  if (tab.key !== "coordinate") {
                    setAiResponse("");
                    setSearched(false);
                  }
                }}
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
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                <span style={{ marginRight: "0.3rem" }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ══ TAB 1: 座標コード入力 ══ */}
        {mode === "coordinate" && (
          <div>
            {/* input */}
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-mono)",
                  opacity: 0.7,
                }}
              >
                W
              </span>
              <label htmlFor="coord-input" className="sr-only">
                W100座標コード
              </label>
              <input
                id="coord-input"
                type="text"
                inputMode="numeric"
                value={coordInput}
                onChange={(e) => setCoordInput(e.target.value)}
                placeholder="24.00.3.01 のように数字を入力"
                autoComplete="off"
                style={{
                  width: "100%",
                  padding: "1rem 1rem 1rem 2.5rem",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  border: "2px solid var(--color-border)",
                  borderRadius: 12,
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  transition: "border-color 0.15s",
                  letterSpacing: "0.05em",
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

            {/* format hint */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.35rem",
                alignItems: "center",
                marginBottom: "1.25rem",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 6,
                  backgroundColor: "#DBEAFE",
                  color: "#1D4ED8",
                  fontWeight: 700,
                }}
              >
                CC
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>.</span>
              <span
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 6,
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  fontWeight: 700,
                }}
              >
                TT
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>.</span>
              <span
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 6,
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  fontWeight: 700,
                }}
              >
                AA
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>.</span>
              <span
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 6,
                  backgroundColor: "#F3E8FF",
                  color: "#7C3AED",
                  fontWeight: 700,
                }}
              >
                UU
              </span>
              <span
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.75rem",
                  marginLeft: "0.5rem",
                }}
              >
                例: 24.00.3.01 / 55.15 / 80
              </span>
            </div>

            {/* resolution result */}
            {coordResolution && (
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  overflow: "hidden",
                  marginBottom: "1rem",
                }}
              >
                {/* code header */}
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        fontFamily: "var(--font-mono)",
                        color: coordResolution.groupColor || "var(--color-accent)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {coordResolution.code}
                    </span>
                    <CoordDepthBadge depth={coordResolution.depth} />
                  </div>
                  <Link
                    href={
                      coordResolution.tt
                        ? `/w100/${coordResolution.cc}/${coordResolution.tt}`
                        : `/w100/${coordResolution.cc}`
                    }
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#fff",
                      backgroundColor: "var(--color-accent)",
                      padding: "0.4rem 1rem",
                      borderRadius: 8,
                      textDecoration: "none",
                      transition: "opacity 0.15s",
                    }}
                  >
                    このページを開く →
                  </Link>
                </div>

                {/* resolved dimensions */}
                <div style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {/* CC */}
                    <CoordRow
                      dim="CC"
                      code={coordResolution.cc}
                      name={coordResolution.fieldName}
                      color="#1D4ED8"
                      bg="#DBEAFE"
                    />
                    {/* TT */}
                    {coordResolution.tt && (
                      <CoordRow
                        dim="TT"
                        code={coordResolution.tt}
                        name={coordResolution.topicName}
                        color="#166534"
                        bg="#DCFCE7"
                      />
                    )}
                    {/* AA */}
                    {coordResolution.aa && (
                      <CoordRow
                        dim="AA"
                        code={coordResolution.aa}
                        name={coordResolution.aspectName}
                        color="#92400E"
                        bg="#FEF3C7"
                      />
                    )}
                    {/* UU */}
                    {coordResolution.uu && (
                      <CoordRow
                        dim="UU"
                        code={coordResolution.uu}
                        name={
                          coordResolution.uuNameJa
                            ? `${coordResolution.uuNameJa} (${coordResolution.uuNameEn ?? ""})`
                            : undefined
                        }
                        color="#7C3AED"
                        bg="#F3E8FF"
                      />
                    )}
                  </div>
                </div>

                {/* neighbor UU preview */}
                {neighborUUs.length > 0 && (
                  <div
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      padding: "1rem 1.25rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        marginBottom: "0.6rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      この観点のUU一覧
                      <span
                        style={{
                          fontSize: "0.65rem",
                          backgroundColor: "var(--color-accent)",
                          color: "#fff",
                          borderRadius: 999,
                          padding: "0.1rem 0.4rem",
                        }}
                      >
                        {neighborUUs.length}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.35rem",
                      }}
                    >
                      {neighborUUs.map((uu) => {
                        const isSelected = coordResolution?.uu === uu.code;
                        return (
                          <button
                            key={uu.code}
                            onClick={() => {
                              const base = `${coordResolution!.cc}.${coordResolution!.tt}.${coordResolution!.aa}`;
                              setCoordInput(`${base}.${uu.code}`);
                            }}
                            style={{
                              fontSize: "0.72rem",
                              padding: "0.25rem 0.5rem",
                              borderRadius: 6,
                              border: isSelected
                                ? "1.5px solid var(--color-accent)"
                                : "1px solid var(--color-border)",
                              backgroundColor: isSelected
                                ? "var(--color-accent)"
                                : "var(--color-surface)",
                              color: isSelected ? "#fff" : "var(--color-text-primary)",
                              cursor: "pointer",
                              fontFamily: "var(--font-sans)",
                              transition: "all 0.15s",
                              whiteSpace: "nowrap",
                            }}
                            title={`${uu.en} (UU${uu.code})`}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontWeight: 700,
                                marginRight: "0.25rem",
                              }}
                            >
                              {uu.code}
                            </span>
                            {uu.ja}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* empty state for coordinate tab */}
            {!coordInput && (
              <div
                style={{
                  textAlign: "center",
                  padding: "2.5rem 1rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "0.75rem",
                    lineHeight: 1,
                    opacity: 0.3,
                  }}
                >
                  🔢
                </div>
                <p style={{ fontSize: "0.95rem", margin: "0 0 0.75rem", fontWeight: 600 }}>
                  数字を入力するだけで知識にアクセス
                </p>
                <div
                  style={{
                    fontSize: "0.8rem",
                    lineHeight: 1.8,
                    maxWidth: 400,
                    margin: "0 auto",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    パスコードのようにW100座標を入力すると、
                    分野・主題・観点・知識単位がリアルタイムで解決されます。
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "0.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    {["24.00.3.01", "55.15.1", "80.00"].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setCoordInput(ex)}
                        style={{
                          fontSize: "0.8rem",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          padding: "0.4rem 0.75rem",
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                          backgroundColor: "var(--color-surface)",
                          color: "var(--color-accent)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        W{ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 2 & 3: AI modes ══ */}
        {mode !== "coordinate" && (
          <>
            {/* input form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
              <div style={{ flex: 1, position: "relative" }}>
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
                <label htmlFor="w100-search-input" className="sr-only">
                  W100 AI探索
                </label>
                <input
                  id="w100-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    mode === "classify"
                      ? "分類したいテキストを入力（論文タイトル、研究テーマ、政策名など）…"
                      : "知りたいテーマ・キーワードを入力…"
                  }
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
                disabled={!query.trim() || loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  color: "#fff",
                  backgroundColor: "var(--color-accent)",
                  border: "none",
                  borderRadius: 10,
                  cursor: !query.trim() || loading ? "not-allowed" : "pointer",
                  opacity: !query.trim() || loading ? 0.55 : 1,
                  transition: "opacity 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "分析中…" : mode === "classify" ? "座標推定" : "検索"}
              </button>
            </form>
          </>
        )}
      </div>

      {/* ── results area (AI modes only) ── */}
      {mode !== "coordinate" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 1.25rem 3rem" }}>
          {/* loading skeleton */}
          {loading && (
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

          {/* initial state */}
          {!searched && !loading && (
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
              <p style={{ fontSize: "0.95rem", margin: "0 0 0.5rem" }}>
                テキストを入力してW100座標を探索してください
              </p>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.8,
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>テキスト → 座標:</strong> 論文タイトルや研究テーマからW100コードを推定
                </p>
                <p style={{ margin: 0 }}>
                  <strong>セマンティック検索:</strong> キーワードから関連するW100分野を横断検索
                </p>
                <p style={{ margin: "0.5rem 0 0", opacity: 0.7 }}>
                  例: 「AIガバナンス設計指針」→ W27.40.04.15
                </p>
              </div>
            </div>
          )}

          {/* error state */}
          {searched && !loading && aiResponse.startsWith("エラー") && (
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
              <p style={{ margin: 0, color: "var(--color-text-primary)", fontWeight: 600 }}>
                {aiResponse}
              </p>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem" }}>
                別のテキストで再度お試しください
              </p>
            </div>
          )}

          {/* coordinate cards */}
          {searched && !loading && coords.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h2
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                推定 W100 座標
                <span
                  style={{
                    fontSize: "0.7rem",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "0.1rem 0.45rem",
                    minWidth: "1.2rem",
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  {coords.length}
                </span>
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {coords.map((coord, i) => {
                  const code = `W${coord.cc}${coord.tt ? "." + coord.tt : ""}${coord.aa ? "." + coord.aa : ""}${coord.uu ? "." + coord.uu : ""}`;
                  const href = coord.tt ? `/w100/${coord.cc}/${coord.tt}` : `/w100/${coord.cc}`;
                  return (
                    <Link key={i} href={href} style={{ textDecoration: "none", color: "inherit" }}>
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
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: "#0369A1",
                            backgroundColor: "#EBF5FF",
                            padding: "0.15rem 0.55rem",
                            borderRadius: 999,
                            marginBottom: "0.5rem",
                            letterSpacing: "0.03em",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {code}
                        </span>
                        <div
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                            marginBottom: "0.3rem",
                            lineHeight: 1.45,
                          }}
                        >
                          {coord.label}
                        </div>
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
                          <span>CC{coord.cc}</span>
                          {coord.tt && (
                            <>
                              <span style={{ opacity: 0.5 }}>›</span>
                              <span>TT{coord.tt}</span>
                            </>
                          )}
                          {coord.aa && (
                            <>
                              <span style={{ opacity: 0.5 }}>›</span>
                              <span>AA{coord.aa}</span>
                            </>
                          )}
                          {coord.uu && (
                            <>
                              <span style={{ opacity: 0.5 }}>›</span>
                              <span>UU{coord.uu}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI response text */}
          {searched && !loading && aiResponse && !aiResponse.startsWith("エラー") && (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "1.25rem",
              }}
            >
              <h2
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ width: 16, height: 16, color: "var(--color-accent)" }}
                >
                  <path d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 0l1.062 1.06a.75.75 0 11-1.06 1.06L5.05 4.11a.75.75 0 010-1.06zm9.9 0a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM10 7a3 3 0 100 6 3 3 0 000-6zm-6.25 3a.75.75 0 01-.75-.75h-1.5a.75.75 0 010 1.5h1.5A.75.75 0 013.75 10zm14.5 0a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zm-12.138 3.879a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm8.876 0a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15z" />
                </svg>
                AI 分析
              </h2>
              <div
                style={{
                  fontSize: "0.88rem",
                  color: "var(--color-text-primary)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.7,
                }}
              >
                {aiResponse}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-secondary)",
                  textAlign: "right",
                  marginTop: "0.75rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                Workers AI による推定結果です。正確性は保証されません。
              </div>
            </div>
          )}

          {/* streaming indicator */}
          {loading && aiResponse && (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "1.25rem",
                marginTop: "0.75rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.88rem",
                  color: "var(--color-text-primary)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.7,
                }}
              >
                {aiResponse}
                <span style={{ animation: "blink 1s infinite" }}>▌</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* bottom padding for coordinate mode */}
      {mode === "coordinate" && <div style={{ height: "3rem" }} />}

      {/* animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── 座標行コンポーネント ──
function CoordRow({
  dim,
  code,
  name,
  color,
  bg,
}: {
  dim: string;
  code: string;
  name?: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 0",
      }}
    >
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color,
          backgroundColor: bg,
          padding: "0.2rem 0.5rem",
          borderRadius: 6,
          fontFamily: "var(--font-mono)",
          minWidth: "2.5rem",
          textAlign: "center",
        }}
      >
        {dim}
        {code}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {name ? (
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {name}
          </span>
        ) : (
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              fontStyle: "italic",
            }}
          >
            {dim === "UU" ? "（UUデータ未登録）" : `${dim}${code}`}
          </span>
        )}
      </div>
    </div>
  );
}

// ── 深度バッジ ──
function CoordDepthBadge({ depth }: { depth: number }) {
  const labels = ["", "分野", "主題", "観点", "知識単位"];
  const colors = ["", "#1D4ED8", "#166534", "#92400E", "#7C3AED"];
  const bgs = ["", "#DBEAFE", "#DCFCE7", "#FEF3C7", "#F3E8FF"];
  return (
    <span
      style={{
        fontSize: "0.65rem",
        fontWeight: 700,
        color: colors[depth],
        backgroundColor: bgs[depth],
        padding: "0.15rem 0.45rem",
        borderRadius: 999,
      }}
    >
      {labels[depth]}レベル
    </span>
  );
}
