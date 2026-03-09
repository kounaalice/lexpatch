"use client";

import { useState, useCallback } from "react";

/* ── 型 ── */

export interface AdvancedSearchState {
  excludeKeyword: string;
  lawType: string;
  dateFrom: string;
  dateTo: string;
}

export const DEFAULT_ADVANCED: AdvancedSearchState = {
  excludeKeyword: "",
  lawType: "",
  dateFrom: "",
  dateTo: "",
};

/* ── OR 検索ユーティリティ ── */

/** "民法 OR 刑法" → ["民法", "刑法"]。OR がなければ [query] をそのまま返す */
export function splitOrQuery(query: string): string[] {
  const parts = query
    .split(/\s+OR\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [query];
}

/** 除外ワードで法令結果をフィルタリング */
export function applyExcludeFilter<T extends { law_title: string; law_num: string }>(
  results: T[],
  excludeKeyword: string,
): T[] {
  if (!excludeKeyword.trim()) return results;
  const excludes = excludeKeyword.trim().split(/\s+/).filter(Boolean);
  return results.filter(
    (r) => !excludes.some((ex) => r.law_title.includes(ex) || r.law_num.includes(ex)),
  );
}

/** 高度検索パラメータから API URLのクエリ文字列を構築 */
export function buildSearchParams(
  query: string,
  adv: AdvancedSearchState,
  pagination?: { offset?: number; limit?: number },
): string {
  const params = new URLSearchParams();
  // e-Gov API の keyword パラメータは無視されるため、常に law_title 検索のみ
  params.set("q", query);
  if (adv.lawType) params.set("law_type", adv.lawType);
  if (adv.dateFrom) params.set("promulgation_from", adv.dateFrom);
  if (adv.dateTo) params.set("promulgation_to", adv.dateTo);
  if (pagination?.offset) params.set("offset", String(pagination.offset));
  if (pagination?.limit) params.set("limit", String(pagination.limit));
  return params.toString();
}

/* ── コンポーネント ── */

export default function AdvancedSearchPanel({
  state,
  onChange,
  compact,
}: {
  state: AdvancedSearchState;
  onChange: (next: AdvancedSearchState) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const update = useCallback(
    (patch: Partial<AdvancedSearchState>) => onChange({ ...state, ...patch }),
    [state, onChange],
  );

  const isActive = !!(state.excludeKeyword || state.lawType || state.dateFrom || state.dateTo);

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--color-text-secondary)",
    minWidth: compact ? "auto" : "5rem",
    whiteSpace: "nowrap",
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.3rem 0.55rem",
    border: "1px solid var(--color-border)",
    borderRadius: "5px",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-sans)",
    fontSize: "0.78rem",
    outline: "none",
    flex: 1,
    minWidth: 0,
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    flex: "none",
    cursor: "pointer",
  };

  return (
    <div>
      {/* トグルボタン */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          padding: "0.2rem 0",
          border: "none",
          background: "transparent",
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
          cursor: "pointer",
          fontWeight: isActive ? 600 : 400,
        }}
      >
        <span
          style={{
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
            fontSize: "0.6rem",
          }}
        >
          ▼
        </span>
        詳細検索
        {isActive && !open && (
          <span
            style={{
              fontSize: "0.6rem",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              borderRadius: "999px",
              padding: "0 0.35rem",
              lineHeight: "1.4",
            }}
          >
            ON
          </span>
        )}
      </button>

      {/* パネル本体 */}
      {open && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem 1rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          {/* 除外ワード */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={labelStyle}>除外</span>
            <input
              type="text"
              value={state.excludeKeyword}
              onChange={(e) => update({ excludeKeyword: e.target.value })}
              placeholder="含まないキーワード（スペース区切り）"
              style={inputStyle}
            />
          </div>

          {/* 行3: 法令種別 */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={labelStyle}>法令種別</span>
            <select
              value={state.lawType}
              onChange={(e) => update({ lawType: e.target.value })}
              style={selectStyle}
            >
              <option value="">すべて</option>
              <option value="Act">法律</option>
              <option value="CabinetOrder">政令</option>
              <option value="MinisterialOrdinance">省令</option>
              <option value="Rule">規則</option>
            </select>
          </div>

          {/* 行4: 期間 */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={labelStyle}>公布日</span>
            <input
              type="date"
              value={state.dateFrom}
              onChange={(e) => update({ dateFrom: e.target.value })}
              style={{ ...inputStyle, flex: "none", width: "140px" }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>～</span>
            <input
              type="date"
              value={state.dateTo}
              onChange={(e) => update({ dateTo: e.target.value })}
              style={{ ...inputStyle, flex: "none", width: "140px" }}
            />
          </div>

          {/* リセットボタン */}
          {isActive && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => onChange(DEFAULT_ADVANCED)}
                style={{
                  padding: "0.2rem 0.6rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  background: "transparent",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                }}
              >
                条件をリセット
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
