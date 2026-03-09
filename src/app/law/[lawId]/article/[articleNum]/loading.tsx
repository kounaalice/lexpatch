export default function ArticleLoading() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダースケルトン */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              height: 12,
              width: 120,
              backgroundColor: "var(--color-border)",
              borderRadius: 4,
              marginBottom: "0.75rem",
              opacity: 0.4,
            }}
          />
          <div
            style={{
              height: 24,
              width: "40%",
              backgroundColor: "var(--color-border)",
              borderRadius: 4,
              marginBottom: "0.5rem",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              height: 12,
              width: "25%",
              backgroundColor: "var(--color-border)",
              borderRadius: 4,
              opacity: 0.3,
            }}
          />
        </div>
      </div>
      {/* 条文本文スケルトン */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "1.5rem",
            animation: "lc-pulse 1.5s ease-in-out infinite",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 14,
                width: `${85 - i * 5}%`,
                backgroundColor: "var(--color-border)",
                borderRadius: 4,
                marginBottom: "0.75rem",
                opacity: 0.3 + (i % 3) * 0.1,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes lc-pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}
