import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "法令業務を、もっとシンプルに",
  description:
    "LexCard は年額24万円・ID無制限で法令検索・条文編集・チーム協働をオールインワン提供。課長決裁で導入可能、入札不要。e-Gov法令APIベースの法令アクセス支援システム。",
  openGraph: {
    title: "法令業務を、もっとシンプルに | LexCard",
    description:
      "年額24万円・ID無制限。自治体・大学・企業の法令業務を変える法令アクセス支援システム。",
    url: "https://lexcard.jp/lp",
  },
  alternates: { canonical: "/lp" },
};

/* ────────────────── スタイル定数 ────────────────── */

const sectionH2: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "1.35rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  borderBottom: "2px solid var(--color-accent)",
  paddingBottom: "0.4rem",
  marginBottom: "1.5rem",
};

const cardStyle: React.CSSProperties = {
  padding: "1.25rem",
  backgroundColor: "var(--color-surface)",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "0.75rem 2rem",
  backgroundColor: "var(--color-accent)",
  color: "#fff",
  borderRadius: "6px",
  fontFamily: "var(--font-sans)",
  fontSize: "0.95rem",
  fontWeight: 700,
  textDecoration: "none",
};

const secondaryBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "0.75rem 2rem",
  backgroundColor: "transparent",
  color: "var(--color-accent)",
  borderRadius: "6px",
  border: "1px solid var(--color-accent)",
  fontFamily: "var(--font-sans)",
  fontSize: "0.95rem",
  fontWeight: 700,
  textDecoration: "none",
};

const container: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "0 1.5rem",
};

/* ────────────────── JSON-LD ────────────────── */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LexCard",
  alternateName: "法令アクセス支援システム",
  applicationCategory: "LegalService",
  operatingSystem: "Web",
  url: "https://lexcard.jp",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "JPY" },
    { "@type": "Offer", name: "Standard", price: "240000", priceCurrency: "JPY", unitCode: "ANN" },
    {
      "@type": "Offer",
      name: "Enterprise",
      price: "900000",
      priceCurrency: "JPY",
      unitCode: "ANN",
    },
  ],
};

