export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        color: "var(--color-text-secondary)",
        fontFamily: "var(--font-sans)",
      }}
      className="w-full px-6 py-4 text-xs text-center"
    >
      法令データ出典：
      <a
        href="https://laws.e-gov.go.jp/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:opacity-70 transition-opacity"
        style={{ color: "var(--color-accent)" }}
      >
        e-Gov法令検索（デジタル庁）
      </a>
    </footer>
  );
}
