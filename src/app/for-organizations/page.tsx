import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "組織向けプラン",
  description:
    "LexCard（法令アクセス支援システム）の自治体・大学・企業向け組織プラン。年額24万円（税別）、課長決裁で導入可能。ID無制限・入札不要。法令検索・改正案作成・チーム協働をオールインワンで提供。",
  openGraph: {
    title: "組織向けプラン | LexCard",
    description:
      "自治体・大学・企業の法務チームに最適な法令アクセスプラン。年額24万円（税別）から。",
  },
};

/* ────────────────── データ定義 ────────────────── */

interface Plan {
  name: string;
  monthly: number;
  annual: number;
  monthlyAlt?: string;
  annualAlt?: string;
  target: string;
  idLimit: string;
  recommended?: boolean;
  availability?: string;
  features: Record<string, boolean | string>;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    target: "個人・学生・市民",
    idLimit: "1",
    features: {
      lawSearch: true,
      amendment: true,
      project: true,
      commentary: true,
      community: true,
      subdomain: false,
      versionFreeze: false,
      auditLog: false,
      sso: false,
      ipRestrict: false,
      sla: false,
      englishUi: false,
    },
  },
  {
    name: "Lite",
    monthly: 8_000,
    annual: 96_000,
    target: "小規模チーム",
    idLimit: "5名",
    availability: "2026年7月予定",
    features: {
      lawSearch: true,
      amendment: true,
      project: true,
      commentary: true,
      community: true,
      subdomain: false,
      versionFreeze: false,
      auditLog: false,
      sso: false,
      ipRestrict: false,
      sla: false,
      englishUi: false,
    },
  },
  {
    name: "Standard",
    monthly: 20_000,
    annual: 240_000,
    target: "自治体・大学・外郭団体",
    idLimit: "無制限",
    recommended: true,
    availability: "2026年8月予定",
    features: {
      lawSearch: true,
      amendment: true,
      project: true,
      commentary: true,
      community: true,
      subdomain: false,
      versionFreeze: true,
      auditLog: false,
      sso: false,
      ipRestrict: false,
      sla: false,
      englishUi: false,
    },
  },
  {
    name: "Professional",
    monthly: 35_000,
    annual: 420_000,
    target: "Standard + 管理機能",
    idLimit: "無制限",
    availability: "2026年9月予定",
    features: {
      lawSearch: true,
      amendment: true,
      project: true,
      commentary: true,
      community: true,
      subdomain: true,
      versionFreeze: true,
      auditLog: true,
      sso: true,
      ipRestrict: false,
      sla: false,
      englishUi: false,
    },
  },
  {
    name: "Enterprise",
    monthly: 75_000,
    annual: 900_000,
    target: "国内企業",
    idLimit: "無制限",
    availability: "2026年10月予定",
    features: {
      lawSearch: true,
      amendment: true,
      project: true,
      commentary: true,
      community: true,
      subdomain: true,
      versionFreeze: true,
      auditLog: true,
      sso: true,
      ipRestrict: true,
      sla: true,
      englishUi: false,
    },
  },
  {
    name: "Global",
    monthly: 0,
    annual: 0,
    monthlyAlt: "$1,000",
    annualAlt: "$12,000",
    target: "外国企業",
    idLimit: "無制限",
    availability: "2026年内予定",
    features: {
      lawSearch: true,
      amendment: true,
      project: true,
      commentary: true,
      community: true,
      subdomain: true,
      versionFreeze: true,
      auditLog: true,
      sso: true,
      ipRestrict: true,
      sla: true,
      englishUi: true,
    },
  },
];

