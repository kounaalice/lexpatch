"use client";

import Link from "next/link";
import type { NoteEntry, NoteCounts } from "@/lib/notes";

interface Props {
  notes: NoteEntry[];
  noteCounts: NoteCounts;
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

export default function NotesWidget({ notes, noteCounts }: Props) {
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
        マイノート ({noteCounts.total})
      </h2>
      {notes.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
            padding: "1rem 0",
          }}
        >
          メモ・注釈はまだありません。条文ページでメモや注釈を残すと、ここに表示されます。
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {notes.map((note) => {
            const href = note.articleTitle
              ? `/law/${encodeURIComponent(note.lawId)}/article/${encodeURIComponent(note.articleTitle)}`
              : `/law/${encodeURIComponent(note.lawId)}`;
            const truncated = note.text.length > 120 ? note.text.slice(0, 120) + "..." : note.text;
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.4rem",
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
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {truncated}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
