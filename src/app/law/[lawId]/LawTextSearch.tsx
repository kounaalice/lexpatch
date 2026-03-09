"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import type { Chapter, Article, Paragraph, Item, Subitem, AppendixTable } from "@/lib/egov/types";
// 全角数字変換（項番号表示用）
function toFullWidth(s: string): string {
  return s.replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
}
import { ItemRenderer } from "@/components/law/ItemRenderer";
import { AppendixTableRenderer } from "@/components/law/AppendixTableRenderer";

/* ── ハイライトテキスト分割 ── */

function highlightSegments(
  text: string,
  keyword: string,
  matchIndexStart: number,
  currentMatchIndex: number,
): { nodes: (string | React.ReactElement)[]; matchCount: number } {
  if (!keyword) return { nodes: [text], matchCount: 0 };
  const nodes: (string | React.ReactElement)[] = [];
  let remaining = text;
  let localIdx = 0;

  while (remaining.length > 0) {
    const idx = remaining.toLowerCase().indexOf(keyword.toLowerCase());
    if (idx === -1) {
      nodes.push(remaining);
      break;
    }
    if (idx > 0) {
      nodes.push(remaining.slice(0, idx));
    }
    const globalIdx = matchIndexStart + localIdx;
    const isCurrent = globalIdx === currentMatchIndex;
    nodes.push(
      <mark
        key={`hl-${globalIdx}`}
        data-match-index={globalIdx}
        style={{
          background: isCurrent ? "#F59E0B" : "#FEF3C7",
          color: "#1E3A5F",
          padding: "0 2px",
          borderRadius: "2px",
          outline: isCurrent ? "2px solid #D97706" : "none",
        }}
      >
        {remaining.slice(idx, idx + keyword.length)}
      </mark>,
    );
    remaining = remaining.slice(idx + keyword.length);
    localIdx++;
  }
  return { nodes, matchCount: localIdx };
}

/* ── テキスト内のマッチ数をカウント ── */
function countMatches(text: string, kw: string): number {
  if (!kw) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    const found = text.toLowerCase().indexOf(kw, idx);
    if (found === -1) break;
    count++;
    idx = found + kw.length;
  }
  return count;
}

/* ── 号・細目内のマッチ数を再帰的にカウント ── */
function countItemMatches(items: Item[] | undefined, kw: string): number {
  if (!items || !kw) return 0;
  let count = 0;
  for (const item of items) {
    count += countMatches(item.sentences.join(""), kw);
    count += countSubitemMatches(item.subitems, kw);
  }
  return count;
}

function countSubitemMatches(subitems: Subitem[] | undefined, kw: string): number {
  if (!subitems || !kw) return 0;
  let count = 0;
  for (const sub of subitems) {
    count += countMatches(sub.sentences.join(""), kw);
    count += countSubitemMatches(sub.subitems, kw);
  }
  return count;
}

/* ── メインコンポーネント ── */