const FEATURE_ROWS: { key: string; label: string }[] = [
  { key: "lawSearch", label: "法令検索・閲覧" },
  { key: "amendment", label: "改正案編集・新旧対照・改め文" },
  { key: "project", label: "プロジェクト管理" },
  { key: "commentary", label: "逐条解説" },
  { key: "community", label: "コミュニティ" },
  { key: "versionFreeze", label: "バージョン凍結" },
  { key: "subdomain", label: "組織サブドメイン" },
  { key: "auditLog", label: "監査ログ" },
  { key: "sso", label: "SSO（SAML / OIDC）" },
  { key: "ipRestrict", label: "IP制限" },
  { key: "sla", label: "SLA" },
  { key: "englishUi", label: "英語UI・AI翻訳" },
];

const COMPETITORS: {
  name: string;
  annual: string;
  manager: boolean;
  discretionary: boolean;
  note?: string;
}[] = [
  { name: "LexCard Standard", annual: "¥240,000", manager: true, discretionary: true },
  { name: "法令DB A社 5ID", annual: "¥660,000", manager: false, discretionary: false },
  { name: "法令DB B社 5ID", annual: "¥594,000", manager: false, discretionary: false },
  { name: "業務システム C社 50名", annual: "¥1,188,000", manager: false, discretionary: false },
];

/* ────────────────── ヘルパー ────────────────── */

const sectionH2: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "1.3rem",
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

function yen(n: number) {
  if (n === 0) return "¥0";
  return "¥" + n.toLocaleString("ja-JP");
}

function Check({ ok }: { ok: boolean | string }) {
  if (ok === true) return <span style={{ color: "var(--color-add-fg)", fontWeight: 700 }}>○</span>;
  if (typeof ok === "string")
    return <span style={{ color: "var(--color-accent)", fontSize: "0.75rem" }}>{ok}</span>;
  return <span style={{ color: "var(--color-text-secondary)", opacity: 0.4 }}>—</span>;
}

/* ────────────────── ページ ────────────────── */