/* ────────────────── ページ ────────────────── */

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── S1: Hero ── */}
      <div
        style={{
          background: "linear-gradient(160deg, #EFF8FF 0%, #DBEAFE 55%, #BFDBFE 100%)",
          padding: "4rem 1.5rem 3.5rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid #BAE6FD",
        }}
      >
        {/* 装飾円 */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "rgba(56,189,248,0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "-40px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "rgba(3,105,161,0.06)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1rem",
            letterSpacing: "0.05em",
          }}
        >
          e-Gov法令API準拠 ｜ こうな姫株式会社
        </div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)",
            fontWeight: 700,
            color: "#1E3A5F",
            marginBottom: "0.75rem",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}
        >
          法令業務を、もっとシンプルに。
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            color: "#4B6A8A",
            maxWidth: "580px",
            margin: "0 auto 2rem",
            lineHeight: 1.85,
          }}
        >
          法令検索・条文編集・新旧対照表・チーム協働をオールインワン。
          <br />
          年額24万円（税別）、ID無制限、課長決裁で導入。
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link href="/contact" style={primaryBtn}>
            お問い合わせ
          </Link>
          <Link href="/" style={secondaryBtn}>
            無料で試す
          </Link>
        </div>
      </div>

      <div style={{ ...container, padding: "3rem 1.5rem" }}>
        {/* ── S2: 課題提起 ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>こんな課題はありませんか？</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                title: "e-Govでは足りない",
                desc: "e-Gov法令検索は閲覧専用。条文を引用するにはコピー＆ペーストで手作業。チーム内での共有や改正案の作成には使えません。",
              },
              {
                title: "既存の法令DBは高すぎる",
                desc: "主要法令データベースはID課金で年額60万円超。人数が増えるほどコストが膨らみ、入札手続きも必要です。",
              },
              {
                title: "法務DXが進まない",
                desc: "法令調査がExcelと紙ベース。知見が属人化し、異動のたびに引き継ぎが途切れます。",
              },
            ].map(({ title, desc }) => (
              <div key={title} style={cardStyle}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "3px",
                    marginBottom: "0.6rem",
                    backgroundColor: "var(--color-del-bg)",
                    color: "var(--color-del-fg)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  課題
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--color-text-primary)",
                    marginBottom: "0.4rem",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── S3: 機能紹介 ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>LexCardが解決します</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                step: "1",
                title: "法令検索・閲覧",
                desc: "e-Gov法令API連携で9,000超の法令をブラウザから即座に検索。50分野のカテゴリで目的の法令にすぐアクセス。",
              },
              {
                step: "2",
                title: "条文の直接編集",
                desc: "条文テキストを直接書き換えて改正案を作成。新旧対照表・改め文を自動生成。",
              },
              {
                step: "3",
                title: "プロジェクト管理",
                desc: "法令調査をタスク・チャット・参考資料で一元管理。部署間・組織間の協働に対応。",
              },
              {
                step: "4",
                title: "逐条解説・コミュニティ",
                desc: "条文ごとの解説を出典付きで投稿・共有。テーマ別コミュニティでナレッジを蓄積。",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} style={cardStyle}>
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {step}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--color-text-primary)",
                    marginBottom: "0.4rem",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── S4: e-Gov比較テーブル ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>e-Gov法令検索との比較</h2>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-text-primary)",
                borderCollapse: "collapse",
                width: "100%",
                minWidth: "480px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.5rem 0.75rem",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  />
                  <th
                    style={{
                      textAlign: "center",
                      padding: "0.5rem 0.75rem",
                      borderBottom: "2px solid var(--color-border)",
                      fontWeight: 600,
                    }}
                  >
                    e-Gov法令検索
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "0.5rem 0.75rem",
                      borderBottom: "2px solid var(--color-border)",
                      fontWeight: 700,
                      color: "var(--color-accent)",
                    }}
                  >
                    LexCard
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "法令閲覧", egov: "○", lex: "○" },
                  { label: "条文コピー", egov: "手作業", lex: "ワンクリック" },
                  { label: "改正案作成", egov: "×", lex: "○（直接編集）" },
                  { label: "新旧対照表", egov: "×", lex: "○（自動生成）" },
                  { label: "改め文", egov: "×", lex: "○（自動生成）" },
                  {
                    label: "チーム共有",
                    egov: "×（URLのみ）",
                    lex: "○（プロジェクト管理）",
                  },
                  {
                    label: "レスポンス",
                    egov: "TTFB ~967ms",
                    lex: "TTFB ~493ms",
                  },
                  { label: "ダークモード", egov: "×", lex: "○" },
                ].map(({ label, egov, lex }) => (
                  <tr key={label}>
                    <td
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderBottom: "1px solid var(--color-border)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "0.5rem 0.75rem",
                        borderBottom: "1px solid var(--color-border)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {egov}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "0.5rem 0.75rem",
                        borderBottom: "1px solid var(--color-border)",
                        fontWeight: 600,
                        color: lex.startsWith("○")
                          ? "var(--color-add-fg)"
                          : "var(--color-text-primary)",
                      }}
                    >
                      {lex}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem 1.25rem",
              backgroundColor: "rgba(3,105,161,0.04)",
              border: "2px solid var(--color-accent)",
              borderRadius: "8px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-accent)",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            主要106法令をCDN静的配信。e-Gov比で約2倍のレスポンス速度。
          </div>
        </section>

        {/* ── S5: 料金プラン ── */}
        <section id="pricing" style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>料金プラン</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            {/* Free */}
            <div style={{ ...cardStyle, textAlign: "center", padding: "2rem 1.5rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                Free
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "1rem",
                }}
              >
                個人・学生・市民
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                ¥0
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "1.25rem",
                }}
              >
                登録不要・即日利用可
              </div>
              <ul
                style={{
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 2,
                  paddingLeft: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <li>法令検索・閲覧（9,000+法令）</li>
                <li>改正案編集・新旧対照表・改め文</li>
                <li>プロジェクト管理</li>
                <li>逐条解説・コミュニティ</li>
                <li>ダークモード</li>
              </ul>
              <Link
                href="/"
                style={{ ...secondaryBtn, padding: "0.6rem 1.5rem", fontSize: "0.85rem" }}
              >
                無料で試す
              </Link>
            </div>

            {/* Standard（おすすめ） */}
            <div
              style={{
                ...cardStyle,
                textAlign: "center",
                padding: "2rem 1.5rem",
                border: "2px solid var(--color-accent)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-0.75rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.75rem",
                  borderRadius: "3px",
                }}
              >
                おすすめ ｜ 課長決裁OK
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                Standard
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "1rem",
                }}
              >
                自治体・大学・外郭団体
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  marginBottom: "0.1rem",
                }}
              >
                ¥240,000
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "0.1rem",
                }}
              >
                年額（税別）｜ 月額 ¥20,000
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-warn-fg)",
                  marginBottom: "1.25rem",
                }}
              >
                2026年8月提供予定
              </div>
              <ul
                style={{
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 2,
                  paddingLeft: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <li>Freeの全機能</li>
                <li>
                  <strong style={{ color: "var(--color-text-primary)" }}>ID無制限</strong>
                </li>
                <li>バージョン凍結（安定性保証）</li>
                <li>随意契約範囲内・入札不要</li>
              </ul>
              <Link
                href="/contact"
                style={{ ...primaryBtn, padding: "0.6rem 1.5rem", fontSize: "0.85rem" }}
              >
                お問い合わせ
              </Link>
            </div>

            {/* Enterprise */}
            <div style={{ ...cardStyle, textAlign: "center", padding: "2rem 1.5rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                Enterprise
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "1rem",
                }}
              >
                国内企業・外国企業
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.1rem",
                }}
              >
                ¥900,000
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "0.1rem",
                }}
              >
                年額（税別）｜ 月額 ¥75,000
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-warn-fg)",
                  marginBottom: "1.25rem",
                }}
              >
                2026年10月提供予定
              </div>
              <ul
                style={{
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 2,
                  paddingLeft: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <li>Standardの全機能</li>
                <li>組織サブドメイン</li>
                <li>監査ログ</li>
                <li>SSO（SAML / OIDC）</li>
                <li>IP制限 ・ SLA</li>
                <li>英語UI・AI翻訳（Global）</li>
              </ul>
              <Link
                href="/contact"
                style={{ ...primaryBtn, padding: "0.6rem 1.5rem", fontSize: "0.85rem" }}
              >
                お問い合わせ
              </Link>
            </div>
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              textAlign: "center",
            }}
          >
            全プランの詳細比較は
            <Link href="/for-organizations" style={{ color: "var(--color-accent)" }}>
              組織向けプランページ
            </Link>
            をご覧ください。
          </p>
        </section>

        {/* ── S6: セグメント別訴求 ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>こんな組織にフィットします</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                badge: "自治体・外郭団体",
                badgeColor: "#0369A1",
                desc: "条例改正案の作成、部署間の法令調査、組織横断の知見共有。年額24万円、課長決裁・随意契約範囲内。入札不要。",
                plan: "Standard",
              },
              {
                badge: "大学・研究機関",
                badgeColor: "#7C3AED",
                desc: "ゼミ・研究室のワークスペース、模擬立法・政策提言の演習、逐条解説で学習成果を蓄積。法令DB値上げの代替に。",
                plan: "Standard",
              },
              {
                badge: "国内企業",
                badgeColor: "#047857",
                desc: "法務チーム全員がID無制限で利用。SSO・監査ログ・IP制限で情報セキュリティ要件を充足。",
                plan: "Enterprise",
              },
              {
                badge: "外国企業",
                badgeColor: "#D97706",
                desc: "日本法へのアクセスの壁を解消。英語UI・AI翻訳・バイリンガルコメンタリーで多言語対応。",
                plan: "Global",
              },
            ].map(({ badge, badgeColor, desc, plan }) => (
              <div key={badge} style={cardStyle}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "0.15rem 0.6rem",
                    borderRadius: "3px",
                    marginBottom: "0.6rem",
                    backgroundColor: badgeColor,
                    color: "#fff",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {badge}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.8,
                    marginBottom: "0.75rem",
                  }}
                >
                  {desc}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  推奨プラン：
                  <strong style={{ color: "var(--color-accent)" }}>{plan}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── S7: セキュリティ ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>情報セキュリティ —「やらない」設計</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            {[
              {
                not: "AI非搭載",
                because:
                  "幻覚（ハルシネーション）リスクゼロ。法令テキストはe-Gov APIから直接取得。",
              },
              {
                not: "メール・チャット中継なし",
                because: "機微情報がシステムを通過しません。内部連絡は既存ツールをそのまま利用。",
              },
              {
                not: "ファイルストレージなし",
                because:
                  "情報漏洩リスクを最小化。参考資料はリンクで管理し、原本は組織の既存ストレージに。",
              },
            ].map(({ not, because }) => (
              <div key={not} style={cardStyle}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "3px",
                    marginBottom: "0.5rem",
                    backgroundColor: "var(--color-del-bg)",
                    color: "var(--color-del-fg)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {not}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {because}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              ...cardStyle,
              backgroundColor: "var(--color-add-bg)",
              border: "1px solid var(--color-add-fg)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-add-fg)",
                fontWeight: 700,
                marginBottom: "0.35rem",
              }}
            >
              結果：扱うデータは「公開法令テキスト + ユーザー注釈」のみ
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              個人情報や機密資料を保持しないため、課レベルで情報セキュリティ審査が完結します。
              Cloudflare上で稼働し、DDoS/WAF防御・全通信HTTPS・ゼロトラスト認証を標準装備。
            </div>
          </div>
        </section>

        {/* ── S8: 信頼性 ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>数字で見るLexCard</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            {[
              { num: "9,000+", label: "法令データ" },
              { num: "106", label: "CDN静的配信法令" },
              { num: "50", label: "法令カテゴリ" },
              { num: "OSS", label: "GitHubで公開" },
            ].map(({ num, label }) => (
              <div key={label} style={{ ...cardStyle, textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.8,
            }}
          >
            データソース：
            <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
              e-Gov法令検索（デジタル庁）
            </span>
            ｜ ホスティング：
            <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
              Cloudflare Workers
            </span>
            ｜ 運営：
            <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
              こうな姫株式会社（東京都渋谷区）
            </span>
          </div>
        </section>

        {/* ── S9: FAQ ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>よくあるご質問</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {[
              {
                q: "e-Gov法令検索との違いは何ですか？",
                a: "e-Govは閲覧専用です。LexCardは閲覧に加え、条文の直接編集、新旧対照表の自動生成、プロジェクト管理、逐条解説など、法令業務のワークフロー全体をカバーします。",
              },
              {
                q: "既存の法令データベース（Westlaw等）と併用できますか？",
                a: "はい。LexCardは判例検索機能を持たないため、判例はWestlaw/TKC、法令協働はLexCardという併用が最適です。",
              },
              {
                q: "無料プランと有料プランの違いは？",
                a: "機能は同一です。有料プランでは「バージョン凍結」（UIや機能が契約期間中に変わらない安定性の保証）とID無制限・組織管理機能を提供します。",
              },
              {
                q: "自治体の随意契約で導入できますか？",
                a: "Standardプラン（年額24万円）は市の随意契約上限（役務50万円以下）の範囲内です。課長決裁で導入可能、入札手続きは不要です。",
              },
              {
                q: "データのセキュリティは大丈夫ですか？",
                a: "LexCardが保持するのは公開法令テキストとユーザー注釈のみです。個人情報や機密資料は保存しません。Cloudflare上で稼働し、DDoS/WAF防御・全通信HTTPSを標準装備しています。",
              },
              {
                q: "サービスが終了したらどうなりますか？",
                a: "有料契約者にソースコード、データベースエクスポート、運用手順書、DNS移管支援を引き渡します。終了6ヶ月前に通知し、自走可能な状態で引き渡すことを契約書に明記します。",
              },
              {
                q: "導入までの流れは？",
                a: "お問い合わせ → ヒアリング（ご予算・利用規模の確認）→ プラン提案 → 契約 → 利用開始。Freeプランは登録不要で即日利用可能です。",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                style={{
                  borderBottom: "1px solid var(--color-border)",
                  padding: "1rem 0",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--color-text-primary)",
                    marginBottom: "0.4rem",
                  }}
                >
                  Q. {q}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.8,
                  }}
                >
                  {a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── S10: クロージングCTA ── */}
        <section style={{ marginBottom: "2rem" }}>
          <div
            style={{
              ...cardStyle,
              textAlign: "center",
              padding: "2.5rem 1.5rem",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              まずは無料でお試しください
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginBottom: "1.5rem",
                lineHeight: 1.7,
              }}
            >
              Freeプランは登録不要で今すぐご利用可能。
              <br />
              組織導入のご相談もお気軽にどうぞ。
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <Link href="/contact" style={primaryBtn}>
                お問い合わせ
              </Link>
              <Link href="/" style={secondaryBtn}>
                無料で試す
              </Link>
              <Link
                href="/for-organizations"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 2rem",
                  backgroundColor: "transparent",
                  color: "var(--color-text-secondary)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  border: "1px solid var(--color-border)",
                }}
              >
                組織向けプラン詳細
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
