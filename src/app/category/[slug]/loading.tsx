export default function CategoryLoading() {
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
              width: 60,
              backgroundColor: "var(--color-border)",
              borderRadius: 4,
              marginBottom: "0.75rem",
              opacity: 0.4,
            }}
          />
          <div
            style={{
              height: 24,
              width: "45%",
              backgroundColor: "var(--color-border)",
              borderRadius: 4,
              marginBottom: "0.5rem",
              opacity: 0.5,
            }}
          />
        </div>
      </div>
      {/* 法令リストスケルトン */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "var(--color-surface)",
              borderBottom: "1px solid var(--color-border)",
              animation: "lc-pulse 1.5s ease-in-out infinite",
            }}
          >
            <div
              style={{
                height: 16,
                width: `${50 + (i % 4) * 10}%`,
                backgroundColor: "var(--color-border)",
                borderRadius: 4,
                marginBottom: "0.3rem",
                opacity: 0.4,
              }}
            />
            <div
              style={{
                height: 12,
                width: "30%",
                backgroundColor: "var(--color-border)",
                borderRadius: 4,
                opacity: 0.25,
              }}
            />
          </div>
        ))}
      </div>
      <style>{`@keyframes lc-pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}