export default function ForOrganizationsPage() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ── 1. ヘッダー ── */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>›</span>
            <span>組織向けプラン</span>
          </nav>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.25rem",
            }}
          >
            組織向けプラン
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              color: "var(--color-text-secondary)",
              margin: 0,
              lineHeight: 1.8,
            }}
          >
            自治体・大学・企業の法務チームに最適な組織定額プラン。
            年額24万円、課長決裁で導入可能。入札不要・ID無制限。
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* ── 2. 価値提案カード ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>導入のメリット</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                icon: "🏛️",
                title: "課長決裁で導入",
                desc: "年額24万円（Standardプラン）。地方自治体の随意契約範囲内で、入札手続き不要。課長決裁で導入できます。",
              },
              {
                icon: "👥",
                title: "ID無制限・組織定額",
                desc: "利用者の増減による追加費用なし。全職員・全学生がアクセス可能。予算の不確実性を排除します。",
              },
              {
                icon: "🔒",
                title: "セキュリティ監査が簡単",
                desc: "AI非搭載・ファイル保存なし。扱うデータは公開法令テキストとユーザー注釈のみ。課レベルで審査完結。",
              },
              {
                icon: "🔓",
                title: "ベンダーロックインなし",
                desc: "OSSとして公開。サービス終了時にはコード・データ・運用手順書を引き渡し。自走可能な状態を保証します。",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={cardStyle}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
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

        {/* ── 3. 料金表 ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>料金プラン</h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1rem",
            }}
          >
            全プラン共通：マルチデバイス対応・インストール不要・ダークモード
          </p>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-primary)",
                borderCollapse: "collapse",
                width: "100%",
                minWidth: "720px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.5rem 0.4rem",
                      borderBottom: "2px solid var(--color-border)",
                      width: "130px",
                    }}
                  />
                  {PLANS.map((p) => (
                    <th
                      key={p.name}
                      style={{
                        textAlign: "center",
                        padding: "0.5rem 0.4rem",
                        borderBottom: "2px solid var(--color-border)",
                        backgroundColor: p.recommended ? "var(--color-accent)" : undefined,
                        color: p.recommended ? "#fff" : "var(--color-text-primary)",
                        borderRadius: p.recommended ? "6px 6px 0 0" : undefined,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        position: "relative",
                      }}
                    >
                      {p.recommended && (
                        <div
                          style={{ fontSize: "0.6rem", fontWeight: 400, marginBottom: "0.15rem" }}
                        >
                          おすすめ
                        </div>
                      )}
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 月額 */}
                <tr>
                  <td style={cellLabel}>月額（税別）</td>
                  {PLANS.map((p) => (
                    <td key={p.name} style={cellValue(p.recommended)}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {p.monthlyAlt ? p.monthlyAlt : p.monthly === 0 ? "無料" : yen(p.monthly)}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* 年額 */}
                <tr>
                  <td style={cellLabel}>年額（税別）</td>
                  {PLANS.map((p) => (
                    <td key={p.name} style={cellValue(p.recommended)}>
                      {p.annualAlt ? p.annualAlt : p.annual === 0 ? "—" : yen(p.annual)}
                    </td>
                  ))}
                </tr>
                {/* 対象 */}
                <tr>
                  <td style={cellLabel}>対象</td>
                  {PLANS.map((p) => (
                    <td key={p.name} style={cellValue(p.recommended)}>
                      {p.target}
                    </td>
                  ))}
                </tr>
                {/* ID */}
                <tr>
                  <td style={cellLabel}>利用ID数</td>
                  {PLANS.map((p) => (
                    <td
                      key={p.name}
                      style={{
                        ...cellValue(p.recommended),
                        fontWeight: p.idLimit === "無制限" ? 700 : 400,
                      }}
                    >
                      {p.idLimit}
                    </td>
                  ))}
                </tr>
                {/* 機能行 */}
                {FEATURE_ROWS.map((fr) => (
                  <tr key={fr.key}>
                    <td style={cellLabel}>{fr.label}</td>
                    {PLANS.map((p) => (
                      <td key={p.name} style={cellValue(p.recommended)}>
                        <Check ok={p.features[fr.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* 状態 */}
                <tr>
                  <td style={cellLabel}>提供状況</td>
                  {PLANS.map((p) => (
                    <td key={p.name} style={cellValue(p.recommended)}>
                      {p.availability ? (
                        <span style={{ color: "var(--color-warn-fg)", fontSize: "0.72rem" }}>
                          {p.availability}
                        </span>
                      ) : (
                        <span style={{ color: "var(--color-add-fg)", fontWeight: 600 }}>
                          提供中
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.75rem",
            }}
          >
            ※ 有料プランは現在準備中です。導入をご検討の方は
            <Link href="/contact" style={{ color: "var(--color-accent)" }}>
              お問い合わせ
            </Link>
            ください。ご予算・ご利用規模に応じた最適なプランをご提案します。
          </p>
        </section>

        {/* ── 4. 自治体・外郭団体向け ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>自治体・外郭団体の方へ</h2>
          <div style={cardStyle}>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.8,
                marginBottom: "1rem",
              }}
            >
              <p style={{ marginBottom: "0.75rem" }}>
                <strong style={{ color: "var(--color-text-primary)" }}>課題：</strong>
                小規模自治体や外郭団体（公社・財団・社会福祉法人等）では、法令データベースの予算が確保できず、条例改正や法令調査を手作業で行っているケースが多くあります。
                自治体が契約する法令DBの対象に外郭団体が含まれないことも少なくありません。
              </p>
              <p style={{ marginBottom: "0.75rem" }}>
                <strong style={{ color: "var(--color-text-primary)" }}>解決：</strong>
                LexCard
                Standardプランは年額24万円。市の随意契約範囲内（地方自治法施行令・役務50万円以下）に収まり、課長決裁で導入できます。
                入札手続きは不要です。
              </p>
            </div>
            <table
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <tbody>
                {[
                  {
                    use: "条例・規則の改正案作成",
                    feature: "条文の直接編集 → 新旧対照表・改め文を自動生成",
                  },
                  {
                    use: "部署間の法令調査",
                    feature: "プロジェクト管理（タスク・チャット・資料管理）",
                  },
                  { use: "組織横断の知見共有", feature: "逐条解説・コミュニティ" },
                  { use: "決裁ルート", feature: "年額¥240,000 → 課長決裁・随意契約" },
                ].map((r) => (
                  <tr key={r.use}>
                    <td
                      style={{
                        padding: "0.4rem 0.75rem 0.4rem 0",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid var(--color-border)",
                        verticalAlign: "top",
                      }}
                    >
                      {r.use}
                    </td>
                    <td
                      style={{
                        padding: "0.4rem 0",
                        color: "var(--color-text-secondary)",
                        borderBottom: "1px solid var(--color-border)",
                        lineHeight: 1.7,
                      }}
                    >
                      {r.feature}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                marginTop: "1rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
              }}
            >
              推奨プラン：<strong style={{ color: "var(--color-accent)" }}>Standard</strong>
              （年額¥240,000・ID無制限）
            </div>
          </div>
        </section>

        {/* ── 5. 大学向け ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>大学・研究機関の方へ</h2>
          <div style={cardStyle}>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.8,
                marginBottom: "1rem",
              }}
            >
              <p style={{ marginBottom: "0.75rem" }}>
                <strong style={{ color: "var(--color-text-primary)" }}>課題：</strong>
                主要法令データベースの大幅値上げにより、多くの大学で契約見直しが進んでいます。
                判例検索と法令テキスト協働は求められる機能が異なり、1つのサービスで両方をカバーする必要はありません。
              </p>
              <p style={{ marginBottom: "0.75rem" }}>
                <strong style={{ color: "var(--color-text-primary)" }}>提案：</strong>
                判例検索は既存サービス、法令協働はLexCard。併用で全体コストを最適化できます。
              </p>
            </div>
            <table
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <tbody>
                {[
                  { use: "ゼミ・研究室", feature: "コミュニティ機能でワークスペースを構築" },
                  { use: "研究テーマ・授業課題", feature: "プロジェクトで法令セット＋タスク管理" },
                  { use: "学習成果物・講義ノート", feature: "逐条解説として出典付きで投稿・共有" },
                  {
                    use: "模擬立法・政策提言",
                    feature: "改正案の直接編集 → 改め文生成で法制執務を実践",
                  },
                ].map((r) => (
                  <tr key={r.use}>
                    <td
                      style={{
                        padding: "0.4rem 0.75rem 0.4rem 0",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid var(--color-border)",
                        verticalAlign: "top",
                      }}
                    >
                      {r.use}
                    </td>
                    <td
                      style={{
                        padding: "0.4rem 0",
                        color: "var(--color-text-secondary)",
                        borderBottom: "1px solid var(--color-border)",
                        lineHeight: 1.7,
                      }}
                    >
                      {r.feature}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                marginTop: "1rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
              }}
            >
              推奨プラン：<strong style={{ color: "var(--color-accent)" }}>Standard</strong>
              （年額¥240,000・全学ID無制限）
            </div>
          </div>
        </section>

        {/* ── 6. 企業向け ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>企業の方へ</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {/* 国内企業 */}
            <div style={cardStyle}>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                国内企業
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
                <p style={{ marginBottom: "0.5rem" }}>
                  既存の法令DBはID課金のため、利用者が増えるほどコストが膨らみます。
                  LexCardは組織定額で人数を気にせず法務チーム全体で利用できます。
                </p>
                <p>
                  EnterpriseプランではSSO（SAML/OIDC）、IP制限、SLAに対応。
                  情報セキュリティ部門の要件を満たします。
                </p>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                推奨プラン：<strong style={{ color: "var(--color-accent)" }}>Enterprise</strong>
                （年額¥900,000）
              </div>
            </div>
            {/* 外国企業 */}
            <div style={cardStyle}>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.75rem",
                }}
              >
                外国企業・国際法律事務所
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
                <p style={{ marginBottom: "0.5rem" }}>
                  日本法へのアクセスは言語の壁が最大の障害です。
                  GlobalプランではUI英語化とAI翻訳機能を提供予定です。
                </p>
                <p>
                  バイリンガルな逐条解説やコメンタリーの投稿にも対応し、
                  日本法の理解を多言語でサポートします。
                </p>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                推奨プラン：<strong style={{ color: "var(--color-accent)" }}>Global</strong>
                （$1,000/mo）
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. セキュリティ ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>情報セキュリティ —「やらない」設計</h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.8,
              marginBottom: "1.25rem",
            }}
          >
            LexCardは「何を搭載しないか」を意識的に設計しています。
            機能を絞ることで、情報セキュリティ上のリスクと審査コストを最小化します。
          </p>
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
                because: "幻覚（ハルシネーション）リスクゼロ。法令は正確さが命。AI API課金もゼロ。",
              },
              {
                not: "メール・チャット中継なし",
                because: "機微情報がシステムを通過しません。内部連絡は既存ツールをそのまま利用。",
              },
              {
                not: "ファイルストレージなし",
                because:
                  "情報漏洩のリスクを最小化。参考資料はリンクで管理し、原本は組織の既存ストレージに。",
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
          {/* サービス終了時保証 */}
          <div style={{ marginTop: "1rem", ...cardStyle }}>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              サービス終了時の引渡し保証
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.8,
              }}
            >
              万が一サービスを終了する場合、有料契約者に以下を引き渡します：
            </div>
            <ul
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
                lineHeight: 2,
                paddingLeft: "1.25rem",
                margin: "0.5rem 0 0",
              }}
            >
              <li>ソースコード一式（OSSとして公開済み）</li>
              <li>データベースのエクスポート</li>
              <li>運用手順書</li>
              <li>DNS移管支援</li>
            </ul>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
                marginTop: "0.5rem",
              }}
            >
              終了6ヶ月前に通知。自走可能な状態で引き渡すことを契約書に明記します。
            </div>
          </div>
        </section>

        {/* ── 8. 競合比較 ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>導入コスト比較（50名利用時の年額）</h2>
          <div style={{ overflowX: "auto" }}>
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
                      padding: "0.5rem 0.5rem",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    サービス
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "0.5rem 0.5rem",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    年額
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "0.5rem 0.5rem",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    課長決裁
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "0.5rem 0.5rem",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    随契（市）
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <tr
                    key={c.name}
                    style={i === 0 ? { backgroundColor: "var(--color-add-bg)" } : undefined}
                  >
                    <td
                      style={{
                        padding: "0.5rem 0.5rem",
                        borderBottom: "1px solid var(--color-border)",
                        fontWeight: i === 0 ? 700 : 400,
                        color: i === 0 ? "var(--color-accent)" : undefined,
                      }}
                    >
                      {c.name}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "0.5rem 0.5rem",
                        borderBottom: "1px solid var(--color-border)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {c.annual}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "0.5rem 0.5rem",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      {c.manager ? (
                        <span style={{ color: "var(--color-add-fg)", fontWeight: 700 }}>○</span>
                      ) : (
                        <span style={{ color: "var(--color-del-fg)" }}>×</span>
                      )}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "0.5rem 0.5rem",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      {c.discretionary ? (
                        <span style={{ color: "var(--color-add-fg)", fontWeight: 700 }}>○</span>
                      ) : (
                        <span style={{ color: "var(--color-del-fg)" }}>×</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.5rem",
            }}
          >
            ※ 他社価格は公開情報に基づく概算です（2026年時点）。税別。
          </p>
        </section>

        {/* ── 9. CTA ── */}
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
                fontFamily: "var(--font-serif)",
                fontSize: "1.2rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              まずはお気軽にご相談ください
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
              ご予算・ご利用規模に応じた最適なプランをご提案します。
              <br />
              Free プランは登録不要で今すぐご利用いただけます。
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/contact"
                style={{
                  display: "inline-block",
                  padding: "0.7rem 2rem",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                お問い合わせ
              </Link>
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  padding: "0.7rem 2rem",
                  backgroundColor: "transparent",
                  color: "var(--color-accent)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid var(--color-accent)",
                }}
              >
                無料で試す
              </Link>
              <Link
                href="/guide"
                style={{
                  display: "inline-block",
                  padding: "0.7rem 2rem",
                  backgroundColor: "transparent",
                  color: "var(--color-text-secondary)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  border: "1px solid var(--color-border)",
                }}
              >
                使い方ガイド
              </Link>
            </div>
          </div>
        </section>

        {/* ── 注記・特商法表記 ── */}
        <section style={{ marginBottom: "2rem" }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.8,
              borderTop: "1px solid var(--color-border)",
              paddingTop: "1.5rem",
            }}
          >
            <p style={{ marginBottom: "0.75rem" }}>
              ※ サービス内容・料金プランは今後変更される場合があります。最新情報は本ページまたは
              <Link href="/contact" style={{ color: "var(--color-accent)" }}>
                お問い合わせ
              </Link>
              にてご確認ください。
            </p>

            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  fontSize: "0.75rem",
                  marginBottom: "0.5rem",
                }}
              >
                特定商取引法に基づく表記
              </div>
              <table style={{ fontSize: "0.72rem", borderCollapse: "collapse", width: "100%" }}>
                <tbody>
                  {[
                    { label: "販売業者", value: "こうな姫株式会社" },
                    { label: "代表者", value: "中川倖成" },
                    { label: "所在地", value: "東京都渋谷区渋谷二丁目19番19号" },
                    { label: "連絡先", value: "お問い合わせフォームよりご連絡ください" },
                    { label: "販売価格", value: "各プランの料金は本ページに記載のとおり（税別）" },
                    {
                      label: "支払方法",
                      value: "クレジットカード、銀行振込（有料プラン提供開始時に詳細を公開）",
                    },
                    { label: "サービス提供時期", value: "お申し込み完了後、速やかにご利用開始" },
                    {
                      label: "返品・キャンセル",
                      value:
                        "月額プラン：いつでも解約可能（日割り返金なし）。年額プラン：契約期間中の中途解約による返金はありません",
                    },
                  ].map((r) => (
                    <tr key={r.label}>
                      <td
                        style={{
                          padding: "0.3rem 0.5rem 0.3rem 0",
                          fontWeight: 600,
                          color: "var(--color-text-secondary)",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid var(--color-border)",
                          verticalAlign: "top",
                          width: "7rem",
                        }}
                      >
                        {r.label}
                      </td>
                      <td
                        style={{
                          padding: "0.3rem 0",
                          lineHeight: 1.7,
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        {r.value}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      style={{
                        padding: "0.3rem 0.5rem 0.3rem 0",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                        verticalAlign: "top",
                        width: "7rem",
                      }}
                    >
                      連絡先フォーム
                    </td>
                    <td style={{ padding: "0.3rem 0", lineHeight: 1.7 }}>
                      <Link href="/contact" style={{ color: "var(--color-accent)" }}>
                        お問い合わせ
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ────────────────── テーブルセルスタイル ────────────────── */

const cellLabel: React.CSSProperties = {
  textAlign: "left",
  padding: "0.4rem 0.4rem",
  fontWeight: 600,
  fontSize: "0.75rem",
  color: "var(--color-text-secondary)",
  borderBottom: "1px solid var(--color-border)",
  whiteSpace: "nowrap",
};

function cellValue(recommended?: boolean): React.CSSProperties {
  return {
    textAlign: "center",
    padding: "0.4rem 0.4rem",
    borderBottom: "1px solid var(--color-border)",
    fontSize: "0.78rem",
    backgroundColor: recommended ? "rgba(3,105,161,0.04)" : undefined,
  };
}
