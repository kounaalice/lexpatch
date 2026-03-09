/**
 * VisuallyHidden — スクリーンリーダー専用テキスト
 * 視覚的には非表示だがスクリーンリーダーには読み上げられる
 * JIS X 8341-3 達成基準 1.1.1 (非テキストコンテンツ) 対応
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
}: {
  children: React.ReactNode;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  return (
    <Component
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      }}
    >
      {children}
    </Component>
  );
}
