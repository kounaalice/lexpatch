"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getSession, type Session } from "@/lib/session";
import { getAllNotes, getNoteCounts, type NoteEntry, type NoteCounts } from "@/lib/notes";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function NotesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [counts, setCounts] = useState<NoteCounts>({ memos: 0, annotations: 0, total: 0 });
  const [filter, setFilter] = useState<"all" | "memo" | "annotation">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const s = getSession();
    setSession(s);
    setLoading(false);
    if (s) {
      setNotes(getAllNotes());
      setCounts(getNoteCounts());
    }
  }, []);

  const filtered = useMemo(() => {
    let result = notes;
    if (filter !== "all") {
      result = result.filter((n) => n.type === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.text.toLowerCase().includes(q) ||
          (n.lawTitle || "").toLowerCase().includes(q) ||
          n.articleTitle.toLowerCase().includes(q),
      );
    }
    return result;
  }, [notes, filter, search]);

  if (loading) {
    return (
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
    );
  }

  if (!session) {
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "2.5rem 2rem",
            textAlign: "center",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.75rem",
            }}
          >
            ログインが必要です
          </div>
          <Link
            href="/login?return=/dashboard/notes"
            style={{
              display: "inline-block",
              padding: "0.7rem 1.5rem",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

  const filterBtn = (
    value: "all" | "memo" | "annotation",
    _label: string,
  ): React.CSSProperties => ({
    padding: "0.35rem 0.8rem",
    fontFamily: "var(--font-sans)",
    fontSize: "0.78rem",
    fontWeight: filter === value ? 600 : 400,
    color: filter === value ? "#fff" : "var(--color-text-secondary)",
    backgroundColor: filter === value ? "var(--color-accent)" : "var(--color-surface)",
    border: `1px solid ${filter === value ? "var(--color-accent)" : "var(--color-border)"}`,
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 1.5rem 3rem" }}>
        {/* パンくず */}
        <nav
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            トップ
          </Link>
          <span style={{ margin: "0 0.4rem" }}>{" \u203A "}</span>
          <Link href="/dashboard" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            マイページ
          </Link>
          <span style={{ margin: "0 0.4rem" }}>{" \u203A "}</span>
          <span>マイノート</span>
        </nav>

        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "0.3rem",
          }}
        >
          マイノート
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.2rem",
          }}
        >
          メモ {counts.memos}件 ・ 注釈 {counts.annotations}件
        </p>

        {/* 検索 + フィルタ */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "1.2rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="キーワードで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: "1 1 200px",
              padding: "0.5rem 0.75rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
          <button onClick={() => setFilter("all")} style={filterBtn("all", "すべて")}>
            すべて
          </button>
          <button onClick={() => setFilter("memo")} style={filterBtn("memo", "メモ")}>
            メモ
          </button>
          <button onClick={() => setFilter("annotation")} style={filterBtn("annotation", "注釈")}>
            注釈
          </button>
        </div>

        {/* ノート一覧 */}
        {filtered.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              padding: "2rem 0",
              textAlign: "center",
            }}
          >
            {notes.length === 0
              ? "メモ・注釈はまだありません。条文ページでメモや注釈を残すと、ここに表示されます。"
              : "条件に一致するノートがありません。"}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map((note) => {
              const href = note.articleTitle
                ? `/law/${encodeURIComponent(note.lawId)}/article/${encodeURIComponent(note.articleTitle)}`
                : `/law/${encodeURIComponent(note.lawId)}`;
              const isMemo = note.type === "memo";

              return (
                <Link
                  key={note.key}
                  href={href}
                  style={{
                    display: "block",
                    padding: "0.85rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    textDecoration: "none",
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* ヘッダー行 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.4rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        padding: "0.08rem 0.4rem",
                        borderRadius: "3px",
                        whiteSpace: "nowrap",
                        backgroundColor: isMemo ? "var(--color-add-bg)" : "var(--color-warn-bg)",
                        color: isMemo ? "var(--color-add-fg)" : "var(--color-warn-fg)",
                      }}
                    >
                      {isMemo ? "メモ" : "注釈"}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {note.lawTitle || note.lawId}
                    </span>
                    {note.articleTitle && (
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.75rem",
                          color: "var(--color-text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {note.articleTitle}
                        {note.lineIndex !== undefined && ` 第${note.lineIndex + 1}項`}
                      </span>
                    )}
                    {note.updatedAt && (
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.68rem",
                          color: "var(--color-text-secondary)",
                          marginLeft: "auto",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(note.updatedAt)}
                      </span>
                    )}
                  </div>

                  {/* テキスト全文 */}
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {note.text}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
