"use client";

import Link from "next/link";
import type { BrowsingHistoryEntry } from "@/lib/history";

interface Props {
  history: BrowsingHistoryEntry[];
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function HistoryWidget({ history }: Props) {
  return (
    <section style={{ marginBottom: "2.5rem" }}>
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
        最近の閲覧履歴
      </h2>
      {history.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
            padding: "1rem 0",
          }}
        >
          閲覧履歴はまだありません。
        </p>
      ) : (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {history.map((entry, i) => {
            const href = entry.articleNum
              ? `/law/${encodeURIComponent(entry.lawId)}/article/${encodeURIComponent(entry.articleNum)}`
              : `/law/${encodeURIComponent(entry.lawId)}`;
            return (
              <Link
                key={`${entry.lawId}-${entry.articleNum ?? ""}-${i}`}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 1rem",
                  textDecoration: "none",
                  borderBottom: i < history.length - 1 ? "1px solid var(--color-border)" : "none",
                  fontFamily: "var(--font-sans)",
                  transition: "background-color 0.1s",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-secondary)",
                    whiteSpace: "nowrap",
                    minWidth: "5.5rem",
                  }}
                >
                  {formatDateTime(entry.visitedAt)}
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-text-primary)",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "40%",
                    flexShrink: 0,
                  }}
                >
                  {entry.lawTitle}
                </span>
                {entry.articleTitle && (
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--color-text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {entry.articleTitle}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
