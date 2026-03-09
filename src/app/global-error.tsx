"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          fontFamily: "'BIZ UDPGothic', sans-serif",
          backgroundColor: "#EFF8FF",
          color: "#1E3A5F",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>サーバーエラーが発生しました</h1>
          <p style={{ color: "#4B6A8A", marginBottom: "1.5rem" }}>
            申し訳ございません。しばらく時間をおいて再度お試しください。
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#0369A1",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
