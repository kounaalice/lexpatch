"use client";

import Link from "next/link";
import type { Bookmark } from "@/lib/bookmarks";

interface Props {
  bookmarks: Bookmark[];
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

export default function BookmarksWidget({ bookmarks }: Props) {
  if (bookmarks.length === 0) return null;

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
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
          ブックマーク
        </h2>
        <button
          onClick={() => {
            const data = bookmarks.map((b) => ({
              l: b.lawId,
              t: b.lawTitle,
              a: b.articleNum,
              at: b.articleTitle,
            }));
            const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
            const url = `${window.location.origin}/bookmarks?list=${encoded}`;
            navigator.clipboard
              .writeText(url)
              .then(() => alert("ブックマークリストのURLをコピーしました"));
          }}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            padding: "0.25rem 0.6rem",
            borderRadius: "4px",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          リストを共有
        </button>
      </div>
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {bookmarks.map((bm, i) => {
          const href = bm.articleNum
            ? `/law/${encodeURIComponent(bm.lawId)}/article/${encodeURIComponent(bm.articleNum)}`
            : `/law/${encodeURIComponent(bm.lawId)}`;
          return (
            <Link
              key={`${bm.lawId}-${bm.articleNum ?? ""}`}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.6rem 1rem",
                textDecoration: "none",
                borderBottom: i < bookmarks.length - 1 ? "1px solid var(--color-border)" : "none",
                fontFamily: "var(--font-sans)",
                transition: "background-color 0.1s",
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "var(--color-accent)", flexShrink: 0 }}>
                ★
              </span>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-text-primary)",
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                {bm.lawTitle}
                {bm.articleTitle && (
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--color-text-secondary)",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {bm.articleTitle}
                  </span>
                )}
              </span>
              {bm.memo && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                    maxWidth: "30%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {bm.memo}
                </span>
              )}
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatDate(bm.createdAt)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
