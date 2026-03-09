"use client";

/**
 * ページネーション共通コンポーネント
 * サーチエンジン風: ← 前へ  1  2  3 ... 25  次へ →
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // ページ番号リストを構築: [1, ..., current-2, current-1, current, current+1, current+2, ..., totalPages]
  const pages: (number | "…")[] = [];
  const range = 2; // 現在ページ ±2

  // 先頭
  pages.push(1);

  // 先頭と current-range の間にギャップがあれば省略
  if (currentPage - range > 2) {
    pages.push("…");
  }

  // 現在ページ周辺
  for (
    let i = Math.max(2, currentPage - range);
    i <= Math.min(totalPages - 1, currentPage + range);
    i++
  ) {
    pages.push(i);
  }

  // current+range と末尾の間にギャップがあれば省略
  if (currentPage + range < totalPages - 1) {
    pages.push("…");
  }

  // 末尾（1ページの場合は重複しないように）
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "2rem",
    height: "2rem",
    padding: "0 0.5rem",
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    backgroundColor: "var(--color-surface)",
    fontFamily: "var(--font-sans)",
    fontSize: "0.82rem",
    cursor: "pointer",
    transition: "all 0.15s",
    textDecoration: "none",
    color: "var(--color-text-primary)",
  };

  const activeStyle: React.CSSProperties = {
    ...btnBase,
    backgroundColor: "var(--color-accent)",
    color: "#fff",
    borderColor: "var(--color-accent)",
    fontWeight: 700,
    cursor: "default",
  };

  const disabledStyle: React.CSSProperties = {
    ...btnBase,
    color: "var(--color-border)",
    cursor: "default",
    opacity: 0.5,
  };

  const ellipsisStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "1.5rem",
    height: "2rem",
    fontFamily: "var(--font-sans)",
    fontSize: "0.82rem",
    color: "var(--color-text-secondary)",
    userSelect: "none",
  };

  return (
    <nav
      aria-label="ページネーション"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.35rem",
        padding: "1rem 0",
        flexWrap: "wrap",
      }}
    >
      {/* 前へ */}
      <button
        type="button"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={currentPage <= 1 ? disabledStyle : btnBase}
        aria-label="前のページ"
      >
        ← 前へ
      </button>

      {/* ページ番号 */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} style={ellipsisStyle}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => p !== currentPage && onPageChange(p)}
            style={p === currentPage ? activeStyle : btnBase}
            aria-current={p === currentPage ? "page" : undefined}
            aria-label={`${p}ページ`}
          >
            {p}
          </button>
        ),
      )}

      {/* 次へ */}
      <button
        type="button"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={currentPage >= totalPages ? disabledStyle : btnBase}
        aria-label="次のページ"
      >
        次へ →
      </button>
    </nav>
  );
}
