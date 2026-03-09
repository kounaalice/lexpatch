import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "使い方ガイド",
  description:
    "LexCardの全機能ガイド。法令検索・条文閲覧・改正案作成・プロジェクト管理・コミュニティ・カレンダー・ゲーミングモード＆条文カードゲームの使い方を説明します。",
};

/* ─── セクションナビ定義 ─── */
const NAV_ITEMS = [
  { href: "#flow", label: "基本の流れ" },
  { href: "#search", label: "検索・閲覧" },
  { href: "#patch", label: "改正案・Lint" },
  { href: "#project", label: "プロジェクト" },
  { href: "#community", label: "コミュニティ" },
  { href: "#calendar", label: "カレンダー・通知" },
  { href: "#gaming", label: "ゲーミング＆カード" },
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
            法令の検索・閲覧から改正案の作成、プロジェクト管理、コミュニティ、条文カードゲームまで。各機能の使い方を説明します。
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
              { num: "04", icon: "\uD83D\uDCC1", label: "プロジェクト", sub: "チームで管理" },
              { num: "05", icon: "\uD83D\uDCAC", label: "コミュニティ", sub: "議論・情報共有" },
              { num: "06", icon: "\uD83C\uDFB4", label: "カードを集める", sub: "条文カードゲーム" },
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
            はメンバー登録（無料）でさらに便利に。 ゲーミングモードの
            XP・活動ポイントは登録なしでもバックグラウンドで蓄積されます。
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
            4. プロジェクト
        ════════════════════════════════════════════════ */}
        <section id="project" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <StepHeader num="03" title="プロジェクト（法令ワークスペース）" color="#0369A1" />

          <p style={bodyText}>
            法令に関する調査・検討をチームで進めるためのワークスペースです。
            プロジェクトを作成し、メンバーを招待して共同作業ができます。
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            {[
              {
                icon: "\u2705",
                title: "タスク管理",
                desc: "担当者・期限・ステータスを設定。詳細記述・リンク添付も可能",
              },
              {
                icon: "\uD83D\uDCC5",
                title: "フェーズ管理",
                desc: "大きな工程をフェーズに分割。ガントチャート表示",
              },
              {
                icon: "\uD83D\uDCDD",
                title: "議事録",
                desc: "会議の記録を時系列で整理。リッチテキスト対応",
              },
              {
                icon: "\uD83D\uDCC2",
                title: "ファイル添付",
                desc: "PDF・Word等の資料をアップロード。ドラッグ＆ドロップ対応",
              },
              {
                icon: "\uD83D\uDCCB",
                title: "チェックリスト",
                desc: "法改正影響調査等のテンプレートからタスクを一括生成",
              },
              {
                icon: "\uD83D\uDCC3",
                title: "法令案",
                desc: "改正後の法令全体像を編・章・条で構造化して作成",
              },
              {
                icon: "\uD83D\uDCC6",
                title: "チームカレンダー",
                desc: "タスク・フェーズ期限をカレンダー表示。iCalエクスポート対応",
              },
              {
                icon: "\uD83D\uDD17",
                title: "改正案紐付け",
                desc: "プロジェクトに改正案を紐付けて一元管理",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "0.9rem 1rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>{item.icon}</div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <TipBox>
            プロジェクトの作成・参加にはメンバー登録が必要です。プロジェクト内の情報は参加メンバーのみ閲覧可能です。
          </TipBox>
        </section>

        {/* ════════════════════════════════════════════════
            5. コミュニティ
        ════════════════════════════════════════════════ */}
        <section id="community" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <StepHeader num="04" title="コミュニティ" color="#0284C7" />

          <p style={bodyText}>
            法令に関する議論や情報共有のためのコミュニティ機能です。分野別・テーマ別のコミュニティを作成・参加できます。
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            {[
              {
                icon: "\uD83D\uDCAC",
                title: "メッセージ",
                desc: "テキストベースのリアルタイムチャット",
              },
              {
                icon: "\uD83D\uDCC2",
                title: "資料共有",
                desc: "PDF・文書ファイルのアップロード・共有",
              },
              {
                icon: "\uD83D\uDD14",
                title: "通知",
                desc: "新しいメッセージやお知らせをメール・アプリ内通知",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "0.9rem 1rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>{item.icon}</div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <h3 style={h3Style}>逐条解説</h3>
          <p style={bodyText}>
            各条文に対してメンバーが解説を投稿できます。出典（一次資料・二次資料等）の明記が推奨されます。
            条文の趣旨や判例の解説など、知識の共有に活用できます。
            ヘッダーの「逐条解説」から一覧・検索が可能です。
          </p>
        </section>

        {/* ════════════════════════════════════════════════
            6. カレンダー・通知
        ════════════════════════════════════════════════ */}
        <section id="calendar" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <StepHeader num="05" title="カレンダー・通知" color="#0369A1" />

          <h3 style={h3Style}>月間カレンダー</h3>
          <p style={bodyText}>
            ヘッダーの「カレンダー」から月間カレンダーを表示できます。
            法令の公布日（青）・施行日（緑）・タスク期限（オレンジ）・フェーズ期限（紫）が色分けドットで表示されます。
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
            プロジェクトのチームカレンダーも個別にiCalエクスポート可能です。
          </p>

          <h3 style={h3Style}>メール通知</h3>
          <p style={bodyText}>
            プロフィール設定でメールアドレスを登録すると、5カテゴリの通知をメールで受信できます。
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {[
              "プロジェクトお知らせ",
              "タスクアラート",
              "新メッセージ",
              "法令公布アラート",
              "施行アラート",
            ].map((name) => (
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
            7. ゲーミング＆カードゲーム
        ════════════════════════════════════════════════ */}
        <section id="gaming" style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0369A1, #A78BFA, #F472B6)",
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
              06
            </div>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              ゲーミングモード＆条文カードゲーム
            </h2>
          </div>

          {/* 導入 */}
          <div
            style={{
              padding: "1.25rem",
              background:
                "linear-gradient(135deg, rgba(3,105,161,0.06), rgba(167,139,250,0.06), rgba(244,114,182,0.06))",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "var(--color-text-primary)",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              LexCard には条文カードゲーム機能が組み込まれています。
              日本の全法令の全条文がTCGカードとしてコレクション対象に。
              法令を読みながらXPを貯め、レベルを上げ、ガチャでカードを集める ──
              完全無料のブラウザカードゲームです。
            </p>
          </div>

          {/* 7-1 ゲーミングモードとは */}
          <GamingSubSection id="gaming-about" num="7-1" title="ゲーミングモードとは">
            <p style={bodyText}>
              設定ページでゲーミングモードをONにすると、画面上部にXPバー、右上にレベル表示、背景にパーティクル演出が表示されます。
              法令ページでは条文カードがTCG風のビジュアルに変化します。
            </p>

            <MockupFrame label="ゲーミングモード ON">
              <div style={{ position: "relative", padding: "0.5rem 0" }}>
                {/* XP bar */}
                <div
                  style={{
                    height: "3px",
                    backgroundColor: "rgba(0,0,0,0.1)",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "65%",
                      background: "linear-gradient(90deg, #0369A1, #A78BFA, #F472B6)",
                    }}
                  />
                </div>
                {/* Level badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "8px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--color-text-secondary)",
                    opacity: 0.7,
                    textAlign: "right",
                  }}
                >
                  <div>Lv.15 法令通</div>
                  <div>{"\u26A1"}87pt</div>
                </div>
                {/* Content */}
                <div
                  style={{
                    padding: "1.5rem 1rem 0.75rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    textAlign: "center",
                  }}
                >
                  XPバー + レベル + パーティクル表示
                </div>
              </div>
            </MockupFrame>

            <TipBox>
              ゲーミングモードが OFF でも、XP・活動ポイントはバックグラウンドで蓄積されます。
              いつでもONにすれば蓄積されたデータが反映されます。
              蓄積自体を無効にしたい場合は設定から「データ蓄積」をOFFにできます。
            </TipBox>
          </GamingSubSection>

          {/* 7-2 XPとレベル */}
          <GamingSubSection id="gaming-xp" num="7-2" title="XP（経験値）とレベル">
            <p style={bodyText}>
              条文をスクロールして読むとXPが加算されます。
              200XPごとにレベルが1上がり、レベルに応じた称号が付与されます。
            </p>

            <div
              style={{
                overflowX: "auto",
                marginBottom: "1.25rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    <th style={thStyle}>レベル</th>
                    <th style={thStyle}>称号</th>
                    <th style={thStyle}>必要XP</th>
                    <th style={thStyle}>特典</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { lv: "1", title: "見習い", xp: "0", perk: "ガチャ解放" },
                    { lv: "2", title: "法令探究者", xp: "200", perk: "R以上カード1枚" },
                    { lv: "3", title: "条文読み", xp: "400", perk: "R以上カード1枚" },
                    { lv: "4", title: "法令通", xp: "600", perk: "R以上カード1枚" },
                    { lv: "5", title: "法令マスター", xp: "800", perk: "R以上カード1枚" },
                    { lv: "6", title: "法令賢者", xp: "1000", perk: "R以上カード1枚" },
                    { lv: "7+", title: "法令王", xp: "1200+", perk: "R以上カード1枚" },
                  ].map((row) => (
                    <tr key={row.lv} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={tdStyle}>{row.lv}</td>
                      <td style={tdStyle}>{row.title}</td>
                      <td style={{ ...tdStyle, fontFamily: "var(--font-mono)" }}>{row.xp}</td>
                      <td style={tdStyle}>{row.perk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TipBox>レベルアップ時にR以上のカードが自動で1枚もらえます。</TipBox>
          </GamingSubSection>

          {/* 7-3 活動ポイント */}
          <GamingSubSection id="gaming-points" num="7-3" title="活動ポイント">
            <p style={bodyText}>
              活動ポイントはカードゲームの「通貨」です。以下のアクションで獲得でき、ガチャやカードの直接購入に使います。
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              {[
                { action: "法令を閲覧", pt: "+5pt" },
                { action: "ブックマーク登録", pt: "+10pt" },
                { action: "法令フォロー", pt: "+8pt" },
                { action: "法令検索", pt: "+3pt" },
                { action: "ノート作成", pt: "+10pt" },
              ].map((item) => (
                <div
                  key={item.action}
                  style={{
                    padding: "0.6rem 0.75rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {item.action}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "var(--color-accent)",
                      fontWeight: 700,
                    }}
                  >
                    {item.pt}
                  </span>
                </div>
              ))}
            </div>

            <p style={bodyText}>
              ポイント残高はゲーミングモードON時にレベル表示の下に{"\u26A1"}マークで表示されます。
              ダッシュボードでも確認できます。
            </p>
          </GamingSubSection>

          {/* 7-4 カードゲーム */}
          <GamingSubSection id="gaming-cards" num="7-4" title="条文カードとレアリティ">
            <p style={bodyText}>
              日本の全法令の全条文が1枚ずつカードになっています。
              カードにはレアリティ（希少度）が設定されており、条文の構造によって決定的に決まります。同じ条文は常に同じレアリティです。
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              {[
                {
                  rarity: "N",
                  rate: "55%",
                  color: "var(--color-border)",
                  desc: "通常ボーダー",
                  bg: "var(--color-surface)",
                },
                {
                  rarity: "R",
                  rate: "30%",
                  color: "#38BDF8",
                  desc: "青ボーダー＋光沢",
                  bg: "rgba(56,189,248,0.05)",
                },
                {
                  rarity: "SR",
                  rate: "12%",
                  color: "#A78BFA",
                  desc: "紫グロー＋パルス",
                  bg: "rgba(167,139,250,0.05)",
                },
                {
                  rarity: "SSR",
                  rate: "3%",
                  color: "#F59E0B",
                  desc: "金グラデーション＋ホロ",
                  bg: "rgba(245,158,11,0.05)",
                },
              ].map((item) => (
                <div
                  key={item.rarity}
                  style={{
                    padding: "0.75rem 0.5rem",
                    backgroundColor: item.bg,
                    border: `2px solid ${item.color}`,
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "1rem",
                      fontWeight: 900,
                      color: item.rarity === "N" ? "var(--color-text-secondary)" : item.color,
                      marginBottom: "0.2rem",
                    }}
                  >
                    {item.rarity}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {item.rate}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.68rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            <h4 style={h4Style}>レアリティの決まり方</h4>
            <div
              style={{
                overflowX: "auto",
                marginBottom: "1rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    <th style={thStyle}>レアリティ</th>
                    <th style={thStyle}>判定条件</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#F59E0B" }}>SSR</td>
                    <td style={tdStyle}>
                      著名条文（憲法9条、民法709条、刑法199条等）または項数10以上
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#A78BFA" }}>SR</td>
                    <td style={tdStyle}>項数5以上、または号(item)10以上</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#38BDF8" }}>R</td>
                    <td style={tdStyle}>項数2以上、またはcaption（見出し）あり</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ ...tdStyle, color: "var(--color-text-secondary)" }}>N</td>
                    <td style={tdStyle}>その他すべて</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 style={h4Style}>TCGカード表示</h4>
            <p style={bodyText}>
              ゲーミングモードON時、法令ページのカード一覧がTCG風に変化します。
              レアリティに応じたボーダー・光沢・アニメーションが付き、未収集カードはシルエット表示になります。
            </p>

            <MockupFrame label="法令ページ（ゲーミングON）">
              <div
                style={{
                  padding: "0.75rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.5rem",
                }}
              >
                {[
                  { art: "第709条", rarity: "SSR", color: "#F59E0B", name: "不法行為" },
                  { art: "第1条", rarity: "SR", color: "#A78BFA", name: "基本原則" },
                  { art: "第90条", rarity: "R", color: "#38BDF8", name: "公序良俗" },
                ].map((card) => (
                  <div
                    key={card.art}
                    style={{
                      padding: "0.5rem",
                      border: `2px solid ${card.color}`,
                      borderRadius: "6px",
                      backgroundColor: "var(--color-surface)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: card.color,
                        fontWeight: 900,
                        marginBottom: "0.2rem",
                      }}
                    >
                      {"★".repeat(card.rarity === "SSR" ? 3 : card.rarity === "SR" ? 2 : 1)}{" "}
                      {card.rarity}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {card.art}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.68rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {card.name}
                    </div>
                  </div>
                ))}
              </div>
            </MockupFrame>
          </GamingSubSection>

          {/* 7-5 カードの入手方法 */}
          <GamingSubSection id="gaming-obtain" num="7-5" title="カードの入手方法">
            <p style={bodyText}>カードは7つの方法で入手できます。</p>

            <div
              style={{
                overflowX: "auto",
                marginBottom: "1.25rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    <th style={thStyle}>入手方法</th>
                    <th style={thStyle}>条件</th>
                    <th style={thStyle}>報酬</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { method: "ガチャ", cond: "ポイント消費", reward: "ランダム1枚" },
                    { method: "直接購入", cond: "ポイント消費", reward: "指定した条文カード1枚" },
                    { method: "レベルアップ", cond: "レベル到達時", reward: "ランダム R以上 1枚" },
                    {
                      method: "プロジェクト",
                      cond: "タスク完了",
                      reward: "関連法令からランダム1枚",
                    },
                    { method: "逐条解説", cond: "解説を投稿", reward: "その条文カード確定" },
                    { method: "改正案", cond: "改正案を作成", reward: "対象条文カード確定" },
                    { method: "デイリーボーナス", cond: "毎日初回訪問", reward: "ランダム N 1枚" },
                  ].map((row) => (
                    <tr key={row.method} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{row.method}</td>
                      <td style={tdStyle}>{row.cond}</td>
                      <td style={tdStyle}>{row.reward}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TipBox>
              逐条解説の投稿と改正案の作成では、対象の条文カードが確定で入手できます。
              法令を読んで、解説を書いて、カードを集める好循環が生まれます。
            </TipBox>

            <h4 style={h4Style}>法令コンプリート</h4>
            <p style={bodyText}>
              ある法令の全条文カードを収集すると、特別な「法令カード」が解放されます。
              法令名がタイトルとなり、条文数・制定年がステータスに。SSR扱いのホロ演出付きです。
            </p>
          </GamingSubSection>

          {/* 7-6 ガチャ */}
          <GamingSubSection id="gaming-gacha" num="7-6" title="ガチャシステム">
            <p style={bodyText}>
              活動ポイントを消費してカードを引くことができます。
              ガチャは現在閲覧中の法令の条文からカードが排出されます。欲しい法令のページでガチャを回しましょう。
            </p>

            <h4 style={h4Style}>コストと排出率</h4>
            <div
              style={{
                overflowX: "auto",
                marginBottom: "1rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    <th style={thStyle}>操作</th>
                    <th style={thStyle}>コスト</th>
                    <th style={thStyle}>備考</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { op: "単発ガチャ", cost: "30pt", note: "" },
                    { op: "10連ガチャ", cost: "250pt", note: "SR以上1枚保証" },
                    { op: "N 直接購入", cost: "20pt", note: "指定条文" },
                    { op: "R 直接購入", cost: "50pt", note: "指定条文" },
                    { op: "SR 直接購入", cost: "150pt", note: "指定条文" },
                    { op: "SSR 直接購入", cost: "500pt", note: "指定条文" },
                  ].map((row) => (
                    <tr key={row.op} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{row.op}</td>
                      <td style={{ ...tdStyle, fontFamily: "var(--font-mono)" }}>{row.cost}</td>
                      <td style={tdStyle}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  排出率
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {[
                    { r: "N", pct: "55%", w: "55%" },
                    { r: "R", pct: "30%", w: "30%" },
                    { r: "SR", pct: "12%", w: "12%" },
                    { r: "SSR", pct: "3%", w: "3%" },
                  ].map((item) => (
                    <div
                      key={item.r}
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          color: "var(--color-text-secondary)",
                          width: "2rem",
                        }}
                      >
                        {item.r}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "6px",
                          backgroundColor: "var(--color-bg)",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: item.w,
                            backgroundColor: "var(--color-accent)",
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.7rem",
                          color: "var(--color-text-secondary)",
                          width: "2.5rem",
                          textAlign: "right",
                        }}
                      >
                        {item.pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  天井（保証）
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.8,
                  }}
                >
                  <div>
                    <strong>30連</strong>でSR以上確定
                  </div>
                  <div>
                    <strong>50連</strong>でSSR確定
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      marginTop: "0.3rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    天井カウントはパックを切り替えてもリセットされません。
                  </div>
                </div>
              </div>
            </div>
          </GamingSubSection>

          {/* 7-7 カード図鑑 */}
          <GamingSubSection id="gaming-collection" num="7-7" title="カード図鑑">
            <p style={bodyText}>
              ヘッダーの「カード図鑑」（ゲーミングモードON時に表示）または{" "}
              <Link href="/cards" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
                /cards
              </Link>{" "}
              でコレクションを確認できます。
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              {[
                { label: "収集カード数", desc: "ユニーク枚数 / 総獲得数" },
                { label: "レアリティ別内訳", desc: "N / R / SR / SSR 各枚数" },
                { label: "法令カード", desc: "全条文コンプで解放" },
                { label: "フィルタ・ソート", desc: "レアリティ・法令・入手日" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.15rem",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </GamingSubSection>

          {/* 7-8 データ蓄積と同期 */}
          <GamingSubSection id="gaming-sync" num="7-8" title="データの保存と端末間同期">
            <div
              style={{
                overflowX: "auto",
                marginBottom: "1rem",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderBottom: "2px solid var(--color-border)",
                    }}
                  >
                    <th style={thStyle}>状態</th>
                    <th style={thStyle}>保存先</th>
                    <th style={thStyle}>端末間引き継ぎ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={tdStyle}>ログインなし</td>
                    <td style={tdStyle}>ブラウザ（localStorage）</td>
                    <td style={tdStyle}>不可</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={tdStyle}>ログインあり</td>
                    <td style={tdStyle}>ブラウザ + データベース</td>
                    <td style={{ ...tdStyle, color: "var(--color-accent)", fontWeight: 700 }}>
                      可能
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={bodyText}>
              ログイン状態ではページ離脱時に自動でデータベースと同期されます。
              別のブラウザや端末でログインすると、XP・活動ポイント・カードコレクションが復元されます。
              同期は「大きい方が勝つ」マージ方式のため、データが失われることはありません。
            </p>
            <TipBox>
              組織でデータ蓄積を無効にしたい場合は、設定ページの「データ蓄積」をOFFにしてください。
              XP・活動ポイント・カードの蓄積が完全に停止します。
            </TipBox>
          </GamingSubSection>
        </section>

        {/* ════════════════════════════════════════════════
            8. 設定
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
              { name: "ゲーミングモード", desc: "TCGカード表示・XPバー・パーティクルのON/OFF" },
              { name: "データ蓄積", desc: "XP・活動ポイント・カード蓄積のON/OFF" },
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
              href="/settings"
              style={{
                padding: "0.6rem 1.5rem",
                background: "linear-gradient(135deg, #0369A1, #A78BFA)",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              ゲーミングモードを試す
            </Link>
            <Link
              href="/projects"
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
              プロジェクト
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

const h4Style: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  marginBottom: "0.4rem",
  marginTop: "1.25rem",
};

const thStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  textAlign: "left",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  color: "var(--color-text-secondary)",
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

// ─── ゲーミングサブセクション ──────────────────────────
function GamingSubSection({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} style={{ marginBottom: "2rem", scrollMarginTop: "100px" }}>
      <h3
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "#A78BFA",
            backgroundColor: "rgba(167,139,250,0.1)",
            padding: "0.15rem 0.5rem",
            borderRadius: "4px",
            fontWeight: 700,
          }}
        >
          {num}
        </span>
        {title}
      </h3>
      {children}
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
    a: "法令の検索・閲覧・改正案の確認は登録不要です。改正案の投稿、プロジェクト、逐条解説、コミュニティ、カードのDB同期にはメンバー登録（無料）が必要です。",
  },
  {
    q: "プロジェクト機能とは何ですか？",
    a: "法令に関する調査・検討をまとめるワークスペースです。タスク管理・フェーズ管理・議事録・ファイル添付・チームカレンダー・改正案の紐付けなどの機能を備えています。",
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
    a: "LexCardはすべての機能を無料で提供しています。ゲーミングモード・カードゲームも含め、課金要素は一切ありません。こうな姫株式会社が公共目的で運営しています。",
  },
  {
    q: "法的アドバイスを提供していますか？",
    a: "いいえ。LexCardは法令テキストの閲覧・編集ツールであり、法的アドバイスや解釈の提供は行っておりません。具体的な法的問題については弁護士等の専門家にご相談ください。",
  },
  // ── ゲーミング・カード関連 ──
  {
    q: "ゲーミングモードをONにしないとポイントは貯まりませんか？",
    a: "いいえ。XPと活動ポイントはゲーミングモードがOFFでもバックグラウンドで蓄積されます。ONにするといつでも蓄積済みのデータが反映されます。蓄積自体を無効にしたい場合は設定の「データ蓄積」をOFFにしてください。",
  },
  {
    q: "カードゲームに課金が必要ですか？",
    a: "完全無料です。活動ポイントはサイトの利用（条文閲覧・改正案作成等）で獲得でき、すべてのカードを無料で入手できます。",
  },
  {
    q: "別の端末やブラウザでもカードを引き継げますか？",
    a: "ログイン状態であれば、ページ離脱時に自動でデータベースと同期されます。別の端末でログインすると XP・活動ポイント・カードコレクションが復元されます。",
  },
  {
    q: "カードのレアリティはランダムですか？",
    a: "いいえ。レアリティは条文の構造（項数・号数）と著名度によって決定的に決まります。同じ条文は常に同じレアリティです。ガチャで「どの条文が出るか」はランダムですが、出た条文のレアリティは固定です。",
  },
  {
    q: "SSRカードの排出率は？天井はありますか？",
    a: "SSRの排出率は3%です。30連でSR以上確定、50連でSSR確定の天井システムがあります。天井カウントはパックを切り替えてもリセットされません。",
  },
];
