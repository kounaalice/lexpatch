import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "使い方ガイド",
  description:
    "LexCardの全機能ガイド。法令検索・条文閲覧・改正案作成・逐条解説・AI法令検索・カレンダー・通知の使い方を説明します。",
};

/* ─── セクションナビ定義 ─── */
const NAV_ITEMS = [
  { href: "#flow", label: "基本の流れ" },
  { href: "#search", label: "検索・閲覧" },
  { href: "#patch", label: "改正案・Lint" },
  { href: "#commentary", label: "逐条解説" },
  { href: "#calendar", label: "カレンダー・通知" },
  { href: "#settings", label: "設定" },
  { href: "#faq", label: "FAQ" },
];

export default function GuidePage() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ── ページヘッダ ── */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
            <span>使い方ガイド</span>
          </nav>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.25rem",
            }}
          >
            使い方ガイド
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            法令の検索・閲覧から改正案の作成、逐条解説、AI法令検索まで。各機能の使い方を説明します。
          </p>
        </div>
      </div>

      {/* ── セクションナビ ── */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "0.75rem 2rem",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            gap: "0.5rem 1.25rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-accent)",
                textDecoration: "none",
                padding: "0.2rem 0",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── コンテンツ ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
        {/* ════════════════════════════════════════════════
            1. 基本の流れ
        ════════════════════════════════════════════════ */}
        <section id="flow" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <SectionTitle>基本の流れ</SectionTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            {[
              { num: "01", icon: "\uD83D\uDD0D", label: "法令を検索", sub: "法令名・分野で探す" },
              { num: "02", icon: "\uD83D\uDCC4", label: "条文を読む", sub: "現行法テキスト閲覧" },
              { num: "03", icon: "\u270F\uFE0F", label: "改正案を作る", sub: "直接編集で改正案" },
              { num: "04", icon: "\uD83D\uDCD6", label: "逐条解説", sub: "条文に解説を投稿" },
              { num: "05", icon: "\uD83D\uDCC5", label: "カレンダー", sub: "公布・施行を追跡" },
              { num: "06", icon: "\uD83E\uDD16", label: "AI法令検索", sub: "AIに質問・要約" },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  padding: "1rem 0.75rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: "0.3rem" }}>{step.icon}</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--color-accent)",
                    fontWeight: 700,
                    marginBottom: "0.2rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  STEP {step.num}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.15rem",
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.7rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {step.sub}
                </div>
              </div>
            ))}
          </div>

          <TipBox>
            STEP 01〜03 は登録不要・無料で利用できます。STEP 04〜06
            はメンバー登録（無料）でさらに便利に。すべての機能は完全無料です。
          </TipBox>
        </section>

        {/* ════════════════════════════════════════════════
            2. 検索・閲覧
        ════════════════════════════════════════════════ */}
        <section id="search" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <StepHeader num="01" title="法令の検索・閲覧" color="#0369A1" />

          <h3 style={h3Style}>法令名で検索</h3>
          <p style={bodyText}>
            トップページの検索バーに法令名（例：「民法」「労働基準法」）を入力して検索します。
            複数の法令を同時に検索する場合は「民法 OR 刑法」のように OR を使えます。
          </p>

          <MockupFrame label="lexcard.jp">
            <div style={{ padding: "1rem 1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: "0.4rem 0.75rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  民法 OR 刑法
                </div>
                <MockupButton>検索</MockupButton>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                50分野 | 47都道府県 | 種別フィルタ (法律/政令/省令/規則)
              </div>
            </div>
          </MockupFrame>

          <h3 style={h3Style}>分野・カテゴリから探す</h3>
          <p style={bodyText}>
            トップページ下部の50分野（憲法・民事・刑事・行政・税務・労働
            等）や47都道府県条例カテゴリから法令を探すこともできます。
            ヘッダーの「分野・条例」ドロップダウンからも直接アクセスできます。
          </p>

          <h3 style={h3Style}>横断検索（全文検索）</h3>
          <p style={bodyText}>
            ヘッダーの「横断検索」では、条文の本文を横断的に検索できます。
            特定のキーワード（例：「損害賠償」「懲役」）が含まれる条文を複数の法令から一括で検索します。
          </p>

          <h3 style={h3Style}>条文を読む</h3>
          <p style={bodyText}>
            法令ページでは条文一覧がカード形式で表示されます。
            条文をクリックすると詳細ページへ移動し、項・号・号細分の字下げ表示、附則、別表を含む完全な条文テキストを閲覧できます。
          </p>

          <h3 style={h3Style}>条文参照リンク</h3>
          <p style={bodyText}>
            条文中の「第○条」「前項」などの参照はリンクになっています。クリック時の動作は設定で3モードから選べます。
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <Tag>navigate: ページ遷移</Tag>
            <Tag>highlight: スクロール+ハイライト</Tag>
            <Tag>popup: ツールチップ表示</Tag>
          </div>

          <h3 style={h3Style}>ブックマーク・閲覧履歴</h3>
          <p style={bodyText}>
            よく参照する条文はブックマークに登録できます。閲覧履歴はトップページに表示されるため、前回読んでいた法令にすぐ戻れます。
            条文メモ・インライン注釈もブラウザに保存されます。
          </p>
        </section>

        {/* ════════════════════════════════════════════════
            3. 改正案・Lint
        ════════════════════════════════════════════════ */}
        <section id="patch" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <StepHeader num="02" title="改正案の作成・Lint検証" color="#0284C7" />

          <h3 style={h3Style}>直接編集で改正案を作成</h3>
          <p style={bodyText}>
            条文詳細ページの「編集」ボタンをクリックすると、現行条文を直接編集できます。
            編集すると自動的に新旧対照表（diff）が生成され、どこが変わったか一目で分かります。
          </p>

          <MockupFrame label="lexcard.jp/law/.../article/709">
            <div style={{ padding: "1rem 1.25rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: "0.3rem",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    現行
                  </div>
                  <div
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "var(--color-bg)",
                      borderRadius: "4px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    故意又は過失によって他人の権利又は法律上保護される利益を侵害した者は…
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: "0.3rem",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    改正案
                  </div>
                  <div
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "#EFF6FF",
                      borderRadius: "4px",
                      border: "1px solid #93C5FD",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    故意又は<span style={{ backgroundColor: "#BBF7D0" }}>重大な</span>過失によって…
                  </div>
                </div>
              </div>
            </div>
          </MockupFrame>

          <h3 style={h3Style}>改め文の自動生成</h3>
          <p style={bodyText}>
            編集内容から法制執務に準拠した改め文（「第○条中『A』を『B』に改める。」）が自動生成されます。
            単語の境界を正しく処理し、実務で使える品質の改め文を出力します。
          </p>

          <h3 style={h3Style}>Lint検証</h3>
          <p style={bodyText}>
            改正案の形式的な問題（用字用語の誤り、条文番号の重複、参照先の不整合等）を自動でチェックします。
          </p>

          <h3 style={h3Style}>保存・共有</h3>
          <p style={bodyText}>
            作成した改正案はタイトル・改正理由を付けて保存できます。保存した改正案はURLで共有可能です。
            「改正提案」ページで全ユーザーの改正案を一覧・検索できます。
          </p>
          <TipBox>改正案の保存にはメンバー登録が必要です。閲覧やdiffの確認は登録不要です。</TipBox>
        </section>

        {/* ════════════════════════════════════════════════
            4. 逐条解説
        ════════════════════════════════════════════════ */}
        <section id="commentary" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <StepHeader num="03" title="逐条解説" color="#0284C7" />

          <p style={bodyText}>
            各条文に対してメンバーが解説を投稿できます。出典（一次資料・二次資料等）の明記が推奨されます。
            条文の趣旨や判例の解説など、知識の共有に活用できます。
            ヘッダーの「逐条解説」から一覧・検索が可能です。
          </p>

          <TipBox>逐条解説の投稿にはメンバー登録が必要です。閲覧は登録不要です。</TipBox>
        </section>

        {/* ════════════════════════════════════════════════
            5. カレンダー・通知
        ════════════════════════════════════════════════ */}
        <section id="calendar" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <StepHeader num="04" title="カレンダー・通知" color="#0369A1" />

          <h3 style={h3Style}>月間カレンダー</h3>
          <p style={bodyText}>
            ヘッダーの「カレンダー」から月間カレンダーを表示できます。
            法令の公布日（青）・施行日（緑）が色分けドットで表示されます。
          </p>

          <h3 style={h3Style}>施行スケジュール</h3>
          <p style={bodyText}>
            ダッシュボードの「施行スケジュール」では、今後6ヶ月間の法令の施行・公布予定がタイムラインで表示されます。
            残り日数に応じた色分けで、期限が近い法令を把握できます。
          </p>

          <h3 style={h3Style}>iCal購読</h3>
          <p style={bodyText}>
            カレンダーページ下部の購読URLを Google カレンダーや Outlook
            に登録すると、法令の公布・施行予定が自動で同期されます。
          </p>

          <h3 style={h3Style}>メール通知</h3>
          <p style={bodyText}>
            プロフィール設定でメールアドレスを登録すると、通知をメールで受信できます。
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {["新メッセージ", "法令公布アラート", "施行アラート"].map((name) => (
              <div
                key={name}
                style={{
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-primary)",
                  textAlign: "center",
                }}
              >
                {name}
              </div>
            ))}
          </div>
          <p style={bodyText}>
            法令アラートのスコープは4段階（ブックマーク / カテゴリ / 状況ベース /
            全法令）から選べます。 即時通知または週次ダイジェストを設定可能です。
          </p>

          <h3 style={h3Style}>法令オンボーディング</h3>
          <p style={bodyText}>
            初回ログイン時のオンボーディングウィザードで、業種・職種・生活状況を選ぶと関連法令が自動でフォローされ、通知スコープも自動設定されます。
          </p>
        </section>

        {/* ════════════════════════════════════════════════
            5. 設定
        ════════════════════════════════════════════════ */}
        <section id="settings" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <SectionTitle>設定</SectionTitle>
          <p style={bodyText}>
            <Link href="/settings" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              設定ページ
            </Link>
            から以下の項目を変更できます。
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {[
              { name: "テーマ", desc: "アクアライト / ダーク / システム / ゆめかわ" },
              { name: "条文参照リンク", desc: "クリック動作: navigate / highlight / popup" },
              { name: "言語", desc: "日本語 / English" },
              { name: "データ管理", desc: "ローカルデータの一括削除" },
            ].map((item) => (
              <div
                key={item.name}
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.15rem",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.73rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════
            9. FAQ
        ════════════════════════════════════════════════ */}
        <section id="faq" style={{ scrollMarginTop: "100px", marginBottom: "2rem" }}>
          <SectionTitle>よくある質問</SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                style={{
                  padding: "1.25rem 1.5rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--color-text-primary)",
                    marginBottom: "0.5rem",
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ color: "var(--color-accent)", flexShrink: 0 }}>Q.</span>
                  <span>{item.q}</span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.75,
                    paddingLeft: "1.5rem",
                  }}
                >
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div
          style={{
            marginTop: "2rem",
            textAlign: "center",
            padding: "2rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.1rem",
              color: "var(--color-text-primary)",
              marginBottom: "1rem",
            }}
          >
            さっそく使ってみる
          </div>
          <div
            style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link
              href="/"
              style={{
                padding: "0.6rem 1.5rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              法令を検索する
            </Link>
            <Link
              href="/about"
              style={{
                padding: "0.6rem 1.5rem",
                border: "1px solid var(--color-accent)",
                color: "var(--color-accent)",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              LexCardとは
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 共通スタイル ──────────────────────────────────────
const bodyText: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.925rem",
  color: "var(--color-text-secondary)",
  lineHeight: 1.85,
  marginBottom: "1.25rem",
};

const h3Style: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  marginBottom: "0.5rem",
  marginTop: "1.5rem",
};

// ─── セクションタイトル ──────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: "1.4rem",
        color: "var(--color-text-primary)",
        marginBottom: "1.25rem",
      }}
    >
      {children}
    </h2>
  );
}

// ─── ステップヘッダー ──────────────────────────────────
function StepHeader({ num, title, color }: { num: string; title: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {num}
      </div>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
          color: "var(--color-text-primary)",
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ─── 画面モックアップフレーム ──────────────────────────
function MockupFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div
        style={{
          backgroundColor: "#0C2340",
          padding: "0.4rem 0.75rem",
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            color: "rgba(186,230,253,0.5)",
            marginLeft: "0.35rem",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          backgroundColor: "var(--color-surface)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── 小さいモックアップボタン ────────────────────────
function MockupButton({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "0.15rem 0.55rem",
        border: "1px solid var(--color-border)",
        borderRadius: "4px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.7rem",
        color: "var(--color-text-secondary)",
        backgroundColor: "var(--color-bg)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ─── ヒントボックス ────────────────────────────────────
function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "0.85rem 1.1rem",
        backgroundColor: "var(--color-warn-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        marginBottom: "0.5rem",
        display: "flex",
        gap: "0.5rem",
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>💡</span>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
          color: "var(--color-text-primary)",
          lineHeight: 1.7,
        }}
      >
        {children}
      </p>
    </div>
  );
}

// ─── タグ ────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "0.2rem 0.6rem",
        backgroundColor: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "4px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.75rem",
        color: "var(--color-text-secondary)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ─── FAQ ──────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "法令データはどこから取得していますか？",
    a: "デジタル庁が提供するe-Gov法令検索（laws.e-gov.go.jp）の法令データAPIを利用しています。最新の現行法令を反映しています。",
  },
  {
    q: "改正案を保存・共有することはできますか？",
    a: "はい。「改正案を保存」ボタンからタイトル・改正理由を入力して保存できます。保存した改正案はURLで共有可能です。「改正提案」ページで一覧を確認できます。",
  },
  {
    q: "メンバー登録は必要ですか？",
    a: "法令の検索・閲覧・改正案の確認は登録不要です。改正案の投稿・逐条解説にはメンバー登録（無料）が必要です。",
  },
  {
    q: "逐条解説は誰が書いていますか？",
    a: "登録メンバーが各条文に対して解説を投稿できます。出典（一次資料・二次資料等）の明記が推奨されます。内容は投稿者の見解であり、公式な解釈ではありません。",
  },
  {
    q: "条文メモやブックマークはどこに保存されますか？",
    a: "条文メモ・ブックマーク・インライン注釈・閲覧履歴・表示設定はお使いのブラウザのローカルストレージに保存されます。サーバーには送信されないため、他の端末やブラウザからはアクセスできません。サイト設定ページからデータの一括削除が可能です。",
  },
  {
    q: "スマートフォンでも使えますか？",
    a: "はい。レスポンシブデザインに対応しており、スマートフォン・タブレットからも利用できます。",
  },
  {
    q: "利用料金はかかりますか？",
    a: "LexCardはすべての機能を無料で提供しています。課金要素は一切ありません。こうな姫株式会社が公共目的で運営しています。",
  },
  {
    q: "法的アドバイスを提供していますか？",
    a: "いいえ。LexCardは法令テキストの閲覧・編集ツールであり、法的アドバイスや解釈の提供は行っておりません。具体的な法的問題については弁護士等の専門家にご相談ください。",
  },
];
