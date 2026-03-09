"use client";
import Link from "next/link";

const SECTIONS = [
  {
    title: "法令の検索・閲覧",
    items: [
      {
        q: "法令を検索するには？",
        a: "トップページの検索バーまたは「検索」ページから法令名・法令番号で検索できます。e-Gov法令検索APIのデータを使用しています。",
      },
      {
        q: "条文を直接開くには？",
        a: "法令ページの目次から条番号をクリックするか、URLに条番号を入力（例: /law/民法/article/第1条）で直接アクセスできます。",
      },
      {
        q: "条文内をキーワード検索するには？",
        a: "法令ページ上部の「条文内検索」欄にキーワードを入力すると、該当箇所がハイライト表示されます。",
      },
      {
        q: "法令カードとは？",
        a: "主要法令をカード形式で一覧表示する機能です。ヘッダーの「法令カード」からアクセスできます。",
      },
    ],
  },
  {
    title: "改正案の作成",
    items: [
      {
        q: "改正案を作成するには？",
        a: "条文ページの「編集」ボタンで直接編集モードに入り、改正案を作成できます。改め文・新旧対照表が自動生成されます。",
      },
      {
        q: "プロジェクトとは？",
        a: "複数の改正案をまとめて管理する単位です。ダッシュボードからプロジェクトを作成し、チームで共同編集できます。",
      },
      {
        q: "改め文は自動生成されますか？",
        a: "はい。法制執務の形式に準拠した改め文が自動生成されます。新旧対照表も同時に作成されます。",
      },
    ],
  },
  {
    title: "ワークスペース（WS）",
    items: [
      {
        q: "ワークスペースでできることは？",
        a: "カレンダー、文書テンプレート、フォーム、承認フロー、データテーブル、作業時間打刻、掲示板、回覧・確認など、業務支援ツールを利用できます。",
      },
      {
        q: "カレンダーの使い方は？",
        a: "個人予定の管理、プロジェクトイベント・法令施行日の表示ができます。繰返しリマインダーも設定可能です。",
      },
      {
        q: "文書テンプレートとは？",
        a: "届出書・申請書・議事録・報告書・契約書・通知文の6種類のテンプレートから文書を作成できます。変数置換で効率的に文書を量産できます。",
      },
      {
        q: "フォームの作り方は？",
        a: "WS > フォームから新規作成し、フィールド（テキスト/数値/日付/選択/チェックボックス）を追加。公開するとURLで回答を収集できます。",
      },
      {
        q: "承認フローの使い方は？",
        a: "申請を作成し、承認者を指定します。承認者はコメント付きで承認/差戻しができます。ステップの進行状況が一覧で確認できます。",
      },
      {
        q: "データテーブルとは？",
        a: "軽量の表計算ツールです。列の追加/削除、数値集計（合計/平均/件数）、CSV取込・出力に対応しています。",
      },
    ],
  },
  {
    title: "通知・フォロー",
    items: [
      {
        q: "法令をフォローするには？",
        a: "法令ページの「フォロー」ボタンを押すと、その法令の更新通知を受け取れます。",
      },
      {
        q: "メール通知の設定は？",
        a: "ダッシュボード > 通知設定から、通知カテゴリ別にメール配信のオン/オフを設定できます。",
      },
      {
        q: "施行予定はどこで確認できますか？",
        a: "ダッシュボードの「施行予定」ウィジェットで、フォロー中の法令の施行・公布予定を確認できます。",
      },
    ],
  },
  {
    title: "その他",
    items: [
      {
        q: "テーマの変更は？",
        a: "ヘッダーのテーマ切替ボタンから6種類（アクアライト/ダーク/ゴシック/クラシック/ゆめかわ/みずいろ）を選べます。",
      },
      {
        q: "オフラインで使えますか？",
        a: "PWA対応のため、一度閲覧した法令はオフラインでもキャッシュから表示できます。",
      },
      {
        q: "料金はかかりますか？",
        a: "完全無料です。LexCardは公共目的で無償提供されており、有料プラン・広告はありません。",
      },
      {
        q: "AIアシスタントとは？",
        a: "条文ページやダッシュボードからAI法令アシスタントを利用できます。条文の要約・解説・関連法令の提案を受けられます。※法的助言ではありません。",
      },
    ],
  },
];

const SHORTCUTS = [
  { key: "/", desc: "検索にフォーカス" },
  { key: "Esc", desc: "モーダル・パネルを閉じる" },
  { key: "←/→", desc: "条文ページで前後の条文に移動" },
  { key: "Enter", desc: "検索実行" },
];

export default function GuidePage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
      <nav
        style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}
      >
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          Top
        </Link>{" "}
        &gt;{" "}
        <Link href="/ws" style={{ color: "var(--color-accent)" }}>
          WS
        </Link>{" "}
        &gt; ガイド
      </nav>

      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        ガイド・ヘルプ
      </h1>
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--color-text-secondary)",
          marginBottom: "1.5rem",
        }}
      >
        LexCardの使い方をご案内します。
      </p>

      {SECTIONS.map((section) => (
        <section key={section.title} style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "0.8rem",
              paddingBottom: "0.3rem",
              borderBottom: "2px solid var(--color-accent)",
            }}
          >
            {section.title}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {section.items.map((item, i) => (
              <details
                key={i}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <summary
                  style={{
                    padding: "0.7rem 1rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}
                >
                  {item.q}
                </summary>
                <p
                  style={{
                    padding: "0 1rem 0.8rem",
                    fontSize: "0.85rem",
                    lineHeight: 1.7,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}

      {/* Keyboard Shortcuts */}
      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: "0.8rem",
            paddingBottom: "0.3rem",
            borderBottom: "2px solid var(--color-accent)",
          }}
        >
          キーボードショートカット
        </h2>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
          }}
        >
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.3rem 0" }}
            >
              <kbd
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 4,
                  padding: "0.1rem 0.5rem",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.8rem",
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {s.key}
              </kbd>
              <span style={{ fontSize: "0.85rem" }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          LexCardについて
        </h2>
        <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--color-text-secondary)" }}>
          LexCard（法令アクセス支援システム）は、こうな姫株式会社が公共目的で無償提供する法令アクセス基盤です。
          e-Gov法令検索APIに基づく法令の閲覧・検索・改正案作成機能を、すべて無料・登録不要で提供しています。
        </p>
        <p
          style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.5rem" }}
        >
          お問い合わせ:{" "}
          <Link href="/contact" style={{ color: "var(--color-accent)" }}>
            お問い合わせフォーム
          </Link>
        </p>
      </section>
    </div>
  );
}