export default function LawTextSearch({
  chapters,
  articles,
  lawId,
  preamble,
  appendixTables,
}: {
  chapters: Chapter[];
  articles: Article[];
  lawId: string;
  preamble?: Paragraph[];
  appendixTables?: AppendixTable[];
}) {
  const [keyword, setKeyword] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 全条文をフラット化
  const allItems = useMemo(() => {
    const items: { article: Article; chapterTitle?: string }[] = [];
    let lastChapter: string | undefined;
    if (chapters.length > 0) {
      for (const ch of chapters) {
        for (const a of ch.articles) {
          items.push({
            article: a,
            chapterTitle: ch.title !== lastChapter ? ch.title : undefined,
          });
          lastChapter = ch.title;
        }
      }
    } else {
      for (const a of articles) {
        items.push({ article: a });
      }
    }
    return items;
  }, [chapters, articles]);

  // 総マッチ数を計算（項 + 号 + 号細分）
  const totalMatches = useMemo(() => {
    if (!keyword) return 0;
    const kw = keyword.toLowerCase();
    let count = 0;
    // 前文
    if (preamble) {
      for (const p of preamble) {
        count += countMatches(p.sentences.join(""), kw);
      }
    }
    // 条文
    for (const { article } of allItems) {
      for (const p of article.paragraphs) {
        count += countMatches(p.sentences.join(""), kw);
        count += countItemMatches(p.items, kw);
      }
    }
    return count;
  }, [keyword, allItems, preamble]);

  // currentMatch をバウンド
  useEffect(() => {
    if (totalMatches === 0) {
      setCurrentMatch(0);
    } else if (currentMatch >= totalMatches) {
      setCurrentMatch(0);
    }
  }, [totalMatches, currentMatch]);

  // マッチへスクロール
  useEffect(() => {
    if (!keyword || totalMatches === 0) return;
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector(
      `[data-match-index="${currentMatch}"]`,
    ) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentMatch, keyword, totalMatches]);

  const goNext = useCallback(() => {
    setCurrentMatch((c) => (c + 1) % Math.max(totalMatches, 1));
  }, [totalMatches]);

  const goPrev = useCallback(() => {
    setCurrentMatch((c) => (c - 1 + Math.max(totalMatches, 1)) % Math.max(totalMatches, 1));
  }, [totalMatches]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) goPrev();
        else goNext();
      }
    },
    [goNext, goPrev],
  );

  // レンダリング — マッチインデックスをグローバルで追跡
  let globalMatchIdx = 0;

  function renderText(text: string) {
    if (!keyword) return text;
    const { nodes, matchCount } = highlightSegments(text, keyword, globalMatchIdx, currentMatch);
    globalMatchIdx += matchCount;
    return <>{nodes}</>;
  }

  return (
    <>
      {/* 検索バー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.4rem 0.6rem",
          marginBottom: "0.5rem",
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "6px",
        }}
      >
        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.82rem", flexShrink: 0 }}>
          🔍
        </span>
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setCurrentMatch(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="条文内を検索..."
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-primary)",
            outline: "none",
            minWidth: 0,
          }}
        />
        {keyword && (
          <>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                color: totalMatches > 0 ? "var(--color-text-secondary)" : "#DC2626",
                whiteSpace: "nowrap",
              }}
            >
              {totalMatches > 0 ? `${currentMatch + 1} / ${totalMatches}` : "0件"}
            </span>
            <button
              onClick={goPrev}
              disabled={totalMatches === 0}
              style={{
                border: "none",
                background: "transparent",
                cursor: totalMatches > 0 ? "pointer" : "default",
                padding: "0 0.2rem",
                fontSize: "0.78rem",
                color: totalMatches > 0 ? "var(--color-text-secondary)" : "var(--color-border)",
              }}
              aria-label="前のマッチ"
            >
              ▲
            </button>
            <button
              onClick={goNext}
              disabled={totalMatches === 0}
              style={{
                border: "none",
                background: "transparent",
                cursor: totalMatches > 0 ? "pointer" : "default",
                padding: "0 0.2rem",
                fontSize: "0.78rem",
                color: totalMatches > 0 ? "var(--color-text-secondary)" : "var(--color-border)",
              }}
              aria-label="次のマッチ"
            >
              ▼
            </button>
            <button
              onClick={() => {
                setKeyword("");
                setCurrentMatch(0);
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "0 0.2rem",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
              }}
              aria-label="検索クリア"
            >
              ✕
            </button>
          </>
        )}
      </div>

      {/* 条文表示 */}
      <div
        ref={containerRef}
        id="law-fulltext-container"
        style={{
          maxHeight: "60vh",
          overflow: "auto",
          padding: "0.5rem 0",
          fontSize: "0.82rem",
          lineHeight: 1.8,
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
        }}
      >
        {/* 前文 */}
        {preamble && preamble.length > 0 && (
          <div
            style={{
              padding: "0.4rem 0.4rem 0.8rem",
              borderBottom: "1px solid var(--color-border)",
              marginBottom: "0.6rem",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              前文
            </h3>
            {preamble.map((p, i) => (
              <p
                key={i}
                style={{
                  margin: "0 0 0.3rem",
                  textIndent: "1em",
                  color: "var(--color-text-primary)",
                }}
              >
                {renderText(p.sentences.join(""))}
              </p>
            ))}
          </div>
        )}

        {allItems.map(({ article: a, chapterTitle }, i) => (
          <div key={a.num || i} id={`preview-article-${a.num}`}>
            {chapterTitle && (
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "var(--color-text-secondary)",
                  borderBottom: "1px solid var(--color-border)",
                  paddingBottom: "0.25rem",
                  marginTop: i > 0 ? "1rem" : "0.25rem",
                  marginBottom: "0.4rem",
                }}
              >
                {chapterTitle}
              </h3>
            )}
            <div style={{ padding: "0.2rem 0.4rem", marginBottom: "0.1rem" }}>
              <Link
                href={`/law/${encodeURIComponent(lawId)}/article/${encodeURIComponent(a.num)}`}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: "var(--color-text-primary)",
                  textDecoration: "none",
                }}
              >
                {a.title || `第${a.num}条`}
                {a.caption && (
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--color-text-secondary)",
                      marginLeft: "0.4rem",
                      fontSize: "0.82rem",
                    }}
                  >
                    {a.caption}
                  </span>
                )}
              </Link>
              {a.paragraphs.map((p, pi) => {
                const showNum = p.num && p.num !== "1";
                const text = p.sentences.join("");
                return (
                  <div
                    key={pi}
                    style={{ margin: "0 0 0.1rem", color: "var(--color-text-primary)" }}
                  >
                    <p style={{ margin: 0 }}>
                      {showNum && (
                        <span
                          style={{
                            marginRight: "0.3rem",
                            color: "var(--color-text-secondary)",
                            fontSize: "0.82rem",
                          }}
                        >
                          {toFullWidth(p.num)}
                        </span>
                      )}
                      {renderText(text)}
                    </p>
                    {/* 号・号細分 */}
                    {p.items && p.items.length > 0 && (
                      <ItemRenderer items={p.items} renderText={renderText} fontSize="0.82rem" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* 別表 */}
        {appendixTables &&
          appendixTables.map((t, ti) => <AppendixTableRenderer key={ti} table={t} />)}
      </div>
    </>
  );
}
