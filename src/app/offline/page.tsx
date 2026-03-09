import Link from "next/link";

export const metadata = {
  title: "オフライン",
};

export default function OfflinePage() {
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          textAlign: "center",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>&#x1F4F6;</div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "0.75rem",
            fontFamily: "var(--font-serif)",
          }}
        >
          オフラインです
        </h1>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            marginBottom: "1.5rem",
          }}
        >
          インターネットに接続されていません。
          <br />
          過去に閲覧した法令ページはオフラインでもご覧いただけます。
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "0.6rem 1.5rem",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
