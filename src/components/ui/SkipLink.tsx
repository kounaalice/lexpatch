"use client";

/**
 * スキップナビゲーション — JIS X 8341-3 達成基準 2.4.1
 * キーボードユーザーがヘッダーをスキップしてメインコンテンツに直接移動できる
 */
export function SkipLink({
  href = "#main-content",
  label = "メインコンテンツへスキップ",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <a
      href={href}
      className="skip-link"
      style={{
        position: "absolute",
        top: "-100%",
        left: "0",
        padding: "0.75rem 1.5rem",
        backgroundColor: "var(--accent, #0369A1)",
        color: "white",
        zIndex: 9999,
        textDecoration: "none",
        fontWeight: "bold",
        fontSize: "0.875rem",
        borderRadius: "0 0 0.5rem 0",
        transition: "top 0.15s ease-in-out",
      }}
      onFocus={(e) => {
        (e.target as HTMLElement).style.top = "0";
      }}
      onBlur={(e) => {
        (e.target as HTMLElement).style.top = "-100%";
      }}
    >
      {label}
    </a>
  );
}
