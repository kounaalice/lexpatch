"use client";

interface Props {
  followedLaws: number;
  followedProjects: number;
  viewedLaws: number;
  bookmarks: number;
  memos: number;
  annotations: number;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: "100px",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "0.85rem 1rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1.6rem",
          fontWeight: 700,
          color: "var(--color-accent)",
          lineHeight: 1.2,
          marginBottom: "0.3rem",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.72rem",
          color: "var(--color-text-secondary)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function QuickStatsWidget({
  followedLaws,
  followedProjects,
  viewedLaws,
  bookmarks,
  memos,
  annotations,
}: Props) {
  return (
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
      <StatCard label="フォロー中の法令" value={followedLaws} />
      <StatCard label="フォロー中のPJ" value={followedProjects} />
      <StatCard label="閲覧した法令" value={viewedLaws} />
      <StatCard label="ブックマーク" value={bookmarks} />
      <StatCard label="メモ" value={memos} />
      <StatCard label="注釈" value={annotations} />
    </div>
  );
}
