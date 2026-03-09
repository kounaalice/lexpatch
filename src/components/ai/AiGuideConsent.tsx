"use client";

interface Props {
  onAgree: () => void;
  onDecline: () => void;
}

export default function AiGuideConsent({ onAgree, onDecline }: Props) {
  return (
    <div
      style={{
        padding: "1.25rem",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
        }}
      >
        AIガイドについて
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: "0.82rem",
          lineHeight: 1.7,
          color: "var(--color-text-secondary)",
        }}
      >
        AIガイドは、LexCardの機能や操作方法を案内するアシスタントです。利用開始前に以下の内容をご確認ください。
      </p>

      <div
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "1rem",
          fontSize: "0.78rem",
          lineHeight: 1.8,
          color: "var(--color-text-primary)",
        }}
      >
        <div style={{ marginBottom: "0.75rem" }}>
          <strong>使用AIモデル</strong>
          <br />
          Meta Llama 3.1 8B Instruct（Cloudflare Workers AI経由）
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <strong>利用目的</strong>
          <br />
          LexCardの機能案内・操作説明のみ。法令の内容の解釈や法的助言は行いません。
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <strong>データの取り扱い</strong>
          <br />
          質問内容はCloudflare Workers AI
          APIに送信されます。会話履歴はお使いのブラウザ（localStorage）にのみ保存され、サーバーには保存されません。
        </div>

        <div>
          <strong>利用制限</strong>
          <br />
          1日30回まで（AI法令アシスタントと共通）。
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={onDecline}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            cursor: "pointer",
          }}
        >
          閉じる
        </button>
        <button
          onClick={onAgree}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          同意して利用開始
        </button>
      </div>
    </div>
  );
}
