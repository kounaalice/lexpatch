"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getHistory, clearHistory, type BrowsingHistoryEntry } from "@/lib/history";

/** Format a relative time string in Japanese. */
function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "たった今";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "昨日";
  if (diffDay < 7) return `${diffDay}日前`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek}週間前`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}ヶ月前`;
  return `${Math.floor(diffDay / 365)}年前`;
}

/**
 * Compact browsing-history list (most recent 10 items).
 * Reads from `lp_history` in localStorage.
 */
export function BrowsingHistory() {
  const [entries, setEntries] = useState<BrowsingHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory().slice(0, 10));
  }, []);

  function handleClear() {
    clearHistory();
    setEntries([]);
  }

  if (entries.length === 0) return null;

  return (
    <section
      style={{
        fontFamily: "var(--font-sans)",
        marginBottom: "1.5rem",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "3px",
              height: "0.9rem",
              backgroundColor: "var(--color-accent)",
              borderRadius: "2px",
            }}
          />
          閲覧履歴
        </h3>
        <button
          onClick={handleClear}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.7rem",
            color: "var(--color-text-secondary)",
            background: "none",
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            padding: "0.15rem 0.55rem",
            cursor: "pointer",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-del-fg)";
            e.currentTarget.style.borderColor = "var(--color-del-fg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-secondary)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          履歴をクリア
        </button>
      </div>

      {/* List */}
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          backgroundColor: "var(--color-border)",
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
      >
        {entries.map((entry, i) => {
          const href = entry.articleNum
            ? `/law/${encodeURIComponent(entry.lawId)}/article/${encodeURIComponent(entry.articleNum)}`
            : `/law/${encodeURIComponent(entry.lawId)}`;

          return (
            <li key={`${entry.lawId}-${entry.articleNum ?? ""}-${i}`}>
              <Link
                href={href}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "var(--color-surface)",
                  textDecoration: "none",
                  transition: "background-color 0.12s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface)";
                }}
              >
                {/* Titles */}
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {entry.lawTitle}
                  </span>
                  {entry.articleTitle && (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        color: "var(--color-text-secondary)",
                        marginLeft: "0.4rem",
                      }}
                    >
                      {entry.articleTitle}
                    </span>
                  )}
                </span>

                {/* Relative time */}
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.68rem",
                    color: "var(--color-text-secondary)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {relativeTime(entry.visitedAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
