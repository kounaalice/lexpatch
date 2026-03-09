"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

interface SharedBookmark {
  l: string; // lawId
  t: string; // lawTitle
  a?: string; // articleNum
  at?: string; // articleTitle
}

function BookmarkListContent() {
  const searchParams = useSearchParams();
  const listParam = searchParams?.get("list") ?? null;

  const bookmarks = useMemo(() => {
    if (!listParam) return [];
    try {
      const decoded = decodeURIComponent(escape(atob(listParam)));
      const parsed = JSON.parse(decoded) as SharedBookmark[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [listParam]);

  // 法令でグルーピング
  const grouped = useMemo(() => {
    const map = new Map<string, { lawTitle: string; items: SharedBookmark[] }>();
    for (const bm of bookmarks) {
      if (!map.has(bm.l)) {
        map.set(bm.l, { lawTitle: bm.t, items: [] });
      }
      map.get(bm.l)!.items.push(bm);
    }
    return Array.from(map.entries());
  }, [bookmarks]);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link
            href="/"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            ← トップへ
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              color: "var(--color-text-primary)",
              marginTop: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            共有ブックマーク
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
            }}
          >
            他のユーザーが共有したブックマークリストです。
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        {bookmarks.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontFamily: "var(--font-sans)",
              fontSize: "0.88rem",
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-surface)",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
            }}
          >
            ブックマークリストが見つかりません。URLが正しいか確認してください。
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {grouped.map(([lawId, { lawTitle, items }]) => (
              <div key={lawId}>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Link
                    href={`/law/${encodeURIComponent(lawId)}`}
                    style={{ color: "var(--color-accent)", textDecoration: "none" }}
                  >
                    {lawTitle}
                  </Link>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                      fontWeight: 400,
                    }}
                  >
                    ({items.length})
                  </span>
                </h2>
                <div
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {items.map((bm, i) => {
                    const href = bm.a
                      ? `/law/${encodeURIComponent(bm.l)}/article/${encodeURIComponent(bm.a)}`
                      : `/law/${encodeURIComponent(bm.l)}`;
                    return (
                      <Link
                        key={`${bm.l}-${bm.a ?? ""}-${i}`}
                        href={href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          padding: "0.6rem 1rem",
                          textDecoration: "none",
                          borderBottom:
                            i < items.length - 1 ? "1px solid var(--color-border)" : "none",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--color-accent)",
                            flexShrink: 0,
                          }}
                        >
                          ★
                        </span>
                        <span
                          style={{
                            fontSize: "0.88rem",
                            color: "var(--color-text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {bm.at || (bm.a ? `第${bm.a}条` : lawTitle)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            backgroundColor: "var(--color-bg)",
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-secondary)",
            padding: "4rem 1rem",
          }}
        >
          読み込み中...
        </div>
      }
    >
      <BookmarkListContent />
    </Suspense>
  );
}
