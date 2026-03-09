"use client";

import Link from "next/link";
import type { FollowEntry } from "@/lib/follows";

interface Props {
  follows: FollowEntry[];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function FollowsWidget({ follows }: Props) {
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
        フォロー中
      </h2>
      {follows.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
            padding: "1rem 0",
          }}
        >
          まだフォローしている法令・プロジェクトはありません。
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
          {follows.map((entry, i) => {
            const href =
              entry.type === "law"
                ? `/law/${encodeURIComponent(entry.id)}`
                : `/projects/${encodeURIComponent(entry.id)}`;
            return (
              <Link
                key={`${entry.type}-${entry.id}`}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.65rem 1rem",
                  textDecoration: "none",
                  borderBottom: i < follows.length - 1 ? "1px solid var(--color-border)" : "none",
                  fontFamily: "var(--font-sans)",
                  transition: "background-color 0.1s",
                }}
              >
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    padding: "0.1rem 0.45rem",
                    borderRadius: "3px",
                    whiteSpace: "nowrap",
                    backgroundColor: entry.type === "law" ? "#EBF2FD" : "#FFFBEB",
                    color: entry.type === "law" ? "#1B4B8A" : "#D97706",
                  }}
                >
                  {entry.type === "law" ? "法令" : "PJ"}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: "0.88rem",
                    color: "var(--color-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.title || entry.id}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(entry.followedAt)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
