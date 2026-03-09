"use client";

import { useState } from "react";
import Link from "next/link";
import type { LawSearchResult } from "@/lib/egov/types";

type LawTypeFilter = "all" | "Act" | "CabinetOrder" | "MinisterialOrdinance";
type SortKey = "default" | "title" | "promulgation_date";

const FILTER_OPTIONS: { value: LawTypeFilter; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "Act", label: "法律" },
  { value: "CabinetOrder", label: "政令" },
  { value: "MinisterialOrdinance", label: "省令" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "法令番号順" },
  { value: "title", label: "名前順" },
  { value: "promulgation_date", label: "公布日順" },
];

function lawTypeLabel(lt: string): string {
  switch (lt) {
    case "Act":
      return "法律";
    case "CabinetOrder":
      return "政令";
    case "MinisterialOrdinance":
      return "省令";
    default:
      return lt;
  }
}

export default function CategoryLawList({
  laws,
  groupBg,
  groupColor,
}: {
  laws: LawSearchResult[];
  groupBg: string;
  groupColor: string;
}) {
  const [filter, setFilter] = useState<LawTypeFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [keyword, setKeyword] = useState("");

  // フィルタリング（種別 + キーワード）
  const filtered = laws
    .filter((l) => filter === "all" || l.law_type === filter)
    .filter((l) => !keyword || l.law_title.includes(keyword) || l.law_num.includes(keyword));

  // 各種別の件数（キーワード適用後）
  const keywordFiltered = laws.filter(
    (l) => !keyword || l.law_title.includes(keyword) || l.law_num.includes(keyword),
  );
  const counts: Record<LawTypeFilter, number> = {
    all: keywordFiltered.length,
    Act: keywordFiltered.filter((l) => l.law_type === "Act").length,
    CabinetOrder: keywordFiltered.filter((l) => l.law_type === "CabinetOrder").length,
    MinisterialOrdinance: keywordFiltered.filter((l) => l.law_type === "MinisterialOrdinance")
      .length,
  };

  // ソート
  const sorted = (() => {
    if (sortKey === "default") return filtered;
    const arr = [...filtered];
    switch (sortKey) {
      case "title":
        return arr.sort((a, b) => a.law_title.localeCompare(b.law_title, "ja"));
      case "promulgation_date":
        return arr.sort((a, b) =>
          (b.promulgation_date ?? "").localeCompare(a.promulgation_date ?? ""),
        );
      default:
        return arr;
    }
  })();

  return (
    <>
      {/* キーワード絞り込み */}
      <div style={{ marginBottom: "0.75rem" }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="法令名で絞り込み"
          style={{
            width: "100%",
            maxWidth: "320px",
            padding: "0.4rem 0.75rem",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* フィルタータブ + ソート */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div
          role="tablist"
          aria-label="法令種別フィルター"
          style={{
            display: "flex",
            gap: "0.35rem",
            flexWrap: "wrap",
          }}
        >
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            const count = counts[opt.value];
            if (opt.value !== "all" && count === 0) return null;
            return (
              <button
                key={opt.value}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(opt.value)}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "6px",
                  border: active
                    ? "1.5px solid var(--color-accent)"
                    : "1px solid var(--color-border)",
                  backgroundColor: active ? "var(--color-accent)" : "var(--color-surface)",
                  color: active ? "#fff" : "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                {opt.label}
                <span
                  style={{
                    fontSize: "0.7rem",
                    opacity: active ? 0.9 : 0.6,
                    fontWeight: 400,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ソートドロップダウン */}
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          aria-label="並び替え"
          style={{
            padding: "0.3rem 0.6rem",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            cursor: "pointer",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 法令一覧 */}
      {sorted.length === 0 ? (
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
          }}
        >
          該当する法令がありません。
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {sorted.map((law) => (
            <Link
              key={law.law_id}
              href={`/law/${encodeURIComponent(law.law_id)}`}
              style={{
                display: "block",
                padding: "0.875rem 1rem",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "border-color 0.15s",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif)",
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
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{law.law_num}</span>
                <span
                  style={{
                    padding: "0.05rem 0.4rem",
                    backgroundColor: groupBg,
                    color: groupColor,
                    borderRadius: "3px",
                    fontSize: "0.72rem",
                  }}
                >
                  {lawTypeLabel(law.law_type)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
