export default function LawLoading() {
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
              height: 14,
              width: 80,
              backgroundColor: "var(--color-border)",
              borderRadius: 4,
              marginBottom: "0.75rem",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              height: 28,
              width: "60%",
              backgroundColor: "var(--color-border)",
              borderRadius: 4,
              marginBottom: "0.5rem",
              opacity: 0.4,
            }}
          />
          <div
            style={{
              height: 14,
              width: "35%",
              backgroundColor: "var(--color-border)",
              borderRadius: 4,
              opacity: 0.3,
            }}
          />
        </div>
      </div>
      {/* 条文グリッドスケルトン */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                animation: "lc-pulse 1.5s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  height: 16,
                  width: "70%",
                  backgroundColor: "var(--color-border)",
                  borderRadius: 4,
                  marginBottom: "0.4rem",
                  opacity: 0.4,
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "50%",
                  backgroundColor: "var(--color-border)",
                  borderRadius: 4,
                  opacity: 0.3,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes lc-pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}
